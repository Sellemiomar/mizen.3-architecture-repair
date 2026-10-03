import { calculateFundingGap, generateFinancingStacks } from '../src/engine/financingStackEngine';
import { runFinancingReadiness } from '../src/engine/financingReadiness';
import { getStackCompatibility } from '../src/knowledge/stackCompatibility';
import { StackComponent } from '../src/types/financingStack';

let passed = true;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    passed = false;
  } else {
    console.log(`PASS: ${message}`);
  }
}

const components: StackComponent[] = [
  {
    sourceId: 'bfpme-cmlt',
    programId: 'bfpme_creation',
    role: 'DEBT',
    cashAmount: 650000,
    verifiedCapacity: 650000,
    evidenceStatus: 'VERIFIED_CURRENT'
  },
  {
    sourceId: 'sotugar-fgpmE',
    programId: 'sotugar_guarantee',
    role: 'GUARANTEE',
    supportCoverage: 75,
    supportType: 'GUARANTEE',
    evidenceStatus: 'VERIFIED_HISTORICAL'
  }
];

const gap = calculateFundingGap(1000000, components);
assert(gap.cashCovered === 650000, 'Guarantee does not count as cash financing');
assert(gap.remainingGap === 350000, 'Funding gap remains 350k after 650k debt');
assert(gap.supportCoverage === 75, 'Guarantee support remains separately visible');

const duplicateGap = calculateFundingGap(1000000, [...components, { ...components[0], cashAmount: 650000 }]);
assert(duplicateGap.cashCovered === 650000, 'Duplicate source is never double-counted');
assert(duplicateGap.diagnostics.some(d => d.includes('Duplicate funding source')), 'Duplicate source produces an explicit diagnostic');

const verified = getStackCompatibility('bfpme_creation', 'bh_bank_loan');
assert(verified.status === 'VERIFIED_COMPATIBLE', 'BFPME + commercial bank is explicitly verified compatible');

const potential = getStackCompatibility('bfpme_creation', 'sotugar_guarantee');
assert(potential.status === 'POTENTIALLY_COMPATIBLE', 'BFPME + SOTUGAR remains conditional/potential');

const unknown = getStackCompatibility('startup_grant_air', 'bh_bank_loan');
assert(unknown.status === 'UNKNOWN', 'Undocumented grant + debt compatibility remains UNKNOWN');

const bfpmEPlusSotugar = generateFinancingStacks({
  requiredFunding: 1000000,
  components,
  maxComponentsPerStack: 2
});
const conditional = bfpmEPlusSotugar.candidates.find(c => c.components.length === 2);
assert(conditional?.overallStatus === 'CONDITIONAL', 'Potential compatibility cannot become VERIFIED');
assert(conditional?.fundingGap.cashCovered === 650000, 'Stack cash coverage remains 650k with SOTUGAR guarantee');
assert(conditional?.fundingGap.remainingGap === 350000, 'SOTUGAR guarantee does not erase the 350k funding gap');
assert(conditional?.confidence === 'LOW', 'Potential compatibility prevents HIGH confidence');

const unknownStack = generateFinancingStacks({
  requiredFunding: 1000000,
  components: [
    components[0],
    { sourceId: 'unknown-grant', programId: 'startup_grant_air', role: 'GRANT', cashAmount: 100000, verifiedCapacity: 100000, evidenceStatus: 'VERIFIED_CURRENT' }
  ],
  maxComponentsPerStack: 2
});
assert(unknownStack.candidates.every(c => c.components.length !== 2), 'UNKNOWN compatibility cannot generate a stack candidate');

const readiness = runFinancingReadiness({
  totalProjectCost: 1000000,
  userContribution: 350000,
  financingRequested: 650000,
  purpose: 'creation',
  sector: 'industry',
  businessStage: 'established_over_2y',
  legalStructure: 'sarl',
  location: 'Sfax'
});
assert(readiness.matches.length > 0, 'Readiness integration preserves the existing single-product matcher');
assert(readiness.stack.requiredFunding === 1000000, 'Stack readiness uses project cost as total funding requirement');
assert(readiness.stack.candidates.every(c => c.fundingGap.cashCovered <= 1000000), 'Stack integration never reports cash coverage above project requirement');

if (!passed) process.exit(1);
