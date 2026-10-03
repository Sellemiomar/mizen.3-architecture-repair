import {
  KnowledgeClaim,
  KnowledgeRuleStatus,
  RuleEvidence,
  SourceReference,
  UnknownReason
} from '../types/knowledge';

export interface ResearchFactInput {
  programId: string;
  field: string;
  value: unknown;
  status: KnowledgeRuleStatus;
  source: {
    url: string;
    title: string;
    publisher: string;
    sourceType: string;
    checkedAt: string;
    effectiveFrom?: string;
  };
  unknownReason?: UnknownReason;
  notes?: { fr: string; ar: string };
}

export interface ImportConflict {
  programId: string;
  field: string;
  existingClaim: KnowledgeClaim;
  incomingFact: ResearchFactInput;
  reason: 'VALUE_MISMATCH' | 'STATUS_DOWNGRADE' | 'SOURCE_DIVERGENCE';
  resolution?: 'ACCEPTED_NEW' | 'KEPT_EXISTING' | 'PENDING_REVIEW';
}

export interface ImportResult {
  success: boolean;
  importedClaims: KnowledgeClaim[];
  conflicts: ImportConflict[];
  auditTrail: string[];
}

function evidenceRank(status: KnowledgeRuleStatus, strength?: string): number {
  if (status === 'VERIFIED_CURRENT' && strength === 'DIRECT_PRIMARY_CURRENT') return 100;
  if (status === 'VERIFIED_CURRENT') return 90;
  if (status === 'PARTIALLY_VERIFIED') return 60;
  if (status === 'UNKNOWN') return 50;
  if (status === 'VERIFIED_HISTORICAL' || status === 'OUTDATED') return 10;
  return 20;
}

function existingRank(claim: KnowledgeClaim): number {
  const evidence = claim.evidence?.[0];
  return evidenceRank(claim.status, evidence?.evidenceStrength);
}

export class ResearchImportPipeline {
  private claimsRegistry = new Map<string, KnowledgeClaim[]>();

  constructor(initialClaims: KnowledgeClaim[] = []) {
    for (const claim of initialClaims) {
      const list = this.claimsRegistry.get(claim.programId) || [];
      list.push(claim);
      this.claimsRegistry.set(claim.programId, list);
    }
  }

  public processResearchBatch(facts: ResearchFactInput[]): ImportResult {
    const importedClaims: KnowledgeClaim[] = [];
    const conflicts: ImportConflict[] = [];
    const auditTrail: string[] = [];

    for (const fact of facts) {
      const existingClaims = this.claimsRegistry.get(fact.programId) || [];
      const currentClaim = existingClaims.find(c => c.field === fact.field && c.isCurrent);

      const sourceRef: SourceReference = {
        id: `src_${fact.programId}_${fact.field}_${fact.source.checkedAt}`,
        url: fact.source.url,
        title: fact.source.title,
        publisher: fact.source.publisher,
        sourceType: fact.source.sourceType as SourceReference['sourceType'],
        retrievedAt: fact.source.checkedAt,
        evidenceStatus: fact.status === 'VERIFIED_CURRENT' ? 'VERIFIED' :
          fact.status === 'VERIFIED_HISTORICAL' ? 'OUTDATED' :
          fact.status === 'PARTIALLY_VERIFIED' ? 'PARTIALLY_VERIFIED' : 'UNVERIFIED'
      };

      const ruleEvidence: RuleEvidence = {
        field: fact.field,
        status: fact.status,
        value: fact.value,
        sourceUrl: fact.source.url,
        sourceTitle: fact.source.title,
        sourceType: fact.source.sourceType,
        evidenceStrength: fact.status === 'VERIFIED_CURRENT'
          ? 'DIRECT_PRIMARY_CURRENT'
          : fact.status === 'VERIFIED_HISTORICAL'
          ? 'DIRECT_PRIMARY_HISTORICAL'
          : 'SECONDARY',
        checkedAt: fact.source.checkedAt,
        effectiveFrom: fact.source.effectiveFrom,
        unknownReason: fact.unknownReason,
        notes: fact.notes
      };

      if (!currentClaim) {
        const newClaim: KnowledgeClaim = {
          id: `claim_${fact.programId}_${fact.field}_v1`,
          programId: fact.programId,
          field: fact.field,
          value: fact.value,
          status: fact.status,
          evidence: [ruleEvidence],
          createdAt: fact.source.checkedAt,
          reviewedAt: fact.source.checkedAt,
          isCurrent: true,
          notes: fact.notes
        };
        existingClaims.push(newClaim);
        this.claimsRegistry.set(fact.programId, existingClaims);
        importedClaims.push(newClaim);
        auditTrail.push(`[CREATED] ${newClaim.id}`);
        continue;
      }

      if (JSON.stringify(currentClaim.value) === JSON.stringify(fact.value)) {
        currentClaim.evidence.push(ruleEvidence);
        currentClaim.reviewedAt = fact.source.checkedAt;
        auditTrail.push(`[ENRICHED] ${currentClaim.id}`);
        continue;
      }

      const incomingRank = evidenceRank(fact.status, ruleEvidence.evidenceStrength);
      const currentRank = existingRank(currentClaim);
      const stronger = incomingRank > currentRank;
      const equalStrength = incomingRank === currentRank;

      const conflict: ImportConflict = {
        programId: fact.programId,
        field: fact.field,
        existingClaim: currentClaim,
        incomingFact: fact,
        reason: fact.status === 'UNKNOWN' && currentClaim.status === 'VERIFIED_CURRENT'
          ? 'STATUS_DOWNGRADE'
          : 'VALUE_MISMATCH',
        resolution: stronger && !equalStrength ? 'ACCEPTED_NEW' : 'PENDING_REVIEW'
      };
      conflicts.push(conflict);

      if (stronger && !equalStrength) {
        currentClaim.isCurrent = false;
        currentClaim.status = 'OUTDATED';
        const newClaim: KnowledgeClaim = {
          id: `claim_${fact.programId}_${fact.field}_v${existingClaims.length + 1}`,
          programId: fact.programId,
          field: fact.field,
          value: fact.value,
          status: fact.status,
          evidence: [ruleEvidence],
          createdAt: fact.source.checkedAt,
          reviewedAt: fact.source.checkedAt,
          supersedesClaimId: currentClaim.id,
          isCurrent: true,
          notes: fact.notes
        };
        existingClaims.push(newClaim);
        importedClaims.push(newClaim);
        auditTrail.push(`[SUPERSEDED] ${currentClaim.id} -> ${newClaim.id}`);
      } else {
        // We retain the conflicting evidence for auditability but it cannot become
        // current without an explicit review when evidence is equal or weaker.
        const pendingClaim: KnowledgeClaim = {
          id: `claim_${fact.programId}_${fact.field}_pending_${existingClaims.length + 1}`,
          programId: fact.programId,
          field: fact.field,
          value: fact.value,
          status: 'CONFLICTING',
          evidence: [ruleEvidence],
          createdAt: fact.source.checkedAt,
          reviewedAt: fact.source.checkedAt,
          isCurrent: false,
          notes: fact.notes
        };
        existingClaims.push(pendingClaim);
        importedClaims.push(pendingClaim);
        auditTrail.push(`[PENDING_REVIEW] Kept current claim ${currentClaim.id}; incoming evidence retained as ${pendingClaim.id}`);
      }
      this.claimsRegistry.set(fact.programId, existingClaims);
    }

    return { success: true, importedClaims, conflicts, auditTrail };
  }

  public getClaimsForProgram(programId: string): KnowledgeClaim[] {
    return this.claimsRegistry.get(programId) || [];
  }
}
