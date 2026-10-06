import { getAuthoritativeFinancingProgram } from '../src/knowledge/authoritativeProjection';
import { calculateFundingGap, evaluateStackCandidate } from '../src/engine/financingStackEngine';
import { getStackCompatibility } from '../src/knowledge/stackCompatibility';
import { ResearchImportPipeline, ResearchFactInput } from '../src/knowledge/researchImport';
import { StackComponent } from '../src/types/financingStack';

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) console.log(`PASS ${message}`);
  else { console.error(`FAIL ${message}`); failures++; }
}

function component(overrides: Partial<StackComponent>): StackComponent {
  return {
    programId: 'test_cash',
    programName: { fr: 'Test cash', ar: 'Test cash' },
    providerId: 'test',
    providerName: { fr: 'Test', ar: 'Test' },
    role: 'DEBT',
    isCashFunding: true,
    evidenceStatus: 'VERIFIED_CURRENT',
    evidenceConfidence: 'HIGH',
    operationalStatus: 'ACTIVE_CONFIRMED',
    ...overrides
  };
}

console.log('=== MIZEN ARCHITECTURE REPAIR AUDIT ===');

// 1. BFPME legacy 3% + TMM must not survive the authoritative projection.
const bfpme = getAuthoritativeFinancingProgram('bfpme_creation');
assert(Boolean(bfpme), 'BFPME authoritative projection exists');
assert(bfpme?.rateType === 'unknown', 'BFPME rate type is UNKNOWN');
assert(bfpme?.estimatedRateAnnual === undefined, 'BFPME estimated rate is absent');
assert(bfpme?.rateDescription.fr.includes('2') && bfpme?.rateDescription.fr.includes('4.5'), 'BFPME exposes the authoritative 2–4.5 range');
assert(!bfpme?.rateDescription.fr.includes('TMM + 3'), 'Legacy TMM + 3% string cannot reach runtime');
assert(!bfpme?.rateDescription.fr.includes('TMM + 3%'), 'Legacy TMM + 3% string cannot reach runtime');

// 2. UNKNOWN amount must never be promoted from maxPotentialAmount to cash funding.
const unknownAmount = component({ programId: 'unknown_amount', allocatedAmount: undefined, maxPotentialAmount: 100000 });
const unknownGap = calculateFundingGap(150000, [unknownAmount]);
assert(unknownGap.verifiedCashFunding === 0, 'UNKNOWN cash amount contributes zero verified cash, not its potential ceiling');
assert(unknownGap.remainingFundingGap === 150000, 'UNKNOWN cash amount leaves the full cash gap open');

// 3. Guarantees never become cash.
const guarantee = component({ programId: 'sotugar_guarantee', role: 'GUARANTEE', isCashFunding: false, maxPotentialAmount: 112500, coveragePercentage: 0.75 });
const guaranteeGap = calculateFundingGap(150000, [guarantee]);
assert(guaranteeGap.verifiedCashFunding === 0, 'SOTUGAR guarantee contributes no cash');
assert(guaranteeGap.guaranteeCoverageAmount > 0, 'SOTUGAR guarantee remains separately measurable as risk coverage');
assert(guaranteeGap.remainingFundingGap === 150000, 'Guarantee does not reduce the cash funding gap');

// 4. UNKNOWN compatibility is never a viable stack.
const unknownPair = evaluateStackCandidate(
  [component({ programId: 'unknown_a', allocatedAmount: 75000, maxPotentialAmount: 75000 })],
  [component({ programId: 'unknown_support', role: 'OTHER_SUPPORT', isCashFunding: false })],
  150000,
  50000
);
assert(unknownPair !== null, 'Unknown pair can be represented as an auditable candidate before visibility filtering');
assert(unknownPair?.overallStatus === 'UNKNOWN', 'Unknown compatibility remains UNKNOWN');

const unknownCompatibility = getStackCompatibility('bfpme_creation', 'leasing_vehicule_pro');
assert(unknownCompatibility.compatibilityStatus === 'UNKNOWN', 'Undocumented BFPME + leasing remains UNKNOWN');

// 5. Historical/weak evidence cannot silently replace a stronger current primary claim.
const existing = {
  id: 'current_rate', programId: 'bfpme_creation', field: 'rate', value: 3,
  status: 'VERIFIED_CURRENT' as const,
  evidence: [{ field: 'rate', value: 3, status: 'VERIFIED_CURRENT' as const, evidenceStrength: 'DIRECT_PRIMARY_CURRENT' }],
  createdAt: '2026-09-20', reviewedAt: '2026-09-20', isCurrent: true
};
const pipeline = new ResearchImportPipeline([existing]);
const weaker: ResearchFactInput = {
  programId: 'bfpme_creation', field: 'rate', value: 2,
  status: 'VERIFIED_HISTORICAL',
  source: { url: 'https://example.test/historical', title: 'Historical source', publisher: 'Test', sourceType: 'OFFICIAL_PDF', checkedAt: '2026-10-01' }
};
const importResult = pipeline.processResearchBatch([weaker]);
assert(importResult.conflicts.length === 1, 'Research import records a conflicting weaker claim');
assert(importResult.conflicts[0]?.resolution === 'PENDING_REVIEW', 'Weaker historical evidence cannot supersede a current primary claim');
assert(pipeline.getClaimsForProgram('bfpme_creation').find(c => c.id === 'current_rate')?.isCurrent === true, 'Current primary claim remains current after weaker conflict');

// 6. A stronger current primary claim may supersede an older weaker claim.
const strongerPipeline = new ResearchImportPipeline([{
  id: 'old_secondary', programId: 'test', field: 'ceiling', value: 100,
  status: 'PARTIALLY_VERIFIED' as const,
  evidence: [{ field: 'ceiling', value: 100, status: 'PARTIALLY_VERIFIED' as const, evidenceStrength: 'SECONDARY' }],
  createdAt: '2026-09-01', reviewedAt: '2026-09-01', isCurrent: true
}]);
const stronger: ResearchFactInput = {
  programId: 'test', field: 'ceiling', value: 120, status: 'VERIFIED_CURRENT',
  source: { url: 'https://example.test/current', title: 'Current primary source', publisher: 'Test', sourceType: 'OFFICIAL_PRODUCT_PAGE', checkedAt: '2026-10-01' }
};
const strongerResult = strongerPipeline.processResearchBatch([stronger]);
assert(strongerResult.conflicts[0]?.resolution === 'ACCEPTED_NEW', 'Stronger current primary evidence supersedes weaker evidence');
assert(strongerPipeline.getClaimsForProgram('test').find(c => c.value === 120)?.isCurrent === true, 'Stronger current claim becomes current');

if (failures) {
  console.error(`ARCHITECTURE AUDIT FAILED: ${failures} assertion(s)`);
  process.exit(1);
}
console.log('ARCHITECTURE AUDIT PASSED');
