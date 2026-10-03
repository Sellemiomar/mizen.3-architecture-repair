import { ApplicantProfile, MatchResult } from '../types/financing';
import { runMatchingEngine } from './matchingEngine';
import { generateFinancingStacks } from './financingStackEngine';
import { FinancingStackResult, StackComponent } from '../types/financingStack';

export interface FinancingReadinessResult {
  matches: MatchResult[];
  stack: FinancingStackResult;
}

function requiredFundingFor(applicant: ApplicantProfile): number | undefined {
  if (typeof applicant.totalProjectCost === 'number') return applicant.totalProjectCost;
  if (typeof applicant.financingRequested === 'number') {
    return applicant.financingRequested + (applicant.userContribution ?? 0);
  }
  return undefined;
}

function componentFromMatch(result: MatchResult, applicant: ApplicantProfile): StackComponent | undefined {
  if (result.status !== 'STRONG_ALIGNMENT' && result.status !== 'POTENTIAL_ALIGNMENT') return undefined;
  const isGuarantee = result.program.category === 'guarantee';
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
  return {
    sourceId: result.program.id,
    programId: result.program.id,
    role: result.program.category === 'equity_quasi_equity' ? 'EQUITY' : result.program.category === 'grant_subsidy' ? 'GRANT' : 'DEBT',
    cashAmount: Math.min(applicant.financingRequested, result.program.maxAmount),
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

  const requiredFunding = requiredFundingFor(applicant);
  if (requiredFunding === undefined) {
    return {
      matches,
      stack: { requiredFunding: 0, candidates: [], diagnostics: ['Project cost or financing need is not specified; no funding stack is inferred.'] }
    };
  }

  return {
    matches,
    stack: generateFinancingStacks({ requiredFunding, components })
  };
}
