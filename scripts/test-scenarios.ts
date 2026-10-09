import { runMatchingEngine } from '../src/engine/matchingEngine';
import { calculateFinancingCost } from '../src/engine/financialCalculations';
import { getAuthoritativeFinancingPrograms } from '../src/knowledge/authoritativeProjection';
import { getAuthoritativeCatalogueProducts } from '../src/knowledge/authoritativeCatalogueProjection';
const FINANCING_PROGRAMS = getAuthoritativeFinancingPrograms();
import { ApplicantProfile } from '../src/types/financing';
import { parseTextToProfileFallback } from '../src/utils/intakeParser';
import { ResearchImportPipeline } from '../src/knowledge/researchImport';

console.log('================================================================');
console.log('       MIZEN PRODUCTION INTEGRITY AUDIT SUITE (SCENARIOS A-J)    ');
console.log('================================================================\n');

let allPassed = true;

function assert(condition: boolean | undefined, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    allPassed = false;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// -------------------------------------------------------------
// Scenario A: Young graduate, first project, 75,000 DT in Sousse
// -------------------------------------------------------------
console.log('--- SCENARIO A: Jeune diplômé, 75 000 DT à Sousse ---');
const profileA: ApplicantProfile = {
  totalProjectCost: 100000,
  userContribution: 25000,
  financingRequested: 75000,
  purpose: 'equipment',
  sector: 'industry',
  location: 'Sousse',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};

const resultsA = runMatchingEngine(profileA);
assert(resultsA.length > 0, 'Scenario A matches programs');
const btsDiplomesA = resultsA.find(r => r.program.id === 'bts_diplomes');
assert(btsDiplomesA !== undefined, 'BTS Diplômés is evaluated');
assert(btsDiplomesA?.reasons.alignmentLevel === 'strong_alignment', 'BTS Diplômés has strong alignment for graduate with 75k DT');
assert(btsDiplomesA?.program.name.fr.includes('Crédit Professionnel'), 'BTS catalogue identity is the general Crédit Professionnel product, not a degree-only product');
assert(!btsDiplomesA?.ruleEvaluations.some(r => r.ruleId === 'requiresDegree'), 'General BTS Crédit Professionnel does not invent a higher-education degree requirement');

// -------------------------------------------------------------
// Scenario B: Existing company, 250,000 DT extension in Sfax (Manufacturing)
// -------------------------------------------------------------
console.log('\n--- SCENARIO B: Entreprise existante, 250 000 DT à Sfax ---');
const profileB: ApplicantProfile = {
  totalProjectCost: 400000,
  userContribution: 150000,
  financingRequested: 250000,
  purpose: 'expansion',
  sector: 'industry',
  location: 'Sfax',
  businessStage: 'established_over_2y',
  legalStructure: 'sarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'standard'
};

const resultsB = runMatchingEngine(profileB);
const bfpmeB = resultsB.find(r => r.program.id === 'bfpme_creation');
const sotugarB = resultsB.find(r => r.program.id === 'sotugar_guarantee');
assert(bfpmeB !== undefined && bfpmeB.reasons.alignmentLevel === 'strong_alignment', 'BFPME matches 250k DT PME expansion with strong alignment');
assert(sotugarB !== undefined && sotugarB.status === 'REQUIRES_CONFIRMATION', 'SOTUGAR remains a candidate but requires confirmation because it guarantees lender credit rather than lending a project amount directly');
const stackSeedMatchesB = resultsB.filter(r => r.program.id === 'bfpme_creation' || r.program.id === 'sotugar_guarantee').map(r => JSON.parse(JSON.stringify(r)));
// BTS cap is 150k DT and doesn't cover expansion
const btsB = resultsB.find(r => r.program.id === 'bts_diplomes');
assert(Boolean(btsB?.reasons.potentialIssues.some(p => p.fr.includes('dépasse le plafond') || p.fr.includes('Non applicable'))), 'BTS flags non-applicability or amount exceeding cap');

// -------------------------------------------------------------
// Scenario C: Innovative startup, 30,000 DT R&D/Tech in Tunis
// -------------------------------------------------------------
console.log('\n--- SCENARIO C: Startup innovante R&D, 30 000 DT à Tunis ---');
const profileC: ApplicantProfile = {
  totalProjectCost: 60000,
  userContribution: 10000,
  financingRequested: 30000,
  purpose: 'innovation_rd',
  sector: 'ict_tech',
  location: 'Tunis',
  businessStage: 'creation_underway',
  legalStructure: 'suarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: true,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};

const resultsC = runMatchingEngine(profileC);
const startupActC = resultsC.find(r => r.program.id === 'startup_act_bourse');
assert(startupActC !== undefined, 'Startup Act program evaluated');
assert(startupActC?.status === 'REQUIRES_CONFIRMATION' && startupActC.financialEvaluation.amountStatus === 'UNKNOWN', 'Startup Act stipend is not misrepresented as a lump-sum project loan');
assert(Boolean(startupActC?.reasons.matchedBecause.some(m => m.fr.includes('Startup Act'))), 'Confirms Startup Act label recognized');

// -------------------------------------------------------------
// Scenario D: Micro-project / artisan, 15,000 DT in Kairouan
// -------------------------------------------------------------
console.log('\n--- SCENARIO D: Micro-projet artisan, 15 000 DT à Kairouan ---');
const profileD: ApplicantProfile = {
  totalProjectCost: 18000,
  userContribution: 3000,
  financingRequested: 15000,
  purpose: 'working_capital',
  sector: 'crafts_trades',
  location: 'Kairouan',
  businessStage: 'idea_project',
  legalStructure: 'not_yet_created',
  hasHigherEducationDegree: false,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: true,
  structurePreference: 'any'
};

const resultsD = runMatchingEngine(profileD);
assert(resultsD.length > 0, 'Scenario D evaluates candidate programs');
const sotugarD = resultsD.find(r => r.program.id === 'sotugar_guarantee');
assert(sotugarD !== undefined, 'SOTUGAR matches micro-artisan guarantee candidate');

// -------------------------------------------------------------
// Scenario E: Islamic finance preference, 80,000 DT equipment in Gabes
// -------------------------------------------------------------
console.log('\n--- SCENARIO E: Finance islamique, 80 000 DT à Gabès ---');
const profileE: ApplicantProfile = {
  totalProjectCost: 100000,
  userContribution: 20000,
  financingRequested: 80000,
  purpose: 'equipment',
  sector: 'industry',
  location: 'Gabes',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: true,
  structurePreference: 'islamic'
};

const resultsE = runMatchingEngine(profileE);
const zitounaE = resultsE.find(r => r.program.id === 'banque_zitouna_mourabaha');
assert(zitounaE !== undefined && zitounaE.status === 'REQUIRES_CONFIRMATION' && zitounaE.reasons.matchedBecause.some(m => m.fr.includes('Structure de financement islamique')), 'Mourabaha preference is recognized while unpublished financing ceiling requires confirmation');
assert(zitounaE?.costEstimate.canCalculateReliably === false, 'Mourabaha does not fabricate a 9.5% fake quote');
assert(zitounaE?.costEstimate.rateOrigin === 'unavailable', 'Mourabaha rateOrigin is unavailable/contractual');

// -------------------------------------------------------------
// Scenario F: Minimal / Empty profile with missing/undefined info
// -------------------------------------------------------------
console.log('\n--- SCENARIO F: Profil minimal / données inconnues ---');
const profileF: ApplicantProfile = {
  totalProjectCost: undefined,
  userContribution: undefined,
  financingRequested: undefined,
  purpose: undefined,
  sector: undefined,
  location: undefined,
  businessStage: undefined,
  legalStructure: undefined,
  hasHigherEducationDegree: undefined,
  hasStartupActLabel: undefined,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};

const resultsF = runMatchingEngine(profileF);
assert(resultsF.length > 0, 'Scenario F evaluates all programs without throwing');
for (const res of resultsF) {
  // Missing info must become needsVerification, NOT an unjustified outright rejection
  assert(res.reasons.needsVerification.length > 0, `Program ${res.program.id} marks missing items as needsVerification`);
  // Must not fabricate fake monthly repayment or fake costs
  assert(res.costEstimate.canCalculateReliably === false, `Program ${res.program.id} does not calculate fake costs for undefined amount`);
  assert(res.costEstimate.monthlyPayment === undefined, `Program ${res.program.id} monthlyPayment is undefined when amount missing`);
  assert(
    ['strong_alignment', 'partial_alignment', 'potential_blockers', 'not_applicable'].includes(res.reasons.alignmentLevel),
    `Program ${res.program.id} outputs valid alignmentLevel`
  );
}

// -------------------------------------------------------------
// Scenario G: Distinct financingRequested vs totalProjectCost Truth Model
// -------------------------------------------------------------
console.log('\n--- SCENARIO G: Séparation stricte financingRequested ≠ totalProjectCost ---');
const profileG: ApplicantProfile = {
  financingRequested: 40000,
  totalProjectCost: undefined, // Total cost deliberately missing
  userContribution: undefined,
  purpose: 'equipment',
  sector: 'services',
  location: 'Tunis',
  businessStage: 'creation_underway',
  hasHigherEducationDegree: true,
  structurePreference: 'any'
};
const resultsG = runMatchingEngine(profileG);
const btsG = resultsG.find(r => r.program.id === 'bts_diplomes');
assert(btsG !== undefined, 'BTS evaluated in Scenario G');
assert(
  Boolean(btsG?.reasons.needsVerification.some(v => v.fr.includes('apport') || v.fr.includes('Coût total non spécifié'))),
  'Engine requires verification of project cost and NEVER equates financingRequested to totalProjectCost'
);

// -------------------------------------------------------------
// Scenario H: Dynamic Verification Coverage & Integrity Audit
// -------------------------------------------------------------
console.log('\n--- SCENARIO H: Audit de couverture et sémantique dynamique des statuts ---');
const validStatuses = ['VERIFIED', 'PARTIALLY_VERIFIED', 'OUTDATED', 'UNVERIFIED', 'SOURCE_UNAVAILABLE'];

for (const prog of FINANCING_PROGRAMS) {
  const v = prog.verification;
  assert(v !== undefined, `${prog.id} has verification metadata`);
  assert(validStatuses.includes(v.status), `${prog.id} has a recognized verification status: ${v.status}`);
  assert(Array.isArray(v.verifiedFields), `${prog.id} specifies verified fields array`);
  assert(Array.isArray(v.unverifiedFields), `${prog.id} specifies unverified fields array`);
  assert(v.sourceUrl.length > 0, `${prog.id} has official source URL`);
  assert(v.sourceTitle.length > 0, `${prog.id} has official source Title`);
  assert(Boolean(v.dateChecked), `${prog.id} has checked date`);

  // Disjoint sets check (no field is simultaneously verified and unverified)
  const overlap = v.verifiedFields.filter(f => v.unverifiedFields.includes(f));
  assert(overlap.length === 0, `${prog.id} has no conflicting overlap between verified and unverified fields`);

  // Semantic status validation
  if (v.status === 'VERIFIED') {
    assert(v.unverifiedFields.length === 0, `${prog.id} marked VERIFIED has no unverified fields`);
    assert(v.verifiedFields.length > 0, `${prog.id} marked VERIFIED has verified fields documented`);
  } else if (v.status === 'PARTIALLY_VERIFIED') {
    assert(v.verifiedFields.length > 0, `${prog.id} marked PARTIALLY_VERIFIED has at least one verified field`);
    assert(v.unverifiedFields.length > 0, `${prog.id} marked PARTIALLY_VERIFIED has at least one unverified field`);
  } else if (v.status === 'UNVERIFIED') {
    assert(v.verifiedFields.length === 0, `${prog.id} marked UNVERIFIED has no verified fields claimed`);
  }
}

// -------------------------------------------------------------
// Scenario I: Unsupported rates never become quotes audit
// -------------------------------------------------------------
console.log('\n--- SCENARIO I: Taux non vérifiés ou variables ne deviennent jamais des devis ---');
// 1. Variable TMM (BFPME)
const bfpmeProg = FINANCING_PROGRAMS.find(p => p.id === 'bfpme_creation')!;
const bfpmeCost = calculateFinancingCost(100000, bfpmeProg);
assert(bfpmeCost.canCalculateReliably === false, 'Variable TMM does not fabricate a fixed quote');
assert(bfpmeCost.monthlyPayment === undefined, 'Variable TMM monthlyPayment is undefined');
assert(bfpmeCost.rateOrigin === 'unavailable', 'Variable TMM rate origin is unavailable');

// 2. Microcredit (Enda Tamweel / non-authoritative)
const endaProg = FINANCING_PROGRAMS.find(p => p.id === 'enda_microcredit_equip');
assert(endaProg !== undefined, 'Current Enda Bidaya product is evaluated in authoritative runtime');
const endaCost = calculateFinancingCost(10000, endaProg!);
assert(endaCost.canCalculateReliably === false, 'Microcredit does not fabricate a fixed rate quote');
assert(endaCost.monthlyPayment === undefined, 'Microcredit monthlyPayment is undefined');
assert(endaCost.rateOrigin === 'unavailable', 'Microcredit rate origin is unavailable');

// 3. Islamic finance (Zitouna Mourabaha)
const zitounaProg = FINANCING_PROGRAMS.find(p => p.id === 'banque_zitouna_mourabaha')!;
const zitounaCost = calculateFinancingCost(50000, zitounaProg);
assert(zitounaCost.canCalculateReliably === false, 'Islamic finance does not fabricate an interest-based quote');
assert(zitounaCost.monthlyPayment === undefined, 'Islamic finance monthlyPayment is undefined');
assert(zitounaCost.rateOrigin === 'unavailable', 'Islamic finance rate origin is unavailable');

// 4. Guarantee mechanism (SOTUGAR)
const sotugarProg = FINANCING_PROGRAMS.find(p => p.id === 'sotugar_guarantee')!;
const sotugarCost = calculateFinancingCost(200000, sotugarProg);
assert(sotugarCost.canCalculateReliably === false, 'SOTUGAR does not fabricate a universal quote');
assert(sotugarCost.monthlyPayment === undefined, 'SOTUGAR monthlyPayment is undefined');
assert(sotugarCost.rateOrigin === 'unavailable', 'SOTUGAR rate origin is unavailable (mechanism-specific)');
assert(sotugarProg.estimatedRateAnnual === undefined, 'SOTUGAR estimatedRateAnnual is undefined (no fake universal 0.75%)');
assert(sotugarCost.rateOrigin === 'unavailable' || sotugarProg.rateType === 'unknown', 'SOTUGAR commission/rate cannot be calculated as loan interest');

// -------------------------------------------------------------
// Scenario J: AI Fallback Parser - Zero Fabricated Defaults Audit
// -------------------------------------------------------------
console.log('\n--- SCENARIO J: Audit du parser intake (Zéro invention de données) ---');
// Case 1: Minimal text with only an amount mentioned
const parsedOnlyAmount = parseTextToProfileFallback('J’ai besoin de 30 000 DT pour mon projet.');
assert(parsedOnlyAmount.financingRequested === 30000, 'Parsed 30 000 DT correctly');
assert(parsedOnlyAmount.totalProjectCost === undefined, 'totalProjectCost is NOT fabricated');
assert(parsedOnlyAmount.userContribution === undefined, 'userContribution is NOT fabricated');
assert(parsedOnlyAmount.location === undefined, 'Location is NOT fabricated to Tunis');
assert(parsedOnlyAmount.sector === undefined, 'Sector is NOT fabricated to services');
assert(parsedOnlyAmount.legalStructure === undefined, 'Legal structure is NOT fabricated to suarl');
assert(parsedOnlyAmount.hasHigherEducationDegree === undefined, 'Degree is NOT fabricated');
assert(parsedOnlyAmount.hasStartupActLabel === undefined, 'Startup Act label is NOT fabricated');

// Case 2: Explicit location and sector mentioned
const parsedFull = parseTextToProfileFallback('Mon projet de textile à Monastir nécessite 80 000 DT de matériel.');
assert(parsedFull.financingRequested === 80000, 'Parsed 80 000 DT');
assert(parsedFull.location === 'Monastir', 'Extracted explicit Monastir');
assert(parsedFull.sector === 'industry', 'Extracted explicit textile industry');
assert(parsedFull.purpose === 'equipment', 'Extracted explicit equipment purpose');
assert(parsedFull.hasHigherEducationDegree === undefined, 'Degree remains undefined when unmentioned');

// -------------------------------------------------------------
// Scenario K: Multi-Amount Separation (ProjectCost vs Contribution vs Financing)
// -------------------------------------------------------------
console.log('\n--- SCENARIO K: Séparation multi-montants réaliste (Coût / Apport / Financement) ---');
const parsedMulti = parseTextToProfileFallback("Je veux créer une entreprise de fabrication de vêtements à Monastir. Le projet coûte 200 000 DT. J'ai 50 000 DT d'apport et j'ai besoin de 150 000 DT de financement.");
assert(parsedMulti.totalProjectCost === 200000, 'Parsed totalProjectCost = 200 000 DT');
assert(parsedMulti.userContribution === 50000, 'Parsed userContribution = 50 000 DT');
assert(parsedMulti.financingRequested === 150000, 'Parsed financingRequested = 150 000 DT');
assert(parsedMulti.location === 'Monastir', 'Extracted Monastir location');
assert(parsedMulti.sector === 'industry', 'Extracted industry (vêtements) sector');
assert(parsedMulti.purpose === 'creation', 'Extracted creation purpose');

// -------------------------------------------------------------
// Scenario L: Million Notations & Flexible Currency Formats
// -------------------------------------------------------------
console.log('\n--- SCENARIO L: Notations Millions (1.5 million, 1,5 MD, 1 500 000 DT) ---');
const parsedMillionText = parseTextToProfileFallback("Mon projet coûte 1,5 million DT et j'ai besoin de 800 000 DT.");
assert(parsedMillionText.totalProjectCost === 1500000, 'Parsed 1,5 million DT as 1 500 000 DT project cost');
assert(parsedMillionText.financingRequested === 800000, 'Parsed 800 000 DT financing requested');

// Sub-notations check
import { parseTunisianAmount } from '../src/utils/intakeParser';
assert(parseTunisianAmount('1.5 million') === 1500000, '1.5 million = 1500000');
assert(parseTunisianAmount('1,5 million') === 1500000, '1,5 million = 1500000');
assert(parseTunisianAmount('1.5 MD') === 1500000, '1.5 MD = 1500000');
assert(parseTunisianAmount('1,5 MD') === 1500000, '1,5 MD = 1500000');
assert(parseTunisianAmount('1500000 DT') === 1500000, '1500000 DT = 1500000');
assert(parseTunisianAmount('1 500 000 DT') === 1500000, '1 500 000 DT = 1500000');
assert(parseTunisianAmount('1.500.000 DT') === 1500000, '1.500.000 DT = 1500000');
assert(parseTunisianAmount('1.5 مليون') === 1500000, '1.5 مليون = 1500000');

// -------------------------------------------------------------
// Scenario M: Specialized Car Financing Journey (Individual vs Business)
// -------------------------------------------------------------
console.log('\n--- SCENARIO M: Financement Véhicule Spécialisé (Particulier vs Professionnel) ---');
const carProfileIndividual: ApplicantProfile = {
  journey: 'car',
  totalProjectCost: 65000,
  userContribution: 15000,
  financingRequested: 50000,
  purpose: 'vehicle',
  vehicleCondition: 'used',
  vehicleBuyerType: 'individual',
  vehicleUsage: 'personal',
  vehicleDesiredTermMonths: 60,
  location: 'Tunis',
  monthlyIncomeRange: '1500_2500',
  employmentStatus: 'salaried_private',
  legalStructure: 'individual'
};

const resultsCarIndiv = runMatchingEngine(carProfileIndividual);
assert(resultsCarIndiv.length > 0, 'Car individual matches programs');
const bnkAuto = resultsCarIndiv.find(r => r.program.id === 'banque_credit_auto');
assert(bnkAuto !== undefined, 'Crédit auto bancaire is evaluated');
assert(bnkAuto?.status === 'REQUIRES_CONFIRMATION' && bnkAuto.reasons.matchedBecause.some(m => m.fr.includes('véhicule')), 'Crédit auto matches the vehicle journey without treating an unpublished ceiling as zero');
assert(Boolean(bnkAuto?.reasons.matchedBecause.some(m => m.fr.includes('véhicule'))), 'Recognizes vehicle purpose without demanding business sector');

// Business car / utility leasing
const carProfileBusiness: ApplicantProfile = {
  journey: 'car',
  totalProjectCost: 120000,
  userContribution: 25000,
  financingRequested: 95000,
  purpose: 'vehicle',
  vehicleCondition: 'new',
  vehicleBuyerType: 'business',
  vehicleUsage: 'professional',
  vehicleCategory: 'utility_commercial',
  location: 'Sfax',
  sector: 'industry',
  businessStage: 'established_over_2y',
  legalStructure: 'sarl'
};

const resultsCarBiz = runMatchingEngine(carProfileBusiness);
const leasingPro = resultsCarBiz.find(r => r.program.id === 'leasing_vehicule_pro');
assert(leasingPro !== undefined, 'Leasing véhicule pro is evaluated');
assert(leasingPro?.status === 'REQUIRES_CONFIRMATION', 'Professional leasing is retained as a candidate while unpublished amount limits require confirmation');

// -------------------------------------------------------------
// Scenario N: Clean Journey Transition (Zero Irrelevant Retained Fields)
// -------------------------------------------------------------
console.log('\n--- SCENARIO N: Transition Propre de Parcours (Effacement des données non pertinentes) ---');
import { cleanProfileForJourney } from '../src/engine/journeyEngine';

const initialStartupProfile: ApplicantProfile = {
  journey: 'startup',
  purpose: 'creation',
  totalProjectCost: 300000,
  userContribution: 60000,
  financingRequested: 240000,
  sector: 'industry',
  startupProjectStage: 'idea',
  hasStartupActLabel: true,
  hasHigherEducationDegree: true,
  legalStructure: 'sarl',
  location: 'Zaghouan'
};

const switchedToHome = cleanProfileForJourney(initialStartupProfile, 'home_purchase');
assert(switchedToHome.journey === 'home_purchase', 'Switched journey is home_purchase');
assert(switchedToHome.purpose === 'first_home', 'Purpose set to first_home');
assert(switchedToHome.totalProjectCost === 300000, 'Preserved project cost');
assert(switchedToHome.location === 'Zaghouan', 'Preserved location');
assert(switchedToHome.hasStartupActLabel === undefined, 'Startup Act label cleansed for home purchase');
assert(switchedToHome.startupProjectStage === undefined, 'Startup project stage cleansed for home purchase');
assert(switchedToHome.sector === undefined, 'Business sector cleansed for home purchase');
assert(switchedToHome.isFirstPropertyPurchase === undefined, 'Home purchase does not invent isFirstPropertyPurchase answer');
assert(switchedToHome.propertyType === undefined, 'Home purchase does not invent propertyType');

const switchedToCar = cleanProfileForJourney(initialStartupProfile, 'car');
assert(switchedToCar.journey === 'car', 'Switched journey is car');
assert(switchedToCar.purpose === 'vehicle', 'Purpose set to vehicle');
assert(switchedToCar.hasStartupActLabel === undefined, 'Startup Act label cleansed for car');
assert(switchedToCar.vehicleCondition === undefined, 'Car does not invent vehicleCondition answer');
assert(switchedToCar.vehicleBuyerType === undefined, 'Car does not invent vehicleBuyerType');

// -------------------------------------------------------------
// Scenario O: Housing Journey Integrity (Premier Logement & FOPROLOS)
// -------------------------------------------------------------
console.log('\n--- SCENARIO O: Intégrité des Parcours Logement (Premier Logement & FOPROLOS) ---');
const homeProfile: ApplicantProfile = {
  journey: 'home_purchase',
  totalProjectCost: 180000,
  userContribution: 36000,
  financingRequested: 144000,
  purpose: 'first_home',
  location: 'Ariana',
  monthlyIncomeRange: '1500_2500',
  employmentStatus: 'salaried_private',
  propertyType: 'new_apartment',
  isFirstPropertyPurchase: true,
  legalStructure: 'individual'
};

const homeResults = runMatchingEngine(homeProfile);
const premierLogement = homeResults.find(r => r.program.id === 'premier_logement');
assert(premierLogement !== undefined, 'Premier Logement is evaluated');
assert(premierLogement?.reasons.alignmentLevel === 'strong_alignment', 'Premier Logement matches middle-class primo-accédant');
assert(Boolean(premierLogement?.reasons.matchedBecause.some(m => m.fr.includes('classe moyenne'))), 'Validates income scale');

// -------------------------------------------------------------
// Scenario P: All 6 Bank/Lender Pilot Demo Cases
// -------------------------------------------------------------
console.log('\n--- SCENARIO P: Audit des 6 Scénarios Démo Pilote Banques & Bailleurs ---');
import { DEMO_SCENARIOS } from '../src/data/demoScenarios';
assert(DEMO_SCENARIOS.length === 6, 'Exactly 6 demo scenarios defined');
for (const sc of DEMO_SCENARIOS) {
  const scResults = runMatchingEngine(sc.profile);
  assert(scResults.length > 0, `Demo scenario ${sc.id} produces matching results`);
  const topResult = scResults[0];
  assert(topResult !== undefined, `Demo scenario ${sc.id} has at least one evaluated candidate`);
  assert(topResult.status !== 'NOT_MATCHED' && topResult.status !== 'NOT_APPLICABLE', `Demo scenario ${sc.id} retains a relevant top candidate without converting unknown terms into rejection`);
}

// -------------------------------------------------------------
// Scenario Q: Hard Applicability Gate (Car User + Housing & Business)
// -------------------------------------------------------------
console.log('\n--- SCENARIO Q: Porte d’Applicabilité Stricte (Car User + FOPROLOS) ---');
import { evaluateApplicability, evaluateProgramCompatibility } from '../src/engine/matchingEngine';

const carUser: ApplicantProfile = {
  journey: 'car',
  purpose: 'vehicle',
  totalProjectCost: 65000,
  userContribution: 15000,
  financingRequested: 50000,
  vehicleCondition: 'new',
  vehicleBuyerType: 'individual',
  vehicleUsage: 'personal',
  employmentStatus: 'salaried_private',
  monthlyIncomeRange: '1500_2500',
  location: 'Tunis'
};

const carResults = runMatchingEngine(carUser);
const foprolosForCar = carResults.find(r => r.program.id === 'foprolos_construction');
const premierLogementForCar = carResults.find(r => r.program.id === 'premier_logement');
const bfpmeForCar = carResults.find(r => r.program.id === 'bfpme_creation');

assert(foprolosForCar !== undefined, 'FOPROLOS is present in authoritative runtime for hard applicability gating');
assert(foprolosForCar?.status === 'NOT_APPLICABLE', 'FOPROLOS is NOT_APPLICABLE for car purchase');
assert(foprolosForCar?.reasons.alignmentLevel === 'not_applicable', 'FOPROLOS alignment level is not_applicable for car');
assert(premierLogementForCar?.status === 'NOT_APPLICABLE', 'Premier Logement is NOT_APPLICABLE for car purchase');
assert(bfpmeForCar?.status === 'NOT_APPLICABLE', 'BFPME is NOT_APPLICABLE for individual car purchase');

const autoCreditForCar = carResults.find(r => r.program.id === 'banque_credit_auto');
assert(autoCreditForCar?.applicabilityStatus === 'APPLICABLE' && autoCreditForCar?.status === 'REQUIRES_CONFIRMATION', 'Crédit auto is applicable to car purchase, with amount limits requiring lender confirmation');

// -------------------------------------------------------------
// Scenario R: Housing User + FOPROLOS & Premier Logement
// -------------------------------------------------------------
console.log('\n--- SCENARIO R: Parcours Habitat (Home User + FOPROLOS & Premier Logement) ---');
const homeConstructUser: ApplicantProfile = {
  journey: 'home_construction',
  purpose: 'home_construction',
  totalProjectCost: 120000,
  userContribution: 25000,
  financingRequested: 95000,
  employmentStatus: 'salaried_private',
  constructionType: 'construction',
  hasLandOwnershipTitle: true,
  isFirstPropertyPurchase: true,
  location: 'Ben Arous'
};

const homeConstructResults = runMatchingEngine(homeConstructUser);
const foprolosForHome = homeConstructResults.find(r => r.program.id === 'foprolos_construction');
assert(foprolosForHome !== undefined, 'FOPROLOS must be present for the home-construction regression scenario');
assert(foprolosForHome?.applicabilityStatus === 'APPLICABLE', 'FOPROLOS is APPLICABLE for home construction');
assert(foprolosForHome?.status === 'REQUIRES_CONFIRMATION' && foprolosForHome.financialEvaluation.amountStatus === 'UNKNOWN', 'FOPROLOS remains applicable but its SMIG-linked ceiling is not fabricated as a fixed TND amount');

const carCreditForHome = homeConstructResults.find(r => r.program.id === 'banque_credit_auto');
assert(carCreditForHome?.status === 'NOT_APPLICABLE', 'Crédit auto is NOT_APPLICABLE for home construction');

// -------------------------------------------------------------
// Scenario S: Critical Failure vs Critical Unknown vs Missing Info
// -------------------------------------------------------------
console.log('\n--- SCENARIO S: Règles Critiques (Échec Critique, Inconnue Critique, Pas de faux PASS) ---');
// 1. Critical Failure: BTS Diplômés with NO degree (hasHigherEducationDegree === false)
const noDegreeUser: ApplicantProfile = {
  journey: 'startup',
  purpose: 'creation',
  totalProjectCost: 80000,
  userContribution: 15000,
  financingRequested: 65000,
  sector: 'industry',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: false, // Critical failure
  location: 'Sousse'
};

const noDegreeResults = runMatchingEngine(noDegreeUser);
const btsNoDegree = noDegreeResults.find(r => r.program.id === 'bts_diplomes');
assert(btsNoDegree !== undefined && btsNoDegree.status !== 'NOT_MATCHED', 'General BTS Crédit Professionnel is not rejected solely because the applicant has no degree');
assert(!btsNoDegree?.ruleEvaluations.some(r => r.ruleId === 'requiresDegree'), 'No unsupported degree-only eligibility rule is applied to general BTS Crédit Professionnel');

// 2. Critical Unknown: BTS Diplômés with undefined degree
const unknownDegreeUser: ApplicantProfile = {
  journey: 'startup',
  purpose: 'creation',
  totalProjectCost: 80000,
  userContribution: 15000,
  financingRequested: 65000,
  sector: 'industry',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: undefined, // Unknown
  location: 'Sousse'
};

const unknownDegreeResults = runMatchingEngine(unknownDegreeUser);
const btsUnknownDegree = unknownDegreeResults.find(r => r.program.id === 'bts_diplomes');
assert(btsUnknownDegree !== undefined && btsUnknownDegree.status !== 'NOT_MATCHED', 'Unknown degree status does not disqualify general BTS Crédit Professionnel');
assert(!btsUnknownDegree?.ruleEvaluations.some(r => r.ruleId === 'requiresDegree'), 'Unknown degree is not treated as a requirement when the product does not publish one');

// 3. Amount exceeding max ceiling -> NOT_MATCHED
const overCeilingUser: ApplicantProfile = {
  journey: 'startup',
  purpose: 'creation',
  totalProjectCost: 300000,
  userContribution: 50000,
  financingRequested: 250000, // BTS professional credit published maximum is 200 000 TND
  sector: 'industry',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: true,
  location: 'Tunis'
};

const overCeilingResults = runMatchingEngine(overCeilingUser);
const btsOverCeiling = overCeilingResults.find(r => r.program.id === 'bts_diplomes');
assert(btsOverCeiling?.status === 'NOT_MATCHED', 'Amount exceeding the published 200k BTS professional-credit ceiling evaluates to NOT_MATCHED');

// -------------------------------------------------------------
// Scenario T: Core Matching Invariants (Property-based tests)
// -------------------------------------------------------------
console.log('\n--- SCENARIO T: Vérification des 7 Invariants Fondamentaux Mizen ---');

// Test across various journeys
const testProfiles: ApplicantProfile[] = [
  carUser,
  homeConstructUser,
  noDegreeUser,
  unknownDegreeUser,
  overCeilingUser,
  ...DEMO_SCENARIOS.map(s => s.profile)
];

for (const prof of testProfiles) {
  const results = runMatchingEngine(prof);
  for (const res of results) {
    // INVARIANT 1 & 2: If applicability = NOT_APPLICABLE, status cannot be STRONG_ALIGNMENT or POTENTIAL_ALIGNMENT
    if (res.applicabilityStatus === 'NOT_APPLICABLE') {
      assert(res.status === 'NOT_APPLICABLE', `[INVARIANT 1&2] ${res.program.id} when NOT_APPLICABLE must have status NOT_APPLICABLE`);
      assert(res.reasons.alignmentLevel === 'not_applicable', `[INVARIANT 1&2] ${res.program.id} when NOT_APPLICABLE must have alignmentLevel not_applicable`);
    }

    // INVARIANT 3: If any critical rule fails, status cannot be STRONG_ALIGNMENT
    const hasCriticalFail = res.ruleEvaluations.some(r => r.criticality === 'CRITICAL' && r.status === 'FAIL');
    if (hasCriticalFail) {
      assert(res.status !== 'STRONG_ALIGNMENT' && res.status !== 'POTENTIAL_ALIGNMENT', `[INVARIANT 3] ${res.program.id} with critical failure cannot be positive alignment`);
    }

    // INVARIANT 4: If any critical rule is UNKNOWN, status cannot be STRONG_ALIGNMENT
    const hasCriticalUnknown = res.ruleEvaluations.some(r => r.criticality === 'CRITICAL' && r.status === 'UNKNOWN');
    if (hasCriticalUnknown) {
      assert(res.status !== 'STRONG_ALIGNMENT', `[INVARIANT 4] ${res.program.id} with critical unknown cannot be STRONG_ALIGNMENT`);
    }
  }
}

// -------------------------------------------------------------
// Scenario U: User-Facing Field Label Safety & 4-Way Verification Categorization
// -------------------------------------------------------------
console.log('\n--- SCENARIO U: Sécurité des Libellés Utilisateur & 4 Niveaux de Vérification ---');
import { getFieldLabel, formatFieldList, formatVerificationNeed } from '../src/utils/verificationLabels';

// 1. Assert getFieldLabel never exposes raw camelCase on unmapped fields
const safeFallbackFr = getFieldLabel('nonExistentInternalCustomField', 'fr');
const safeFallbackAr = getFieldLabel('nonExistentInternalCustomField', 'ar');
assert(!safeFallbackFr.includes('nonExistentInternalCustomField'), 'getFieldLabel FR never exposes raw camelCase tokens');
assert(!safeFallbackAr.includes('nonExistentInternalCustomField'), 'getFieldLabel AR never exposes raw camelCase tokens');
assert(safeFallbackFr === 'Condition financière spécifique à confirmer', 'getFieldLabel FR provides safe fallback');

// 2. Assert formatVerificationNeed produces distinct institutional categories
const userInputMsg = formatVerificationNeed('USER_INPUT_REQUIRED', 'userContribution', 'fr');
const lenderMsg = formatVerificationNeed('LENDER_CONFIRMATION_REQUIRED', 'exactMarginOverTMM', 'fr');
const mizenDataMsg = formatVerificationNeed('DATA_NOT_VERIFIED_IN_MIZEN', 'maxAmount', 'fr');
const ruleOutdatedMsg = formatVerificationNeed('PROGRAMME_RULE_UNCLEAR_OR_OUTDATED', 'rate', 'fr');

assert(userInputMsg.includes('Information requise à préciser dans votre profil'), 'Distinguishes USER_INPUT_REQUIRED');
assert(lenderMsg.includes('À confirmer auprès de l\'établissement prêteur'), 'Distinguishes LENDER_CONFIRMATION_REQUIRED');
assert(mizenDataMsg.includes('référentiel public Mizen'), 'Distinguishes DATA_NOT_VERIFIED_IN_MIZEN');
assert(ruleOutdatedMsg.includes('Cadre réglementaire ou barème officiel'), 'Distinguishes PROGRAMME_RULE_UNCLEAR_OR_OUTDATED');

// 3. Comprehensive check across all demo scenarios & programs: zero camelCase identifiers in user text
const forbiddenRawTokens = [
  'exactMonthlyLeaseRate',
  'fileProcessingFees',
  'businessAge',
  'exactMarginOverTMM',
  'variableCommercialSpread',
  'exactIncomeScaleCeiling',
  'inspectionFees',
  'exactInsuranceQuote',
  'commercialBankSpread',
  'exactPropertyCapUpdate',
  'exactProfitMarginRate',
  'takafulInsuranceRate',
  'partnerBankApproval',
  'commissionRate',
  'exactGuaranteeShare',
  'regionalBonusRate',
  'collegeDecision',
  'regionalQuota'
];

let zeroRawTokensFound = true;
for (const prof of testProfiles) {
  const results = runMatchingEngine(prof);
  for (const res of results) {
    const allUserTexts = [
      ...res.reasons.matchedBecause.map(m => m.fr + ' ' + m.ar),
      ...res.reasons.potentialIssues.map(p => p.fr + ' ' + p.ar),
      ...res.reasons.needsVerification.map(n => n.fr + ' ' + n.ar),
      res.compatibilitySummary.fr + ' ' + res.compatibilitySummary.ar
    ].join(' ');

    for (const token of forbiddenRawTokens) {
      if (allUserTexts.includes(token)) {
        console.error(`❌ Leak of raw internal token '${token}' found in program ${res.program.id}!`);
        zeroRawTokensFound = false;
        allPassed = false;
      }
    }
  }
}
assert(zeroRawTokensFound, 'Zero internal camelCase or database identifiers exposed across all user-facing results');

// -------------------------------------------------------------
// Scenario V: Canonical Knowledge Catalogue Integrity & Provenance
// -------------------------------------------------------------
console.log('\n--- SCENARIO V: Intégrité du Référentiel Canonique & Traçabilité des Sources ---');
import { CANONICAL_PROVIDERS, CANONICAL_PRODUCTS, CANONICAL_METADATA } from '../src/knowledge/canonicalCatalogue';
import { DISCOVERY_QUERIES, evaluateSourceFreshness } from '../src/knowledge/searchRegistry';
import { extractFinancingFactsDeterministically, searchFinancingCatalogue } from '../src/knowledge/discoveryEngine';
import { getOfficialSimulator, generateExclusionReason, getCatalogueHealthSummary } from '../src/knowledge/catalogueAdapter';

// 1. Every active product has an existing registered provider
const providerIdSet = new Set(CANONICAL_PROVIDERS.map(p => p.id));
for (const product of CANONICAL_PRODUCTS) {
  assert(providerIdSet.has(product.providerId), `Product ${product.id} must reference a registered provider (found ${product.providerId})`);
  assert(product.sources.length > 0, `Product ${product.id} must have at least one source reference`);
  assert(product.applicability.domains.length > 0, `Product ${product.id} must define financing domains`);
  assert(product.applicability.applicantTypes.length > 0, `Product ${product.id} must define supported applicant types`);
  
  if (product.financialTerms.amount?.min) {
    assert(product.financialTerms.amount.min > 0, `Product ${product.id} min amount must be positive`);
  }
  if (product.financialTerms.amount?.max) {
    assert(product.financialTerms.amount.max > 0, `Product ${product.id} max amount must be positive`);
  }
}

// 2. No duplicate provider or product IDs
const uniqueProductIds = new Set(CANONICAL_PRODUCTS.map(p => p.id));
assert(uniqueProductIds.size === CANONICAL_PRODUCTS.length, 'Zero duplicate product IDs in canonical catalogue');

const uniqueProviderIds = new Set(CANONICAL_PROVIDERS.map(p => p.id));
assert(uniqueProviderIds.size === CANONICAL_PROVIDERS.length, 'Zero duplicate provider IDs in canonical catalogue');

// -------------------------------------------------------------
// Scenario W: Search & Discovery Engine
// -------------------------------------------------------------
console.log('\n--- SCENARIO W: Moteur de Recherche & Découverte de Faits Financiers ---');

// 1. Search registry contains queries for all domains
assert(DISCOVERY_QUERIES.length >= 8, 'Search registry contains queries across all financing domains');
for (const q of DISCOVERY_QUERIES) {
  assert(Boolean(q.queryFr && q.queryAr), `Query ${q.id} has both French and Arabic formulations`);
}

// 2. Deterministic fact extraction test
const sampleDecreeText = "Décret n° 2017-278 : Le montant maximum est de 50 000 DT avec un apport personnel minimum de 20% et un remboursement sur 20 ans au taux de 2%.";
const extracted = extractFinancingFactsDeterministically(sampleDecreeText, 'http://legislation.tn', 'JORT');
assert(extracted.extractedFacts.length >= 2, 'Extracts multiple facts from raw regulatory text');
assert(extracted.requiresReview === true, 'Extracted facts require human/developer review before canonical promotion');

// 3. Source freshness evaluation
const freshSource = evaluateSourceFreshness(new Date().toISOString());
assert(freshSource.isOutdated === false, 'Recent source is marked verified/fresh');

const staleSource = evaluateSourceFreshness('2022-01-01T00:00:00Z');
assert(staleSource.isOutdated === true, 'Source older than 12 months is marked outdated');

// 4. Search catalogue test
const carSearch = searchFinancingCatalogue({ domain: 'CAR' });
assert(carSearch.products.length >= 2, 'Search by CAR domain returns relevant vehicle financing products');

// -------------------------------------------------------------
// Scenario X: Exclusion Reasoning ("Why not?")
// -------------------------------------------------------------
console.log('\n--- SCENARIO X: Moteur d\'Explication d\'Exclusion ("Pourquoi pas ce mécanisme ?") ---');

const excludedHousing = generateExclusionReason(CANONICAL_PRODUCTS.find(p => p.id === 'premier_logement')!, 'PURPOSE_MISMATCH');
assert(Boolean(excludedHousing.explanation.fr && excludedHousing.explanation.ar), 'Exclusion reason has clear FR and AR explanations');
assert(excludedHousing.reasonCode === 'PURPOSE_MISMATCH', 'Exclusion code is PURPOSE_MISMATCH');

// -------------------------------------------------------------
// Scenario Y: Official Simulators & Guarantee Distinction
// -------------------------------------------------------------
console.log('\n--- SCENARIO Y: Simulateurs Officiels & Non-Assimilation des Garanties en Prêt Direct ---');

// 1. Official simulators exist for key products
const bhSim = getOfficialSimulator('banque_credit_auto');
assert(Boolean(bhSim && bhSim.official), 'BH Auto has official simulator reference');

const tlfSim = getOfficialSimulator('leasing_vehicule_pro');
assert(Boolean(tlfSim && tlfSim.official), 'TLF Leasing has official simulator reference');

// 2. Guarantee mechanism is never presented as direct loan debt
const sotugarProd = CANONICAL_PRODUCTS.find(p => p.id === 'sotugar_guarantee');
assert(sotugarProd?.category === 'GUARANTEE', 'SOTUGAR is classified as GUARANTEE category');
assert(sotugarProd?.financialTerms.rate?.type === 'NOT_APPLICABLE', 'SOTUGAR does not charge loan interest rate (NOT_APPLICABLE)');

// -------------------------------------------------------------
// Scenario Z: Claim-Level Knowledge Architecture & Batch 2 Regression Tests
// -------------------------------------------------------------
console.log('\n--- SCENARIO Z: Architecture Canonique par Revendications & 30 Tests de Non-Régression ---');
import { CLAIMS_REPOSITORY, INITIAL_CANONICAL_CLAIMS, FinancingClaimsRepository } from '../src/knowledge/claimsRepository';
import { FinancingClaim } from '../src/types/claims';

// Test 1: New current claim supersedes older conflicting claim
const repo = new FinancingClaimsRepository();
const oldClaim = repo.getClaim('claim_bfpme_cmlt_ceiling_amount_historical');
const currentClaim = repo.getClaim('claim_bfpme_cmlt_ceiling_amount_current');
assert(oldClaim?.conflictStatus === 'SUPERSEDED', '1. Old conflicting claim is marked SUPERSEDED');
assert(oldClaim?.supersededByClaimId === 'claim_bfpme_cmlt_ceiling_amount_current', '1. Old claim points to newer claim');
assert(currentClaim?.conflictStatus === 'NONE' && currentClaim?.ruleStatus === 'VERIFIED_CURRENT', '1. New current claim is active and current');

// Test 2: Historical claim remains queryable
const historicalClaims = repo.getHistoricalClaims('bfpme_creation');
assert(historicalClaims.some(c => c.claimId === 'claim_bfpme_cmlt_ceiling_amount_historical'), '2. Historical claim remains queryable in repository');

// Test 3: Historical claim does not appear in current production matching
const activeClaims = repo.getActiveClaims('bfpme_creation');
assert(!activeClaims.some(c => c.claimId === 'claim_bfpme_cmlt_ceiling_amount_historical'), '3. Historical claim does not appear in active claims');
assert(activeClaims.some(c => c.claimId === 'claim_bfpme_cmlt_ceiling_amount_current' && c.value === 2500000), '3. Active claim reflects current 2.5M ceiling');

// Test 4: Institution active does not imply product active
const bfpmeActiveClaims = repo.getActiveClaims('bfpme_creation');
const bfpmeOperationalClaim = bfpmeActiveClaims.find(c => c.field === 'minProjectCost');
assert(bfpmeOperationalClaim?.operationalStatus === 'ACTIVE_NOT_CONFIRMED', '4. Product operational status is ACTIVE_NOT_CONFIRMED despite institution active');

// Test 5: Product active does not imply universal applicability
assert(bfpmeOperationalClaim?.applicabilityStatus === 'CONDITIONAL', '5. Product applicability is CONDITIONAL, not universal');

// Test 6: Unknown operational status prevents current recommendation
const fgjcClaims = repo.getAllClaims('sotugar_fgjc');
const fgjcOperational = fgjcClaims.find(c => c.field === 'projectCostCeiling');
assert(fgjcOperational?.operationalStatus === 'UNKNOWN', '6. FGJC operational status is explicitly UNKNOWN');

// Test 7: Unknown pricing relationship prevents rate calculation
const bfpmePricing = calculateFinancingCost(500000, FINANCING_PROGRAMS.find(p => p.id === 'bfpme_creation')!);
assert(bfpmePricing.canCalculateReliably === false, '7. Unknown pricing relationship prevents automatic rate calculation');
assert(bfpmePricing.monthlyPayment === undefined, '7. Monthly installment is undefined for unresolved pricing spread');

// Test 8: Unknown full-financing meaning prevents 100% financing calculation
const fullFinancingProfile: ApplicantProfile = {
  totalProjectCost: 500000,
  userContribution: 0,
  financingRequested: 500000,
  purpose: 'creation',
  sector: 'industry',
  location: 'Sousse',
  businessStage: 'idea_project',
  legalStructure: 'sarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const fullFinancingResults = runMatchingEngine(fullFinancingProfile);
const bfpmeFullFin = fullFinancingResults.find(r => r.program.id === 'bfpme_creation');
assert(bfpmeFullFin?.eligibilityOutcome === 'UNKNOWN_DUE_TO_MISSING_DATA', '8. Full financing request returns UNKNOWN_DUE_TO_MISSING_DATA');
assert(bfpmeFullFin?.costEstimate.canCalculateReliably === false, '8. Full financing does not assume 100% bank financing calculation');

// Test 9: Fund capitalization cannot become borrower financing ceiling
const fgpmeCapClaim = repo.getClaim('claim_fgpme_7590_allocation');
assert(fgpmeCapClaim?.isFundLevelFact === true, '9. Fund capitalization is explicitly flagged as fund-level fact');
assert(fgpmeCapClaim?.value === 30000000, '9. Fund capitalization is 30M TND');
const sotugarProgram = FINANCING_PROGRAMS.find(p => p.id === 'sotugar_guarantee');
assert(sotugarProgram?.maxAmount !== 30000000, '9. Borrower financing ceiling is not 30M TND');

// Test 10: Compatibility without evidence remains UNKNOWN/POTENTIALLY_COMPATIBLE
const unknownCompat = repo.getCompatibility('unknown_program_a', 'unknown_program_b');
assert(unknownCompat.compatibilityStatus === 'UNKNOWN' && unknownCompat.confidence === 'LOW', '10. Compatibility without evidence remains UNKNOWN with LOW confidence');

// Test 11: Duplicate research import is idempotent
const repoCopy = new FinancingClaimsRepository();
const summary1 = repoCopy.getReconciliationSummary();
repoCopy.ingestClaims(INITIAL_CANONICAL_CLAIMS);
const summary2 = repoCopy.getReconciliationSummary();
assert(summary1.stats.total === summary2.stats.total, '11. Re-importing identical claims does not create duplicates (idempotency)');
assert(summary1.stats.active === summary2.stats.active, '11. Active claims count remains strictly identical');

// Test 12: Conflicting sources remain auditable
const bfpmeAllCostClaims = repo.getAllClaims('bfpme_creation').filter(c => c.field === 'maxFinancingAmount');
assert(bfpmeAllCostClaims.length === 2, '12. Both historical 5M and current 2.5M claims remain auditable in repository');

// Test 13: Historical SOTUGAR 75/90 percentages remain historical
const fgpmePriorityClaim = repo.getClaim('claim_fgpme_7590_coverage_priority');
assert(fgpmePriorityClaim?.ruleStatus === 'VERIFIED_HISTORICAL', '13. SOTUGAR 75/90 priority coverage remains VERIFIED_HISTORICAL');

// Test 14: Current BFPME 150k minimum is usable
const bfpmeMinCostClaim = repo.getClaim('claim_bfpme_min_cost_current');
assert(bfpmeMinCostClaim?.value === 150000 && bfpmeMinCostClaim?.ruleStatus === 'VERIFIED_CURRENT', '14. Current BFPME 150k min cost is usable');

// Test 15: Current BFPME 15M maximum is usable
const bfpmeMaxCostClaim = repo.getClaim('claim_bfpme_max_cost_current');
assert(bfpmeMaxCostClaim?.value === 15000000 && bfpmeMaxCostClaim?.ruleStatus === 'VERIFIED_CURRENT', '15. Current BFPME 15M max cost is usable');

// Test 16: Current BFPME 65% ceiling is usable
const bfpmePctClaim = repo.getClaim('claim_bfpme_cmlt_ceiling_pct_current');
assert(bfpmePctClaim?.value === 65 && bfpmePctClaim?.ruleStatus === 'VERIFIED_CURRENT', '16. Current BFPME 65% CMLT ceiling is usable');

// Test 17: Current BFPME 2.5M CMLT ceiling is usable
const bfpmeCeilClaim = repo.getClaim('claim_bfpme_cmlt_ceiling_amount_current');
assert(bfpmeCeilClaim?.value === 2500000 && bfpmeCeilClaim?.ruleStatus === 'VERIFIED_CURRENT', '17. Current BFPME 2.5M CMLT ceiling is usable');

// Test 18: BFPME 70% request against project cost is rejected
const profile70Pct: ApplicantProfile = {
  totalProjectCost: 1000000,
  userContribution: 300000,
  financingRequested: 700000, // 70% > 65%
  purpose: 'creation',
  sector: 'industry',
  location: 'Tunis',
  businessStage: 'idea_project',
  legalStructure: 'sarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const res70 = runMatchingEngine(profile70Pct).find(r => r.program.id === 'bfpme_creation');
assert(res70?.status === 'NOT_MATCHED' && res70?.eligibilityOutcome === 'INCOMPATIBLE_ON_DOCUMENTED_RULES', '18. BFPME 70% financing request is rejected');

// Test 19: BFPME 2.6M CMLT request is rejected
const profile2_6M: ApplicantProfile = {
  totalProjectCost: 5000000,
  userContribution: 2400000,
  financingRequested: 2600000, // 2.6M > 2.5M CMLT ceiling
  purpose: 'creation',
  sector: 'industry',
  location: 'Sfax',
  businessStage: 'established_under_2y',
  legalStructure: 'sa',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const res2_6M = runMatchingEngine(profile2_6M).find(r => r.program.id === 'bfpme_creation');
assert(res2_6M?.status === 'NOT_MATCHED' && res2_6M?.eligibilityOutcome === 'INCOMPATIBLE_ON_DOCUMENTED_RULES', '19. BFPME 2.6M CMLT request is rejected');

// Test 20: BFPME 149,999 TND project is rejected
const profile149k: ApplicantProfile = {
  totalProjectCost: 149999, // < 150,000 TND
  userContribution: 50000,
  financingRequested: 90000,
  purpose: 'creation',
  sector: 'industry',
  location: 'Sousse',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const res149k = runMatchingEngine(profile149k).find(r => r.program.id === 'bfpme_creation');
assert(res149k?.status === 'NOT_MATCHED' && res149k?.eligibilityOutcome === 'INCOMPATIBLE_ON_DOCUMENTED_RULES', '20. BFPME 149,999 TND project is rejected');

// Test 21: BFPME 150,000 TND boundary passes documented amount rule
const profile150k: ApplicantProfile = {
  totalProjectCost: 150000, // = 150,000 TND boundary
  userContribution: 60000,
  financingRequested: 90000, // 60% <= 65%
  purpose: 'creation',
  sector: 'industry',
  location: 'Sousse',
  businessStage: 'idea_project',
  legalStructure: 'suarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const res150k = runMatchingEngine(profile150k).find(r => r.program.id === 'bfpme_creation');
assert(res150k?.financialEvaluation.amountStatus === 'PASS', '21. BFPME 150,000 TND boundary passes documented amount rule');

// Test 22: BFPME 15M boundary passes documented amount rule
const profile15M: ApplicantProfile = {
  totalProjectCost: 15000000, // = 15M TND boundary
  userContribution: 12500000,
  financingRequested: 2500000, // = 2.5M max ceiling
  purpose: 'creation',
  sector: 'industry',
  location: 'Sfax',
  businessStage: 'established_under_2y',
  legalStructure: 'sa',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const res15M = runMatchingEngine(profile15M).find(r => r.program.id === 'bfpme_creation');
assert(res15M?.financialEvaluation.amountStatus === 'PASS', '22. BFPME 15M boundary passes documented amount rule');

// Test 23: BFPME 15,000,001 TND fails
const profile15M1: ApplicantProfile = {
  totalProjectCost: 15000001, // > 15M
  userContribution: 12500001,
  financingRequested: 2500000,
  purpose: 'creation',
  sector: 'industry',
  location: 'Sfax',
  businessStage: 'established_under_2y',
  legalStructure: 'sa',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any'
};
const res15M1 = runMatchingEngine(profile15M1).find(r => r.program.id === 'bfpme_creation');
assert(res15M1?.status === 'NOT_MATCHED' && res15M1?.eligibilityOutcome === 'INCOMPATIBLE_ON_DOCUMENTED_RULES', '23. BFPME 15,000,001 TND project is rejected');

// Test 24: Rural guesthouse is not rejected by the generic accommodation exclusion
const profileGuesthouse: ApplicantProfile = {
  totalProjectCost: 400000,
  userContribution: 150000,
  financingRequested: 250000,
  purpose: 'creation',
  sector: 'tourism',
  location: 'Zaghouan',
  businessStage: 'idea_project',
  legalStructure: 'sarl',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any',
  projectDescription: "Création d'un gîte rural et maison d'hôtes écologique à Zaghouan"
};
const resGuesthouse = runMatchingEngine(profileGuesthouse).find(r => r.program.id === 'bfpme_creation');
assert(resGuesthouse?.status !== 'NOT_MATCHED', '24. Rural guesthouse passes BFPME tourism exception');

// Test 25: Residential developer is rejected on documented rule
const profileDeveloper: ApplicantProfile = {
  totalProjectCost: 2000000,
  userContribution: 800000,
  financingRequested: 1200000,
  purpose: 'creation',
  sector: 'real_estate',
  location: 'Tunis',
  businessStage: 'creation_underway',
  legalStructure: 'sa',
  hasHigherEducationDegree: true,
  hasStartupActLabel: false,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any',
  projectDescription: "Société de promotion immobilière résidentielle pour construction de logements"
};
const resDev = runMatchingEngine(profileDeveloper).find(r => r.program.id === 'bfpme_creation');
assert(resDev?.status === 'NOT_MATCHED' && resDev?.eligibilityOutcome === 'INCOMPATIBLE_ON_DOCUMENTED_RULES', '25. Residential developer is rejected on documented BFPME rule');

// Test 26: Full-financing case returns UNKNOWN_DUE_TO_MISSING_DATA
const resFullFinCase = runMatchingEngine(fullFinancingProfile).find(r => r.program.id === 'bfpme_creation');
assert(resFullFinCase?.eligibilityOutcome === 'UNKNOWN_DUE_TO_MISSING_DATA', '26. Full-financing case returns UNKNOWN_DUE_TO_MISSING_DATA');

// Test 27: Historical FGJC status remains UNKNOWN operationally
const fgjcClaim = repo.getClaim('claim_fgjc_project_ceiling');
assert(fgjcClaim?.operationalStatus === 'UNKNOWN' && fgjcClaim?.ruleStatus === 'VERIFIED_HISTORICAL', '27. Historical FGJC status remains UNKNOWN operationally (not assumed closed)');

// Test 28: Startup Guarantee + VC/FCPR/seed fund remains VERIFIED_HISTORICAL
const startupVcCompat = repo.getCompatibility('startup_guarantee_fund', 'venture_capital_fund');
assert(startupVcCompat.compatibilityStatus === 'HISTORICAL_COMPATIBILITY' && startupVcCompat.ruleStatus === 'VERIFIED_HISTORICAL', '28. Startup Guarantee + VC remains VERIFIED_HISTORICAL');

// Test 29: Startup Guarantee + bank remains UNKNOWN
const startupBankCompat = repo.getCompatibility('startup_guarantee_fund', 'bh_bank_loan');
assert(startupBankCompat.compatibilityStatus === 'UNKNOWN', '29. Startup Guarantee + bank credit remains UNKNOWN');

// Test 30: BFPME + SOTUGAR remains POTENTIALLY_COMPATIBLE with LOW confidence
const bfpmeSotugarCompat = repo.getCompatibility('bfpme_creation', 'sotugar_guarantee');
assert(bfpmeSotugarCompat.compatibilityStatus === 'POTENTIALLY_COMPATIBLE' && bfpmeSotugarCompat.confidence === 'LOW', '30. BFPME + SOTUGAR remains POTENTIALLY_COMPATIBLE with LOW confidence');

// Architecture regression: legacy BFPME TMM + 3% must not survive the claims-first projection.
const authoritativeBfpme = getAuthoritativeFinancingPrograms().find(p => p.id === 'bfpme_creation')!;
assert(authoritativeBfpme.rateType === 'unknown', '31. BFPME pricing relationship resolves to UNKNOWN');
assert(authoritativeBfpme.rateDescription.fr.includes('2 à 4.5') && !authoritativeBfpme.rateDescription.fr.includes('TMM +'), '32. BFPME published margin range survives without inventing a TMM relationship');
assert(authoritativeBfpme.estimatedRateAnnual === undefined, '33. BFPME has no fabricated annual rate');

// Import regression: weaker/historical evidence cannot silently supersede a stronger current claim.
const importPipeline = new ResearchImportPipeline([{
  id: 'claim_test_bfpme_margin_current',
  programId: 'bfpme_creation',
  field: 'publishedMarginRange',
  value: { min: 2, max: 4.5 },
  status: 'VERIFIED_CURRENT',
  evidence: [{ field: 'publishedMarginRange', status: 'VERIFIED_CURRENT', evidenceStrength: 'DIRECT_PRIMARY_CURRENT' }],
  createdAt: '2026-09-20',
  isCurrent: true
}]);
const weakerImport = importPipeline.processResearchBatch([{
  programId: 'bfpme_creation',
  field: 'publishedMarginRange',
  value: { min: 3, max: 3 },
  status: 'VERIFIED_HISTORICAL',
  source: { url: 'https://example.invalid/historical', title: 'Historical source', publisher: 'Historical', sourceType: 'OFFICIAL_PDF', checkedAt: '2026-10-02' }
}]);
const retained = importPipeline.getClaimsForProgram('bfpme_creation').find(c => c.isCurrent && c.field === 'publishedMarginRange');
assert(Boolean(retained?.value) && JSON.stringify(retained?.value) === JSON.stringify({ min: 2, max: 4.5 }), '34. Historical weaker claim cannot supersede current primary claim');
assert(weakerImport.conflicts.some(c => c.resolution === 'PENDING_REVIEW'), '35. Weaker conflicting research is retained as pending review');
assert(authoritativeBfpme.projectCostMin === 150000, '36. BFPME project-cost minimum is projected into the dedicated project-cost field');
assert(authoritativeBfpme.projectCostMax === 15000000, '37. BFPME project-cost maximum is projected into the dedicated project-cost field');
assert(authoritativeBfpme.maxFinancingPercentage === 65, '38. BFPME 65% financing ceiling is projected separately from financing amount');
assert(authoritativeBfpme.maxAmount === 2500000, '39. BFPME 2.5M ceiling remains the financing amount ceiling');
assert(authoritativeBfpme.minAmount !== 150000, '40. Project-cost minimum never leaks into financing minimum amount');
assert(authoritativeBfpme.rateType === 'unknown' && authoritativeBfpme.estimatedRateAnnual === undefined, '41. Unresolved BFPME pricing cannot expose a calculable annual rate');

const bfpmeProjectedCriteria = getAuthoritativeCatalogueProducts().find(p => p.id === 'bfpme_creation')!;
const projectMinCriterion = bfpmeProjectedCriteria.criteria.find(c => c.field === 'totalProjectCost' && c.operator === 'GTE');
const financingMaxCriterion = bfpmeProjectedCriteria.criteria.find(c => c.field === 'financingRequested' && c.operator === 'LTE');
assert(projectMinCriterion?.expectedValue === 150000, '42. Catalogue projection updates project-cost criterion from authoritative claim');
assert(financingMaxCriterion?.expectedValue === 2500000, '43. Catalogue projection updates financing ceiling criterion from authoritative claim');
assert(bfpmeProjectedCriteria.financialTerms.rate?.type === 'UNKNOWN' && bfpmeProjectedCriteria.financialTerms.rate?.margin === undefined && bfpmeProjectedCriteria.financialTerms.rate?.referenceIndex === undefined, '44. Catalogue projection blocks TMM + margin calculation');
assert(Boolean(bfpmeProjectedCriteria.financialTerms.rate?.explanation?.fr?.includes('2 à 4.5')) && !Boolean(bfpmeProjectedCriteria.financialTerms.rate?.explanation?.fr?.includes('TMM +')), '45. Catalogue projection preserves the published margin range without inventing TMM linkage');

// =========================================================================
// SCENARIO AA: Moteur de Financement Combiné (Financing Stack Engine) & Invariants
// =========================================================================
console.log('\n--- SCENARIO AA: Moteur de Financement Combiné (Financing Stack Engine) ---');
import { 
  calculateFundingGap, 
  evaluateStackCandidate, 
  generateFinancingStacks, 
  mapProgramToStackComponent 
} from '../src/engine/financingStackEngine';
import { getStackCompatibility, getAllCompatibilityRules } from '../src/knowledge/stackCompatibility';

// 1. Compatibility Rule Invariants
const compatBfpmeBank = getStackCompatibility('bfpme_creation', 'bh_bank_loan');
assert(compatBfpmeBank.compatibilityStatus === 'VERIFIED_COMPATIBLE', 'AA.1. BFPME + Commercial Bank is VERIFIED_COMPATIBLE');

const compatBfpmeSotugar = getStackCompatibility('bfpme_creation', 'sotugar_guarantee');
assert(compatBfpmeSotugar.compatibilityStatus === 'POTENTIALLY_COMPATIBLE' && compatBfpmeSotugar.confidence === 'LOW', 'AA.2. BFPME + SOTUGAR is POTENTIALLY_COMPATIBLE with LOW confidence');

const compatBfpmeLeasing = getStackCompatibility('bfpme_creation', 'leasing_vehicule_pro');
assert(compatBfpmeLeasing.compatibilityStatus === 'UNKNOWN', 'AA.3. BFPME + Leasing is UNKNOWN');

const compatStartupBank = getStackCompatibility('startup_guarantee_fund', 'bh_bank_loan');
assert(compatStartupBank.compatibilityStatus === 'UNKNOWN', 'AA.4. Startup Guarantee + Bank is UNKNOWN');

// 2. Guarantee Cash Gap Invariant (Guarantee is NOT cash)
const compBfpmeDebt = mapProgramToStackComponent(authoritativeBfpme, { financingRequested: 650000, totalProjectCost: 1000000 });
const sotugarProgramObj = FINANCING_PROGRAMS.find(p => p.id === 'sotugar_guarantee')!;
const compSotugar = mapProgramToStackComponent(sotugarProgramObj, { financingRequested: 650000, totalProjectCost: 1000000 });

assert(compBfpmeDebt.isCashFunding === true, 'AA.5a. BFPME component is flagged as cash funding');
assert(compSotugar.isCashFunding === false, 'AA.5b. SOTUGAR guarantee component is flagged as NOT cash funding');
assert(compSotugar.role === 'GUARANTEE', 'AA.5c. SOTUGAR role is GUARANTEE');

const gapWithGuarantee = calculateFundingGap(1000000, [compBfpmeDebt, compSotugar]);
assert(gapWithGuarantee.verifiedCashFunding === 650000, 'AA.5d. Guarantee does not increase cash funding coverage');
assert(gapWithGuarantee.remainingFundingGap === 350000, 'AA.5e. Remaining funding gap is exactly 350k TND (guarantee is NOT 350k cash)');

// 3. Duplicate prevention (Double counting defense)
const gapWithDup = calculateFundingGap(1000000, [compBfpmeDebt, compBfpmeDebt]);
assert(gapWithDup.verifiedCashFunding === 650000, 'AA.6. Duplicate component ID does not double count cash coverage');

// 4. Unknown compatibility does not produce a confirmed stack
// Reuse the established Scenario B business-expansion profile. Its matching
// assertions above prove the engine returns strong-alignment business products;
// the stack test should exercise those real matches instead of a synthetic
// profile whose journey metadata can exclude every candidate.
const testApplicant: ApplicantProfile = profileB;

const matchResultsForStack = stackSeedMatchesB;
const stacksResult = generateFinancingStacks({
  applicantProfile: testApplicant,
  matchResults: matchResultsForStack
});

assert(
  stacksResult.stacks.length > 0 || (stacksResult.unverifiedCombinations?.length ?? 0) > 0,
  `AA.7. Generates viable or explicitly unverified financing stack candidates (matches=${matchResultsForStack.length}, aligned=${matchResultsForStack.filter(m => ['STRONG_ALIGNMENT', 'POTENTIAL_ALIGNMENT', 'REQUIRES_CONFIRMATION'].includes(m.status) || ['strong_alignment', 'partial_alignment'].includes(m.reasons?.alignmentLevel)).map(m => `${m.program.id}:${m.status}:${m.reasons?.alignmentLevel}`).join(',')}, viable=${stacksResult.stacks.length}, unverified=${stacksResult.unverifiedCombinations?.length ?? 0})`
);

// AA.8: UNKNOWN compatibility is excluded from viable stacks
const unknownFoprodiMourabaha = stacksResult.stacks.find(s => 
  s.components.some(c => c.programId.includes('foprodi')) && 
  s.components.some(c => c.programId.includes('mourabaha'))
);
assert(!unknownFoprodiMourabaha, 'AA.8a. UNKNOWN compatibility (FOPRODI + Mourabaha) is strictly excluded from viable stacks');

const unknownFoprodiSotugar = stacksResult.stacks.find(s => 
  s.components.some(c => c.programId.includes('foprodi')) && 
  s.supportComponents.some(c => c.programId === 'sotugar_guarantee')
);
assert(!unknownFoprodiSotugar, 'AA.8b. UNKNOWN compatibility (FOPRODI + SOTUGAR) is strictly excluded from viable stacks');

// AA.8c: Zero-value component invariant
const hasZeroDTComponent = stacksResult.stacks.some(s => 
  s.components.some(c => c.allocatedAmount !== undefined && c.allocatedAmount <= 0)
);
assert(!hasZeroDTComponent, 'AA.8c. Zero-value (0 DT) components are strictly forbidden in candidate stacks');

const bfpmeSotugarStack = stacksResult.stacks.find(s => s.components.some(c => c.programId === 'bfpme_creation') && s.supportComponents.some(c => c.programId === 'sotugar_guarantee'));
if (bfpmeSotugarStack) {
  assert(bfpmeSotugarStack.overallStatus === 'POTENTIALLY_COMPATIBLE', 'AA.9. BFPME + SOTUGAR stack is POTENTIALLY_COMPATIBLE (not unconditionally confirmed)');
  assert(bfpmeSotugarStack.confidence === 'LOW', 'AA.10. BFPME + SOTUGAR stack propagates LOW confidence');
  assert(!bfpmeSotugarStack.isReliablyCalculable, 'AA.11. Unknown BFPME rate prevents payment/amortization calculation in stack');
}

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 ALL 56 AUDIT SCENARIOS (A-AA) & FINANCING STACK ARCHITECTURE INVARIANTS PASSED SUCCESSFULLY!');
} else {
  console.error('❌ SOME CHECKS FAILED');
  process.exit(1);
}

