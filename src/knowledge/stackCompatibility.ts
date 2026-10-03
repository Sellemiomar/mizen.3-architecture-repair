import { CLAIMS_REPOSITORY } from './claimsRepository';
import { StackCompatibilityEvaluation, StackCompatibilityStatus } from '../types/financingStack';

function mapStatus(status: string, ruleStatus: string): StackCompatibilityStatus {
  if (status === 'VERIFIED_COMPATIBLE' && ruleStatus === 'VERIFIED_CURRENT') return 'VERIFIED_COMPATIBLE';
  if (status === 'POTENTIALLY_COMPATIBLE' || status === 'HISTORICAL_COMPATIBILITY') return 'POTENTIALLY_COMPATIBLE';
  if (status === 'INCOMPATIBLE') return 'INCOMPATIBLE';
  return 'UNKNOWN';
}

export function getStackCompatibility(programAId: string, programBId: string): StackCompatibilityEvaluation {
  const claim = CLAIMS_REPOSITORY.getCompatibility(programAId, programBId);
  const status = mapStatus(claim.compatibilityStatus, claim.ruleStatus);

  return {
    programAId,
    programBId,
    status,
    evidenceStatus: claim.ruleStatus,
    rationale: claim.notes.fr,
    source: claim.evidence[0]?.url
  };
}
