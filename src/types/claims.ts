/**
 * Mizen - Claim-Level Knowledge Layer Architecture
 * 
 * Represents financing intelligence as discrete, source-tracked, temporally safe claims.
 * Preserves evidence history without allowing stale, superseded, or inferred facts
 * to corrupt active matching and calculation decisions.
 */

import { Language } from './financing';
import { SourceReference, SourceType, LocalizedText } from './knowledge';

export type EvidenceStrength =
  | 'DIRECT_PRIMARY_CURRENT'
  | 'DIRECT_PRIMARY_HISTORICAL'
  | 'OFFICIAL_SECONDARY'
  | 'SECONDARY'
  | 'INFERRED';

export type RuleStatus =
  | 'VERIFIED_CURRENT'
  | 'VERIFIED_HISTORICAL'
  | 'PARTIALLY_VERIFIED'
  | 'UNKNOWN'
  | 'CONFLICTING'
  | 'OUTDATED';

export type OperationalStatus =
  | 'ACTIVE_CONFIRMED'
  | 'ACTIVE_NOT_CONFIRMED'
  | 'UNKNOWN'
  | 'INACTIVE_CONFIRMED'
  | 'HISTORICAL_ONLY';

export type ApplicabilityScope =
  | 'UNIVERSAL'
  | 'CONDITIONAL'
  | 'GEOGRAPHICALLY_CONDITIONAL'
  | 'ENTITY_SPECIFIC'
  | 'UNKNOWN';

export type ClaimConflictStatus =
  | 'NONE'
  | 'CONFLICT_DETECTED'
  | 'SUPERSEDED'
  | 'HISTORICAL_DIVERGENCE';

export type CompatibilityStatus =
  | 'VERIFIED_COMPATIBLE'
  | 'POTENTIALLY_COMPATIBLE'
  | 'UNKNOWN'
  | 'VERIFIED_INCOMPATIBLE'
  | 'HISTORICAL_COMPATIBILITY';

export interface FinancingClaim {
  claimId: string;
  entityId: string; // Product ID, Provider ID, or Mechanism ID
  field: string;
  value: unknown;
  source: SourceReference;
  sourceType: SourceType;
  sourceDate?: string;
  retrievalDate: string;
  evidenceStrength: EvidenceStrength;
  ruleStatus: RuleStatus;
  operationalStatus: OperationalStatus;
  applicabilityStatus: ApplicabilityScope;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  effectiveDate?: string;
  expiryDate?: string;
  supersededByClaimId?: string;
  conflictStatus: ClaimConflictStatus;
  supersededReason?: string;
  notes?: LocalizedText;
  isFundLevelFact?: boolean; // True if this is a fund capitalization or budget, NOT an entrepreneur ceiling
}

export interface CompatibilityClaim {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  compatibilityStatus: CompatibilityStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: SourceReference[];
  ruleStatus: RuleStatus;
  notes?: LocalizedText;
}

export interface ClaimReconciliationResult {
  activeClaims: FinancingClaim[];
  historicalClaims: FinancingClaim[];
  allClaims: FinancingClaim[];
  conflictingClaims: FinancingClaim[];
  supersededClaims: FinancingClaim[];
  stats: {
    total: number;
    active: number;
    historical: number;
    superseded: number;
    conflicting: number;
  };
}
