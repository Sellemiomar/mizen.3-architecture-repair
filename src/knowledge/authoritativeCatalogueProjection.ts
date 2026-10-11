import { CANONICAL_PRODUCTS, CANONICAL_PROVIDERS } from './canonicalCatalogue';
import { CLAIMS_REPOSITORY } from './claimsRepository';
import { getAuthoritativeClaim, isClaimSafeToProject } from './authoritativeProjection';
import { FinancingClaim } from '../types/claims';
export { getAuthoritativeClaim };
import { FinancingProduct } from '../types/knowledge';

function applyClaim(product: FinancingProduct, claim: FinancingClaim): void {
  const updateCriterion = (field: string, operator: string, expectedValue: unknown) => {
    const criterion = product.criteria.find(c => c.field === field && c.operator === operator);
    if (criterion) criterion.expectedValue = expectedValue;
  };

  switch (claim.field) {
    case 'minProjectCost':
      if (typeof claim.value === 'number') { product.financialTerms.projectCost = { ...product.financialTerms.projectCost, min: claim.value, currency: 'TND' }; updateCriterion('totalProjectCost', 'GTE', claim.value); }
      break;
    case 'maxProjectCost':
      if (typeof claim.value === 'number') { product.financialTerms.projectCost = { ...product.financialTerms.projectCost, max: claim.value, currency: 'TND' }; updateCriterion('totalProjectCost', 'LTE', claim.value); }
      break;
    case 'maxFinancingAmount':
      if (typeof claim.value === 'number') { product.financialTerms.amount = { ...product.financialTerms.amount, max: claim.value, currency: 'TND' }; updateCriterion('financingRequested', 'LTE', claim.value); }
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
        const existing = product.financialTerms.rate?.explanation?.fr || '';
        const range = existing.match(/\d+(?:[.,]\d+)? à \d+(?:[.,]\d+)?/i)?.[0];
        product.financialTerms.rate = {
          ...product.financialTerms.rate,
          type: 'UNKNOWN',
          margin: undefined,
          referenceIndex: undefined,
          explanation: {
            fr: range
              ? `Marge publiée : ${range} points. Relation de tarification avec l'indice TMM non confirmée. Aucune simulation automatique de taux ne peut être effectuée.`
              : 'Relation de tarification avec l\'indice TMM non confirmée. Aucune simulation automatique de taux ne peut être effectuée.',
            ar: 'العلاقة الدقيقة مع TMM غير معلومة. لا يمكن احتساب نسبة فائدة آلية.'
          }
        };
      }
      break;
    case 'coverageBasis':
      product.financialTerms.guaranteeDetails = {
        ...product.financialTerms.guaranteeDetails,
        coverageBasis: claim.value as any
      };
      break;
    case 'governorates':
      product.financialTerms.guaranteeDetails = {
        ...product.financialTerms.guaranteeDetails,
        governorates: claim.value as any
      };
      break;
  }
}

function clearUnsupportedLegacyValue(product: FinancingProduct, field: string): void {
  const reason = 'Prior claim exists, but no current, non-conflicting, in-date claim is usable.';
  const notes = {
    fr: 'Valeur héritée masquée : la revendication disponible est périmée, expirée ou en conflit et doit être revérifiée.',
    ar: 'تم إخفاء القيمة القديمة: المعطى المتاح متقادم أو منتهي الصلاحية أو متعارض ويجب التثبت منه.'
  };
  const matchingEvidence = [
    ...product.verification.fields.filter(item => item.field === field),
    ...product.financialTerms.verification.filter(item => item.field === field)
  ];
  for (const evidence of matchingEvidence) {
    evidence.status = 'UNVERIFIED';
    evidence.unknownReason = reason;
    evidence.notes = notes;
  }
  if (!product.financialTerms.verification.some(item => item.field === field)) {
    product.financialTerms.verification.push({
      field,
      status: 'UNVERIFIED',
      sourceIds: [],
      unknownReason: reason,
      notes
    });
  }

  switch (field) {
    case 'minProjectCost':
      if (product.financialTerms.projectCost) product.financialTerms.projectCost.min = undefined;
      break;
    case 'maxProjectCost':
      if (product.financialTerms.projectCost) product.financialTerms.projectCost.max = undefined;
      break;
    case 'maxFinancingAmount':
      if (product.financialTerms.amount) product.financialTerms.amount.max = undefined;
      break;
    case 'publishedMarginRange':
    case 'pricingRelationship':
      product.financialTerms.rate = {
        ...product.financialTerms.rate,
        type: 'UNKNOWN',
        value: undefined,
        margin: undefined,
        referenceIndex: undefined,
        min: undefined,
        max: undefined,
        ruleStatus: 'UNKNOWN',
        explanation: {
          fr: 'Tarification masquée : aucune revendication actuelle exploitable ne permet un calcul fiable.',
          ar: 'تم إخفاء شروط التسعير: لا توجد معلومة حالية صالحة تسمح باحتساب موثوق.'
        }
      };
      break;
    case 'coverageBasis':
      if (product.financialTerms.guaranteeDetails) product.financialTerms.guaranteeDetails.coverageBasis = 'UNKNOWN';
      break;
    case 'governorates':
      if (product.financialTerms.guaranteeDetails) product.financialTerms.guaranteeDetails.governorates = undefined;
      break;
  }
}

export function getAuthoritativeCatalogueProducts(): FinancingProduct[] {
  return CANONICAL_PRODUCTS.map(base => {
    const product = structuredClone(base) as FinancingProduct;
    const claims = CLAIMS_REPOSITORY.getAllClaims(base.id);
    const fields = new Set(claims.map(claim => claim.field));
    for (const field of fields) {
      const claim = getAuthoritativeClaim(base.id, field);
      if (claim && isClaimSafeToProject(claim)) applyClaim(product, claim);
      else clearUnsupportedLegacyValue(product, field);
    }
    return product;
  });
}

export function getAuthoritativeCatalogueMetadata() {
  const products = getAuthoritativeCatalogueProducts();
  const providers = getAuthoritativeCatalogueProviders();
  return {
    productCount: products.length,
    providerCount: providers.length,
    sourceCount: providers.reduce((n,p) => n + p.sources.length, 0) + products.reduce((n,p) => n + p.sources.length, 0)
  };
}

export function getAuthoritativeCatalogueProviders() {
  return CANONICAL_PROVIDERS;
}

export function getAuthoritativeCatalogueProduct(id: string): FinancingProduct | undefined {
  return getAuthoritativeCatalogueProducts().find(p => p.id === id);
}
