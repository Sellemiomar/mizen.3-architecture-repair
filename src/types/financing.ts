/**
 * Mizen - Unified Financing Intelligence Domain Model
 * Unifying Mizen 1's rigorous domain definitions & verification statuses
 * with Mizen 2's modern application capabilities.
 */

export type Language = 'fr' | 'ar';

export type VerificationStatus = 
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'OUTDATED'
  | 'UNVERIFIED'
  | 'SOURCE_UNAVAILABLE';

export type ProviderType = 
  | 'public_bank'
  | 'microfinance'
  | 'guarantee_fund'
  | 'public_agency'
  | 'sovereign_fund'
  | 'islamic_bank'
  | 'commercial_bank';

export interface Provider {
  id: string;
  name: string;
  acronym: string;
  type: ProviderType;
  description: {
    fr: string;
    ar: string;
  };
  website: string;
  headquarters: string;
  networkCoverage: {
    fr: string;
    ar: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  officialBadgeText: {
    fr: string;
    ar: string;
  };
}

export type FinancingCategory = 
  | 'bank_loan'
  | 'subsidized_loan'
  | 'microcredit'
  | 'guarantee'
  | 'grant_subsidy'
  | 'equity_quasi_equity'
  | 'islamic_finance';

export type FinancingPurpose = 
  | 'creation'
  | 'equipment'
  | 'working_capital'
  | 'expansion'
  | 'agriculture'
  | 'innovation_rd'
  | 'export'
  | 'first_home'
  | 'home_construction'
  | 'vehicle';

export type FinancingJourney = 
  | 'home_purchase'
  | 'home_construction'
  | 'car'
  | 'startup'
  | 'business_expansion'
  | 'equipment'
  | 'agriculture'
  | 'other_professional'
  | 'business_creation';

export type BusinessStage = 
  | 'idea_project'
  | 'creation_underway'
  | 'established_under_2y'
  | 'established_over_2y';

export type BusinessSector = 
  | 'industry'
  | 'services'
  | 'ict_tech'
  | 'agriculture_agribusiness'
  | 'crafts_trades'
  | 'commerce'
  | 'renewable_energy'
  | 'tourism'
  | 'hotels_accommodation'
  | 'real_estate'
  | 'real_estate_development'
  | 'residential_real_estate_promotion'
  | 'other';

export type LegalStructure = 
  | 'suarl'
  | 'sarl'
  | 'sa'
  | 'individual'
  | 'personne_physique'
  | 'cooperative'
  | 'agricultural_coop'
  | 'association'
  | 'not_yet_created';

export type MonthlyIncomeRange = 
  | 'under_1000'
  | '1000_1500'
  | '1500_2500'
  | '2500_4000'
  | 'over_4000';

export type EmploymentStatus =
  | 'salaried_private'
  | 'salaried_public'
  | 'independent_professional'
  | 'business_owner'
  | 'job_seeker';

export type PropertyType =
  | 'new_apartment'
  | 'individual_house'
  | 'land_and_build'
  | 'renovation';

export type VehicleCondition = 'new' | 'used';
export type VehicleBuyerType = 'individual' | 'business';
export type VehicleUsage = 'personal' | 'professional';
export type VehicleCategory = 'passenger' | 'utility_commercial' | 'fleet';

export type ConstructionType = 'construction' | 'renovation' | 'extension';
export type StartupProjectStage = 'idea' | 'study_prep' | 'incorporated' | 'launch_underway' | 'operating';
export type AnnualTurnoverRange = 'under_100k' | '100k_500k' | '500k_2m' | '2m_5m' | 'over_5m';
export type EmployeesCountRange = '1_5' | '6_20' | '21_50' | 'over_50';
export type ExpansionPurpose = 'expansion' | 'equipment' | 'working_capital' | 'premises' | 'vehicle_fleet' | 'renovation' | 'acquisition' | 'other';
export type EquipmentCategory = 'manufacturing' | 'agriculture' | 'construction' | 'commercial' | 'tech_it' | 'medical' | 'transport' | 'other';
export type AgriculturalActivityType = 'crops' | 'livestock' | 'mixed' | 'irrigation_equipment' | 'agri_services';
export type AgriculturalLandStatus = 'owned' | 'leased' | 'family_land' | 'state_domain';

export interface ApplicantProfile {
  // Specialized Journey Selector
  journey?: FinancingJourney;

  // Core financial figures (Strict Mizen separation)
  totalProjectCost?: number;       // Coût total du projet / bien (TND)
  userContribution?: number;       // Apport personnel (TND)
  financingRequested?: number;     // Financement demandé (TND)

  purpose?: FinancingPurpose;
  businessStage?: BusinessStage;
  businessAgeYears?: number;
  sector?: BusinessSector;
  location?: string;               // Gouvernorat (e.g. 'Tunis', 'Sousse', 'Kasserine', etc.)
  isRegionalDevelopmentZone?: boolean; // Zone d'encouragement au développement régional (ZDR)
  legalStructure?: LegalStructure;

  // Key qualifying traits
  monthlyIncomeRange?: MonthlyIncomeRange;
  employmentStatus?: EmploymentStatus;
  propertyType?: PropertyType;
  isFirstPropertyPurchase?: boolean;
  hasStartupActLabel?: boolean;
  applicantAge?: number;
  hasHigherEducationDegree?: boolean;
  collateralPreference?: 'available' | 'limited' | 'none';
  structurePreference?: 'standard' | 'islamic' | 'any';

  // Specialized Fields: Car Financing Journey
  vehicleCondition?: VehicleCondition;
  vehicleBuyerType?: VehicleBuyerType;
  vehicleUsage?: VehicleUsage;
  vehicleDesiredTermMonths?: number;
  vehicleIsReplacement?: boolean;
  vehicleCategory?: VehicleCategory;

  // Specialized Fields: Home Purchase / Construction
  propertyCondition?: 'new' | 'existing';
  constructionType?: ConstructionType;
  hasLandOwnershipTitle?: boolean;
  isPrincipalResidence?: boolean;
  desiredTermYears?: number;

  // Specialized Fields: Startup Journey
  startupProjectStage?: StartupProjectStage;
  isIncorporated?: boolean;
  needsEquipmentOrPremises?: boolean;

  // Specialized Fields: Expansion Journey
  annualTurnoverRange?: AnnualTurnoverRange;
  employeesCountRange?: EmployeesCountRange;
  expansionPurpose?: ExpansionPurpose;
  hasExistingBankDebt?: boolean;

  // Specialized Fields: Equipment Journey
  equipmentCategory?: EquipmentCategory;
  equipmentCondition?: 'new' | 'used';
  hasProformaInvoice?: boolean;

  // Specialized Fields: Agricultural Journey
  agriculturalActivityType?: AgriculturalActivityType;
  agriculturalLandStatus?: AgriculturalLandStatus;
  isSeasonalRequirement?: boolean;

  // Specialized Fields: Other Professional
  generalApplicantType?: 'individual' | 'business';

  // Demo metadata
  isDemoCase?: boolean;
  demoCaseId?: string;
  demoCaseTitle?: {
    fr: string;
    ar: string;
  };

  // User prioritization preferences
  userPriorities?: UserPriority[];

  // Context notes from user
  projectDescription?: string;
}

export type FinancingStructure = 
  | 'CONVENTIONAL_CREDIT'
  | 'LEASING'
  | 'IJARA'
  | 'MOURABAHA'
  | 'GRANT_SUBSIDY'
  | 'GUARANTEE'
  | 'OTHER'
  | 'UNKNOWN';

export type UserPriority = 
  | 'LOWEST_MONTHLY_PAYMENT'
  | 'LOWEST_INITIAL_CONTRIBUTION'
  | 'SHORTEST_DURATION'
  | 'LONGEST_DURATION'
  | 'ISLAMIC_FINANCING'
  | 'FAST_APPLICATION'
  | 'MINIMUM_FEES';

export interface ApplicationReadiness {
  knownFields: {
    key: string;
    label: {
      fr: string;
      ar: string;
    };
    value: string;
  }[];
  missingApplicantFields: {
    key: string;
    label: {
      fr: string;
      ar: string;
    };
  }[];
  lenderConfirmationFields: {
    key: string;
    label: {
      fr: string;
      ar: string;
    };
  }[];
  requiredDocuments: DocumentRequirement[];
  readinessScorePercent: number;
}

export interface DemoScenario {
  id: string;
  number: number;
  title: {
    fr: string;
    ar: string;
  };
  subtitle: {
    fr: string;
    ar: string;
  };
  badge: {
    fr: string;
    ar: string;
  };
  targetInstitutions: string[];
  description: {
    fr: string;
    ar: string;
  };
  profile: ApplicantProfile;
}

export interface VerificationRecord {
  status: VerificationStatus;
  sourceUrl: string;
  sourceTitle: string;
  sourceType: 'official_portal' | 'decree_law' | 'bank_fiche' | 'public_framework';
  dateChecked: string;
  verifiedFields: string[];
  unverifiedFields: string[];
  notes: {
    fr: string;
    ar: string;
  };
  lastUpdateYear: number;
}

export interface DocumentRequirement {
  id: string;
  name: {
    fr: string;
    ar: string;
  };
  category: 'identity' | 'legal' | 'technical_business_plan' | 'financial' | 'quotations_invoices';
  mandatory: boolean;
  details?: {
    fr: string;
    ar: string;
  };
}

export interface FinancingProgram {
  id: string;
  code: string;
  providerId: string;
  name: {
    fr: string;
    ar: string;
  };
  tagline: {
    fr: string;
    ar: string;
  };
  category: FinancingCategory;
  purposes: FinancingPurpose[];
  
  // Financial boundaries
  minAmount: number;             // TND
  maxAmount: number;             // TND
  minContributionPercent: number;// Min % apport personnel requis (e.g. 10%, 20%)
  
  // Terms
  rateType: 'fixed' | 'variable_tmm' | 'subsidized' | 'interest_free' | 'equity' | 'profit_margin' | 'unknown';
  rateDescription: {
    fr: string;
    ar: string;
  };
  estimatedRateAnnual?: number;  // Indicatif (e.g. 7.5 or 10.5%)
  durationMonthsMin: number;
  durationMonthsMax: number;
  gracePeriodMonthsMin: number;
  gracePeriodMonthsMax: number;

  // Guarantees & eligibility
  guaranteeRequirements: {
    fr: string;
    ar: string;
  };
  targetAudience: {
    fr: string;
    ar: string;
  };
  eligibilityCriteria: {
    stages: BusinessStage[];
    sectors: BusinessSector[];
    allowedLegalForms: LegalStructure[];
    minAge?: number;
    maxAge?: number;
    requiresDegree?: boolean;
    requiresStartupLabel?: boolean;
    regionalPriorityZonesOnly?: boolean;
    otherRules: {
      fr: string;
      ar: string;
    }[];
  };

  requiredDocuments: DocumentRequirement[];
  applicationSteps: {
    step: number;
    title: {
      fr: string;
      ar: string;
    };
    description: {
      fr: string;
      ar: string;
    };
  }[];
  importantCaveats: {
    fr: string;
    ar: string;
  }[];

  // Data-driven matching flags (avoids hardcoded program IDs in matching engine)
  hasRegionalDevelopmentBonus?: boolean;
  accessibleWithoutHeavyCollateral?: boolean;
  applicability?: {
    supportedJourneys?: FinancingJourney[];
    supportedPurposes?: FinancingPurpose[];
    supportedBuyerTypes?: ('individual' | 'business')[];
    requiresBusinessEntity?: boolean;
    isFirstPropertyOnly?: boolean;
    unverifiedApplicability?: boolean;
  };

  // Traceability & Verification
  verification: VerificationRecord;
}

export type ApplicabilityStatus = 'APPLICABLE' | 'NOT_APPLICABLE' | 'UNKNOWN';
export type RuleStatus = 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT_APPLICABLE';
export type RuleCriticality = 'CRITICAL' | 'IMPORTANT' | 'INFORMATIONAL';

export interface RuleEvaluation {
  ruleId: string;
  label: {
    fr: string;
    ar: string;
  };
  criticality: RuleCriticality;
  status: RuleStatus;
  explanation: {
    fr: string;
    ar: string;
  };
  verifiedSourceField?: string;
}

export interface FinancialEvaluation {
  amountStatus: RuleStatus;
  contributionStatus: RuleStatus;
  overallFinancialStatus: 'COMPATIBLE' | 'PARTIALLY_COMPATIBLE' | 'INCOMPATIBLE' | 'UNKNOWN';
  details: {
    fr: string;
    ar: string;
  }[];
}

export interface EvidenceEvaluation {
  status: VerificationStatus;
  isOutdated: boolean;
  hasUnverifiedFields: boolean;
  confidenceScore: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: {
    fr: string;
    ar: string;
  };
}

export type MatchStatus = 
  | 'STRONG_ALIGNMENT'
  | 'POTENTIAL_ALIGNMENT'
  | 'REQUIRES_CONFIRMATION'
  | 'NOT_MATCHED'
  | 'NOT_APPLICABLE';

export type AlignmentLevel = 'strong_alignment' | 'partial_alignment' | 'potential_blockers' | 'not_applicable';

export interface MatchReason {
  matchedBecause: {
    fr: string;
    ar: string;
  }[];
  potentialIssues: {
    fr: string;
    ar: string;
  }[];
  needsVerification: {
    fr: string;
    ar: string;
  }[];
  alignmentLevel: AlignmentLevel;
}

export type RateOrigin = 
  | 'official_current_benchmark' // e.g. BCT TMM benchmark
  | 'subsidized_fixed_decree'   // e.g. BTS subsidized rate
  | 'user_provided'             // user entered rate
  | 'estimated_market_spread'   // e.g. TMM + bank margin assumption
  | 'interest_free_grant'       // e.g. 0% for subsidies
  | 'unavailable';              // Rate cannot be reliably determined

export interface CostEstimate {
  canCalculateReliably: boolean;
  financingStructure: FinancingStructure;
  evidenceStatus: VerificationStatus;
  rateOrigin?: RateOrigin;
  rateOriginLabel?: {
    fr: string;
    ar: string;
  };
  rateBenchmarkSource?: string;
  rateBenchmarkDate?: string;
  monthlyPayment?: number;
  totalRepayment?: number;
  totalCostOfFinancing?: number;
  assumedRatePercent?: number;
  durationMonths?: number;
  gracePeriodMonths?: number;
  firstRent?: number;
  residualValue?: number;
  calculationExplanation: {
    fr: string;
    ar: string;
  };
  unreliableReason?: {
    fr: string;
    ar: string;
  };
}

import { ExclusionReason, SimulatorReference } from './knowledge';
export * from './knowledge';

export type EligibilityOutcome = 
  | 'DOCUMENTED_ELIGIBILITY'
  | 'POTENTIAL_ELIGIBILITY'
  | 'UNKNOWN'
  | 'UNKNOWN_DUE_TO_MISSING_DATA'
  | 'INCOMPATIBLE_ON_DOCUMENTED_RULES';

export interface MatchResult {
  program: FinancingProgram;
  provider: Provider;
  status: MatchStatus;
  eligibilityOutcome?: EligibilityOutcome;
  applicabilityStatus: ApplicabilityStatus;
  applicabilityReason?: {
    fr: string;
    ar: string;
  };
  ruleEvaluations: RuleEvaluation[];
  financialEvaluation: FinancialEvaluation;
  evidenceEvaluation: EvidenceEvaluation;
  reasons: MatchReason;
  costEstimate: CostEstimate;
  applicationReadiness: ApplicationReadiness;
  exclusionReason?: ExclusionReason;
  officialSimulator?: SimulatorReference;
  compatibilitySummary: {
    fr: string;
    ar: string;
  };
  scoreWeight: number; // Categorical ranking weight for secondary ordering
}

export interface LeadSubmission {
  id: string;
  createdAt: string;
  applicant: ApplicantProfile;
  selectedProgramIds: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'draft' | 'submitted' | 'processing';
  notes?: string;
}

export interface DocumentAnalysisReport {
  documentName: string;
  identifiedFields: {
    key: string;
    label: string;
    extractedValue: string;
    status: 'matches_profile' | 'contradiction' | 'neutral';
    comment?: string;
  }[];
  missingMandatoryDocs: string[];
  recommendations: string[];
}
