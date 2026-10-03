/**
 * Mizen - Canonical Knowledge Registry
 * Deterministic query and evidence retrieval layer for financing programs, claims, and rules.
 * 
 * Rules:
 * - Deterministic lookup only.
 * - No LLM inference in authoritative rule status.
 * - Distinguishes VERIFIED_CURRENT from VERIFIED_HISTORICAL and PARTIALLY_VERIFIED.
 */

import { 
  CANONICAL_PRODUCTS, 
  CANONICAL_PROVIDERS, 
  CANONICAL_METADATA 
} from './canonicalCatalogue';
import { 
  FinancingProduct, 
  FinancingProvider, 
  KnowledgeClaim, 
  KnowledgeRuleStatus, 
  OperationalStatus, 
  RuleEvidence, 
  UnknownReason 
} from '../types/knowledge';

export class KnowledgeRegistry {
  private static instance: KnowledgeRegistry;
  private productsMap: Map<string, FinancingProduct> = new Map();
  private providersMap: Map<string, FinancingProvider> = new Map();

  private constructor() {
    this.reload();
  }

  public static getInstance(): KnowledgeRegistry {
    if (!KnowledgeRegistry.instance) {
      KnowledgeRegistry.instance = new KnowledgeRegistry();
    }
    return KnowledgeRegistry.instance;
  }

  public reload(): void {
    this.productsMap.clear();
    this.providersMap.clear();

    for (const prov of CANONICAL_PROVIDERS) {
      this.providersMap.set(prov.id, prov);
    }
    for (const prod of CANONICAL_PRODUCTS) {
      this.productsMap.set(prod.id, prod);
    }
  }

  public getCanonicalProgram(id: string): FinancingProduct | undefined {
    return this.productsMap.get(id);
  }

  public getAllCanonicalPrograms(): FinancingProduct[] {
    return Array.from(this.productsMap.values());
  }

  public getCanonicalProviders(): FinancingProvider[] {
    return Array.from(this.providersMap.values());
  }

  public getCanonicalProvider(id: string): FinancingProvider | undefined {
    return this.providersMap.get(id);
  }

  public getProgramOperationalStatus(programId: string): OperationalStatus {
    const prod = this.productsMap.get(programId);
    if (!prod) return 'UNKNOWN';
    return prod.operationalStatus || 'UNKNOWN';
  }

  public getProgramKnowledgeVersion(programId: string): string {
    const prod = this.productsMap.get(programId);
    return prod?.knowledgeVersion || '1.0.0';
  }

  public getRuleEvidence(programId: string, field: string): RuleEvidence | undefined {
    const prod = this.productsMap.get(programId);
    if (!prod) return undefined;

    // Check direct evidence map if present
    if (prod.evidenceMap && prod.evidenceMap[field]) {
      return prod.evidenceMap[field];
    }

    // Check financialTerms verification
    const fieldVer = prod.financialTerms.verification.find(v => v.field === field);
    if (fieldVer) {
      return {
        field,
        status: (fieldVer.status as KnowledgeRuleStatus) || 'UNKNOWN',
        evidenceStrength: fieldVer.status === 'VERIFIED_CURRENT' 
          ? 'DIRECT_PRIMARY_CURRENT' 
          : fieldVer.status === 'VERIFIED_HISTORICAL' 
          ? 'DIRECT_PRIMARY_HISTORICAL' 
          : 'UNVERIFIED',
        unknownReason: fieldVer.unknownReason,
        notes: fieldVer.notes
      };
    }

    // Check criteria evidence
    const criterion = prod.criteria.find(c => c.field === field);
    if (criterion) {
      return {
        field,
        status: criterion.ruleStatus || 'VERIFIED_CURRENT',
        value: criterion.expectedValue,
        evidenceStrength: criterion.ruleStatus === 'VERIFIED_CURRENT' 
          ? 'DIRECT_PRIMARY_CURRENT' 
          : 'DIRECT_PRIMARY_HISTORICAL'
      };
    }

    return undefined;
  }

  public isFieldVerifiedCurrent(programId: string, field: string): boolean {
    const prod = this.productsMap.get(programId);
    if (!prod) return false;

    // If product itself is historical or outdated, field cannot be verified current
    if (prod.ruleStatus === 'VERIFIED_HISTORICAL' || prod.ruleStatus === 'OUTDATED') {
      return false;
    }

    // Check criterion
    const crit = prod.criteria.find(c => c.field === field);
    if (crit) {
      return crit.ruleStatus === 'VERIFIED_CURRENT';
    }

    // Check financial terms
    const termEvidence = prod.financialTerms.verification.find(v => v.field === field);
    if (termEvidence) {
      return termEvidence.status === 'VERIFIED_CURRENT' || termEvidence.status === 'VERIFIED';
    }

    // Check claims
    const claim = prod.claims?.find(c => c.field === field && c.isCurrent);
    if (claim) {
      return claim.status === 'VERIFIED_CURRENT';
    }

    return false;
  }

  public getCurrentRule(programId: string, field: string): unknown {
    const prod = this.productsMap.get(programId);
    if (!prod) return undefined;

    const crit = prod.criteria.find(c => c.field === field);
    if (crit && crit.ruleStatus === 'VERIFIED_CURRENT') {
      return crit.expectedValue;
    }

    const claim = prod.claims?.find(c => c.field === field && c.isCurrent);
    if (claim && claim.status === 'VERIFIED_CURRENT') {
      return claim.value;
    }

    if (field === 'minAmount') return prod.financialTerms.amount?.min;
    if (field === 'maxAmount') return prod.financialTerms.amount?.max;
    if (field === 'minProjectCost') return prod.financialTerms.projectCost?.min;
    if (field === 'maxProjectCost') return prod.financialTerms.projectCost?.max;

    return undefined;
  }

  public getUnknownReason(programId: string, field: string): UnknownReason | undefined {
    const evidence = this.getRuleEvidence(programId, field);
    return evidence?.unknownReason;
  }

  public getClaimsForProgram(programId: string): KnowledgeClaim[] {
    const prod = this.productsMap.get(programId);
    return prod?.claims || [];
  }
}

// Global exported helpers
export const registry = KnowledgeRegistry.getInstance();

export function getCanonicalProgram(id: string): FinancingProduct | undefined {
  return registry.getCanonicalProgram(id);
}

export function getRuleEvidence(programId: string, field: string): RuleEvidence | undefined {
  return registry.getRuleEvidence(programId, field);
}

export function getProgramOperationalStatus(programId: string): OperationalStatus {
  return registry.getProgramOperationalStatus(programId);
}

export function isFieldVerifiedCurrent(programId: string, field: string): boolean {
  return registry.isFieldVerifiedCurrent(programId, field);
}

export function getCurrentRule(programId: string, field: string): unknown {
  return registry.getCurrentRule(programId, field);
}

export function getUnknownReason(programId: string, field: string): UnknownReason | undefined {
  return registry.getUnknownReason(programId, field);
}

export function getProgramKnowledgeVersion(programId: string): string {
  return registry.getProgramKnowledgeVersion(programId);
}

export function getClaimsForProgram(programId: string): KnowledgeClaim[] {
  return registry.getClaimsForProgram(programId);
}

export function getAllCanonicalPrograms(): FinancingProduct[] {
  return registry.getAllCanonicalPrograms();
}

export function getCanonicalProviders(): FinancingProvider[] {
  return registry.getCanonicalProviders();
}
