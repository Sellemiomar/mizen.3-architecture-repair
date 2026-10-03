import {
  FinancingStackCandidate,
  FinancingStackResult,
  FundingGapResult,
  StackComponent,
  StackCompatibilityStatus,
  StackOverallStatus,
  StackConfidence
} from '../types/financingStack';
import { getStackCompatibility } from '../knowledge/stackCompatibility';

const CASH_ROLES = new Set(['DEBT', 'EQUITY', 'QUASI_EQUITY', 'GRANT', 'PROMOTER_CONTRIBUTION', 'SUBSIDY']);

export function calculateFundingGap(requiredFunding: number, components: StackComponent[]): FundingGapResult {
  if (!Number.isFinite(requiredFunding) || requiredFunding < 0) {
    throw new Error('requiredFunding must be a finite non-negative number');
  }

  const seen = new Set<string>();
  const diagnostics: string[] = [];
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
      if (typeof component.cashAmount === 'number' && Number.isFinite(component.cashAmount) && component.cashAmount >= 0) {
        cashCovered += component.cashAmount;
      } else {
        diagnostics.push(`Unresolved cash capacity: ${component.sourceId}`);
      }
    }
  }

  return {
    requiredFunding,
    cashCovered: Math.min(requiredFunding, cashCovered),
    remainingGap: Math.max(0, requiredFunding - cashCovered),
    supportCoverage,
    diagnostics
  };
}

export interface FinancingStackInput {
  requiredFunding: number;
  components: StackComponent[];
  compatibilityPairs: Array<[string, string]>;
}

function compatibilityRank(status: StackCompatibilityStatus): number {
  return status === 'VERIFIED_COMPATIBLE' ? 3 : status === 'POTENTIALLY_COMPATIBLE' ? 2 : status === 'UNKNOWN' ? 1 : 0;
}

function buildCandidate(input: FinancingStackInput): FinancingStackCandidate {
  const compatibility = input.compatibilityPairs.map(([a, b]) => getStackCompatibility(a, b));
  const hasIncompatible = compatibility.some(c => c.status === 'INCOMPATIBLE');
  const hasUnknown = compatibility.some(c => c.status === 'UNKNOWN');
  const hasPotential = compatibility.some(c => c.status === 'POTENTIALLY_COMPATIBLE');
  const unresolvedAssumptions = compatibility
    .filter(c => c.status !== 'VERIFIED_COMPATIBLE')
    .map(c => `${c.programAId} + ${c.programBId}: ${c.rationale}`);

  const fundingGap = calculateFundingGap(input.requiredFunding, input.components);
  const evidenceStrength = compatibility.length === 0
    ? 0
    : compatibility.reduce((sum, c) => sum + compatibilityRank(c.status), 0) / compatibility.length;

  let overallStatus: StackOverallStatus = 'VERIFIED';
  let confidence: StackConfidence = 'HIGH';
  if (hasIncompatible) {
    overallStatus = 'INCOMPATIBLE';
    confidence = 'LOW';
  } else if (hasUnknown) {
    overallStatus = 'UNKNOWN';
    confidence = 'LOW';
  } else if (hasPotential || fundingGap.remainingGap > 0) {
    overallStatus = 'CONDITIONAL';
    confidence = 'MEDIUM';
  }

  if (fundingGap.remainingGap > 0 && overallStatus === 'VERIFIED') overallStatus = 'CONDITIONAL';

  return {
    id: input.components.map(c => c.sourceId).sort().join('__'),
    components: input.components,
    fundingGap,
    overallStatus,
    confidence,
    unresolvedAssumptions,
    compatibility,
    evidenceStrength
  };
}

export function generateFinancingStacks(input: FinancingStackInput): FinancingStackResult {
  const candidate = buildCandidate(input);
  return {
    requiredFunding: input.requiredFunding,
    candidates: [candidate],
    diagnostics: candidate.fundingGap.diagnostics
  };
}
