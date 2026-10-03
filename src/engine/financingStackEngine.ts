import {
  FinancingStackCandidate,
  FinancingStackResult,
  FundingGapResult,
  StackComponent,
  StackCompatibilityStatus,
  StackOverallStatus,
  StackConfidence,
  StackCompatibilityEvaluation
} from '../types/financingStack';
import { getStackCompatibility } from '../knowledge/stackCompatibility';

const CASH_ROLES = new Set(['DEBT', 'EQUITY', 'QUASI_EQUITY', 'GRANT', 'PROMOTER_CONTRIBUTION', 'SUBSIDY']);

export function calculateFundingGap(requiredFunding: number, components: StackComponent[]): FundingGapResult {
  if (!Number.isFinite(requiredFunding) || requiredFunding < 0) throw new Error('requiredFunding must be a finite non-negative number');
  const seen = new Set<string>();
  const diagnostics: string[] = [];
  const unresolvedCashSources: string[] = [];
  let cashCovered = 0;
  let supportCoverage = 0;

  for (const component of components) {
    if (seen.has(component.sourceId)) {
      diagnostics.push(`Duplicate funding source ignored: ${component.sourceId}`);
      continue;
    }
    seen.add(component.sourceId);
    if (component.role === 'GUARANTEE') {
      if (typeof component.supportCoverage === 'number') supportCoverage = Math.max(supportCoverage, component.supportCoverage);
      continue;
    }
    if (CASH_ROLES.has(component.role)) {
      if (typeof component.cashAmount === 'number' && Number.isFinite(component.cashAmount) && component.cashAmount >= 0) cashCovered += component.cashAmount;
      else {
        unresolvedCashSources.push(component.sourceId);
        diagnostics.push(`Unresolved cash capacity: ${component.sourceId}`);
      }
    }
  }

  return {
    requiredFunding,
    cashCovered: Math.min(requiredFunding, cashCovered),
    remainingGap: Math.max(0, requiredFunding - cashCovered),
    supportCoverage,
    unresolvedCashSources,
    diagnostics
  };
}

export interface FinancingStackInput {
  requiredFunding: number;
  components: StackComponent[];
  maxComponentsPerStack?: number;
}

function compatibilityRank(status: StackCompatibilityStatus): number {
  return status === 'VERIFIED_COMPATIBLE' ? 3 : status === 'POTENTIALLY_COMPATIBLE' ? 2 : status === 'UNKNOWN' ? 1 : 0;
}

function evaluateCandidate(requiredFunding: number, components: StackComponent[]): FinancingStackCandidate | null {
  const programIds = components.map(c => c.programId).filter((id): id is string => Boolean(id));
  const compatibility: StackCompatibilityEvaluation[] = [];
  for (let i = 0; i < programIds.length; i += 1) {
    for (let j = i + 1; j < programIds.length; j += 1) compatibility.push(getStackCompatibility(programIds[i], programIds[j]));
  }
  if (compatibility.some(c => c.status === 'INCOMPATIBLE' || c.status === 'UNKNOWN')) return null;

  const unresolvedAssumptions = compatibility.filter(c => c.status !== 'VERIFIED_COMPATIBLE').map(c => `${c.programAId} + ${c.programBId}: ${c.rationale}`);
  const fundingGap = calculateFundingGap(requiredFunding, components);
  const unresolvedEligibility = components.flatMap(c => c.unresolvedEligibility ?? []);
  const evidenceStrength = compatibility.length === 0 ? 3 : compatibility.reduce((sum, c) => sum + compatibilityRank(c.status), 0) / compatibility.length;
  const hasPotential = compatibility.some(c => c.status === 'POTENTIALLY_COMPATIBLE');
  const hasUnresolvedCapacity = fundingGap.unresolvedCashSources.length > 0;
  const hasUnresolvedEligibility = unresolvedEligibility.length > 0;
  const overallStatus: StackOverallStatus = hasPotential || hasUnresolvedCapacity || hasUnresolvedEligibility || fundingGap.remainingGap > 0 ? 'CONDITIONAL' : 'VERIFIED';
  const confidence: StackConfidence = hasPotential || hasUnresolvedCapacity || hasUnresolvedEligibility ? 'LOW' : fundingGap.remainingGap > 0 ? 'MEDIUM' : 'HIGH';

  return {
    id: components.map(c => c.sourceId).sort().join('__'),
    components,
    fundingGap,
    overallStatus,
    confidence,
    unresolvedAssumptions: [
      ...unresolvedAssumptions,
      ...fundingGap.unresolvedCashSources.map(id => `Cash capacity unresolved: ${id}`),
      ...unresolvedEligibility.map(note => `Eligibility confirmation required: ${note}`)
    ],
    compatibility,
    evidenceStrength
  };
}

function combinations<T>(items: T[], maxSize: number): T[][] {
  const result: T[][] = [];
  const walk = (start: number, current: T[]) => {
    if (current.length > 0) result.push([...current]);
    if (current.length === maxSize) return;
    for (let i = start; i < items.length; i += 1) {
      current.push(items[i]);
      walk(i + 1, current);
      current.pop();
    }
  };
  walk(0, []);
  return result;
}

export function generateFinancingStacks(input: FinancingStackInput): FinancingStackResult {
  const unique = Array.from(new Map(input.components.map(c => [c.sourceId, c])).values());
  const maxSize = Math.min(input.maxComponentsPerStack ?? 4, unique.length);
  const candidates = combinations(unique, maxSize)
    .map(components => evaluateCandidate(input.requiredFunding, components))
    .filter((candidate): candidate is FinancingStackCandidate => candidate !== null)
    .filter(candidate => candidate.components.some(c => c.role !== 'GUARANTEE'))
    .sort((a, b) => {
      const statusRank = (status: StackOverallStatus) => status === 'VERIFIED' ? 2 : status === 'CONDITIONAL' ? 1 : 0;
      const statusDiff = statusRank(b.overallStatus) - statusRank(a.overallStatus);
      if (statusDiff !== 0) return statusDiff;
      const assumptionDiff = a.unresolvedAssumptions.length - b.unresolvedAssumptions.length;
      if (assumptionDiff !== 0) return assumptionDiff;
      const componentDiff = a.components.length - b.components.length;
      if (componentDiff !== 0) return componentDiff;
      const evidenceDiff = b.evidenceStrength - a.evidenceStrength;
      if (evidenceDiff !== 0) return evidenceDiff;
      return a.fundingGap.remainingGap - b.fundingGap.remainingGap;
    });

  return {
    requiredFunding: input.requiredFunding,
    candidates,
    diagnostics: candidates.length === 0 ? ['No explicitly compatible financing stack was established.'] : []
  };
}
