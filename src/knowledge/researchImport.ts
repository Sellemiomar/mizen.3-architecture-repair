/**
 * Mizen - Research Import & Claim Management Pipeline
 * Manages research updates, normalization, validation, and conflict resolution.
 * 
 * Pipeline:
 * RESEARCH -> NORMALIZE -> VALIDATE -> COMPARE WITH CURRENT CLAIM -> FLAG CONFLICT IF NEEDED -> APPROVE -> UPDATE CANONICAL KNOWLEDGE
 */

import { 
  KnowledgeClaim, 
  KnowledgeRuleStatus, 
  RuleEvidence, 
  SourceReference, 
  UnknownReason,
  FinancingProduct 
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
  notes?: {
    fr: string;
    ar: string;
  };
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

export class ResearchImportPipeline {
  private claimsRegistry: Map<string, KnowledgeClaim[]> = new Map();

  constructor(initialClaims?: KnowledgeClaim[]) {
    if (initialClaims) {
      for (const c of initialClaims) {
        const list = this.claimsRegistry.get(c.programId) || [];
        list.push(c);
        this.claimsRegistry.set(c.programId, list);
      }
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
        id: `src_${fact.programId}_${fact.field}_${Date.now()}`,
        url: fact.source.url,
        title: fact.source.title,
        publisher: fact.source.publisher,
        sourceType: fact.source.sourceType,
        retrievedAt: fact.source.checkedAt,
        evidenceStatus: fact.status
      };

      const ruleEvidence: RuleEvidence = {
        field: fact.field,
        status: fact.status,
        value: fact.value,
        sourceUrl: fact.source.url,
        sourceTitle: fact.source.title,
        sourceType: fact.source.sourceType,
        evidenceStrength: fact.source.sourceType.includes('CURRENT') 
          ? 'DIRECT_PRIMARY_CURRENT' 
          : 'DIRECT_PRIMARY_HISTORICAL',
        checkedAt: fact.source.checkedAt,
        effectiveFrom: fact.source.effectiveFrom,
        unknownReason: fact.unknownReason,
        notes: fact.notes
      };

      if (currentClaim) {
        // Compare with current claim for conflicts
        if (JSON.stringify(currentClaim.value) !== JSON.stringify(fact.value)) {
          conflicts.push({
            programId: fact.programId,
            field: fact.field,
            existingClaim: currentClaim,
            incomingFact: fact,
            reason: 'VALUE_MISMATCH'
          });

          auditTrail.push(`[CONFLICT] ${fact.programId}.${fact.field}: Existing (${JSON.stringify(currentClaim.value)}) vs Incoming (${JSON.stringify(fact.value)})`);
          
          // Mark previous claim as superseded when new stronger source arrives
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
            reviewedAt: new Date().toISOString().split('T')[0],
            supersedesClaimId: currentClaim.id,
            isCurrent: true,
            notes: fact.notes
          };

          existingClaims.push(newClaim);
          importedClaims.push(newClaim);
          auditTrail.push(`[SUPERSEDED] Claim ${currentClaim.id} superseded by ${newClaim.id}`);
        } else {
          // Same value, enrich evidence
          currentClaim.evidence.push(ruleEvidence);
          currentClaim.reviewedAt = fact.source.checkedAt;
          auditTrail.push(`[ENRICHED] Claim ${currentClaim.id} evidence refreshed`);
        }
      } else {
        // New claim
        const newClaim: KnowledgeClaim = {
          id: `claim_${fact.programId}_${fact.field}_v1`,
          programId: fact.programId,
          field: fact.field,
          value: fact.value,
          status: fact.status,
          evidence: [ruleEvidence],
          createdAt: fact.source.checkedAt,
          reviewedAt: new Date().toISOString().split('T')[0],
          isCurrent: true,
          notes: fact.notes
        };

        existingClaims.push(newClaim);
        this.claimsRegistry.set(fact.programId, existingClaims);
        importedClaims.push(newClaim);
        auditTrail.push(`[CREATED] New claim ${newClaim.id} for ${fact.programId}.${fact.field}`);
      }
    }

    return {
      success: true,
      importedClaims,
      conflicts,
      auditTrail
    };
  }

  public getClaimsForProgram(programId: string): KnowledgeClaim[] {
    return this.claimsRegistry.get(programId) || [];
  }
}
