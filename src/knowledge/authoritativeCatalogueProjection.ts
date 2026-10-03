import { CANONICAL_PRODUCTS, CANONICAL_PROVIDERS } from './canonicalCatalogue';
import { CLAIMS_REPOSITORY } from './claimsRepository';
import { FinancingClaim } from '../types/claims';
import { FinancingProduct } from '../types/knowledge';

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
    .sort((a,b) => rank(b)-rank(a) || String(b.retrievalDate).localeCompare(String(a.retrievalDate)))[0];
}

function applyClaim(product: FinancingProduct, claim: FinancingClaim): void {
  switch (claim.field) {
    case 'minProjectCost':
      if (typeof claim.value === 'number') product.financialTerms.projectCost = { ...product.financialTerms.projectCost, min: claim.value, currency: 'TND' };
      break;
    case 'maxProjectCost':
      if (typeof claim.value === 'number') product.financialTerms.projectCost = { ...product.financialTerms.projectCost, max: claim.value, currency: 'TND' };
      break;
    case 'maxFinancingAmount':
      if (typeof claim.value === 'number') product.financialTerms.amount = { ...product.financialTerms.amount, max: claim.value, currency: 'TND' };
      break;
    case 'publishedMarginRange': {
      const v = claim.value as { min?: number; max?: number };
      if (typeof v?.min === 'number' && typeof v?.max === 'number') {
        product.financialTerms.rate = {
          ...product.financialTerms.rate,
          type: 'UNKNOWN',
          margin: undefined,
          referenceIndex: undefined,
          min: v.min / 100,
          max: v.max / 100,
          currency: 'PERCENT',
          explanation: {
            fr: `Marge publiée : ${v.min} à ${v.max} points de pourcentage. Relation avec le TMM non établie.`,
            ar: `الهامش المنشور: من ${v.min} إلى ${v.max} نقطة مئوية. العلاقة مع TMM غير مثبتة.`
          }
        };
      }
      break;
    }
    case 'pricingRelationship':
      if (claim.value === 'UNKNOWN') {
        product.financialTerms.rate = {
          ...product.financialTerms.rate,
          type: 'UNKNOWN',
          margin: undefined,
          referenceIndex: undefined,
          explanation: {
            fr: 'Relation exacte avec le TMM : inconnue. Aucun calcul TMM + marge ne peut être effectué.',
            ar: 'العلاقة الدقيقة مع TMM غير معلومة. لا يمكن احتساب TMM + هامش.'
          }
        };
      }
      break;
  }
}

export function getAuthoritativeCatalogueProducts(): FinancingProduct[] {
  return CANONICAL_PRODUCTS.map(base => {
    const product = structuredClone(base) as FinancingProduct;
    const fields = new Set(CLAIMS_REPOSITORY.getAllClaims(base.id).map(c => c.field));
    for (const field of fields) {
      const claim = getAuthoritativeClaim(base.id, field);
      if (claim) applyClaim(product, claim);
    }
    return product;
  });
}

export function getAuthoritativeCatalogueProviders() {
  return CANONICAL_PROVIDERS;
}

export function getAuthoritativeCatalogueProduct(id: string): FinancingProduct | undefined {
  return getAuthoritativeCatalogueProducts().find(p => p.id === id);
}
