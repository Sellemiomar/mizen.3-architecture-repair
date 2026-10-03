import { FINANCING_PROGRAMS } from '../data/financingData';
import { CLAIMS_REPOSITORY } from './claimsRepository';
import { FinancingClaim } from '../types/claims';
import { FinancingProgram } from '../types/financing';

/**
 * Claims-first runtime projection.
 * FINANCING_PROGRAMS supplies legacy structural metadata only. Any field with a
 * non-historical claim is resolved from CLAIMS_REPOSITORY before runtime use.
 */
function rank(c: FinancingClaim): number {
  if (c.ruleStatus === 'VERIFIED_HISTORICAL' || c.operationalStatus === 'HISTORICAL_ONLY') return -100;
  if (c.evidenceStrength === 'DIRECT_PRIMARY_CURRENT' && c.ruleStatus === 'VERIFIED_CURRENT') return 100;
  if (c.ruleStatus === 'UNKNOWN') return 80;
  if (c.ruleStatus === 'PARTIALLY_VERIFIED') return 60;
  if (c.evidenceStrength === 'OFFICIAL_SECONDARY') return 40;
  if (c.evidenceStrength === 'SECONDARY') return 20;
  return 0;
}

export function getAuthoritativeClaim(entityId: string, field: string): FinancingClaim | undefined {
  return CLAIMS_REPOSITORY.getAllClaims(entityId)
    .filter(c => c.field === field && c.conflictStatus !== 'SUPERSEDED')
    .filter(c => c.ruleStatus !== 'VERIFIED_HISTORICAL' && c.operationalStatus !== 'HISTORICAL_ONLY')
    .sort((a, b) => rank(b) - rank(a) || String(b.retrievalDate).localeCompare(String(a.retrievalDate)))[0];
}

function applyClaim(program: FinancingProgram, claim: FinancingClaim): void {
  if (claim.field === 'minProjectCost' && typeof claim.value === 'number') program.minAmount = claim.value;
  if (claim.field === 'maxProjectCost' && typeof claim.value === 'number') program.maxAmount = claim.value;
  if (claim.field === 'maxFinancingAmount' && typeof claim.value === 'number') program.maxAmount = claim.value;

  if (claim.field === 'publishedMarginRange' && claim.value && typeof claim.value === 'object') {
    const v = claim.value as { min?: number; max?: number };
    if (typeof v.min === 'number' && typeof v.max === 'number') {
      program.rateType = 'unknown';
      program.estimatedRateAnnual = undefined;
      program.rateDescription = {
        fr: `Marge publiée : ${v.min} à ${v.max} points. Relation avec le TMM non établie.`,
        ar: `الهامش المنشور: من ${v.min} إلى ${v.max} نقطة. العلاقة مع TMM غير مثبتة.`
      };
    }
  }

  if (claim.field === 'pricingRelationship' && claim.value === 'UNKNOWN') {
    program.rateType = 'unknown';
    program.estimatedRateAnnual = undefined;
    const current = program.rateDescription.fr || '';
    const range = current.match(/\\d+(?:[.,]\\d+)? à \\d+(?:[.,]\\d+)?/i)?.[0];
    program.rateDescription = {
      fr: range ? `Marge publiée : ${range} points. Relation de tarification avec le TMM : inconnue. Aucune simulation automatique de taux.` : 'Relation de tarification avec le TMM : inconnue. Aucune simulation automatique de taux.',
      ar: 'العلاقة السعرية مع TMM غير معلومة. لا توجد محاكاة آلية للنسبة.'
    };
  }

  if ((claim.field === 'repaymentDuration' || claim.field === 'repaymentDurationMonths') && claim.value === 'UNKNOWN') {
    program.durationMonthsMin = 0;
    program.durationMonthsMax = 0;
  }

  if ((claim.field === 'gracePeriod' || claim.field === 'gracePeriodMonths') && claim.value === 'UNKNOWN') {
    program.gracePeriodMonthsMin = 0;
    program.gracePeriodMonthsMax = 0;
  }
}

function project(base: FinancingProgram): FinancingProgram {
  const program = structuredClone(base) as FinancingProgram;
  const fields = new Set(CLAIMS_REPOSITORY.getAllClaims(base.id).map(c => c.field));
  for (const field of fields) {
    const claim = getAuthoritativeClaim(base.id, field);
    if (claim) applyClaim(program, claim);
  }
  return program;
}

export function getAuthoritativeFinancingPrograms(): FinancingProgram[] {
  return FINANCING_PROGRAMS.map(project);
}

export function getAuthoritativeFinancingProgram(id: string): FinancingProgram | undefined {
  const base = FINANCING_PROGRAMS.find(p => p.id === id);
  return base ? project(base) : undefined;
}
