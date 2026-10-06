import { getAuthoritativeCatalogueProducts, getAuthoritativeCatalogueProduct, getAuthoritativeCatalogueProviders, getAuthoritativeClaim } from './authoritativeCatalogueProjection';
import { CLAIMS_REPOSITORY } from './claimsRepository';
import { FinancingProduct, KnowledgeRuleStatus, OperationalStatus, RuleEvidence, UnknownReason, KnowledgeClaim } from '../types/knowledge';

export class KnowledgeRegistry {
  private static instance: KnowledgeRegistry;
  private productsMap = new Map<string, FinancingProduct>();

  private constructor() { this.reload(); }

  public static getInstance(): KnowledgeRegistry {
    if (!KnowledgeRegistry.instance) KnowledgeRegistry.instance = new KnowledgeRegistry();
    return KnowledgeRegistry.instance;
  }

  public reload(): void {
    this.productsMap.clear();
    for (const product of getAuthoritativeCatalogueProducts()) this.productsMap.set(product.id, product);
  }

  public getCanonicalProgram(id: string): FinancingProduct | undefined {
    return getAuthoritativeCatalogueProduct(id);
  }

  public getAllCanonicalPrograms(): FinancingProduct[] {
    return Array.from(this.productsMap.values());
  }

  public getCanonicalProviders() {
    return getAuthoritativeCatalogueProviders();
  }

  public getCanonicalProvider(id: string) {
    return getAuthoritativeCatalogueProviders().find(p => p.id === id);
  }

  public getProgramOperationalStatus(programId: string): OperationalStatus {
    const claims = CLAIMS_REPOSITORY.getAllClaims(programId);
    const active = claims.find(c => c.operationalStatus === 'ACTIVE_CONFIRMED');
    if (active) return 'ACTIVE_CONFIRMED';
    const pending = claims.find(c => c.operationalStatus === 'ACTIVE_NOT_CONFIRMED');
    if (pending) return 'ACTIVE_NOT_CONFIRMED';
    const historical = claims.find(c => c.operationalStatus === 'HISTORICAL_ONLY');
    if (historical) return 'HISTORICAL_ONLY';
    const inactive = claims.find(c => c.operationalStatus === 'INACTIVE_CONFIRMED');
    if (inactive) return 'INACTIVE_CONFIRMED';
    // A missing operational claim is UNKNOWN. Do not fall back to a legacy
    // product.active/status flag because that flag is not authoritative.
    return 'UNKNOWN';
  }

  public getProgramKnowledgeVersion(programId: string): string {
    const claims = CLAIMS_REPOSITORY.getAllClaims(programId);
    return claims.length ? `claims-${claims.length}` : '1.0.0';
  }

  public getRuleEvidence(programId: string, field: string): RuleEvidence | undefined {
    // Financing facts are claims-only. Never infer a current rule from a
    // legacy criterion when the authoritative claim repository has no claim.
    const claim = getAuthoritativeClaim(programId, field);
    if (!claim) return undefined;

    return {
      field,
      status: claim.ruleStatus as KnowledgeRuleStatus,
      value: claim.value,
      evidenceStrength: claim.evidenceStrength,
      unknownReason: undefined,
      notes: claim.notes
    };
  }

  public isFieldVerifiedCurrent(programId: string, field: string): boolean {
    const claim = getAuthoritativeClaim(programId, field);
    if (claim) return claim.ruleStatus === 'VERIFIED_CURRENT' && claim.operationalStatus !== 'HISTORICAL_ONLY';
    return false;
  }

  public getCurrentRule(programId: string, field: string): unknown {
    const claim = getAuthoritativeClaim(programId, field);
    if (claim) return claim.ruleStatus === 'VERIFIED_CURRENT' ? claim.value : undefined;
    return undefined;
  }

  public getUnknownReason(programId: string, field: string): UnknownReason | undefined {
    return this.getRuleEvidence(programId, field)?.unknownReason;
  }

  public getClaimsForProgram(programId: string): KnowledgeClaim[] {
    return CLAIMS_REPOSITORY.getAllClaims(programId) as unknown as KnowledgeClaim[];
  }
}

export const registry = KnowledgeRegistry.getInstance();
export const getCanonicalProgram = (id: string) => registry.getCanonicalProgram(id);
export const getRuleEvidence = (programId: string, field: string) => registry.getRuleEvidence(programId, field);
export const getProgramOperationalStatus = (programId: string) => registry.getProgramOperationalStatus(programId);
export const isFieldVerifiedCurrent = (programId: string, field: string) => registry.isFieldVerifiedCurrent(programId, field);
export const getCurrentRule = (programId: string, field: string) => registry.getCurrentRule(programId, field);
export const getUnknownReason = (programId: string, field: string) => registry.getUnknownReason(programId, field);
export const getProgramKnowledgeVersion = (programId: string) => registry.getProgramKnowledgeVersion(programId);
export const getClaimsForProgram = (programId: string) => registry.getClaimsForProgram(programId);
export const getAllCanonicalPrograms = () => registry.getAllCanonicalPrograms();
export const getCanonicalProviders = () => registry.getCanonicalProviders();
