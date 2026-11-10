import { LocalizedText, KnowledgeRuleStatus, SourceReference } from './knowledge';
import { RuleStatus, OperationalStatus } from './claims';
import { ApplicantProfile, MatchResult } from './financing';

export type StackFundingRole = 
  | 'CASH_FINANCING'
  | 'DEBT'
  | 'EQUITY'
  | 'QUASI_EQUITY'
  | 'GRANT'
  | 'SUBSIDY'
  | 'PROMOTER_CONTRIBUTION'
  | 'GUARANTEE'
  | 'LEASING'
  | 'OTHER_SUPPORT';

export type StackCompatibilityStatus = 
  | 'VERIFIED_COMPATIBLE'
  | 'POTENTIALLY_COMPATIBLE'
  | 'UNKNOWN'
  | 'INCOMPATIBLE';

export interface StackComponent {
  programId: string;
  programName: LocalizedText;
  providerId: string;
  providerName: LocalizedText;
  role: StackFundingRole;
  isCashFunding: boolean;
  /** Amount proposed for this candidate stack; not proof that the applicant has secured it. */
  allocatedAmount?: number;
  /** Explicit applicant-specific commitment, backed by an approval/offer/contract record. */
  confirmedCommitmentAmount?: number;
  /** Applicant-specific status; product operational status is not a funding commitment. */
  fundingCommitmentStatus?: 'NOT_REQUESTED' | 'APPLIED' | 'OFFERED' | 'COMMITTED' | 'UNKNOWN';
  /** Actual applicant-specific guarantee amount confirmed by the guarantee provider; not a programme ceiling. */
  confirmedGuaranteeCoverageAmount?: number;
  maxPotentialAmount?: number;
  coveragePercentage?: number;
  rateType?: string;
  evidenceStatus: KnowledgeRuleStatus | RuleStatus;
  evidenceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  operationalStatus: OperationalStatus;
  caveats?: LocalizedText[];
}

export interface StackCompatibilityEvaluation {
  programAId: string;
  programBId: string;
  compatibilityStatus: StackCompatibilityStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: LocalizedText;
  source?: SourceReference;
  isHistoricalOnly: boolean;
}

export interface FundingGapResult {
  /** False when the requested funding amount is missing, negative, or non-finite. */
  inputValid: boolean;
  requiredFunding: number;
  /** Sum of explicitly confirmed sources before comparing it with the requirement. */
  verifiedCashFunding: number;
  remainingFundingGap: number;
  /** Confirmed funding in excess of the requirement; never silently discarded. */
  fundingSurplus: number;
  cashCoverageRatio: number;
  guaranteeCoverageAmount: number;
  hasDoubleCounting: boolean;
  warnings: string[];
}

export interface FinancingStackCandidate {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  overallStatus: 'SUPPORTED' | 'POTENTIALLY_COMPATIBLE' | 'CONDITIONAL' | 'UNKNOWN' | 'INCOMPATIBLE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  requiredFunding: number;
  verifiedCashFunding: number;
  remainingFundingGap: number;
  fundingSurplus: number;
  cashCoverageRatio: number;
  promoterContribution?: number;
  components: StackComponent[];
  supportComponents: StackComponent[];
  compatibilityEvaluations: StackCompatibilityEvaluation[];
  unresolvedAssumptions: LocalizedText[];
  missingInformation: LocalizedText[];
  calculationLimitations: LocalizedText[];
  isReliablyCalculable: boolean;
  costEstimateSummary?: {
    totalMonthlyPayment?: number;
    explanation: LocalizedText;
  };
}

export interface FinancingStackInput {
  profile: ApplicantProfile;
  matchedPrograms: MatchResult[];
  requiredFunding?: number;
}

export interface FinancingStackResult {
  requiredFunding: number;
  totalProjectCost?: number;
  userContribution?: number;
  stacks: FinancingStackCandidate[];
  unverifiedCombinations?: FinancingStackCandidate[];
  /** Pair relationships that remain UNKNOWN; these are not necessarily renderable stack candidates. */
  unknownPairEvaluations?: StackCompatibilityEvaluation[];
  evaluatedPairCount: number;
  evidenceSummary: {
    verifiedPairs: number;
    potentialPairs: number;
    unknownPairs: number;
  };
}
