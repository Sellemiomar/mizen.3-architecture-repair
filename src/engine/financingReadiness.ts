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
  if (typeof applicant.financingRequested === 'number') return applicant.financingRequested + (applicant.userContribution ?? 0);
  return undefined;
}

function unresolvedCriticalRules(result: MatchResult): string[] {
  return result.ruleEvaluations
    .filter(rule => rule.criticality === 'CRITICAL' && rule.status === 'UNKNOWN')
    .map(rule => rule.label.fr);
}

function componentFromMatch(result: MatchResult, applicant: ApplicantProfile): StackComponent | undefined {
  if (result.status !== 'STRONG_ALIGNMENT' && result.status !== 'POTENTIAL_ALIGNMENT') return undefined;
  if (result.ruleEvaluations.some(rule => rule.criticality === 'CRITICAL' && rule.status === 'FAIL')) return undefined;

  const unresolvedEligibility = unresolvedCriticalRules(result);
  if (result.program.verification.status !== 'VERIFIED') {
    unresolvedEligibility.push(`Programme verification status is ${result.program.verification.status}; current operational confirmation is still required.`);
  }

  if (result.program.category === 'guarantee') {
    return {
      sourceId: result.program.id,
      programId: result.program.id,
      role: 'GUARANTEE',
      supportType: 'GUARANTEE',
      evidenceStatus: result.program.verification.status,
      unresolvedEligibility,
      notes: ['Guarantee support is not counted as cash financing; coverage remains unresolved unless current evidence explicitly verifies it.']
    };
  }
  if (typeof applicant.financingRequested !== 'number') return undefined;
  if (!result.program.verification.verifiedFields.includes('maxAmount') || result.program.maxAmount <= 0) return undefined;

  return {
    sourceId: result.program.id,
    programId: result.program.id,
    role: result.program.category === 'equity_quasi_equity' ? 'EQUITY' : result.program.category === 'grant_subsidy' ? 'GRANT' : 'DEBT',
    cashAmount: Math.min(applicant.financingRequested, result.program.maxAmount),
    verifiedCapacity: result.program.maxAmount,
    evidenceStatus: result.program.verification.status,
    unresolvedEligibility
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