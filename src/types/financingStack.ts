export type StackFundingRole =
  | 'DEBT'
  | 'EQUITY'
  | 'QUASI_EQUITY'
  | 'GRANT'
  | 'GUARANTEE'
  | 'PROMOTER_CONTRIBUTION'
  | 'SUBSIDY';

export type StackCompatibilityStatus =
  | 'VERIFIED_COMPATIBLE'
  | 'POTENTIALLY_COMPATIBLE'
  | 'UNKNOWN'
  | 'INCOMPATIBLE';

export type StackOverallStatus = 'VERIFIED' | 'CONDITIONAL' | 'UNKNOWN' | 'INCOMPATIBLE';
export type StackConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface StackComponent {
  sourceId: string;
  programId?: string;
  role: StackFundingRole;
  cashAmount?: number;
  verifiedCapacity?: number;
  supportCoverage?: number;
  supportType?: 'GUARANTEE' | 'SUBSIDY' | 'OTHER';
  evidenceStatus: string;
  notes?: string[];
}

export interface FundingGapResult {
  requiredFunding: number;
  cashCovered: number;
  remainingGap: number;
  supportCoverage: number;
  diagnostics: string[];
}

export interface StackCompatibilityEvaluation {
  programAId: string;
  programBId: string;
  status: StackCompatibilityStatus;
  evidenceStatus: string;
  rationale: string;
  source?: string;
}

export interface FinancingStackCandidate {
  id: string;
  components: StackComponent[];
  fundingGap: FundingGapResult;
  overallStatus: StackOverallStatus;
  confidence: StackConfidence;
  unresolvedAssumptions: string[];
  compatibility: StackCompatibilityEvaluation[];
  evidenceStrength: number;
}

export interface FinancingStackResult {
  requiredFunding: number;
  candidates: FinancingStackCandidate[];
  diagnostics: string[];
}
