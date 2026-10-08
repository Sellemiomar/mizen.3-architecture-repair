/**
 * Mizen - Canonical Financing Claim Repository
 * 
 * Central registry for discrete, source-tracked, temporally safe financing claims.
 * Enforces:
 * - Claim-level provenance and status separation (Rule, Operational, Applicability, Evidence Strength)
 * - Historical evidence preservation (never hard-delete superseded claims)
 * - Idempotent ingestion (re-importing identical batches creates 0 duplicates and causes 0 degradation)
 * - Separation of Fund Capitalization vs Borrower Financing Ceilings
 * - Strict Compatibility Registry based on empirical evidence
 */

import { 
  FinancingClaim, 
  CompatibilityClaim, 
  ClaimReconciliationResult,
  RuleStatus,
  OperationalStatus,
  EvidenceStrength
} from '../types/claims';
import { SourceReference } from '../types/knowledge';

// Canonical Source References
export const CANONICAL_SOURCES: Record<string, SourceReference> = {
  bfpme_guide_current: {
    id: 'src_bfpme_guide_2024',
    url: 'https://www.bfpme.com.tn/produits/cmlt',
    title: 'BFPME — Guide Officiel Crédit Moyen et Long Terme (CMLT)',
    publisher: 'Banque de Financement des PME (BFPME)',
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    language: 'fr',
    publishedAt: '2024-01-15',
    retrievedAt: '2026-09-20',
    lastVerifiedAt: '2026-09-20',
    evidenceStatus: 'VERIFIED'
  },
  bfpme_guide_historical: {
    id: 'src_bfpme_guide_2016',
    url: 'https://www.bfpme.com.tn/archive/guide_promoteur_2016.pdf',
    title: 'BFPME — Ancien Guide du Promoteur (Archive 2016)',
    publisher: 'BFPME',
    sourceType: 'OFFICIAL_PDF',
    language: 'fr',
    publishedAt: '2016-05-10',
    retrievedAt: '2024-01-10',
    lastVerifiedAt: '2024-01-10',
    evidenceStatus: 'OUTDATED'
  },
  sotugar_fgpme_7590_jort: {
    id: 'src_sotugar_fgpme_7590',
    url: 'http://www.iort.gov.tn/WD120AWP/WD120Awp.exe/CTX_4896-1-XlZpZkXwUf/PageAcceuil/SYNC_1854497746',
    title: 'Loi de Finances Complémentaire 2015 — Article 4 (FGPME 75/90)',
    publisher: 'Journal Officiel de la République Tunisienne (JORT)',
    sourceType: 'OFFICIAL_REGULATION',
    language: 'fr',
    publishedAt: '2015-08-07',
    retrievedAt: '2026-09-18',
    lastVerifiedAt: '2026-10-08',
    evidenceStatus: 'VERIFIED'
  },
  sotugar_official_bareme: {
    id: 'src_sotugar_official_bareme',
    url: 'https://sotugar.com.tn/garantie-des-credits-accordes-aux-pme/',
    title: 'SOTUGAR — Garantie des crédits accordés aux PME',
    publisher: 'SOTUGAR',
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    language: 'fr',
    publishedAt: '2023-11-01',
    retrievedAt: '2026-09-18',
    lastVerifiedAt: '2026-09-18',
    evidenceStatus: 'VERIFIED'
  },
  fgjc_convention_archive: {
    id: 'src_fgjc_convention_archive',
    url: 'https://www.sotugar.com.tn/archive/fgjc-texte.pdf',
    title: 'Convention FGJC — Fonds de Garantie des Jeunes Promoteurs & Diplômés',
    publisher: 'Ministère des Finances / SOTUGAR',
    sourceType: 'OFFICIAL_DOCUMENT',
    language: 'fr',
    publishedAt: '2018-04-12',
    retrievedAt: '2025-06-10',
    lastVerifiedAt: '2025-06-10',
    evidenceStatus: 'PARTIALLY_VERIFIED'
  },
  startup_act_guarantee_decree: {
    id: 'src_startup_act_guarantee',
    url: 'https://startup.gov.tn/fr/cadre-reglementaire/fonds-garantie',
    title: 'Décret n° 2018-840 & Dispositif de Garantie Startup Act',
    publisher: 'Smart Capital / Ministère des TIC',
    sourceType: 'OFFICIAL_REGULATION',
    language: 'fr',
    publishedAt: '2018-10-15',
    retrievedAt: '2026-09-20',
    lastVerifiedAt: '2026-09-20',
    evidenceStatus: 'VERIFIED'
  },
  energy_transition_convention: {
    id: 'src_energy_transition_convention',
    url: 'https://www.anme.tn/fr/fonds-transition-energetique',
    title: 'Convention Cadre du Fonds de Transition Énergétique (FTE)',
    publisher: 'ANME / Ministère de l’Énergie',
    sourceType: 'OFFICIAL_DOCUMENT',
    language: 'fr',
    publishedAt: '2021-03-20',
    retrievedAt: '2026-09-10',
    lastVerifiedAt: '2026-09-10',
    evidenceStatus: 'VERIFIED'
  }
,
  mehat_foprolos_current: {
    id: 'src_mehat_foprolos',
    url: 'https://www.mehat.gov.tn/fr/principaux-secteurs/habitat/programmes-projets/foprolos/',
    title: 'FOPROLOS — Ministère de l\'Équipement et de l\'Habitat',
    publisher: 'Ministère de l\'Équipement et de l\'Habitat',
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    language: 'fr',
    retrievedAt: '2026-10-08',
    lastVerifiedAt: '2026-10-08',
    evidenceStatus: 'VERIFIED'
  },
  apii_foprodi_financing_guide: {
    id: 'src_apii_foprodi_financing_guide',
    url: 'https://caipe.tunisieindustrie.nat.tn/IMG/pdf/Guide_Francais.pdf',
    title: 'Guide de financement des petites et moyennes entreprises — FOPRODI',
    publisher: 'APII',
    sourceType: 'OFFICIAL_PDF',
    language: 'fr',
    retrievedAt: '2026-10-08',
    lastVerifiedAt: '2026-10-08',
    evidenceStatus: 'VERIFIED'
  },
  apii_foprodi_current: {
    id: 'src_apii_foprodi',
    url: 'https://www.tunisieindustrie.nat.tn/en/doc.asp?mcat=12&mrub=208',
    title: 'Granting and release of financial benefits — FOPRODI',
    publisher: 'APII',
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    language: 'en',
    retrievedAt: '2026-10-08',
    lastVerifiedAt: '2026-10-08',
    evidenceStatus: 'VERIFIED'
  },
  enda_bidaya_current: {
    id: 'src_enda_bidaya',
    url: 'https://www.endatamweel.tn/nos-services/micro-credits/pack-creation/',
    title: 'Pack création (Bidaya) — Enda Tamweel',
    publisher: 'Enda Tamweel',
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    language: 'fr',
    retrievedAt: '2026-10-08',
    lastVerifiedAt: '2026-10-08',
    evidenceStatus: 'VERIFIED'
  }
};

/**
 * Initial Canonical Claims Repository
 * Contains all verified current, historical, and transitional financing claims.
 */
export const INITIAL_CANONICAL_CLAIMS: FinancingClaim[] = [
  // -------------------------------------------------------------
  // BFPME CMLT Claims
  // -------------------------------------------------------------
  // Current evidence establishes project-cost and financing ceilings,
  // but does not establish a minimum financing amount. Keep the legacy 50k
  // structural value from becoming a current user-facing fact.
  {
    claimId: 'claim_bfpme_min_financing_amount_unknown',
    entityId: 'bfpme_creation',
    field: 'minFinancingAmount',
    value: 'UNKNOWN',
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'UNKNOWN',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Le montant minimum de financement CMLT n'est pas établi par la source actuelle. Ne pas reprendre l'ancien plancher structurel de 50 000 TND comme fait vérifié.",
      ar: "الحد الأدنى لمبلغ تمويل CMLT غير مثبت في المصدر الحالي. لا يجب اعتماد الحد الهيكلي القديم البالغ 50 ألف دينار كمعطى موثق."
    }
  },
  {
    claimId: 'claim_bfpme_min_cost_current',
    entityId: 'bfpme_creation',
    field: 'minProjectCost',
    value: 150000,
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Investissement global minimum de 150 000 TND requis pour le Crédit Moyen et Long Terme (CMLT).",
      ar: "كلفة استثمارية جملية لا تقل عن 150 ألف دينار لقرض CMLT."
    }
  },
  {
    claimId: 'claim_bfpme_max_cost_current',
    entityId: 'bfpme_creation',
    field: 'maxProjectCost',
    value: 15000000,
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Investissement global maximum de 15 000 000 TND éligible au schéma de co-financement BFPME.",
      ar: "سقف الكلفة الاستثمارية الجملية لا يتجاوز 15 مليون دينار."
    }
  },
  {
    claimId: 'claim_bfpme_cmlt_ceiling_pct_current',
    entityId: 'bfpme_creation',
    field: 'maxFinancingPercentage',
    value: 65, // 65% of investment cost
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Plafond du concours CMLT limité à 65% du coût total de l'investissement.",
      ar: "نسبة تمويل CMLT محددة بـ 65% كحد أقصى من كلفة الاستثمار."
    }
  },
  {
    claimId: 'claim_bfpme_cmlt_ceiling_amount_current',
    entityId: 'bfpme_creation',
    field: 'maxFinancingAmount',
    value: 2500000, // 2.5M TND CMLT ceiling
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Plafond absolu de crédit CMLT accordé par la BFPME fixé à 2 500 000 TND par projet.",
      ar: "الحد الأقصى المطلق لمبلغ قرض CMLT من BFPME محدد بـ 2.5 مليون دينار."
    }
  },
  {
    claimId: 'claim_bfpme_cmlt_ceiling_amount_historical',
    entityId: 'bfpme_creation',
    field: 'maxFinancingAmount',
    value: 5000000, // 5M TND old ceiling
    source: CANONICAL_SOURCES.bfpme_guide_historical,
    sourceType: 'OFFICIAL_PDF',
    sourceDate: '2016-05-10',
    retrievalDate: '2024-01-10',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'HISTORICAL_ONLY',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    supersededByClaimId: 'claim_bfpme_cmlt_ceiling_amount_current',
    conflictStatus: 'SUPERSEDED',
    supersededReason: "Ancien plafond BFPME 5M TND remplacé par le barème CMLT actuel à 2,5M TND (65% du coût d'investissement).",
    notes: {
      fr: "Ancien barème historique de la BFPME (5 000 000 TND), conservé pour traçabilité.",
      ar: "السقف التاريخي القديم لبنك BFPME (5 ملايين دينار)، محفوظ لأغراض التوثيق التاريخي."
    }
  },
  {
    claimId: 'claim_bfpme_margin_range_current',
    entityId: 'bfpme_creation',
    field: 'publishedMarginRange',
    value: { min: 2.0, max: 4.5, unit: 'percentage_points' },
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Fourchette de marge commerciale publiée de 2 à 4,5 points de pourcentage.",
      ar: "نطاق الهامش التجاري المنشور يتراوح بين 2 و 4.5 نقطة مئوية."
    }
  },
  {
    claimId: 'claim_bfpme_pricing_relationship',
    entityId: 'bfpme_creation',
    field: 'pricingRelationship',
    value: 'UNKNOWN',
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'SECONDARY',
    ruleStatus: 'UNKNOWN',
    operationalStatus: 'UNKNOWN',
    applicabilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    conflictStatus: 'NONE',
    notes: {
      fr: "La relation exacte entre la marge publiée (2-4,5%) et le TMM n'est pas formellement documentée comme formule universelle automatique.",
      ar: "العلاقة الدقيقة بين الهامش المنشور ونسبة TMM غير مثبتة رسمياً كصيغة آلية ثابتة."
    }
  },
  {
    claimId: 'claim_bfpme_financement_integral',
    entityId: 'bfpme_creation',
    field: 'financementIntegralMeaning',
    value: 'UNKNOWN_DUE_TO_MISSING_DATA',
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'SECONDARY',
    ruleStatus: 'UNKNOWN',
    operationalStatus: 'UNKNOWN',
    applicabilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    conflictStatus: 'NONE',
    notes: {
      fr: "La mention 'Financement intégral possible' ne doit pas être assimilée à 100% de crédit sans apport sans documentation primaire vérifiée.",
      ar: "عبارة 'إمكانية التمويل الشامل' لا تعني 100% تمويلاً بنكياً دون تمويل ذاتي دون دليل رسمي مؤكد."
    }
  },
  {
    claimId: 'claim_bfpme_exclusions_sectors',
    entityId: 'bfpme_creation',
    field: 'sectorExclusionsAndExceptions',
    value: {
      excludedSectors: ['accommodation_tourism', 'residential_real_estate_promotion'],
      allowedExceptions: ['rural_gites', 'guesthouses_maisons_hotes']
    },
    source: CANONICAL_SOURCES.bfpme_guide_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2024-01-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Exclusion du tourisme hôtelier classique et de la promotion immobilière résidentielle. Exception expresse pour les gîtes ruraux et maisons d'hôtes.",
      ar: "استثناء السياحة الفندقية الكلاسيكية والبعث العقاري السكني، مع قبول صريح للإقامات الريفية ودور الضيافة."
    }
  },

  // -------------------------------------------------------------
  // SOTUGAR FGPME 75/90 Claims
  // -------------------------------------------------------------
  {
    claimId: 'claim_fgpme_7590_allocation',
    entityId: 'sotugar_fgpme_7590',
    field: 'fundAllocationCapitalization',
    value: 30000000, // 30M TND fund capitalization
    source: CANONICAL_SOURCES.sotugar_fgpme_7590_jort,
    sourceType: 'OFFICIAL_REGULATION',
    sourceDate: '2015-08-07',
    retrievalDate: '2026-09-18',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'GEOGRAPHICALLY_CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    isFundLevelFact: true, // Crucial invariant: never expose as entrepreneur ceiling
    notes: {
      fr: "Dotation initiale de 30 MDT allouée par l'État pour le Fonds de Garantie PME 75/90 (fait financier au niveau du fonds, et NON plafond emprunteur).",
      ar: "اعتماد مالي قدره 30 مليون دينار مخصص لصندوق ضمان المؤسسات 75/90 (معلومة على مستوى الصندوق ولا تمثل سقف المقترض الفردي)."
    }
  },
  {
    claimId: 'claim_fgpme_7590_coverage_priority',
    entityId: 'sotugar_fgpme_7590',
    field: 'coveragePercentagePriority',
    value: 90,
    source: CANONICAL_SOURCES.sotugar_fgpme_7590_jort,
    sourceType: 'OFFICIAL_REGULATION',
    sourceDate: '2015-08-07',
    retrievalDate: '2026-09-18',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'GEOGRAPHICALLY_CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Taux de couverture de 90% pour les projets prioritaires dans les 14 gouvernorats de l'intérieur.",
      ar: "نسبة ضمان تبلغ 90% للمشاريع ذات الأولوية بـ 14 ولاية داخلية."
    }
  },
  {
    claimId: 'claim_fgpme_7590_coverage_other',
    entityId: 'sotugar_fgpme_7590',
    field: 'coveragePercentageOther',
    value: 75,
    source: CANONICAL_SOURCES.sotugar_fgpme_7590_jort,
    sourceType: 'OFFICIAL_REGULATION',
    sourceDate: '2015-08-07',
    retrievalDate: '2026-09-18',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'GEOGRAPHICALLY_CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Taux de couverture de 75% pour les autres projets éligibles.",
      ar: "نسبة ضمان تبلغ 75% لبقية المشاريع المؤهلة."
    }
  },
  {
    claimId: 'claim_fgpme_7590_project_ceiling',
    entityId: 'sotugar_fgpme_7590',
    field: 'projectCostCeiling',
    value: 15000000,
    source: CANONICAL_SOURCES.sotugar_fgpme_7590_jort,
    sourceType: 'OFFICIAL_REGULATION',
    sourceDate: '2015-08-07',
    retrievalDate: '2026-09-18',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'GEOGRAPHICALLY_CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Projets de création ou d'extension jusqu'à 15M TND éligibles.",
      ar: "مشاريع الإحداث والتوسعة حتى 15 مليون دينار."
    }
  },

  // -------------------------------------------------------------
  // SOTUGAR SME Mechanism Claims
  // -------------------------------------------------------------
  {
    claimId: 'claim_sotugar_sme_coverage_historical',
    entityId: 'sotugar_guarantee',
    field: 'coverageRates',
    value: [75, 60, 50],
    source: CANONICAL_SOURCES.sotugar_official_bareme,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    sourceDate: '2023-11-01',
    retrievalDate: '2026-09-18',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Taux de couverture historiques de 75%, 60% et 50% selon le mécanisme spécifique de garantie.",
      ar: "نسب تغطية تاريخية (75%، 60%، 50%) بحسب آلية الضمان المحددة."
    }
  },

  // -------------------------------------------------------------
  // FGJC (Fonds de Garantie Jeunes Promoteurs / Diplômés)
  // -------------------------------------------------------------
  {
    claimId: 'claim_fgjc_project_ceiling',
    entityId: 'sotugar_fgjc',
    field: 'projectCostCeiling',
    value: 500000,
    source: CANONICAL_SOURCES.fgjc_convention_archive,
    sourceType: 'OFFICIAL_DOCUMENT',
    sourceDate: '2018-04-12',
    retrievalDate: '2025-06-10',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'UNKNOWN', // Do NOT infer closure from 0 2024 declarations
    applicabilityStatus: 'ENTITY_SPECIFIC',
    confidence: 'MEDIUM',
    conflictStatus: 'NONE',
    notes: {
      fr: "Plafond d'investissement de 500 000 TND pour les jeunes diplômés (statut opérationnel actuel à confirmer).",
      ar: "سقف استثماري بـ 500 ألف دينار لأصحاب الشهادات العليا (الوضعية التشغيلية الحالية قيد التثبت)."
    }
  },
  {
    claimId: 'claim_fgjc_loan_coverage',
    entityId: 'sotugar_fgjc',
    field: 'loanCoveragePercentage',
    value: 75,
    source: CANONICAL_SOURCES.fgjc_convention_archive,
    sourceType: 'OFFICIAL_DOCUMENT',
    sourceDate: '2018-04-12',
    retrievalDate: '2025-06-10',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'UNKNOWN',
    applicabilityStatus: 'ENTITY_SPECIFIC',
    confidence: 'MEDIUM',
    conflictStatus: 'NONE',
    notes: {
      fr: "Prise en charge de 75% du crédit irrécouvrable et 50% des frais de poursuite.",
      ar: "تغطية 75% من أصل القرض غير المسترد و 50% من مصاريف التقاضي."
    }
  },

  // -------------------------------------------------------------
  // Startup Guarantee Fund Claims
  // -------------------------------------------------------------
  {
    claimId: 'claim_startup_guarantee_label',
    entityId: 'startup_guarantee_fund',
    field: 'requiresStartupActLabel',
    value: true,
    source: CANONICAL_SOURCES.startup_act_guarantee_decree,
    sourceType: 'OFFICIAL_REGULATION',
    sourceDate: '2018-10-15',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'UNKNOWN',
    applicabilityStatus: 'ENTITY_SPECIFIC',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: "Nécessite impérativement le Label Startup Act officiel en cours de validité.",
      ar: "يشترط الحصول على علامة المؤسسة الناشئة (Label Startup Act) السارية."
    }
  },
  {
    claimId: 'claim_startup_guarantee_terms_unknown',
    entityId: 'startup_guarantee_fund',
    field: 'termsAndCeilings',
    value: 'UNKNOWN',
    source: CANONICAL_SOURCES.startup_act_guarantee_decree,
    sourceType: 'OFFICIAL_REGULATION',
    retrievalDate: '2026-09-20',
    evidenceStrength: 'SECONDARY',
    ruleStatus: 'UNKNOWN',
    operationalStatus: 'UNKNOWN',
    applicabilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    conflictStatus: 'NONE',
    notes: {
      fr: "Les plafonds, taux de couverture et conditions d'octroi bancaire du fonds de garantie Startup Act restent non documentés.",
      ar: "سقوف ونسب التغطية والشروط البنكية لصندوق ضمان الستارتاب تبقى غير موثقة بصفة قطعية."
    }
  },

  // -------------------------------------------------------------
  // Energy-Transition Guarantee Fund Claims
  // -------------------------------------------------------------
  {
    claimId: 'claim_energy_transition_convention',
    entityId: 'energy_transition_fund',
    field: 'conventionStatus',
    value: 'VERIFIED_HISTORICAL',
    source: CANONICAL_SOURCES.energy_transition_convention,
    sourceType: 'OFFICIAL_DOCUMENT',
    sourceDate: '2021-03-20',
    retrievalDate: '2026-09-10',
    evidenceStrength: 'DIRECT_PRIMARY_HISTORICAL',
    ruleStatus: 'VERIFIED_HISTORICAL',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    isFundLevelFact: true,
    notes: {
      fr: "Convention-cadre pour les projets d'efficacité énergétique et énergies renouvelables.",
      ar: "اتفاقية إطارية لمشاريع النجاعة الطاقية والطاقات المتجددة."
    }
  },
  {
    claimId: 'claim_energy_transition_borrower_ceiling',
    entityId: 'energy_transition_fund',
    field: 'borrowerCeilingAndEligibility',
    value: 'UNKNOWN',
    source: CANONICAL_SOURCES.energy_transition_convention,
    sourceType: 'OFFICIAL_DOCUMENT',
    retrievalDate: '2026-09-10',
    evidenceStrength: 'INFERRED',
    ruleStatus: 'UNKNOWN',
    operationalStatus: 'UNKNOWN',
    applicabilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    conflictStatus: 'NONE',
    notes: {
      fr: "Plafonds par emprunteur et conditions précises de mise en œuvre bancaire non publiés intégralement.",
      ar: "السقوف الفردية وشروط التفعيل البنكي الدقيقة لم تنشر بالكامل."
    }
  }
,
  // -------------------------------------------------------------
  // FOPROLOS current evidence closure
  // -------------------------------------------------------------
  {
    claimId: 'claim_foprolos_program_current',
    entityId: 'foprolos_construction',
    field: 'programStatus',
    value: 'CURRENT_PROGRAM',
    source: CANONICAL_SOURCES.mehat_foprolos_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'La page officielle actuelle du ministère présente FOPROLOS comme un fonds intervenant par prêts et dons.',
      ar: 'الصفحة الرسمية الحالية للوزارة تعرض فوبرولوس كصندوق يتدخل بالقروض والمنح.'
    }
  },
  {
    claimId: 'claim_foprolos_construction_current',
    entityId: 'foprolos_construction',
    field: 'supportedPurpose',
    value: 'HOME_CONSTRUCTION',
    source: CANONICAL_SOURCES.mehat_foprolos_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'La page officielle liste les prêts pour financer la construction d’un logement.',
      ar: 'الصفحة الرسمية تذكر القروض لتمويل بناء مسكن.'
    }
  },
  {
    claimId: 'claim_foprolos_income_cap_current',
    entityId: 'foprolos_construction',
    field: 'incomeCapSmigMultiple',
    value: 6,
    source: CANONICAL_SOURCES.mehat_foprolos_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'La page officielle indique un revenu mensuel brut du ménage ne dépassant pas six fois le SMIG, sous réserve des autres conditions.',
      ar: 'الصفحة الرسمية تحدد سقف الدخل الشهري الخام للأسرة في ست مرات الأجر الأدنى، مع بقية الشروط.'
    }
  },
  // -------------------------------------------------------------
  // FOPRODI current existence/purpose closure
  // -------------------------------------------------------------
  {
    claimId: 'claim_foprodi_program_current',
    entityId: 'foprodi_dotation',
    field: 'programStatus',
    value: 'CURRENT_PROGRAM',
    source: CANONICAL_SOURCES.apii_foprodi_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'La page APII actuelle référence explicitement le FOPRODI parmi les dispositifs de bénéfices financiers.',
      ar: 'صفحة APII الحالية تدرج فوبرودي ضمن آليات الامتيازات المالية.'
    }
  },
  {
    claimId: 'claim_foprodi_creation_development_current',
    entityId: 'foprodi_dotation',
    field: 'supportedPurposes',
    value: ['BUSINESS_CREATION', 'BUSINESS_EXPANSION'],
    source: CANONICAL_SOURCES.apii_foprodi_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Le mécanisme est conservé comme financement public à vérifier pour les détails de barème; aucun plafond non vérifié n’est injecté.',
      ar: 'يتم الاحتفاظ بالآلية كتمويل عمومي مع إبقاء تفاصيل الجداول غير المثبتة دون إدخال أرقام مفترضة.'
    }
  },
  // -------------------------------------------------------------
  // FOPRODI financing-detail claims
  // -------------------------------------------------------------
  {
    claimId: 'claim_foprodi_dotation_project_threshold_current',
    entityId: 'foprodi_dotation',
    field: 'dotationProjectCostThreshold',
    value: 500000,
    source: CANONICAL_SOURCES.apii_foprodi_financing_guide,
    sourceType: 'OFFICIAL_PDF',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Le guide APII indique que pour les projets dont le coût est inférieur ou égal à 500 000 DT, le promoteur peut choisir entre participation FOPRODI et dotation remboursable.',
      ar: 'دليل APII يذكر أنه بالنسبة للمشاريع التي لا تتجاوز كلفتها 500 ألف دينار يمكن للباعث الاختيار بين مساهمة FOPRODI والدوتاسيون القابلة للسداد.'
    }
  },
  {
    claimId: 'claim_foprodi_dotation_capital_share_current',
    entityId: 'foprodi_dotation',
    field: 'dotationCapitalMinimumShareMax',
    value: 30,
    source: CANONICAL_SOURCES.apii_foprodi_financing_guide,
    sourceType: 'OFFICIAL_PDF',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'La dotation remboursable ne dépasse pas 30% du capital minimum dans le schéma documenté; ce pourcentage ne doit pas être traité comme un pourcentage automatique du coût total du projet.',
      ar: 'الدوتاسيون القابلة للسداد لا تتجاوز 30% من رأس المال الأدنى في المخطط الموثق؛ ولا يجب اعتبار هذه النسبة تلقائيا نسبة من كلفة المشروع الإجمالية.'
    }
  },
  {
    claimId: 'claim_foprodi_dotation_repayment_current',
    entityId: 'foprodi_dotation',
    field: 'repaymentDurationMonths',
    value: 144,
    source: CANONICAL_SOURCES.apii_foprodi_financing_guide,
    sourceType: 'OFFICIAL_PDF',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Le guide indique un remboursement des dotations sur 12 ans.',
      ar: 'الدليل يذكر سداد الدوتاسيونات على مدى 12 سنة.'
    }
  },
  {
    claimId: 'claim_foprodi_dotation_rate_current',
    entityId: 'foprodi_dotation',
    field: 'dotationInterestRate',
    value: 3,
    source: CANONICAL_SOURCES.apii_foprodi_financing_guide,
    sourceType: 'OFFICIAL_PDF',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Le guide indique un taux d’intérêt annuel de 3% pour le remboursement des dotations.',
      ar: 'الدليل يذكر نسبة فائدة سنوية قدرها 3% لسداد الدوتاسيونات.'
    }
  },

  // -------------------------------------------------------------
  // Enda Bidaya current evidence closure
  // -------------------------------------------------------------
  {
    claimId: 'claim_enda_bidaya_min_current',
    entityId: 'enda_microcredit_equip',
    field: 'minFinancingAmount',
    value: 200,
    source: CANONICAL_SOURCES.enda_bidaya_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Le Crédit Bidaya est annoncé de 200 à 40 000 DT.',
      ar: 'قرض بداية معلن من 200 إلى 40 ألف دينار.'
    }
  },
  {
    claimId: 'claim_enda_bidaya_max_current',
    entityId: 'enda_microcredit_equip',
    field: 'maxFinancingAmount',
    value: 40000,
    source: CANONICAL_SOURCES.enda_bidaya_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Plafond Bidaya vérifié à 40 000 DT sur la page officielle actuelle.',
      ar: 'السقف الحالي لقرض بداية مثبت في 40 ألف دينار وفق الصفحة الرسمية.'
    }
  },
  {
    claimId: 'claim_enda_bidaya_duration_current',
    entityId: 'enda_microcredit_equip',
    field: 'repaymentDurationMonths',
    value: { min: 1, max: 60 },
    source: CANONICAL_SOURCES.enda_bidaya_current,
    sourceType: 'OFFICIAL_PRODUCT_PAGE',
    retrievalDate: '2026-10-08',
    evidenceStrength: 'DIRECT_PRIMARY_CURRENT',
    ruleStatus: 'VERIFIED_CURRENT',
    operationalStatus: 'ACTIVE_NOT_CONFIRMED',
    applicabilityStatus: 'CONDITIONAL',
    confidence: 'HIGH',
    conflictStatus: 'NONE',
    notes: {
      fr: 'Durée Bidaya annoncée de 1 à 60 mois.',
      ar: 'مدة قرض بداية المعلنة من شهر إلى 60 شهراً.'
    }
  }
];

/**
 * Compatibility Claims Registry
 * Empirical, evidence-backed matrix of cross-mechanism stacking and co-financing.
 */
export const INITIAL_COMPATIBILITY_CLAIMS: CompatibilityClaim[] = [
  {
    id: 'compat_bfpme_commercial_bank',
    sourceEntityId: 'bfpme_creation',
    targetEntityId: 'bh_bank_loan',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.bfpme_guide_current],
    ruleStatus: 'VERIFIED_CURRENT',
    notes: {
      fr: "Schéma classique de co-financement BFPME (CMLT) + Banque commerciale de la place (crédit bancaire complémentaire).",
      ar: "مخطط تمويل مشترك تقليدي بين BFPME وبنك تجاري (قرض تكميلي)."
    }
  },
  {
    id: 'compat_sotugar_bank_credit',
    sourceEntityId: 'sotugar_guarantee',
    targetEntityId: 'bh_bank_loan',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.sotugar_official_bareme],
    ruleStatus: 'VERIFIED_CURRENT',
    notes: {
      fr: "Garantie publique SOTUGAR directement applicable aux crédits d'investissement des banques conventionnées.",
      ar: "ضمان عمومي من سوتوغار مطبق مباشرة على قروض الاستثمار لدى البنوك المعتمدة."
    }
  },
  {
    id: 'compat_sotugar_leasing',
    sourceEntityId: 'sotugar_guarantee',
    targetEntityId: 'leasing_vehicule_pro',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.sotugar_official_bareme],
    ruleStatus: 'VERIFIED_CURRENT',
    notes: {
      fr: "Garantie SOTUGAR applicable aux opérations de leasing mobilier et équipements professionnels.",
      ar: "ضمان سوتوغار يشمل عقود الإيجار المالي للمعدات والآليات المهنية."
    }
  },
  {
    id: 'compat_bfpme_sotugar',
    sourceEntityId: 'bfpme_creation',
    targetEntityId: 'sotugar_guarantee',
    compatibilityStatus: 'POTENTIALLY_COMPATIBLE',
    confidence: 'LOW',
    evidence: [CANONICAL_SOURCES.bfpme_guide_current],
    ruleStatus: 'PARTIALLY_VERIFIED',
    notes: {
      fr: "Association possible sous réserve d'accord de la commission mixte BFPME-SOTUGAR (confiance basse à confirmer par l'agence).",
      ar: "إمكانية الجمع خاضعة لموافقة اللجنة المشتركة (مستوى تأكيد منخفض يتطلب موافقة الفرع)."
    }
  },
  {
    id: 'compat_startup_guarantee_vc',
    sourceEntityId: 'startup_guarantee_fund',
    targetEntityId: 'venture_capital_fund',
    compatibilityStatus: 'HISTORICAL_COMPATIBILITY',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.startup_act_guarantee_decree],
    ruleStatus: 'VERIFIED_HISTORICAL',
    notes: {
      fr: "Couverture historique des prises de participation des fonds d'amorçage et FCPR agréés Startup Act.",
      ar: "تغطية تاريخية لمساهمات صناديق رأس المال المخاطر وصناديق الاستثمار في الستارتاب."
    }
  },
  {
    id: 'compat_startup_guarantee_bank',
    sourceEntityId: 'startup_guarantee_fund',
    targetEntityId: 'bh_bank_loan',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    evidence: [CANONICAL_SOURCES.startup_act_guarantee_decree],
    ruleStatus: 'UNKNOWN',
    notes: {
      fr: "Compatibilité directe entre la garantie Startup Act et le crédit bancaire classique non documentée.",
      ar: "التوافق المباشر بين ضمان الستارتاب والقروض البنكية الكلاسيكية غير موثق."
    }
  },
  {
    id: 'compat_bfpme_leasing',
    sourceEntityId: 'bfpme_creation',
    targetEntityId: 'leasing_vehicule_pro',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    evidence: [CANONICAL_SOURCES.bfpme_guide_current],
    ruleStatus: 'UNKNOWN',
    notes: {
      fr: "La compatibilité formelle et le partage d'assiette d'investissement entre crédit BFPME et leasing ne font pas l'objet d'une convention universelle automatique.",
      ar: "التوافق الرسمي وتقاسم وعاء الاستثمار بين قرض BFPME وعقد الإيجار المالي غير مثبت باتفاقية شاملة آلية."
    }
  },
  {
    id: 'compat_grant_debt',
    sourceEntityId: 'aneti_cheque_entreprendre',
    targetEntityId: 'bts_diplomes',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.bfpme_guide_current],
    ruleStatus: 'VERIFIED_CURRENT',
    notes: {
      fr: "Cumul autorisé entre prime d'accompagnement (ex. ANETI) et crédit d'investissement (ex. BTS).",
      ar: "الجمع مسموح قانوناً بين منحة المرافقة (ANETI) وقرض الاستثمار (BTS)."
    }
  },
  {
    id: 'compat_grant_leasing',
    sourceEntityId: 'foprodi_dotation',
    targetEntityId: 'leasing_vehicule_pro',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.bfpme_guide_current],
    ruleStatus: 'VERIFIED_CURRENT',
    notes: {
      fr: "Primes FOPRODI et leasing d'équipement compatibles dans le schéma d'investissement.",
      ar: "منح فوسبرودي والإيجار المالي للمعدات متوافقة ضمن هيكل الاستثمار."
    }
  },
  {
    id: 'compat_grant_equity',
    sourceEntityId: 'foprodi_dotation',
    targetEntityId: 'sicar_equity',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    evidence: [CANONICAL_SOURCES.bfpme_guide_current],
    ruleStatus: 'VERIFIED_CURRENT',
    notes: {
      fr: "Dotations remboursables et participations en capital SICAR/FCPR parfaitement compatibles.",
      ar: "المنح القابلة للاسترجاع والمساهمات في رأس المال متطابقة ومتكاملة."
    }
  }
];

/**
 * Claims Repository Class with Idempotent Ingestion & Historical Audit Trails
 */
export class FinancingClaimsRepository {
  private claims: Map<string, FinancingClaim> = new Map();
  private compatibilityMap: Map<string, CompatibilityClaim> = new Map();

  constructor(
    initialClaims: FinancingClaim[] = INITIAL_CANONICAL_CLAIMS,
    initialCompatibilities: CompatibilityClaim[] = INITIAL_COMPATIBILITY_CLAIMS
  ) {
    this.ingestClaims(initialClaims);
    initialCompatibilities.forEach(c => {
      this.compatibilityMap.set(`${c.sourceEntityId}__${c.targetEntityId}`, c);
      this.compatibilityMap.set(`${c.targetEntityId}__${c.sourceEntityId}`, c);
    });
  }

  /**
   * Idempotent Ingestion Engine:
   * Reconciles incoming claims with existing records.
   * If an identical claim exists, it preserves identity without duplicating.
   * If a newer current claim conflicts with an older one, it marks the older one as SUPERSEDED.
   */
  public ingestClaims(incomingClaims: FinancingClaim[]): ClaimReconciliationResult {
    for (const incoming of incomingClaims) {
      const existing = this.claims.get(incoming.claimId);
      
      if (existing) {
        // Idempotency check: if identical claim, do nothing
        if (
          existing.value === incoming.value &&
          existing.ruleStatus === incoming.ruleStatus &&
          existing.operationalStatus === incoming.operationalStatus &&
          existing.evidenceStrength === incoming.evidenceStrength
        ) {
          continue;
        }
      }

      // Check if this incoming claim supersedes an existing claim on the same entity and field
      if (incoming.supersededByClaimId) {
        // Explicit supersession
      } else if (incoming.evidenceStrength === 'DIRECT_PRIMARY_CURRENT' && incoming.ruleStatus === 'VERIFIED_CURRENT') {
        for (const [id, oldClaim] of this.claims.entries()) {
          if (
            oldClaim.entityId === incoming.entityId &&
            oldClaim.field === incoming.field &&
            oldClaim.claimId !== incoming.claimId &&
            oldClaim.conflictStatus !== 'SUPERSEDED'
          ) {
            // Supersede older claim cleanly
            this.claims.set(id, {
              ...oldClaim,
              conflictStatus: 'SUPERSEDED',
              supersededByClaimId: incoming.claimId,
              supersededReason: incoming.supersededReason || `Mis à jour par la revendication ${incoming.claimId}`
            });
          }
        }
      }

      this.claims.set(incoming.claimId, { ...incoming });
    }

    return this.getReconciliationSummary();
  }

  public getClaim(claimId: string): FinancingClaim | undefined {
    return this.claims.get(claimId);
  }

  public getAllClaims(entityId?: string): FinancingClaim[] {
    const all = Array.from(this.claims.values());
    if (!entityId) return all;
    return all.filter(c => c.entityId === entityId);
  }

  public getActiveClaims(entityId?: string): FinancingClaim[] {
    const all = Array.from(this.claims.values());
    const active = all.filter(c => 
      c.conflictStatus !== 'SUPERSEDED' && 
      c.ruleStatus === 'VERIFIED_CURRENT' && 
      c.operationalStatus !== 'HISTORICAL_ONLY'
    );
    if (!entityId) return active;
    return active.filter(c => c.entityId === entityId);
  }

  public getHistoricalClaims(entityId?: string): FinancingClaim[] {
    const all = Array.from(this.claims.values());
    const historical = all.filter(c => 
      c.conflictStatus === 'SUPERSEDED' || 
      c.ruleStatus === 'VERIFIED_HISTORICAL' || 
      c.operationalStatus === 'HISTORICAL_ONLY'
    );
    if (!entityId) return historical;
    return historical.filter(c => c.entityId === entityId);
  }

  public getCompatibility(sourceEntityId: string, targetEntityId: string): CompatibilityClaim {
    const key = `${sourceEntityId}__${targetEntityId}`;
    const direct = this.compatibilityMap.get(key);
    if (direct) return direct;

    // Default when no empirical claim exists: UNKNOWN with LOW confidence
    return {
      id: `compat_unknown_${sourceEntityId}_${targetEntityId}`,
      sourceEntityId,
      targetEntityId,
      compatibilityStatus: 'UNKNOWN',
      confidence: 'LOW',
      evidence: [],
      ruleStatus: 'UNKNOWN',
      notes: {
        fr: "Compatibilité non documentée par des sources officielles ou empiriques.",
        ar: "إمكانية الجمع غير موثقة استناداً إلى مصادر رسمية."
      }
    };
  }

  public getReconciliationSummary(): ClaimReconciliationResult {
    const allClaims = Array.from(this.claims.values());
    const activeClaims = this.getActiveClaims();
    const historicalClaims = this.getHistoricalClaims();
    const conflictingClaims = allClaims.filter(c => c.conflictStatus === 'CONFLICT_DETECTED');
    const supersededClaims = allClaims.filter(c => c.conflictStatus === 'SUPERSEDED');

    return {
      activeClaims,
      historicalClaims,
      allClaims,
      conflictingClaims,
      supersededClaims,
      stats: {
        total: allClaims.length,
        active: activeClaims.length,
        historical: historicalClaims.length,
        superseded: supersededClaims.length,
        conflicting: conflictingClaims.length
      }
    };
  }
}

// Global Singleton Repository instance
export const CLAIMS_REPOSITORY = new FinancingClaimsRepository();
