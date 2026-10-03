import { calculateFundingGap } from '../src/engine/financingStackEngine';
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

if (!passed) process.exit(1);
