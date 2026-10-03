import { FINANCING_PROGRAMS } from '../data/financingData';
import { CLAIMS_REPOSITORY } from './claimsRepository';
import { FinancingClaim } from '../types/claims';
import { FinancingProgram } from '../types/financing';

/**
 * Claims-first runtime projection.
 *
 * FINANCING_PROGRAMS is a structural compatibility layer only. Whenever a
 * researched field exists in CLAIMS_REPOSITORY, the legacy value is shadowed
 * and cannot leak into runtime. In particular, project-cost limits are never
 * mapped onto financing-amount limits.
 */

function rank(c: FinancingClaim): number {
  if (c.ruleStatus === 'VERIFIED_HISTORICAL' || c.operationalStatus === 'HISTORICAL_ONLY') return -100;
  if (c.ruleStatus === 'UNKNOWN' && c.evidenceStrength === 'DIRECT_PRIMARY_CURRENT') return 95;
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
  switch (claim.field) {
    case 'minProjectCost':
      if (typeof claim.value === 'number') program.projectCostMin = claim.value;
      break;
    case 'maxProjectCost':
      if (typeof claim.value === 'number') program.projectCostMax = claim.value;
      break;
    case 'maxFinancingPercentage':
      if (typeof claim.value === 'number') program.maxFinancingPercentage = claim.value;
      break;
    case 'maxFinancingAmount':
      if (typeof claim.value === 'number') program.maxAmount = claim.value;
      break;
    case 'publishedMarginRange': {
      const v = claim.value as { min?: number; max?: number };
      if (typeof v?.min === 'number' && typeof v?.max === 'number') {
        program.rateType = 'unknown';
        program.estimatedRateAnnual = undefined;
        program.rateDescription = {
          fr: `Marge publiée : ${v.min} à ${v.max} points. Relation avec le TMM non établie.`,
          ar: `الهامش المنشور: من ${v.min} إلى ${v.max} نقطة. العلاقة مع TMM غير مثبتة.`
        };
      }
      break;
    }
    case 'pricingRelationship':
      if (claim.value === 'UNKNOWN') {
        program.rateType = 'unknown';
        program.estimatedRateAnnual = undefined;
        program.rateDescription = {
          fr: 'Relation de tarification avec le TMM : inconnue. Aucune simulation automatique de taux.',
          ar: 'العلاقة السعرية مع TMM غير معلومة. لا توجد محاكاة آلية للنسبة.'
        };
      }
      break;
    case 'repaymentDuration':
    case 'repaymentDurationMonths':
      if (claim.value === 'UNKNOWN') {
        program.importantCaveats = [
          ...program.importantCaveats,
          { fr: 'Durée de remboursement non établie par une revendication actuelle.', ar: 'مدة السداد غير مثبتة بمعلومة حالية.' }
        ];
      }
      break;
    case 'gracePeriod':
    case 'gracePeriodMonths':
      if (claim.value === 'UNKNOWN') {
        program.importantCaveats = [
          ...program.importantCaveats,
          { fr: 'Période de grâce non établie par une revendication actuelle.', ar: 'فترة الإمهال غير مثبتة بمعلومة حالية.' }
        ];
      }
      break;
  }
}

function project(base: FinancingProgram): FinancingProgram {
  const product = structuredClone(base) as FinancingProgram;
  const claims = CLAIMS_REPOSITORY.getAllClaims(base.id);
  const claimedFields = new Set(claims.map(c => c.field));

  if (claimedFields.has('minProjectCost')) product.projectCostMin = undefined;
  if (claimedFields.has('maxProjectCost')) product.projectCostMax = undefined;
  if (claimedFields.has('maxFinancingPercentage')) product.maxFinancingPercentage = undefined;

  for (const field of claimedFields) {
    const claim = getAuthoritativeClaim(base.id, field);
    if (claim) applyClaim(product, claim);
  }

  const pricingClaim = getAuthoritativeClaim(base.id, 'pricingRelationship');
  if (pricingClaim?.value === 'UNKNOWN') {
    product.rateType = 'unknown';
    product.estimatedRateAnnual = undefined;
  }

  return product;
}

export function getAuthoritativeFinancingPrograms(): FinancingProgram[] {
  return FINANCING_PROGRAMS.map(project);
}

export function getAuthoritativeFinancingProgram(id: string): FinancingProgram | undefined {
  const base = FINANCING_PROGRAMS.find(p => p.id === id);
  return base ? project(base) : undefined;
}
