import { ApplicantProfile, MatchResult } from '../types/financing';
import { runMatchingEngine } from './matchingEngine';
import { generateFinancingStacks } from './financingStackEngine';
import { FinancingStackResult, StackComponent } from '../types/financingStack';
import { getStackCompatibility } from '../knowledge/stackCompatibility';

export interface FinancingReadinessResult {
  matches: MatchResult[];
  stack: FinancingStackResult;
}

function requiredFundingFor(applicant: ApplicantProfile): number | undefined {
  if (typeof applicant.financingRequested === 'number') return applicant.financingRequested;
  if (typeof applicant.totalProjectCost === 'number' && typeof applicant.userContribution === 'number') {
    return Math.max(0, applicant.totalProjectCost - applicant.userContribution);
  }
  return undefined;
}

function componentFromMatch(result: MatchResult, applicant: ApplicantProfile): StackComponent | undefined {
  if (result.status !== 'STRONG_ALIGNMENT' && result.status !== 'POTENTIAL_ALIGNMENT') return undefined;
  const isGuarantee = result.program.category === 'guarantee' || result.program.rateType === 'unknown' && result.program.id.includes('sotugar');
  if (isGuarantee) {
    const sotugarCoverage = result.program.id === 'sotugar_guarantee' ? 75 : undefined;
    return {
      sourceId: result.program.id,
      programId: result.program.id,
      role: 'GUARANTEE',
      supportCoverage: sotugarCoverage,
      supportType: 'GUARANTEE',
      evidenceStatus: result.program.verification.status
    };
  }
  if (typeof applicant.financingRequested !== 'number') return undefined;
  const amount = Math.min(applicant.financingRequested, result.program.maxAmount);
  return {
    sourceId: result.program.id,
    programId: result.program.id,
    role: result.program.category === 'equity_quasi_equity' ? 'EQUITY' : result.program.category === 'grant_subsidy' ? 'GRANT' : 'DEBT',
    cashAmount: amount,
    verifiedCapacity: result.program.maxAmount,
    evidenceStatus: result.program.verification.status
  };
}

export function runFinancingReadiness(applicant: ApplicantProfile): FinancingReadinessResult {
  const matches = runMatchingEngine(applicant);
  const components: StackComponent[] = [];
  if (typeof applicant.userContribution === 'number' && applicant.userContribution > 0) {
    components.push({
      sourceId: 'applicant_contribution',
      role: 'PROMOTER_CONTRIBUTION',
      cashAmount: applicant.userContribution,
      verifiedCapacity: applicant.userContribution,
      evidenceStatus: 'USER_PROVIDED'
    });
  }

  for (const result of matches) {
    const component = componentFromMatch(result, applicant);
    if (component) components.push(component);
  }

  const requiredFunding = requiredFundingFor(applicant) ?? 0;
  const programComponents = components.filter(c => c.programId);
  const compatibilityPairs: Array<[string, string]> = [];
  for (let i = 0; i < programComponents.length; i += 1) {
    for (let j = i + 1; j < programComponents.length; j += 1) {
      compatibilityPairs.push([programComponents[i].programId!, programComponents[j].programId!]);
    }
  }

  // Preserve explicit UNKNOWN compatibility as a blocker rather than manufacturing a stack.
  for (const [a, b] of compatibilityPairs) getStackCompatibility(a, b);

  return {
    matches,
    stack: generateFinancingStacks({ requiredFunding, components })
  };
}
