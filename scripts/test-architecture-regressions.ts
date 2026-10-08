/**
 * Mizen architecture regression guardrails.
 * These assertions intentionally fail when knowledge disappears instead of
 * allowing "missing product" to become a passing test.
 */

import { runMatchingEngine } from '../src/engine/matchingEngine';
import { calculateFinancingCost } from '../src/engine/financialCalculations';
import {
  calculateFundingGap,
  generateFinancingStacks,
  mapProgramToStackComponent
} from '../src/engine/financingStackEngine';
import { getAuthoritativeFinancingPrograms, getAuthoritativeProviders } from '../src/knowledge/authoritativeProjection';
import { getStackCompatibility } from '../src/knowledge/stackCompatibility';
import { CLAIMS_REPOSITORY } from '../src/knowledge/claimsRepository';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
    else if (/\\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const sourceFiles = collectSourceFiles(join(process.cwd(), 'src'));
const legacyImports = sourceFiles.filter(file => {
  const text = readFileSync(file, 'utf8');
  return /(?:from\\s+|import\\s*\\()['"][^'"]*data\\/financingData(?:\\.ts)?['"]/.test(text);
});
assert(legacyImports.length === 0, 'Deprecated financingData fixture must never be imported by production source files');

const programs = getAuthoritativeFinancingPrograms();
const providers = getAuthoritativeProviders();

// 1. Required current mechanisms must exist.
const foprolos = programs.find(p => p.id === 'foprolos_construction');
const foprodi = programs.find(p => p.id === 'foprodi_dotation');
const enda = programs.find(p => p.id === 'enda_microcredit_equip');

assert(foprolos !== undefined, 'FOPROLOS must exist in authoritative runtime');
assert(foprodi !== undefined, 'FOPRODI must exist in authoritative runtime');
assert(enda !== undefined, 'Enda Bidaya must exist in authoritative runtime');

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
const foprolosHome = homeMatches.find(m => m.program.id === 'foprolos_construction');
assert(foprolosHome?.status === 'STRONG_ALIGNMENT', 'FOPROLOS strongly matches salaried home construction');

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
assert(foprodi?.rateType === 'unknown', 'FOPRODI rate remains UNKNOWN');
assert(foprodi?.estimatedRateAnnual === undefined, 'FOPRODI exposes no fabricated annual rate');
// 3b. FOPRODI dotation is repayable/quasi-equity, not a grant.
const foprodiComponent = foprodi ? mapProgramToStackComponent(foprodi, { financingRequested: 240000, totalProjectCost: 300000 }) : undefined;
assert(foprodiComponent?.role === 'QUASI_EQUITY', 'FOPRODI repayable dotation is classified as QUASI_EQUITY, not GRANT');
assert(foprodiComponent?.isCashFunding === true, 'FOPRODI quasi-equity can be counted as cash only when its amount is explicitly established');


// 4. Enda Bidaya: current amount/duration are present, rate stays unknown.
assert(enda?.minAmount === 200, 'Enda Bidaya current minimum is 200 DT');
assert(enda?.maxAmount === 40000, 'Enda Bidaya current maximum is 40,000 DT');
assert(enda?.rateType === 'unknown', 'Enda Bidaya rate remains UNKNOWN');
const endaCost = calculateFinancingCost(10000, enda!);
assert(!endaCost.canCalculateReliably && endaCost.monthlyPayment === undefined, 'Enda Bidaya never fabricates a monthly payment without a verified rate');

// 5. Guarantee is not cash.
const sotugar = programs.find(p => p.id === 'sotugar_guarantee')!;
const sotugarComponent = mapProgramToStackComponent(sotugar, { financingRequested: 150000, totalProjectCost: 200000 });
assert(sotugarComponent.role === 'GUARANTEE' && sotugarComponent.isCashFunding === false, 'SOTUGAR remains a non-cash guarantee component');
const gap = calculateFundingGap(150000, [sotugarComponent]);
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

// 7. UNKNOWN compatibility cannot become a viable stack.
const unknownCompat = getStackCompatibility('foprodi_dotation', 'banque_zitouna_mourabaha');
assert(unknownCompat.compatibilityStatus === 'UNKNOWN', 'Undocumented FOPRODI + Mourabaha compatibility remains UNKNOWN');
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


// 8. High-risk legacy financial literals must not leak back into runtime.
const bfpme = programs.find(p => p.id === 'bfpme_creation');
assert(bfpme?.minAmount === 0, 'BFPME has no stale 50,000 DT minimum financing floor');
assert(bfpme?.rateType === 'unknown', 'BFPME does not expose a fabricated TMM-plus-3% rate');
assert(bfpme?.durationMonthsMin === undefined && bfpme?.durationMonthsMax === undefined, 'BFPME duration remains UNKNOWN until current evidence establishes it');
const zitouna = programs.find(p => p.id === 'banque_zitouna_mourabaha');
assert(zitouna?.rateType === 'unknown', 'Banque Zitouna Mourabaha does not expose an unsupported fixed 3% margin');

// 9. Current BTS / BH / leasing / Zitouna / SOTUGAR knowledge guardrails.
const bts = programs.find(p => p.id === 'bts_diplomes');
assert(bts?.maxAmount === 200000, 'BTS current Crédit Professionnel ceiling is 200,000 DT');
assert(bts?.maxFinancingPercentage === 90, 'BTS current Crédit Professionnel financing share is capped at 90%');
assert(bts?.durationMonthsMax === 84, 'BTS current Crédit Professionnel duration is capped at 7 years');
assert(bts?.gracePeriodMonthsMin === 3 && bts?.gracePeriodMonthsMax === 12, 'BTS current grace period is 3-12 months');
assert(bts?.estimatedRateAnnual === undefined, 'BTS does not expose an unsupported numeric fixed rate');

const bhAuto = programs.find(p => p.id === 'banque_credit_auto');
assert(bhAuto?.maxAmount === 0, 'BH AUTO unknown financing ceiling is represented as UNKNOWN, not a fake number');
assert(bhAuto?.durationMonthsMax === 84, 'BH AUTO current maximum duration is 7 years');
assert(bhAuto?.rateType === 'unknown', 'BH AUTO does not expose a fabricated TMM or margin');
assert(!String(bhAuto?.rateDescription.fr || '').includes('7,99'), 'BH AUTO has no stale 7.99% TMM literal');
assert(!String(bhAuto?.rateDescription.fr || '').includes('3,0%'), 'BH AUTO has no stale 3.0% margin literal');

const firstHome = programs.find(p => p.id === 'premier_logement');
assert(firstHome?.maxAmount === 40000, 'BH Al Masken Al Awal own-financing loan ceiling is 40,000 DT');
assert(firstHome?.projectCostMax === 220000, 'BH Al Masken Al Awal property price ceiling is 220,000 DT');
assert(firstHome?.durationMonthsMax === 84 && firstHome?.gracePeriodMonthsMax === 60, 'BH Al Masken Al Awal uses 7-year repayment after 5-year grace');

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

const startupBourse = programs.find(p => p.id === 'startup_act_bourse');
assert(startupBourse?.maxAmount === undefined, 'Startup Act bourse does not expose the stale fixed 36,000 DT ceiling');

if (failed > 0) {
  console.error(`❌ ${failed} architecture regression guard(s) failed.`);
  process.exit(1);
}
console.log('🎉 Architecture regression guardrails passed.');
