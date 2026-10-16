/**
 * Mizen architecture regression guardrails.
 * These assertions intentionally fail when knowledge disappears instead of
 * allowing "missing product" to become a passing test.
 */

import { runMatchingEngine, evaluateProgramCompatibility } from '../src/engine/matchingEngine';
import { calculateFinancingCost } from '../src/engine/financialCalculations';
import {
  calculateFundingGap,
  generateFinancingStacks,
  mapProgramToStackComponent,
  createStackComponent,
  evaluateStackCandidate,
  determineStackFundingRole
} from '../src/engine/financingStackEngine';
import { getAuthoritativeFinancingPrograms, getAuthoritativeProviders, getAuthoritativeFinancingProgram } from '../src/knowledge/authoritativeProjection';
import { CANONICAL_PRODUCTS } from '../src/knowledge/canonicalCatalogue';
import { getStackCompatibility } from '../src/knowledge/stackCompatibility';
import { getAuthoritativeCatalogueProducts, getAuthoritativeCatalogueProviders } from '../src/knowledge/authoritativeCatalogueProjection';
import { validateKnowledgeCatalogue } from '../src/knowledge/knowledgeValidator';
import { CLAIMS_REPOSITORY } from '../src/knowledge/claimsRepository';
import { getAuthoritativeClaim } from '../src/knowledge/authoritativeProjection';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatFinancingAmountRange } from '../src/utils/financingAmountLabels';

let failed = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const sourceFiles = collectSourceFiles(join(process.cwd(), 'src'));
const legacyImports = sourceFiles.filter(file => {
  const text = readFileSync(file, 'utf8');
  return /(?:from\s+|import\s*\()['"][^'"]*data\/financingData(?:\.ts)?['"]/.test(text);
});
assert(legacyImports.length === 0, 'Deprecated financingData fixture must never be imported by production source files');

const programs = getAuthoritativeFinancingPrograms();
const providers = getAuthoritativeProviders();

// Stack synthesis must reject invalid required amounts at its own boundary,
// not merely rely on calculateFundingGap to sanitize a later calculation.
const negativeFundingStack = generateFinancingStacks({
  applicantProfile: { financingRequested: -1 } as any,
  matchResults: []
});
assert(
  negativeFundingStack.requiredFunding === 0 && negativeFundingStack.stacks.length === 0,
  'Negative financing requirement cannot leak into generated stack totals'
);
const nonFiniteFundingStack = generateFinancingStacks({
  applicantProfile: { financingRequested: Number.NaN } as any,
  matchResults: []
});
assert(
  nonFiniteFundingStack.requiredFunding === 0 && nonFiniteFundingStack.stacks.length === 0,
  'Non-finite financing requirement cannot leak into generated stack totals'
);

// A large SME request must not remain an applicable BTS Honour Loan candidate
// merely because the product stores its tiered caps as claims rather than maxAmount.
const btsHonour = programs.find(p => p.id === 'bts_credit_sur_honneur');
const btsProvider = providers.find(p => p.id === btsHonour?.providerId);
if (btsHonour && btsProvider) {
  const largeIndustrialSme = {
    purpose: 'equipment' as const,
    sector: 'industry' as const,
    location: 'Zaghouan',
    businessStage: 'established_under_2y' as const,
    legalStructure: 'suarl' as const,
    totalProjectCost: 300000,
    userContribution: 60000,
    financingRequested: 240000
  };
  const btsHonourResult = evaluateProgramCompatibility(largeIndustrialSme, btsHonour, btsProvider);
  assert(
    btsHonourResult.financialEvaluation.amountStatus === 'FAIL' &&
    btsHonourResult.status === 'NOT_MATCHED',
    'BTS Honour Loan request above the authoritative SME tier ceiling is blocked, not listed as an applicable candidate'
  );

  const nonFiniteBtsRequest = evaluateProgramCompatibility(
    { ...largeIndustrialSme, financingRequested: Number.NaN },
    btsHonour,
    btsProvider
  );
  assert(
    nonFiniteBtsRequest.financialEvaluation.amountStatus === 'UNKNOWN' &&
    nonFiniteBtsRequest.ruleEvaluations.some(rule => rule.ruleId === 'btsHonourLoanTierCap' && rule.status === 'UNKNOWN'),
    'Non-finite BTS financing request remains UNKNOWN and cannot fall through to a passing tier-cap comparison'
  );

  const unknownBtsApplicantTier = evaluateProgramCompatibility(
    {
      purpose: 'equipment' as const,
      sector: 'industry' as const,
      location: 'Zaghouan',
      financingRequested: 10000
    },
    btsHonour,
    btsProvider
  );
  assert(
    unknownBtsApplicantTier.financialEvaluation.amountStatus === 'UNKNOWN' &&
    unknownBtsApplicantTier.ruleEvaluations.some(rule => rule.ruleId === 'btsHonourLoanTierCap' && rule.status === 'UNKNOWN'),
    'BTS tier ceiling remains UNKNOWN when applicant stage and legal structure do not establish the applicable category'
  );
} else {
  assert(false, 'BTS Honour Loan and provider must exist for tier-cap regression');
}

// Small-ticket support must be visually separated from primary-gap financing.
// This programme's detailed tier and current availability remain partly unverified,
// so the UI must not imply that it can cover the full request.
const resultsViewSource = readFileSync(join(process.cwd(), 'src/components/ResultsView.tsx'), 'utf8');
assert(
  resultsViewSource.includes("program.id === 'bts_credit_sur_honneur'") &&
  resultsViewSource.includes('Petit ticket / complément — plafond à confirmer') &&
  resultsViewSource.includes('السقف يحتاج إلى تأكيد'),
  'BTS Crédit sur l’honneur is visibly labelled as supplementary small-ticket support with its ceiling unconfirmed'
);

// 1. Required current mechanisms must exist.
const foprolos = programs.find(p => p.id === 'foprolos_construction');
const foprodi = programs.find(p => p.id === 'foprodi_dotation');
const enda = programs.find(p => p.id === 'enda_microcredit_equip');

assert(foprolos !== undefined, 'FOPROLOS must exist in authoritative runtime');
assert(foprolos?.category === 'subsidized_loan', 'FOPROLOS construction is classified as a subsidized loan, not a generic grant');
assert(foprolos?.maxFinancingPercentage === 90, 'FOPROLOS construction financing can reach 90% of eligible cost');
assert(foprolos?.minContributionPercent === 5, 'FOPROLOS minimum documented contribution floor is 5%');
assert(foprolos?.durationMonthsMax === 300, 'FOPROLOS construction repayment ceiling is 25 years');
assert(foprolos?.gracePeriodMonthsMax === 24, 'FOPROLOS construction grace period is up to 2 years');
assert(foprolos?.applicability?.unverifiedApplicability === true, 'Explicitly unverified FOPROLOS applicability remains a runtime confirmation gate');
assert(foprolos?.verification.verifiedFields.includes('gracePeriodMonths') === true, 'FOPROLOS grace period is field-level verified');
const startupBourseEarly = programs.find(p => p.id === 'startup_act_bourse');
assert(startupBourseEarly !== undefined, 'Startup Act founder stipend must exist');
assert(startupBourseEarly?.maxAmount === 0, 'Startup stipend must not be represented as a fixed total amount');
assert(CANONICAL_PRODUCTS.some(p => p.id === 'startup_act_bourse' && p.shortDescription?.fr?.includes('net/mois')), 'Startup stipend is described as a monthly benefit, not a total project amount');
assert(!startupBourseEarly?.rateDescription.fr.includes('non remboursable'), 'Startup stipend must not be mislabeled as a non-refundable grant');
assert(!String(CANONICAL_PRODUCTS.find(p => p.id === 'startup_act_bourse')?.financialTerms.rate?.explanation?.ar || '').includes('غير مستردة'), 'Startup stipend Arabic explanation must not mislabel it as a non-refundable grant');
assert(String(CANONICAL_PRODUCTS.find(p => p.id === 'startup_act_bourse')?.shortDescription?.ar || '').includes('5,000') === true, 'Startup stipend Arabic description must include the current 5,000 TND upper range');
assert(foprolos?.rateType === 'fixed' && foprolos?.rateDescription.fr.includes('1%, 3%, 5% ou 7%'), 'FOPROLOS exposes the verified income-category rate schedule');
const foproloIncomeCapClaim = getAuthoritativeClaim('foprolos_construction', 'incomeCapSmigMultiple');
const foproloIncomeCriterion = foprolos?.criteria?.find(criterion => criterion.id === 'crit_foprolos_income');
assert(
  foproloIncomeCapClaim !== undefined &&
  foproloIncomeCriterion?.expectedValue === foproloIncomeCapClaim.value,
  'FOPROLOS gross-household-income criterion uses the authoritative incomeCapSmigMultiple claim rather than a stale catalogue literal'
);
assert(foprolos?.maxAmount === 0, 'FOPROLOS does not invent a fixed DT ceiling from the 300-SMIG formula');
assert(foprodi !== undefined, 'FOPRODI must exist in authoritative runtime');
assert(enda !== undefined, 'Enda Bidaya must exist in authoritative runtime');

// Catalogue-level critical criteria must reach the matcher. A missing partner-bank
// filing cannot disappear just because the catalogue's narrative mentions it.
const sotugarCriteriaProgram = structuredClone(programs.find(p => p.id === 'sotugar_guarantee')!);
const sotugarCriteriaProvider = providers.find(p => p.id === sotugarCriteriaProgram.providerId)!;
const sotugarCriteriaApplicant = {
  journey: 'startup' as const,
  purpose: 'creation' as const,
  totalProjectCost: 100000,
  userContribution: 20000,
  financingRequested: 80000,
  sector: 'industry' as const,
  location: 'Sousse',
  businessStage: 'idea_project' as const,
  legalStructure: 'suarl' as const,
  generalApplicantType: 'business' as const
};
const sotugarCriteriaResult = evaluateProgramCompatibility(
  sotugarCriteriaApplicant,
  sotugarCriteriaProgram,
  sotugarCriteriaProvider
);
assert(
  sotugarCriteriaResult.ruleEvaluations.some(rule =>
    rule.ruleId === 'catalogue_crit_sotugar_bank_coop' && rule.status === 'UNKNOWN'
  ) && sotugarCriteriaResult.eligibilityOutcome !== 'DOCUMENTED_ELIGIBILITY',
  'A critical catalogue condition requiring partner-bank filing cannot silently disappear from matching'
);

const foprolosCriteriaProvider = providers.find(p => p.id === foprolos!.providerId)!;
const foprolosCriteriaApplicant = {
  journey: 'home_construction' as const,
  purpose: 'home_construction' as const,
  totalProjectCost: 120000,
  userContribution: 25000,
  financingRequested: 95000,
  employmentStatus: 'salaried_private' as const,
  constructionType: 'construction' as const,
  hasLandOwnershipTitle: true,
  isFirstPropertyPurchase: true,
  location: 'Nabeul'
};
const foprolosCriteriaResult = evaluateProgramCompatibility(foprolosCriteriaApplicant, foprolos!, foprolosCriteriaProvider);
assert(
  foprolosCriteriaResult.ruleEvaluations.some(rule =>
    rule.ruleId === 'catalogue_crit_foprolos_household_ownership' && rule.status === 'UNKNOWN'
  ) &&
  foprolosCriteriaResult.ruleEvaluations.some(rule =>
    rule.ruleId === 'catalogue_crit_foprolos_salaried' && rule.status === 'UNKNOWN'
  ) &&
  foprolosCriteriaResult.eligibilityOutcome !== 'DOCUMENTED_ELIGIBILITY',
  'FOPROLOS household ownership and salaried-category CUSTOM rules stay unresolved until their dedicated evidence and evaluators exist'
);
assert(
  foprolosCriteriaResult.ruleEvaluations.some(rule =>
    rule.ruleId === 'catalogue_crit_foprolos_income' && rule.status === 'UNKNOWN'
  ),
  'FOPROLOS household income stays UNKNOWN when the gross household-income/SMIG ratio is missing'
);
const foprolosWithinIncomeCap = evaluateProgramCompatibility(
  { ...foprolosCriteriaApplicant, monthlyGrossHouseholdIncomeSmigMultiple: 5.5 },
  foprolos!,
  foprolosCriteriaProvider
);
assert(
  foprolosWithinIncomeCap.ruleEvaluations.some(rule =>
    rule.ruleId === 'catalogue_crit_foprolos_income' && rule.status === 'PASS'
  ),
  'A supplied household gross-income ratio at or below six SMIG passes only the documented income criterion'
);
const foprolosOverIncomeCap = evaluateProgramCompatibility(
  { ...foprolosCriteriaApplicant, monthlyGrossHouseholdIncomeSmigMultiple: 6.01 },
  foprolos!,
  foprolosCriteriaProvider
);
assert(
  foprolosOverIncomeCap.ruleEvaluations.some(rule =>
    rule.ruleId === 'catalogue_crit_foprolos_income' && rule.status === 'FAIL'
  ),
  'A supplied household gross-income ratio above six SMIG fails the documented FOPROLOS income criterion'
);

// An otherwise matching synthetic programme must not claim documented eligibility
// while current intake remains unconfirmed.
const intakeUnconfirmedProgram = structuredClone(foprolos!);
intakeUnconfirmedProgram.id = 'audit_unconfirmed_intake';
intakeUnconfirmedProgram.operationalStatus = 'ACTIVE_NOT_CONFIRMED';
intakeUnconfirmedProgram.criteria = [];
intakeUnconfirmedProgram.applicability = {
  supportedJourneys: ['home_construction'],
  supportedPurposes: ['home_construction'],
  supportedBuyerTypes: ['individual'],
  unverifiedApplicability: false
};
intakeUnconfirmedProgram.maxAmount = 200000;
intakeUnconfirmedProgram.maxFinancingPercentage = 100;
intakeUnconfirmedProgram.minContributionPercent = 0;
intakeUnconfirmedProgram.verification = {
  ...intakeUnconfirmedProgram.verification,
  status: 'VERIFIED',
  unverifiedFields: [],
  notes: { fr: '', ar: '' }
};
const intakeUnconfirmedResult = evaluateProgramCompatibility(
  foprolosCriteriaApplicant,
  intakeUnconfirmedProgram,
  foprolosCriteriaProvider
);
assert(
  intakeUnconfirmedResult.status === 'REQUIRES_CONFIRMATION' &&
  intakeUnconfirmedResult.eligibilityOutcome !== 'DOCUMENTED_ELIGIBILITY' &&
  intakeUnconfirmedResult.reasons.needsVerification.some(note => note.fr.includes("l'ouverture actuelle des dépôts")),
  'An otherwise matching programme with unconfirmed current intake requires confirmation, not documented eligibility'
);

const sameProgrammeWithConfirmedIntake = structuredClone(intakeUnconfirmedProgram);
sameProgrammeWithConfirmedIntake.operationalStatus = 'ACTIVE_CONFIRMED';
const sameProgrammeConfirmedResult = evaluateProgramCompatibility(
  foprolosCriteriaApplicant,
  sameProgrammeWithConfirmedIntake,
  foprolosCriteriaProvider
);
assert(
  intakeUnconfirmedResult.criteriaFit === sameProgrammeConfirmedResult.criteriaFit,
  'Criteria fit is evaluated independently from current intake status'
);

const sameProgrammeWithUnverifiedCommercialTerms = structuredClone(intakeUnconfirmedProgram);
sameProgrammeWithUnverifiedCommercialTerms.verification.status = 'UNVERIFIED';
const sameProgrammeUnverifiedTermsResult = evaluateProgramCompatibility(
  foprolosCriteriaApplicant,
  sameProgrammeWithUnverifiedCommercialTerms,
  foprolosCriteriaProvider
);
assert(
  intakeUnconfirmedResult.criteriaFit === sameProgrammeUnverifiedTermsResult.criteriaFit,
  'Unverified commercial terms do not erase independently evaluated public-criteria fit'
);

// 2. FOPROLOS: construction works, unrelated car journey is blocked.
const homeProfile = {
  journey: 'home_construction' as const,
  purpose: 'home_construction' as const,
  totalProjectCost: 120000,
  userContribution: 25000,
  financingRequested: 95000,
  employmentStatus: 'salaried_private' as const,
  constructionType: 'construction' as const,
  hasLandOwnershipTitle: true,
  isFirstPropertyPurchase: true,
  location: 'Nabeul'
};
const homeMatches = runMatchingEngine(homeProfile);

// Unknown applicability must block a definitive eligibility result even when
// all synthetic numeric criteria are deliberately satisfied.
const syntheticApplicabilityProgram = structuredClone(foprolos!);
syntheticApplicabilityProgram.id = 'audit_unknown_applicability';
syntheticApplicabilityProgram.applicability!.unverifiedApplicability = true;
syntheticApplicabilityProgram.applicability!.isFirstPropertyOnly = false;
syntheticApplicabilityProgram.eligibilityCriteria.requiresDegree = false;
syntheticApplicabilityProgram.eligibilityCriteria.requiresStartupLabel = false;
syntheticApplicabilityProgram.minAmount = 0;
syntheticApplicabilityProgram.maxAmount = 200000;
syntheticApplicabilityProgram.projectCostMin = 0;
syntheticApplicabilityProgram.projectCostMax = 200000;
syntheticApplicabilityProgram.minContributionPercent = 0;
syntheticApplicabilityProgram.maxFinancingPercentage = 100;
syntheticApplicabilityProgram.verification.status = 'VERIFIED';
syntheticApplicabilityProgram.verification.unverifiedFields = [];
syntheticApplicabilityProgram.verification.verifiedFields = [];
const syntheticProvider = providers.find(p => p.id === syntheticApplicabilityProgram.providerId)!;
const unknownApplicabilityResult = evaluateProgramCompatibility(
  homeProfile,
  syntheticApplicabilityProgram,
  syntheticProvider
);
assert(
  unknownApplicabilityResult.applicabilityStatus === 'UNKNOWN' &&
  unknownApplicabilityResult.eligibilityOutcome !== 'DOCUMENTED_ELIGIBILITY' &&
  unknownApplicabilityResult.status === 'REQUIRES_CONFIRMATION',
  'Unknown programme applicability cannot produce a definitive documented-eligibility result'
);

// Missing BFPME limits must not be treated as a successful range/ratio check.
const bfpmeUnknownLimits = structuredClone(programs.find(p => p.id === 'bfpme_creation')!);
bfpmeUnknownLimits.projectCostMin = undefined;
bfpmeUnknownLimits.projectCostMax = undefined;
bfpmeUnknownLimits.maxAmount = 0;
bfpmeUnknownLimits.maxFinancingPercentage = undefined;
bfpmeUnknownLimits.verification.status = 'VERIFIED';
bfpmeUnknownLimits.verification.unverifiedFields = [];
const bfpmeApplicant = {
  journey: 'startup' as const,
  purpose: 'creation' as const,
  totalProjectCost: 300000,
  userContribution: 120000,
  financingRequested: 180000,
  sector: 'industry' as const,
  location: 'Zaghouan',
  businessStage: 'idea_project' as const,
  legalStructure: 'suarl' as const,
  generalApplicantType: 'business' as const,
  isRegionalDevelopmentZone: false
};
const bfpmeProvider = providers.find(p => p.id === bfpmeUnknownLimits.providerId)!;
const bfpmeUnknownLimitResult = evaluateProgramCompatibility(bfpmeApplicant, bfpmeUnknownLimits, bfpmeProvider);
assert(
  bfpmeUnknownLimitResult.financialEvaluation.amountStatus === 'UNKNOWN' &&
  bfpmeUnknownLimitResult.eligibilityOutcome !== 'DOCUMENTED_ELIGIBILITY' &&
  bfpmeUnknownLimitResult.ruleEvaluations.some(r => r.ruleId === 'bfpmeProjectCostRange' && r.status === 'UNKNOWN'),
  'Missing BFPME project-cost, loan and percentage ceilings cannot be converted into passing eligibility checks'
);

// Authoritative claims must not let expired/stale primary evidence or unresolved
// conflicts override a current, non-conflicting claim.
const claimTemplate = CLAIMS_REPOSITORY.getAllClaims().find(c => c.source.evidenceStatus === 'VERIFIED')!;
const nowMs = Date.now();
const recentIso = new Date(nowMs - 1000).toISOString();
const stalePrimaryClaim = structuredClone(claimTemplate);
stalePrimaryClaim.claimId = 'audit_stale_primary_claim';
stalePrimaryClaim.entityId = 'audit_claim_selection';
stalePrimaryClaim.field = 'syntheticTerm';
stalePrimaryClaim.ruleStatus = 'VERIFIED_CURRENT';
stalePrimaryClaim.operationalStatus = 'ACTIVE_CONFIRMED';
stalePrimaryClaim.evidenceStrength = 'DIRECT_PRIMARY_CURRENT';
stalePrimaryClaim.conflictStatus = 'NONE';
stalePrimaryClaim.retrievalDate = recentIso;
stalePrimaryClaim.source.lastVerifiedAt = new Date(nowMs - 200 * 24 * 60 * 60 * 1000).toISOString();
const currentSecondaryClaim = structuredClone(claimTemplate);
currentSecondaryClaim.claimId = 'audit_current_secondary_claim';
currentSecondaryClaim.entityId = 'audit_claim_selection';
currentSecondaryClaim.field = 'syntheticTerm';
currentSecondaryClaim.ruleStatus = 'VERIFIED_CURRENT';
currentSecondaryClaim.operationalStatus = 'ACTIVE_NOT_CONFIRMED';
currentSecondaryClaim.evidenceStrength = 'OFFICIAL_SECONDARY';
currentSecondaryClaim.conflictStatus = 'NONE';
currentSecondaryClaim.retrievalDate = recentIso;
currentSecondaryClaim.source.lastVerifiedAt = recentIso;
currentSecondaryClaim.value = 'current-safe-value';
stalePrimaryClaim.value = 'stale-value';
CLAIMS_REPOSITORY.ingestClaims([stalePrimaryClaim, currentSecondaryClaim]);
assert(
  getAuthoritativeClaim('audit_claim_selection', 'syntheticTerm')?.value === 'current-safe-value',
  'Stale high-strength claim cannot override a current usable claim'
);

const conflictingPrimaryClaim = structuredClone(stalePrimaryClaim);
conflictingPrimaryClaim.claimId = 'audit_conflicting_primary_claim';
conflictingPrimaryClaim.entityId = 'audit_conflict_selection';
conflictingPrimaryClaim.field = 'syntheticTerm';
conflictingPrimaryClaim.source.lastVerifiedAt = recentIso;
conflictingPrimaryClaim.retrievalDate = recentIso;
conflictingPrimaryClaim.conflictStatus = 'CONFLICT_DETECTED';
const nonConflictingClaim = structuredClone(currentSecondaryClaim);
nonConflictingClaim.claimId = 'audit_nonconflicting_claim';
nonConflictingClaim.entityId = 'audit_conflict_selection';
nonConflictingClaim.field = 'syntheticTerm';
nonConflictingClaim.value = 'non-conflicting-value';
CLAIMS_REPOSITORY.ingestClaims([conflictingPrimaryClaim, nonConflictingClaim]);
assert(
  getAuthoritativeClaim('audit_conflict_selection', 'syntheticTerm')?.value === 'non-conflicting-value',
  'A conflict-detected claim cannot override a usable non-conflicting claim'
);
const foprolosHome = homeMatches.find(m => m.program.id === 'foprolos_construction');
assert(foprolosHome?.status === 'REQUIRES_CONFIRMATION' && foprolosHome.financialEvaluation.amountStatus === 'UNKNOWN', 'FOPROLOS matches salaried home construction while its SMIG-linked ceiling remains unconverted to a fixed TND amount');

const carProfile = {
  journey: 'car' as const,
  purpose: 'vehicle' as const,
  totalProjectCost: 65000,
  userContribution: 15000,
  financingRequested: 50000,
  vehicleCondition: 'used' as const,
  vehicleBuyerType: 'individual' as const,
  vehicleUsage: 'personal' as const,
  employmentStatus: 'salaried_private' as const,
  location: 'Tunis'
};
const carMatches = runMatchingEngine(carProfile);
const foprolosCar = carMatches.find(m => m.program.id === 'foprolos_construction');
assert(foprolosCar?.status === 'NOT_APPLICABLE', 'FOPROLOS is NOT_APPLICABLE to vehicle financing');

// 3. FOPRODI: authoritative claims exist and no fabricated numeric financing terms are exposed.
const foprodiClaims = CLAIMS_REPOSITORY.getAllClaims('foprodi_dotation');
assert(foprodiClaims.some(c => c.field === 'programStatus' && c.ruleStatus === 'VERIFIED_CURRENT'), 'FOPRODI current existence is claim-backed');
assert(foprodiClaims.some(c => c.field === 'supportedPurposes' && c.ruleStatus === 'VERIFIED_CURRENT'), 'FOPRODI creation/expansion purpose is claim-backed');
assert(foprodi?.rateType === 'fixed' && foprodi?.estimatedRateAnnual === 3, 'FOPRODI current repayable dotation rate is 3% annually');
assert(foprolos?.rateType === 'fixed', 'FOPROLOS verified rate schedule remains classified as fixed when represented as a min/max band');
assert(foprodi?.durationMonthsMax === 144, 'FOPRODI repayable dotation repayment duration is 12 years');
assert(foprodi?.gracePeriodMonthsMin === 60 && foprodi?.gracePeriodMonthsMax === 60, 'FOPRODI current grace period is 5 years');
assert(foprodi?.maxAmount === 0, 'FOPRODI does not confuse the 500,000 DT project-cost threshold with a financing amount');
assert(foprodi?.projectCostMax === 500000, 'FOPRODI project-cost threshold is 500,000 DT');
// 3b. FOPRODI dotation is repayable/quasi-equity, not a grant.
const foprodiCost = calculateFinancingCost(240000, foprodi!);
assert(!foprodiCost.canCalculateReliably && foprodiCost.monthlyPayment === undefined, 'FOPRODI does not fabricate a monthly repayment schedule');
assert(foprodiCost.rateOriginLabel?.fr.includes('3%') === true && !foprodiCost.rateOriginLabel?.fr.includes('Taux non disponible'), 'FOPRODI shows its documented 3% rate while clearly withholding an unverified repayment schedule');

assert(formatFinancingAmountRange(0, 0, 'fr') === 'Plafond non publié — à confirmer auprès de l’organisme', 'Unknown financing ceiling never renders as 0 DT');
assert(formatFinancingAmountRange(0, 0, 'ar').includes('غير منشور'), 'Arabic unknown ceiling is also rendered as unpublished, not zero');
assert(formatFinancingAmountRange(1000, 0, 'fr').includes('plafond non établi'), 'Known minimum with unknown ceiling does not imply a zero ceiling');

const foprodiComponent = foprodi ? mapProgramToStackComponent(foprodi, { financingRequested: 240000, totalProjectCost: 300000 }) : undefined;
assert(foprodiComponent?.role === 'QUASI_EQUITY', 'FOPRODI repayable dotation is classified as QUASI_EQUITY, not GRANT');
assert(foprodiComponent?.isCashFunding === true, 'FOPRODI quasi-equity can be counted as cash only when its amount is explicitly established');


// 4. Enda Bidaya: current amount/duration are present, rate stays unknown.
assert(enda?.minAmount === 200, 'Enda Bidaya current minimum is 200 DT');
assert(enda?.maxAmount === 40000, 'Enda Bidaya current maximum is 40,000 DT');
assert(enda?.durationMonthsMin === 0 && enda?.durationMonthsMax === 0, 'Enda Bidaya unpublished duration uses the runtime unknown sentinel (zero), not a fabricated term');
assert(enda?.rateType === 'unknown', 'Enda Bidaya rate remains UNKNOWN');
const endaCost = calculateFinancingCost(10000, enda!);
assert(!endaCost.canCalculateReliably && endaCost.monthlyPayment === undefined, 'Enda Bidaya never fabricates a monthly payment without a verified rate');

// 5. Guarantee is not cash.
const sotugar = programs.find(p => p.id === 'sotugar_guarantee')!;
const sotugarComponent = mapProgramToStackComponent(sotugar, { financingRequested: 150000, totalProjectCost: 200000 });
assert(sotugarComponent.role === 'GUARANTEE' && sotugarComponent.isCashFunding === false, 'SOTUGAR remains a non-cash guarantee component');
const gap = calculateFundingGap(150000, [sotugarComponent]);

const uncommittedGuaranteeCeilingGap = calculateFundingGap(150000, [{
  ...sotugarComponent,
  maxPotentialAmount: 1000000,
  coveragePercentage: 0.75,
  confirmedGuaranteeCoverageAmount: undefined
}]);
assert(
  uncommittedGuaranteeCeilingGap.guaranteeCoverageAmount === 0,
  'Guarantee fund/program ceiling and generic percentage are not reported as applicant-confirmed guarantee coverage'
);
assert(
  uncommittedGuaranteeCeilingGap.warnings.some(w => w.includes('aucun engagement individuel')),
  'Uncommitted guarantee potential is explicitly labelled unconfirmed'
);
const confirmedGuaranteeGap = calculateFundingGap(150000, [{
  ...sotugarComponent,
  maxPotentialAmount: 1000000,
  coveragePercentage: 0.75,
  confirmedGuaranteeCoverageAmount: 60000,
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_CONFIRMED'
}]);
assert(
  confirmedGuaranteeGap.guaranteeCoverageAmount === 60000,
  'Only the explicit applicant-specific confirmed guarantee amount is reported as confirmed coverage'
);
assert(gap.verifiedCashFunding === 0 && gap.remainingFundingGap === 150000, 'Guarantee coverage cannot reduce the cash funding gap');

// 6. UNKNOWN evidence cannot be counted as verified cash even when an amount is present.
const unknownCashGap = calculateFundingGap(100000, [{
  ...sotugarComponent,
  programId: 'unknown-cash',
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 100000,
  evidenceStatus: 'UNKNOWN',
  evidenceConfidence: 'LOW'
}]);
assert(unknownCashGap.verifiedCashFunding === 0 && unknownCashGap.remainingFundingGap === 100000, 'UNKNOWN cash evidence never becomes verified funding');

const operationallyUnconfirmedGap = calculateFundingGap(100000, [{
  ...sotugarComponent,
  programId: 'operationally-unconfirmed-cash',
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 100000,
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_NOT_CONFIRMED',
  evidenceConfidence: 'HIGH'
}]);
assert(operationallyUnconfirmedGap.verifiedCashFunding === 0 && operationallyUnconfirmedGap.remainingFundingGap === 100000, 'ACTIVE_NOT_CONFIRMED source is excluded from confirmed cash totals');
assert(operationallyUnconfirmedGap.warnings.some(w => w.includes('disponibilité opérationnelle non confirmée')), 'Unconfirmed operational status explains why cash was excluded');

const partiallyVerifiedGap = calculateFundingGap(100000, [{
  ...sotugarComponent,
  programId: 'partially-verified-cash',
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 100000,
  evidenceStatus: 'PARTIALLY_VERIFIED',
  operationalStatus: 'ACTIVE_CONFIRMED',
  evidenceConfidence: 'MEDIUM'
}]);
assert(partiallyVerifiedGap.verifiedCashFunding === 0 && partiallyVerifiedGap.remainingFundingGap === 100000, 'PARTIALLY_VERIFIED source is excluded from confirmed cash totals');

const fullyConfirmedGap = calculateFundingGap(100000, [{
  ...sotugarComponent,
  programId: 'fully-confirmed-cash',
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 100000,
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_CONFIRMED',
  fundingCommitmentStatus: 'COMMITTED',
  confirmedCommitmentAmount: 100000,
  evidenceConfidence: 'HIGH'
}]);
assert(fullyConfirmedGap.verifiedCashFunding === 100000 && fullyConfirmedGap.remainingFundingGap === 0, 'Only current evidence, active program, and explicit applicant-specific commitment count as confirmed cash');
const commitmentAbovePublishedCeiling = calculateFundingGap(100000, [{
  programId: 'ceiling-conflict',
  programName: { fr: 'Programme avec plafond', ar: 'برنامج بسقف' },
  providerId: 'test-provider',
  providerName: { fr: 'Test', ar: 'اختبار' },
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 120000,
  confirmedCommitmentAmount: 120000,
  fundingCommitmentStatus: 'COMMITTED',
  maxPotentialAmount: 100000,
  evidenceStatus: 'VERIFIED_CURRENT',
  evidenceConfidence: 'HIGH',
  operationalStatus: 'ACTIVE_CONFIRMED'
}]);
assert(
  commitmentAbovePublishedCeiling.verifiedCashFunding === 0 &&
  commitmentAbovePublishedCeiling.remainingFundingGap === 100000 &&
  commitmentAbovePublishedCeiling.warnings.some(w => w.includes('dépasse le plafond publié')),
  'Applicant-specific commitment exceeding a known programme ceiling is flagged and excluded pending documented reconciliation'
);
const invalidCeilingCommitment = calculateFundingGap(100000, [{
  programId: 'invalid-infinite-ceiling',
  programName: { fr: 'Plafond invalide', ar: 'سقف غير صالح' },
  providerId: 'test-provider',
  providerName: { fr: 'Test', ar: 'اختبار' },
  role: 'DEBT',
  isCashFunding: true,
  maxPotentialAmount: Number.POSITIVE_INFINITY,
  evidenceStatus: 'VERIFIED_CURRENT',
  evidenceConfidence: 'HIGH',
  operationalStatus: 'ACTIVE_CONFIRMED',
  fundingCommitmentStatus: 'COMMITTED',
  confirmedCommitmentAmount: 50000
}]);
assert(
  invalidCeilingCommitment.verifiedCashFunding === 0 &&
  invalidCeilingCommitment.warnings.some(w => w.includes('plafond publié invalide')),
  'A confirmed cash amount is withheld when its supplied ceiling is malformed rather than silently treated as unlimited'
);

const guaranteeCoverageAboveCeiling = calculateFundingGap(100000, [{
  programId: 'guarantee-ceiling-conflict',
  programName: { fr: 'Garantie avec plafond', ar: 'ضمان بسقف' },
  providerId: 'test-provider',
  providerName: { fr: 'Test', ar: 'اختبار' },
  role: 'GUARANTEE',
  isCashFunding: false,
  maxPotentialAmount: 100000,
  confirmedGuaranteeCoverageAmount: 120000,
  evidenceStatus: 'VERIFIED_CURRENT',
  evidenceConfidence: 'HIGH',
  operationalStatus: 'ACTIVE_CONFIRMED'
}]);
assert(
  guaranteeCoverageAboveCeiling.guaranteeCoverageAmount === 0 &&
  guaranteeCoverageAboveCeiling.verifiedCashFunding === 0 &&
  guaranteeCoverageAboveCeiling.warnings.some(w => w.includes('dépasse le plafond publié')),
  'Applicant-specific guarantee coverage above a known published ceiling is excluded and flagged pending documented reconciliation'
);
const staleGuaranteeCoverage = calculateFundingGap(100000, [{
  programId: 'stale-guarantee-commitment',
  programName: { fr: 'Garantie ancienne', ar: 'ضمان قديم' },
  providerId: 'test-provider',
  providerName: { fr: 'Test', ar: 'اختبار' },
  role: 'GUARANTEE',
  isCashFunding: false,
  confirmedGuaranteeCoverageAmount: 50000,
  maxPotentialAmount: 100000,
  evidenceStatus: 'VERIFIED_HISTORICAL',
  evidenceConfidence: 'HIGH',
  operationalStatus: 'ACTIVE_NOT_CONFIRMED'
}]);
assert(
  staleGuaranteeCoverage.guaranteeCoverageAmount === 0 &&
  staleGuaranteeCoverage.warnings.some(w => w.includes('preuve actuelle complète')),
  'An applicant-specific guarantee amount is not counted without current evidence and confirmed operational availability'
);
const invalidGuaranteeCeiling = calculateFundingGap(100000, [{
  programId: 'invalid-guarantee-ceiling',
  programName: { fr: 'Plafond de garantie invalide', ar: 'سقف ضمان غير صالح' },
  providerId: 'test-provider',
  providerName: { fr: 'Test', ar: 'اختبار' },
  role: 'GUARANTEE',
  isCashFunding: false,
  confirmedGuaranteeCoverageAmount: 50000,
  maxPotentialAmount: Number.NaN,
  evidenceStatus: 'VERIFIED_CURRENT',
  evidenceConfidence: 'HIGH',
  operationalStatus: 'ACTIVE_CONFIRMED'
}]);
assert(
  invalidGuaranteeCeiling.guaranteeCoverageAmount === 0 &&
  invalidGuaranteeCeiling.warnings.some(w => w.includes('plafond publié invalide')),
  'A confirmed guarantee amount is withheld when the supplied ceiling is non-finite'
);
const supportMislabelledAsCash = calculateFundingGap(50000, [{
  ...sotugarComponent,
  programId: 'support-mislabelled-as-cash',
  role: 'TECHNICAL_ASSISTANCE',
  isCashFunding: true,
  allocatedAmount: 50000,
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_CONFIRMED',
  fundingCommitmentStatus: 'COMMITTED',
  confirmedCommitmentAmount: 50000
} as any]);
assert(
  supportMislabelledAsCash.verifiedCashFunding === 0 &&
  supportMislabelledAsCash.remainingFundingGap === 50000 &&
  supportMislabelledAsCash.warnings.some(w => w.includes('rôle') && w.includes('numéraire')),
  'A non-cash support role cannot reduce the funding gap even if malformed input labels it as cash'
);

const activeProductWithoutApplicantCommitment = calculateFundingGap(100000, [{
  ...sotugarComponent,
  programId: 'active-but-not-approved-for-applicant',
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 100000,
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_CONFIRMED',
  evidenceConfidence: 'HIGH'
}]);
assert(activeProductWithoutApplicantCommitment.verifiedCashFunding === 0 && activeProductWithoutApplicantCommitment.remainingFundingGap === 100000, 'An active, verified program is not treated as applicant-secured financing');
assert(activeProductWithoutApplicantCommitment.warnings.some(w => w.includes('engagement individuel')), 'Missing applicant-specific commitment is explained');


// Funding-gap accounting must preserve overfunding instead of clamping the confirmed sum.
const overfundedGap = calculateFundingGap(100000, [
  {
    ...sotugarComponent,
    programId: 'confirmed-cash-a',
    role: 'DEBT',
    isCashFunding: true,
    allocatedAmount: 80000,
    evidenceStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_CONFIRMED',
    fundingCommitmentStatus: 'COMMITTED',
    confirmedCommitmentAmount: 80000,
    evidenceConfidence: 'HIGH'
  },
  {
    ...sotugarComponent,
    programId: 'confirmed-cash-b',
    role: 'GRANT',
    isCashFunding: true,
    allocatedAmount: 50000,
    evidenceStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_CONFIRMED',
    fundingCommitmentStatus: 'COMMITTED',
    confirmedCommitmentAmount: 50000,
    evidenceConfidence: 'HIGH'
  }
]);
assert(overfundedGap.inputValid, 'A finite non-negative funding requirement is valid');
assert(overfundedGap.verifiedCashFunding === 130000, 'Confirmed funding total is not silently capped at the requirement');
assert(overfundedGap.remainingFundingGap === 0 && overfundedGap.fundingSurplus === 30000, 'Overfunding is reported separately from the residual gap');
assert(overfundedGap.cashCoverageRatio === 1, 'Coverage ratio remains bounded at 100% while surplus is exposed separately');
assert(overfundedGap.warnings.some(w => w.includes('dépassent le besoin')), 'Overfunding emits an explicit diagnostic');

const negativeRequirementGap = calculateFundingGap(-1, [{
  ...sotugarComponent,
  programId: 'invalid-negative-input',
  role: 'DEBT',
  isCashFunding: true,
  allocatedAmount: 50000,
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_CONFIRMED',
  evidenceConfidence: 'HIGH'
}]);
assert(!negativeRequirementGap.inputValid && negativeRequirementGap.verifiedCashFunding === 0, 'Negative required funding is rejected without counting cash');
assert(negativeRequirementGap.warnings.some(w => w.includes('invalide')), 'Invalid funding requirement explains why calculation was withheld');

const nanRequirementGap = calculateFundingGap(Number.NaN, []);
assert(!nanRequirementGap.inputValid && nanRequirementGap.remainingFundingGap === 0, 'Non-finite required funding is rejected without propagating NaN');


// 7. UNKNOWN compatibility cannot become a viable stack.
const unknownCompat = getStackCompatibility('foprodi_dotation', 'banque_zitouna_mourabaha');
assert(unknownCompat.compatibilityStatus === 'UNKNOWN', 'Undocumented FOPRODI + Mourabaha compatibility remains UNKNOWN');

// Compatibility registry must distinguish "no claim" from an explicit UNKNOWN claim,
// so the documented fallback matrix is reachable for pairs absent from the claim registry.
const matrixFallback = getStackCompatibility('bfpme_creation', 'banque_credit_auto');
assert(matrixFallback.compatibilityStatus === 'POTENTIALLY_COMPATIBLE', 'Local compatibility matrix is consulted when no direct claim exists');

// Unsupported combinations must not remain marked as verified using an unrelated BFPME source.
assert(getStackCompatibility('aneti_cheque_entreprendre', 'bts_diplomes').compatibilityStatus === 'UNKNOWN', 'ANETI + BTS stays unconfirmed without direct compatibility evidence');
assert(getStackCompatibility('foprodi_dotation', 'leasing_vehicule_pro').compatibilityStatus === 'UNKNOWN', 'FOPRODI + leasing stays unconfirmed without direct compatibility evidence');
assert(getStackCompatibility('foprodi_dotation', 'sicar_equity').compatibilityStatus === 'UNKNOWN', 'FOPRODI + SICAR stays unconfirmed without direct compatibility evidence');
assert(getStackCompatibility('bts_diplomes', 'bh_bank_loan').compatibilityStatus === 'UNKNOWN', 'BTS + commercial bank remains UNKNOWN without direct prohibition evidence');
assert(getStackCompatibility('bts_diplomes', 'bfpme_creation').compatibilityStatus === 'UNKNOWN', 'BTS + BFPME is not falsely excluded based on overlapping project-cost ranges');
assert(getStackCompatibility('sotugar_guarantee', 'leasing_vehicule_pro').compatibilityStatus === 'POTENTIALLY_COMPATIBLE', 'SOTUGAR + leasing is conditional on the eligible mechanism and asset');

// A general product page is not evidence that applications are currently open.
const validationProducts = getAuthoritativeCatalogueProducts();
const validationProviders = getAuthoritativeCatalogueProviders();
const syntheticActiveProduct = structuredClone(validationProducts[0]);
syntheticActiveProduct.id = 'synthetic_active_without_intake_claim';
syntheticActiveProduct.operationalStatus = 'ACTIVE_CONFIRMED';
const syntheticActiveValidation = validateKnowledgeCatalogue(
  [...validationProducts, syntheticActiveProduct],
  validationProviders
);
assert(
  syntheticActiveValidation.errors.some(e =>
    e.programId === syntheticActiveProduct.id && e.code === 'UNSUPPORTED_OPERATIONAL_STATUS'
  ),
  'ACTIVE_CONFIRMED is rejected without fresh direct-primary intake evidence'
);
const invalidFinancingPercentageProduct = structuredClone(validationProducts[0]);
invalidFinancingPercentageProduct.id = 'synthetic_invalid_financing_percentage';
invalidFinancingPercentageProduct.financialTerms.maxFinancingPercentage = 150;
const invalidFinancingPercentageValidation = validateKnowledgeCatalogue(
  [...validationProducts, invalidFinancingPercentageProduct],
  validationProviders
);
assert(
  invalidFinancingPercentageValidation.errors.some(e =>
    e.programId === invalidFinancingPercentageProduct.id && e.code === 'INVALID_FINANCING_PERCENTAGE'
  ),
  'Knowledge validation rejects project-cost financing percentages above 100%'
);
const invalidGuaranteeRangeProduct = structuredClone(validationProducts.find(p => p.id === 'sotugar_guarantee')!);
invalidGuaranteeRangeProduct.id = 'synthetic_invalid_guarantee_range';
invalidGuaranteeRangeProduct.financialTerms.guaranteeDetails = {
  coveragePercentMin: 80,
  coveragePercentMax: 120,
  coverageBasis: 'PRINCIPAL'
};
const invalidGuaranteeRangeValidation = validateKnowledgeCatalogue(
  [...validationProducts, invalidGuaranteeRangeProduct],
  validationProviders
);
assert(
  invalidGuaranteeRangeValidation.errors.some(e =>
    e.programId === invalidGuaranteeRangeProduct.id && e.code === 'INVALID_GUARANTEE_COVERAGE_RANGE'
  ),
  'Knowledge validation rejects guarantee coverage percentages outside 0–100%'
);
const stackResult = generateFinancingStacks({
  profile: {
    journey: 'startup',
    purpose: 'creation',
    totalProjectCost: 300000,
    userContribution: 60000,
    financingRequested: 240000,
    sector: 'industry',
    location: 'Zaghouan',
    businessStage: 'idea_project',
    legalStructure: 'sarl',
    structurePreference: 'any'
  },
  matchedPrograms: runMatchingEngine({
    journey: 'startup',
    purpose: 'creation',
    totalProjectCost: 300000,
    userContribution: 60000,
    financingRequested: 240000,
    sector: 'industry',
    location: 'Zaghouan',
    businessStage: 'idea_project',
    legalStructure: 'sarl',
    structurePreference: 'any'
  })
});
const badStack = stackResult.stacks.find(s =>
  s.components.some(c => c.programId === 'foprodi_dotation') &&
  s.components.some(c => c.programId === 'banque_zitouna_mourabaha')
);
assert(!badStack, 'UNKNOWN compatibility is excluded from viable financing stacks');

// Even when the compatibility registry confirms a pair, unconfirmed operational
// intake must prevent the UI from labelling the whole structure "Compatibilité confirmée".
const bfpmeStackBase = mapProgramToStackComponent(programs.find(p => p.id === 'bfpme_creation')!, { financingRequested: 50000, totalProjectCost: 100000 });
const secondCashStackBase = mapProgramToStackComponent(programs.find(p => p.id === 'banque_credit_auto')!, { financingRequested: 50000, totalProjectCost: 100000 });
const unknownCeilingProgram = programs.find(p => p.id === 'leasing_vehicule_pro')!;
const infiniteMappedAllocation = mapProgramToStackComponent(unknownCeilingProgram, { financingRequested: Number.POSITIVE_INFINITY });
assert(
  infiniteMappedAllocation.allocatedAmount === undefined,
  'Non-finite requested amount cannot become an infinite candidate allocation when the programme ceiling is unknown'
);
const unknownCeilingMappedAllocation = mapProgramToStackComponent(unknownCeilingProgram, {
  financingRequested: 50000,
  totalProjectCost: 100000
});
assert(
  unknownCeilingMappedAllocation.allocatedAmount === undefined,
  'Unknown programme amount and percentage ceilings do not inherit the applicant request as a candidate allocation'
);
const percentageCappedProgram = {
  ...unknownCeilingProgram,
  maxFinancingPercentage: 40,
  maxAmount: 0
};
const percentageCappedAllocation = mapProgramToStackComponent(percentageCappedProgram, {
  financingRequested: 50000,
  totalProjectCost: 100000
});
assert(
  percentageCappedAllocation.allocatedAmount === 40000,
  'A documented financing percentage and project cost can provide a bounded candidate allocation even when the DT ceiling is unknown'
);
const invalidPercentageProgram = {
  ...unknownCeilingProgram,
  id: 'synthetic_invalid_percentage_cap',
  maxAmount: 0,
  maxFinancingPercentage: 150
};
const invalidPercentageAllocation = mapProgramToStackComponent(invalidPercentageProgram, {
  financingRequested: 50000,
  totalProjectCost: 100000
});
assert(
  invalidPercentageAllocation.allocatedAmount === undefined &&
  invalidPercentageAllocation.maxPotentialAmount === undefined &&
  invalidPercentageAllocation.coveragePercentage === undefined,
  'A financing percentage above 100% cannot create an invalid cap, allocation, or coverage ratio'
);
const invalidPercentageStackResult = generateFinancingStacks({
  profile: {
    totalProjectCost: 100000,
    financingRequested: 150000,
    userContribution: 0,
    purpose: 'creation'
  } as any,
  matchedPrograms: [
    { program: invalidPercentageProgram, status: 'STRONG_ALIGNMENT', reasons: { alignmentLevel: 'strong_alignment' } },
    { program: programs.find(p => p.id === 'sotugar_guarantee')!, status: 'STRONG_ALIGNMENT', reasons: { alignmentLevel: 'strong_alignment' } }
  ] as any
});
const invalidPercentageCandidates = [...invalidPercentageStackResult.stacks, ...(invalidPercentageStackResult.unverifiedCombinations || [])];
assert(
  invalidPercentageCandidates.length > 0 &&
  invalidPercentageCandidates.every(candidate =>
    candidate.components
      .filter(component => component.programId === invalidPercentageProgram.id)
      .every(component => component.allocatedAmount === undefined || component.allocatedAmount <= 100000)
  ),
  'Stack generation cannot use a financing percentage above 100% to allocate more than the project cost'
);
const zeroFundingStackResult = generateFinancingStacks({
  profile: {
    totalProjectCost: 100000,
    financingRequested: 0,
    userContribution: 100000,
    purpose: 'creation'
  } as any,
  matchedPrograms: [
    { program: unknownCeilingProgram, status: 'STRONG_ALIGNMENT', reasons: { alignmentLevel: 'strong_alignment' } },
    { program: programs.find(p => p.id === 'sotugar_guarantee')!, status: 'STRONG_ALIGNMENT', reasons: { alignmentLevel: 'strong_alignment' } }
  ] as any
});
assert(
  zeroFundingStackResult.stacks.length === 0 &&
  (zeroFundingStackResult.unverifiedCombinations || []).length === 0 &&
  zeroFundingStackResult.evaluatedPairCount === 0,
  'A fully self-funded project does not receive irrelevant financing-stack candidates'
);
const percentageCeilingComponent = createStackComponent(
  { program: percentageCappedProgram } as any,
  50000,
  100000
);
assert(
  percentageCeilingComponent.maxPotentialAmount === 40000,
  'A project-specific percentage cap is retained as the ceiling for later commitment validation'
);
const percentageCeilingConflict = calculateFundingGap(100000, [{
  ...percentageCeilingComponent,
  programId: 'percentage-ceiling-conflict',
  isCashFunding: true,
  role: 'DEBT',
  evidenceStatus: 'VERIFIED_CURRENT',
  operationalStatus: 'ACTIVE_CONFIRMED',
  fundingCommitmentStatus: 'COMMITTED',
  confirmedCommitmentAmount: 50000
}]);
assert(
  percentageCeilingConflict.verifiedCashFunding === 0 &&
  percentageCeilingConflict.warnings.some(w => w.includes('dépasse le plafond publié')),
  'A committed amount above the known project-cost percentage cap is excluded from confirmed cash totals'
);
const percentageGuaranteeProgram = {
  ...unknownCeilingProgram,
  id: 'synthetic_guarantee_percentage',
  category: 'guarantee' as const,
  maxAmount: 0,
  maxFinancingPercentage: 75
};
const percentageGuaranteeComponent = mapProgramToStackComponent(percentageGuaranteeProgram, {
  financingRequested: 90000,
  totalProjectCost: 100000
});
assert(
  percentageGuaranteeComponent.role === 'GUARANTEE' &&
  percentageGuaranteeComponent.maxPotentialAmount === undefined &&
  percentageGuaranteeComponent.coveragePercentage === 0.75,
  'A guarantee coverage ratio is not misinterpreted as a cash-amount ceiling based on project cost'
);
const infiniteDirectAllocation = createStackComponent({ program: unknownCeilingProgram } as any, Number.POSITIVE_INFINITY);
assert(
  infiniteDirectAllocation.allocatedAmount === undefined,
  'Direct stack-component creation rejects infinite allocated amounts'
);
assert(
  evaluateStackCandidate(
    [{ ...bfpmeStackBase, allocatedAmount: 25000 }, { ...secondCashStackBase, allocatedAmount: 25000 }],
    [],
    Number.NaN
  ) === null,
  'Direct stack evaluation rejects NaN required funding rather than returning a candidate with invalid totals'
);
assert(
  evaluateStackCandidate(
    [{ ...bfpmeStackBase, allocatedAmount: 25000 }, { ...secondCashStackBase, allocatedAmount: 25000 }],
    [],
    -1
  ) === null,
  'Direct stack evaluation rejects negative required funding'
);
assert(
  evaluateStackCandidate(
    [{ ...percentageCeilingComponent, allocatedAmount: 50000 }, { ...secondCashStackBase, allocatedAmount: 10000 }],
    [],
    60000
  ) === null,
  'Direct stack evaluation rejects candidate allocations above a known programme/project ceiling'
);
assert(
  evaluateStackCandidate(
    [{ ...percentageGuaranteeComponent, allocatedAmount: 10000 }, { ...secondCashStackBase, allocatedAmount: 10000 }],
    [],
    20000
  ) === null,
  'Direct stack evaluation rejects guarantees incorrectly supplied in the cash-financing bucket'
);
assert(
  evaluateStackCandidate(
    [{ ...bfpmeStackBase, maxPotentialAmount: Number.POSITIVE_INFINITY, allocatedAmount: 25000 }, { ...secondCashStackBase, allocatedAmount: 25000 }],
    [],
    50000
  ) === null,
  'Direct stack evaluation rejects non-finite published ceilings instead of treating them as unlimited'
);
const intakePendingStack = evaluateStackCandidate(
  [{ ...bfpmeStackBase, allocatedAmount: 25000, evidenceStatus: 'VERIFIED_CURRENT', operationalStatus: 'ACTIVE_NOT_CONFIRMED' },
   { ...secondCashStackBase, allocatedAmount: 25000, evidenceStatus: 'VERIFIED_CURRENT', operationalStatus: 'ACTIVE_CONFIRMED' }],
  [],
  50000
);
assert(
  intakePendingStack?.overallStatus === 'CONDITIONAL',
  'A verified-compatible pair with unconfirmed current intake is conditional, never confirmed'
);
const evidencePendingStack = evaluateStackCandidate(
  [{ ...bfpmeStackBase, allocatedAmount: 25000, evidenceStatus: 'PARTIALLY_VERIFIED', operationalStatus: 'ACTIVE_CONFIRMED' },
   { ...secondCashStackBase, allocatedAmount: 25000, evidenceStatus: 'VERIFIED_CURRENT', operationalStatus: 'ACTIVE_CONFIRMED' }],
  [],
  50000
);
assert(
  evidencePendingStack?.overallStatus === 'CONDITIONAL',
  'A verified-compatible pair with partially verified terms is conditional, never confirmed'
);


// 8. High-risk legacy financial literals must not leak back into runtime.
const bfpme = programs.find(p => p.id === 'bfpme_creation');
assert(bfpme?.minAmount === 0, 'BFPME has no stale 50,000 DT minimum financing floor');
assert(bfpme?.rateType === 'unknown', 'BFPME does not expose a fabricated TMM-plus-3% rate');
assert(bfpme?.durationMonthsMin === 0 && bfpme?.durationMonthsMax === 0, 'BFPME unpublished duration uses the runtime unknown sentinel (zero), not a fabricated term');
const zitouna = programs.find(p => p.id === 'banque_zitouna_mourabaha');
assert(zitouna?.rateType === 'unknown', 'Banque Zitouna Mourabaha does not expose an unsupported fixed 3% margin');

// 9. Current BTS / BH / leasing / Zitouna / SOTUGAR knowledge guardrails.
const bts = programs.find(p => p.id === 'bts_diplomes');
assert(bts?.maxAmount === 200000, 'BTS current Crédit Professionnel ceiling is 200,000 DT');
assert(bts?.maxFinancingPercentage === 90, 'BTS current Crédit Professionnel financing share is capped at 90%');
assert(bts?.durationMonthsMax === 84, 'BTS current Crédit Professionnel duration is capped at 7 years');
assert(bts?.gracePeriodMonthsMin === 3 && bts?.gracePeriodMonthsMax === 12, 'BTS current grace period is 3-12 months');
assert(bts?.estimatedRateAnnual === undefined, 'BTS does not expose an unsupported numeric fixed rate');
const honour = programs.find(p => p.id === 'bts_credit_sur_honneur');
assert(honour !== undefined, 'BTS Crédit sur l’honneur exists as a distinct product');
assert(honour?.maxAmount === 0, 'Tiered Crédit sur l’honneur maxima are not collapsed into one misleading universal ceiling');
assert(honour?.rateType === 'interest_free' && honour?.estimatedRateAnnual === 0, 'Crédit sur l’honneur is represented as interest-free without inventing a payment schedule');
assert(honour?.verification.status === 'PARTIALLY_VERIFIED', 'Crédit sur l’honneur keeps detailed eligibility partially verified');
assert(CLAIMS_REPOSITORY.getAllClaims('bts_credit_sur_honneur').some(c => c.field === 'maxFinancingAmountMicroProject' && c.value === 10000), 'Micro-project tiered ceiling is source-tracked at 10,000 DT');
assert(CLAIMS_REPOSITORY.getAllClaims('bts_credit_sur_honneur').some(c => c.field === 'maxFinancingAmountSmeCommunity' && c.value === 25000), 'SME/community tiered ceiling is source-tracked at 25,000 DT');
assert(CLAIMS_REPOSITORY.getAllClaims('foprodi_dotation').some(c => c.field === 'gracePeriodMonths' && c.value === 60), 'FOPRODI five-year grace period is source-tracked');

const bhAuto = programs.find(p => p.id === 'banque_credit_auto');
assert(bhAuto?.maxAmount === 0, 'BH AUTO unknown financing ceiling is represented as UNKNOWN, not a fake number');
assert(bhAuto?.durationMonthsMax === 84, 'BH AUTO current maximum duration is 7 years');
assert(bhAuto?.gracePeriodMonthsMin === 0 && bhAuto?.gracePeriodMonthsMax === 0, 'BH AUTO has no unsupported grace period claim');
assert(bhAuto?.rateType === 'unknown', 'BH AUTO does not expose a fabricated TMM or margin');
assert(!String(bhAuto?.rateDescription.fr || '').includes('7,99'), 'BH AUTO has no stale 7.99% TMM literal');
assert(!String(bhAuto?.rateDescription.fr || '').includes('3,0%'), 'BH AUTO has no stale 3.0% margin literal');

const foprolosCanonical = CANONICAL_PRODUCTS.find(p => p.id === 'foprolos_construction');
assert(foprolosCanonical?.applicability.unverifiedApplicability === true, 'FOPROLOS applicability remains explicitly review-gated while its full purpose/ownership rules are reconciled');
assert(foprolosCanonical?.applicability.isFirstPropertyOnly !== true, 'FOPROLOS does not blanket-exclude the documented home-extension exception');
assert(foprolosCanonical?.financingPurposes.includes('HOME_RENOVATION') === true, 'FOPROLOS catalogue includes the extension/renovation purpose variant');
assert(foprolosCanonical?.criteria.some(c => c.id === 'crit_foprolos_household_ownership' && c.critical) === true, 'FOPROLOS household ownership condition is a critical review gate');
assert(foprolosCanonical?.financingPurposes.includes('LAND_ACQUISITION') === true && foprolosCanonical?.financingPurposes.includes('HOME_PURCHASE') === true, 'FOPROLOS includes land acquisition and new-home purchase purposes');
assert(foprolosCanonical?.criteria.some(c => c.id === 'crit_foprolos_income' && c.operator === 'LTE' && c.expectedValue === 6) === true, 'FOPROLOS household gross income cap is encoded as six times SMIG, not UNKNOWN');

const anetiCanonical = CANONICAL_PRODUCTS.find(p => p.id === 'aneti_cheque_entreprendre');
assert(anetiCanonical?.status === 'UNKNOWN' && anetiCanonical?.operationalStatus === 'UNKNOWN', 'ANETI Chèque Entreprendre is not presented as operational without verified source evidence');
assert(anetiCanonical?.applicantTypes.includes('BUSINESS') === true && anetiCanonical?.applicability.unverifiedApplicability === true && anetiCanonical?.status === 'UNKNOWN', 'ANETI audit placeholder remains structurally valid but eligibility/operational status are unverified');
assert(anetiCanonical?.financialTerms.amount === undefined, 'ANETI unknown amount is omitted rather than fabricated');
assert(anetiCanonical?.verification.status === 'SOURCE_UNAVAILABLE', 'ANETI source availability is explicitly recorded');

const anetiStackComponent = mapProgramToStackComponent(programs.find(p => p.id === 'aneti_cheque_entreprendre')!);
assert(determineStackFundingRole(programs.find(p => p.id === 'aneti_cheque_entreprendre')!) === 'OTHER_SUPPORT', 'ANETI Chèque Entreprendre is not inferred to be a grant from its name');
assert(anetiStackComponent.role === 'OTHER_SUPPORT' && anetiStackComponent.isCashFunding === false, 'Unverified ANETI support type is excluded from cash funding calculations');
const foprodiStackComponent = mapProgramToStackComponent(foprodi!);
assert(['ACTIVE_NOT_CONFIRMED', 'UNKNOWN'].includes(foprodiStackComponent.operationalStatus), 'Published FOPRODI terms do not imply current operational availability');
assert(mapProgramToStackComponent(programs.find(p => p.id === 'bts_credit_sur_honneur')!).operationalStatus !== 'ACTIVE_CONFIRMED', 'BTS Crédit sur l’honneur keeps its explicit unconfirmed operational status');


const firstHome = programs.find(p => p.id === 'premier_logement');
assert(firstHome?.maxAmount === 40000, 'BH Al Masken Al Awal own-financing loan ceiling is 40,000 DT');
assert(firstHome?.projectCostMax === 220000, 'BH Al Masken Al Awal property price ceiling is 220,000 DT');
assert(firstHome?.durationMonthsMax === 84 && firstHome?.gracePeriodMonthsMax === 60, 'BH Al Masken Al Awal uses 7-year repayment after 5-year grace');

const firstHomeAtCap = runMatchingEngine({
  journey: 'home_purchase' as const,
  purpose: 'first_home' as const,
  totalProjectCost: 220000,
  userContribution: 40000,
  financingRequested: 180000,
  employmentStatus: 'salaried_private' as const,
  propertyCondition: 'new' as const,
  isFirstPropertyPurchase: true,
  isPrincipalResidence: true,
  location: 'Sfax'
}).find(m => m.program.id === 'premier_logement');
assert(firstHomeAtCap?.financialEvaluation.amountStatus === 'PASS', 'Premier Logement accepts the documented 220,000 TND property-price ceiling');
assert(JSON.stringify(firstHomeAtCap?.reasons?.matchedBecause || []).replace(/\s/g, '').includes('220000'), 'Premier Logement eligibility explanation reflects the authoritative 220,000 TND ceiling');

const firstHomeAboveCap = runMatchingEngine({
  journey: 'home_purchase' as const,
  purpose: 'first_home' as const,
  totalProjectCost: 220001,
  userContribution: 40000,
  financingRequested: 180001,
  employmentStatus: 'salaried_private' as const,
  propertyCondition: 'new' as const,
  isFirstPropertyPurchase: true,
  isPrincipalResidence: true,
  location: 'Sfax'
}).find(m => m.program.id === 'premier_logement');
assert(firstHomeAboveCap?.financialEvaluation.amountStatus === 'FAIL', 'Premier Logement rejects property prices above 220,000 TND');
assert(JSON.stringify(firstHomeAboveCap?.reasons?.potentialIssues || []).replace(/\s/g, '').includes('220000'), 'Premier Logement rejection explanation uses the same authoritative 220,000 TND ceiling');

const leasing = programs.find(p => p.id === 'leasing_vehicule_pro');
assert(leasing?.durationMonthsMin === 36 && leasing?.durationMonthsMax === 60, 'TLF professional vehicle leasing duration is 3-5 years');
assert(leasing?.maxAmount === 0, 'TLF unknown financing ceiling is not rendered as a numeric placeholder');
assert(leasing?.rateType === 'unknown', 'TLF leasing does not expose an unsupported numeric rate');
assert(!String(leasing?.rateDescription.fr || '').toLowerCase().includes('tmm +'), 'TLF leasing does not inherit a stale TMM-plus-margin assumption');

const zitounaCurrent = programs.find(p => p.id === 'banque_zitouna_mourabaha');
assert(zitounaCurrent?.maxFinancingPercentage === 70, 'Banque Zitouna professional equipment financing can reach 70% of investment needs');
assert(zitounaCurrent?.maxAmount === 0, 'Banque Zitouna unknown financing ceiling is not rendered as a numeric placeholder');
assert(zitounaCurrent?.durationMonthsMax === 84, 'Banque Zitouna professional equipment financing maximum duration is 7 years');
assert(zitounaCurrent?.rateType === 'unknown', 'Banque Zitouna does not expose an unsupported numeric Mourabaha margin');

assert(sotugar?.category === 'guarantee', 'SOTUGAR remains a guarantee mechanism, not a lending product');
assert(sotugar?.maxAmount === 0, 'SOTUGAR has no fabricated borrower financing amount');
const sotugarCanonical = CANONICAL_PRODUCTS.find(p => p.id === 'sotugar_guarantee');
assert(String(sotugarCanonical?.shortDescription?.en || '').includes('depends on the specific fund') === true, 'SOTUGAR coverage is explicitly mechanism-specific, not a universal percentage');
assert(sotugarCanonical?.financialTerms.verification.some(v => v.field === 'fees' && v.status === 'UNVERIFIED') === true, 'SOTUGAR generic fees remain unknown unless a mechanism-specific source verifies them');
assert(CLAIMS_REPOSITORY.getAllClaims('sotugar_guarantee').some(c => c.field === 'smeGuaranteeCoverageRangeMechanismSpecific' && c.ruleStatus === 'PARTIALLY_VERIFIED'), 'SOTUGAR SME coverage range is source-tracked as mechanism-specific, not a universal current rate');

const startupBourse = programs.find(p => p.id === 'startup_act_bourse');
assert(startupBourse?.maxAmount === 0, 'Startup Act bourse does not expose the stale fixed 36,000 DT ceiling; zero denotes no fixed total amount');

// Last-resort shadowing guard: if all max-amount claims become stale, neither
// runtime projection may silently fall back to the canonical catalogue literal.
const staleCeilingClaim = structuredClone(claimTemplate);
staleCeilingClaim.claimId = 'audit_expired_bfpme_ceiling';
staleCeilingClaim.entityId = 'bfpme_creation';
staleCeilingClaim.field = 'maxFinancingAmount';
staleCeilingClaim.value = 9999999;
staleCeilingClaim.ruleStatus = 'VERIFIED_CURRENT';
staleCeilingClaim.operationalStatus = 'ACTIVE_NOT_CONFIRMED';
staleCeilingClaim.evidenceStrength = 'DIRECT_PRIMARY_CURRENT';
staleCeilingClaim.conflictStatus = 'NONE';
staleCeilingClaim.retrievalDate = recentIso;
staleCeilingClaim.source.lastVerifiedAt = new Date(nowMs - 200 * 24 * 60 * 60 * 1000).toISOString();
CLAIMS_REPOSITORY.ingestClaims([staleCeilingClaim]);
assert(
  getAuthoritativeFinancingProgram('bfpme_creation')?.maxAmount === 0,
  'Stale max-financing claim cannot fall back to the legacy BFPME amount ceiling'
);
assert(
  getAuthoritativeCatalogueProducts().find(p => p.id === 'bfpme_creation')?.financialTerms.amount?.max === undefined,
  'Catalogue projection hides the legacy financing ceiling when no current usable claim remains'
);

const partialCeilingClaim = structuredClone(staleCeilingClaim);
partialCeilingClaim.claimId = 'audit_partial_bfpme_ceiling';
partialCeilingClaim.value = 9999999;
partialCeilingClaim.ruleStatus = 'PARTIALLY_VERIFIED';
partialCeilingClaim.retrievalDate = recentIso;
partialCeilingClaim.source.lastVerifiedAt = recentIso;
CLAIMS_REPOSITORY.ingestClaims([partialCeilingClaim]);
assert(
  getAuthoritativeFinancingProgram('bfpme_creation')?.maxAmount === 0,
  'Partially verified BFPME ceiling cannot become a hard runtime eligibility limit'
);
assert(
  getAuthoritativeCatalogueProducts().find(p => p.id === 'bfpme_creation')?.financialTerms.amount?.max === undefined,
  'Partially verified financing ceiling stays hidden rather than overriding the legacy value'
);

// Authoritative FOPROLOS income-cap claims must update the actual matcher criterion,
 // rather than leaving the canonical literal at six SMIG.
const existingFoprolosIncomeClaim = CLAIMS_REPOSITORY.getAllClaims('foprolos_construction')
  .find(claim => claim.field === 'incomeCapSmigMultiple');
assert(existingFoprolosIncomeClaim !== undefined, 'FOPROLOS authoritative income-cap claim exists for projection regression');
if (existingFoprolosIncomeClaim) {
  CLAIMS_REPOSITORY.ingestClaims([{
    ...existingFoprolosIncomeClaim,
    claimId: 'test_claim_foprolos_income_cap_changed',
    value: 5,
    retrievalDate: new Date().toISOString().slice(0, 10),
    notes: {
      fr: 'Synthetic regression claim only: threshold changed to verify criterion projection.',
      ar: 'ادعاء اختباري اصطناعي فقط للتحقق من إسقاط الحد على معيار المطابقة.'
    }
  }]);
  const projectedFoprolosIncomeCriterion = getAuthoritativeCatalogueProducts()
    .find(product => product.id === 'foprolos_construction')
    ?.criteria.find(criterion => criterion.id === 'crit_foprolos_income');
  assert(
    projectedFoprolosIncomeCriterion?.expectedValue === 5,
    'A changed authoritative income-cap claim updates the FOPROLOS matcher threshold instead of leaving a stale hard-coded six'
  );
}

if (failed > 0) {
  console.error(`❌ ${failed} architecture regression guard(s) failed.`);
  process.exit(1);
}
console.log('🎉 Architecture regression guardrails passed.');
