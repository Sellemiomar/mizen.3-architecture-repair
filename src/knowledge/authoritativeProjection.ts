import { CANONICAL_PRODUCTS, CANONICAL_PROVIDERS } from './canonicalCatalogue';
import { CLAIMS_REPOSITORY } from './claimsRepository';
import { FinancingClaim } from '../types/claims';
import { FinancingProgram, Provider, FinancingCategory, FinancingPurpose } from '../types/financing';
import { FinancingProduct } from '../types/knowledge';

const REGIONAL_DEVELOPMENT_ZONES = [
  'Kasserine', 'Sidi Bouzid', 'Gafsa', 'Kébili', 'Tataouine', 'Tozeur',
  'Siliana', 'Le Kef', 'Jendouba', 'Béja', 'Kairouan', 'Médenine', 'Gabès'
] as const;

function rank(c: FinancingClaim): number {
  if (c.ruleStatus === 'VERIFIED_HISTORICAL' || c.operationalStatus === 'HISTORICAL_ONLY') return -100;
  if (c.ruleStatus === 'UNKNOWN' && c.evidenceStrength === 'DIRECT_PRIMARY_CURRENT') return 110;
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

function mapCategory(product: FinancingProduct): FinancingCategory {
  const category = product.category;
  if (category === 'PUBLIC_FUNDING' || product.financingDomains.includes('PUBLIC_FUNDING')) return 'grant_subsidy';
  if (category === 'MICROFINANCE') return 'microcredit';
  if (category === 'GUARANTEE') return 'guarantee';
  if (category === 'GRANT') return 'grant_subsidy';
  if (category === 'EQUITY') return 'equity_quasi_equity';
  if (category === 'ISLAMIC_FINANCE') return 'islamic_finance';
  if (category === 'SUBSIDIZED_LOAN' || product.financialTerms.rate?.type === 'INTEREST_FREE_SUBSIDIZED') return 'subsidized_loan';
  if (category === 'BANK_LOAN' || category === 'LEASING') return 'bank_loan';
  // Canonical STARTUP is a domain label, not a funding role. Keep debt-like
  // products as loans and reserve equity/quasi-equity for explicit equity data.
  if (product.financialTerms.paymentStructure === 'AMORTIZING_MONTHLY') return 'bank_loan';
  return 'equity_quasi_equity';
}

function mapPurpose(purpose: string): FinancingPurpose | undefined {
  const map: Record<string, FinancingPurpose> = {
    BUSINESS_CREATION: 'creation',
    EQUIPMENT_PURCHASE: 'equipment',
    WORKING_CAPITAL: 'working_capital',
    BUSINESS_EXPANSION: 'expansion',
    AGRICULTURE: 'agriculture',
    INNOVATION_RD: 'innovation_rd',
    EXPORT: 'export',
    VEHICLE_PERSONAL: 'vehicle',
    VEHICLE_PRO: 'vehicle',
    HOME_PURCHASE: 'first_home',
    HOME_CONSTRUCTION: 'home_construction'
  };
  return map[purpose];
}

function mapRateType(rate: FinancingProduct['financialTerms']['rate']): FinancingProgram['rateType'] {
  if (!rate) return 'unknown';
  switch (rate.type) {
    case 'FIXED':
      return rate.margin !== undefined ? 'fixed' : 'unknown';
    case 'TMM_PLUS_MARGIN':
      return 'variable_tmm';
    case 'INTEREST_FREE_SUBSIDIZED':
      return rate.value === 0 ? 'interest_free' : 'subsidized';
    case 'PROFIT_MARGIN':
      return 'profit_margin';
    case 'NEGOTIATED':
    case 'UNKNOWN':
    case 'NOT_APPLICABLE':
    default:
      return 'unknown';
  }
}

function productToProgram(product: FinancingProduct): FinancingProgram {
  const amount = product.financialTerms.amount;
  const contribution = product.financialTerms.contributionPercentage;
  const duration = product.financialTerms.durationMonths;
  const grace = product.financialTerms.gracePeriodMonths;
  const rate = product.financialTerms.rate;

  const program: FinancingProgram = {
    id: product.id,
    code: product.id,
    providerId: product.providerId,
    name: product.name as { fr: string; ar: string },
    tagline: product.shortDescription as { fr: string; ar: string },
    category: mapCategory(product),
    purposes: product.financingPurposes.map(mapPurpose).filter(Boolean) as FinancingPurpose[],
    minAmount: amount?.min ?? 0,
    maxAmount: amount?.max ?? Number.MAX_SAFE_INTEGER,
    minContributionPercent: contribution?.min ?? 0,
    projectCostMin: product.financialTerms.projectCost?.min,
    projectCostMax: product.financialTerms.projectCost?.max,
    maxFinancingPercentage: undefined,
    rateType: mapRateType(rate),
    rateDescription: rate?.explanation || { fr: 'Taux non établi.', ar: 'نسبة التمويل غير مثبتة.' },
    estimatedRateAnnual: rate?.value,
    durationMonthsMin: duration?.min ?? 0,
    durationMonthsMax: duration?.max ?? 0,
    gracePeriodMonthsMin: grace?.min ?? 0,
    gracePeriodMonthsMax: grace?.max ?? 0,
    guaranteeRequirements: {
      fr: product.guarantees?.map(g => g.description.fr).join(' ') || 'Aucune exigence de garantie documentée.',
      ar: product.guarantees?.map(g => g.description.ar).join(' ') || 'لا توجد متطلبات ضمان موثقة.'
    },
    targetAudience: product.shortDescription as { fr: string; ar: string },
    eligibilityCriteria: {
      stages: (product.applicability.allowedBusinessStages || []) as any,
      sectors: (product.applicability.allowedSectors || []) as any,
      allowedLegalForms: [],
      minAge: undefined,
      maxAge: undefined,
      requiresDegree: product.applicability.requiresHigherEducationDegree,
      requiresStartupLabel: product.applicability.requiresStartupActLabel,
      regionalPriorityZonesOnly: false,
      otherRules: product.criteria.map(c => c.description)
    },
    requiredDocuments: (product.requiredDocuments || []).map(d => ({
      id: d.id,
      name: d.name,
      category: 'legal',
      mandatory: d.mandatory
    })) as any,
    applicationSteps: [],
    importantCaveats: [],
    hasRegionalDevelopmentBonus: product.financingDomains.includes('AGRICULTURE') || product.financingDomains.includes('BUSINESS'),
    accessibleWithoutHeavyCollateral: undefined,
    applicability: {
      supportedPurposes: product.financingPurposes.map(mapPurpose).filter(Boolean) as FinancingPurpose[],
      requiresBusinessEntity: product.applicability.requiresBusinessEntity,
      isFirstPropertyOnly: false,
      unverifiedApplicability: product.verification.status === 'UNVERIFIED'
    },
    verification: {
      status: product.verification.status === 'VERIFIED' ? 'VERIFIED' : 'PARTIALLY_VERIFIED',
      sourceUrl: product.sources[0]?.url || '',
      sourceTitle: product.sources[0]?.title || '',
      sourceType: 'official_portal',
      dateChecked: product.lastVerifiedAt || product.sources[0]?.retrievedAt || '',
      verifiedFields: product.verification.fields.filter(f => f.status === 'VERIFIED').map(f => f.field),
      unverifiedFields: product.verification.fields.filter(f => f.status !== 'VERIFIED').map(f => f.field),
      notes: {
        fr: product.verification.fields.filter(f => f.status !== 'VERIFIED').map(f => f.notes?.fr).filter(Boolean).join(' ') || '',
        ar: product.verification.fields.filter(f => f.status !== 'VERIFIED').map(f => f.notes?.ar).filter(Boolean).join(' ') || ''
      },
      lastUpdateYear: Number((product.lastVerifiedAt || '').slice(0, 4)) || new Date().getFullYear()
    }
  };

  return program;
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
        program.durationMonthsMin = 0;
        program.durationMonthsMax = 0;
        program.importantCaveats.push({
          fr: 'Durée de remboursement non établie par une revendication actuelle.',
          ar: 'مدة السداد غير مثبتة بمعلومة حالية.'
        });
      }
      break;
    case 'gracePeriod':
    case 'gracePeriodMonths':
      if (claim.value === 'UNKNOWN') {
        program.gracePeriodMonthsMin = 0;
        program.gracePeriodMonthsMax = 0;
        program.importantCaveats.push({
          fr: 'Période de grâce non établie par une revendication actuelle.',
          ar: 'فترة الإمهال غير مثبتة بمعلومة حالية.'
        });
      }
      break;
  }
}

function project(base: FinancingProduct): FinancingProgram {
  const product = structuredClone(base);
  const program = productToProgram(product);
  const claims = CLAIMS_REPOSITORY.getAllClaims(base.id);
  const claimedFields = new Set(claims.map(c => c.field));

  if (claimedFields.has('minProjectCost')) program.projectCostMin = undefined;
  if (claimedFields.has('maxProjectCost')) program.projectCostMax = undefined;
  if (claimedFields.has('maxFinancingPercentage')) program.maxFinancingPercentage = undefined;

  for (const field of claimedFields) {
    const claim = getAuthoritativeClaim(base.id, field);
    if (claim) applyClaim(program, claim);
  }

  const pricingClaim = getAuthoritativeClaim(base.id, 'pricingRelationship');
  if (pricingClaim?.value === 'UNKNOWN') {
    program.rateType = 'unknown';
    program.estimatedRateAnnual = undefined;
  }

  return program;
}

export function getAuthoritativeFinancingPrograms(): FinancingProgram[] {
  return CANONICAL_PRODUCTS.map(project);
}

export function getAuthoritativeFinancingProgram(id: string): FinancingProgram | undefined {
  const base = CANONICAL_PRODUCTS.find(p => p.id === id);
  return base ? project(base) : undefined;
}

function mapProviderType(type: string): Provider['type'] {
  switch (type) {
    case 'PUBLIC_BANK':
    case 'BANK':
      return 'commercial_bank';
    case 'MICROFINANCE':
      return 'microfinance';
    case 'GUARANTEE_MECHANISM':
      return 'guarantee_fund';
    case 'PUBLIC_FUNDING_AGENCY':
      return 'public_agency';
    case 'ISLAMIC_BANK':
      return 'islamic_bank';
    default:
      return 'commercial_bank';
  }
}

export function getAuthoritativeProviders(): Provider[] {
  return CANONICAL_PROVIDERS.map(p => ({
    id: p.id,
    name: p.name,
    acronym: p.acronym,
    type: mapProviderType(p.type),
    description: p.description as { fr: string; ar: string },
    website: p.website,
    headquarters: '',
    networkCoverage: { fr: 'Tunisie', ar: 'تونس' },
    officialBadgeText: {
      fr: 'Source officielle référencée',
      ar: 'مصدر رسمي موثق'
    }
  }));
}

export function getAuthoritativeRegionalDevelopmentZones(): readonly string[] {
  return REGIONAL_DEVELOPMENT_ZONES;
}
