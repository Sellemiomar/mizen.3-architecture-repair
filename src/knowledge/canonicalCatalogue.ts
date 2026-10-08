/**
 * Mizen - Canonical Financing Knowledge Catalogue
 * Normalized, source-backed repository of Tunisian financing providers, products, and mechanisms.
 */

import { 
  FinancingProvider, 
  FinancingProduct, 
  CatalogueMetadata,
  SourceReference 
} from '../types/knowledge';

export const CANONICAL_PROVIDERS: FinancingProvider[] = [
  {
    id: 'bfpme',
    name: 'Banque de Financement des Petites et Moyennes Entreprises',
    legalName: 'BFPME S.A.',
    acronym: 'BFPME',
    type: 'PUBLIC_BANK',
    website: 'https://www.bfpme.com.tn',
    officialDomain: 'bfpme.com.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Banque publique d\'investissement dédiée au co-financement et renforcement des fonds propres des PME en phase de création ou d\'extension.',
      ar: 'بنك عمومي استثماري مختص في تمويل إحداث وتوسعة المؤسسات الصغرى والمتوسطة مع البنوك الشريكة.',
      en: 'Public SME investment bank dedicated to co-financing and quasi-equity for Tunisian SMEs.'
    },
    sources: [
      {
        id: 'src_bfpme_official',
        url: 'https://www.bfpme.com.tn/fr/nos-produits/credit-dinvestissement',
        title: 'Guide des Crédits d\'Investissement BFPME',
        publisher: 'BFPME',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        publishedAt: '2024-01-15',
        retrievedAt: '2026-09-15',
        lastVerifiedAt: '2026-09-15',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-15'
  },
  {
    id: 'bts',
    name: 'Banque Tunisienne de Solidarité',
    legalName: 'Banque Tunisienne de Solidarité S.A.',
    acronym: 'BTS',
    type: 'PUBLIC_BANK',
    website: 'https://www.btsbank.net',
    officialDomain: 'btsbank.net',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Banque publique spécialisée dans le micro-financement et les crédits à taux préférentiel pour diplômés du supérieur et artisans.',
      ar: 'بنك عمومي مختص في تمويل حاملي الشهادات العليا وأصحاب الحرف والمشاريع الصغرى بشروط ميسرة.',
      en: 'Public development bank supporting graduates, artisans, and micro-entrepreneurs with subsidized rates.'
    },
    sources: [
      {
        id: 'src_bts_official',
        url: 'https://www.btsbank.net/solutions/produit/credit-professionnel-Mg',
        title: 'BTS — Crédit Professionnel',
        publisher: 'BTS',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        retrievedAt: '2026-09-20',
        lastVerifiedAt: '2026-09-20',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-20'
  },
  {
    id: 'sotugar',
    name: 'Société Tunisienne de Garantie',
    legalName: 'SOTUGAR S.A.',
    acronym: 'SOTUGAR',
    type: 'GUARANTEE_MECHANISM',
    website: 'https://www.sotugar.com.tn',
    officialDomain: 'sotugar.com.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Mécanisme public national de partage des risques et de garantie des crédits d\'investissement et d\'exploitation accordés aux PME (ne prête pas directement).',
      ar: 'مؤسسة عمومية وطنية متخصصة في ضمان القروض البنكية وتقاسم المخاطر مع البنوك (آلية ضمان وليست جهة إقراض مباشر).',
      en: 'National public guarantee institution facilitating bank lending to SMEs by covering default risk.'
    },
    sources: [
      {
        id: 'src_sotugar_official',
        url: 'https://sotugar.com.tn/garantie-des-credits-accordes-aux-pme/',
        title: 'SOTUGAR — Garantie des crédits accordés aux PME',
        publisher: 'SOTUGAR',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        retrievedAt: '2026-09-18',
        lastVerifiedAt: '2026-09-18',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-18'
  },
  {
    id: 'aneti',
    name: 'Agence Nationale pour l\'Emploi et le Travail Indépendant',
    legalName: 'ANETI',
    acronym: 'ANETI',
    type: 'PUBLIC_FUNDING_AGENCY',
    website: 'https://www.aneti.tn',
    officialDomain: 'aneti.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Agence publique d\'accompagnement et d\'incitation à l\'auto-emploi accordant des bourses de démarrage et primes d\'étude (Chèque Entreprendre).',
      ar: 'وكالة عمومية تعنى بمرافقة وتأطير الباعثين الشبان وإسناد صكوك المرافقة ومنح دراسة الجدوى.',
      en: 'Public national agency for employment and self-employment promotion.'
    },
    sources: [
      {
        id: 'src_aneti_official',
        url: 'https://www.aneti.tn/fr/services/cheque-entreprendre',
        title: 'Guide du Chèque Entreprendre ANETI',
        publisher: 'ANETI',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        retrievedAt: '2026-09-22',
        lastVerifiedAt: '2026-09-22',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-22'
  },
  {
    id: 'mehat',
    name: 'Ministère de l\'Équipement et de l\'Habitat',
    legalName: 'Ministère de l\'Équipement et de l\'Habitat',
    acronym: 'MEHAT',
    type: 'PUBLIC_FUNDING_AGENCY',
    website: 'https://www.mehat.gov.tn',
    officialDomain: 'mehat.gov.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Ministère de tutelle du FOPROLOS et des dispositifs publics de financement du logement des salariés.',
      ar: 'وزارة الإشراف على صندوق النهوض بالمسكن لفائدة الأجراء وبرامج السكن العمومية.',
      en: 'Government ministry overseeing FOPROLOS and public housing-finance mechanisms for employees.'
    },
    sources: [
      {
        id: 'src_mehat_foprolos',
        url: 'https://www.mehat.gov.tn/fr/principaux-secteurs/habitat/programmes-projets/foprolos/',
        title: 'FOPROLOS — Ministère de l\'Équipement et de l\'Habitat',
        publisher: 'Ministère de l\'Équipement et de l\'Habitat',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        retrievedAt: '2026-10-08',
        lastVerifiedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-10-08'
  },
  {
    id: 'apii',
    name: 'Agence de Promotion de l\'Industrie et de l\'Innovation',
    legalName: 'Agence de Promotion de l\'Industrie et de l\'Innovation',
    acronym: 'APII',
    type: 'PUBLIC_FUNDING_AGENCY',
    website: 'https://www.tunisieindustrie.nat.tn',
    officialDomain: 'tunisieindustrie.nat.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Agence publique chargée notamment de l\'information, de l\'accompagnement et de la gestion des dispositifs d\'incitation industrielle tels que le FOPRODI.',
      ar: 'وكالة عمومية تعنى بالتنمية الصناعية والابتكار وإدارة آليات التحفيز مثل فوبرودي.',
      en: 'Public agency supporting industrial development and administering incentive mechanisms including FOPRODI.'
    },
    sources: [
      {
        id: 'src_apii_foprodi',
        url: 'https://www.tunisieindustrie.nat.tn/en/doc.asp?mcat=12&mrub=208',
        title: 'Granting and release of financial benefits — FOPRODI',
        publisher: 'APII',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'en',
        retrievedAt: '2026-10-08',
        lastVerifiedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-10-08'
  },
  {
    id: 'bh_bank',
    name: 'BH Bank',
    legalName: 'BH Bank S.A. (ex-Banque de l\'Habitat)',
    acronym: 'BH Bank',
    type: 'BANK',
    website: 'https://www.bhbank.tn',
    officialDomain: 'bhbank.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Banque universelle leader historique du financement de l\'habitat, de l\'immobilier et des crédits aux particuliers et entreprises en Tunisie.',
      ar: 'بنك شمولي رائد في تمويل السكن والعقارات والقروض الاستهلاكية والمهنية بتونس.',
      en: 'Leading Tunisian universal bank specialized in real estate, housing schemes, and retail banking.'
    },
    sources: [
      {
        id: 'src_bh_simulator',
        url: 'https://bhbank.tn/credit_bh_auto',
        title: 'BH Bank — BH AUTO',
        publisher: 'BH Bank',
        sourceType: 'OFFICIAL_SIMULATOR',
        language: 'fr',
        retrievedAt: '2026-09-25',
        lastVerifiedAt: '2026-09-25',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-25'
  },
  {
    id: 'tlf',
    name: 'Tunisie Leasing & Factoring',
    legalName: 'Tunisie Leasing & Factoring S.A.',
    acronym: 'TLF',
    type: 'LEASING_COMPANY',
    website: 'https://www.tlf.com.tn',
    officialDomain: 'tlf.com.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Établissement financier pionnier du leasing mobilier, immobilier et du factoring pour véhicules professionnels et équipements de production.',
      ar: 'مؤسسة مالية رائدة في الإيجار المالي للعربات المهنية والمعدات الصناعية والطبية.',
      en: 'Pioneer leasing company in Tunisia for commercial vehicles, equipment, and real estate leasing.'
    },
    sources: [
      {
        id: 'src_tlf_official',
        url: 'https://www.tlf.com.tn/site/fr/conditions-financieres.316.html',
        title: 'TLF — Conditions financières du leasing',
        publisher: 'TLF',
        sourceType: 'OFFICIAL_SIMULATOR',
        language: 'fr',
        retrievedAt: '2026-09-26',
        lastVerifiedAt: '2026-09-26',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-26'
  },
  {
    id: 'banque_zitouna',
    name: 'Banque Zitouna',
    legalName: 'Banque Zitouna S.A.',
    acronym: 'Zitouna',
    type: 'ISLAMIC_BANK',
    website: 'https://www.banquezitouna.com',
    officialDomain: 'banquezitouna.com',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Première banque islamique commerciale en Tunisie opérant sous les contrats de la finance islamique (Mourabaha, Ijara, Istisna\'a).',
      ar: 'أول مصرف إسلامي تجاري في تونس يقدم حلول تمويل مطابقة للضوابط الشرعية (مرابحة، إجارة، استصناع).',
      en: 'Leading Islamic commercial bank offering Sharia-compliant retail and corporate financing solutions.'
    },
    sources: [
      {
        id: 'src_zitouna_mourabaha',
        url: 'https://www.banquezitouna.com/fr/business/financer-mon-activite/developper-mon-activite/tamouil-mouaddet-mehnia',
        title: 'Banque Zitouna — Tamouil Mouaddet Mehnia',
        publisher: 'Banque Zitouna',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        retrievedAt: '2026-09-21',
        lastVerifiedAt: '2026-09-21',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-21'
  },
  {
    id: 'enda_tamweel',
    name: 'Enda Tamweel',
    legalName: 'Enda Tamweel S.A.',
    acronym: 'Enda',
    type: 'MICROFINANCE',
    website: 'https://www.endatamweel.tn',
    officialDomain: 'endatamweel.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Institution de microfinance leader en Tunisie offrant des microcrédits rapides pour petits commerces, artisans, agriculteurs et micro-entreprises.',
      ar: 'مؤسسة التمويل الصغير الرائدة بتونس لإسناد القروض الموجهة للمشاريع الصغرى والحرفيين.',
      en: 'Leading Tunisian microfinance institution providing microcredits for small businesses and artisans.'
    },
    sources: [
      {
        id: 'src_enda_official',
        url: 'https://www.endatamweel.tn/nos-credits-professionnels/',
        title: 'Produits de microcrédit professionnel Enda',
        publisher: 'Enda Tamweel',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'fr',
        retrievedAt: '2026-09-20',
        lastVerifiedAt: '2026-09-20',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-20'
  },
  {
    id: 'smart_capital',
    name: 'Smart Capital (Startup Act)',
    legalName: 'Smart Capital S.A.S.',
    acronym: 'Smart Capital',
    type: 'PUBLIC_FUNDING_AGENCY',
    website: 'https://startup.gov.tn',
    officialDomain: 'startup.gov.tn',
    country: 'TN',
    active: true,
    status: 'VERIFIED',
    description: {
      fr: 'Opérateur public mandaté pour la mise en œuvre du cadre légal Startup Act et la gestion du fonds de fonds ANAVA.',
      ar: 'الهيئة المشرفة على تفعيل قانون المؤسسات الناشئة ومنح علامة ومزايا الستارتاب في تونس.',
      en: 'Official operator of the Tunisian Startup Act framework and founder incentives.'
    },
    sources: [
      {
        id: 'src_startup_act_jort',
        url: 'https://startup.gov.tn/fr/startup-act/avantages',
        title: 'Loi n° 2018-20 relative aux Startups (Startup Act)',
        publisher: 'JORT / Ministère des TIC',
        sourceType: 'OFFICIAL_REGULATION',
        language: 'fr',
        retrievedAt: '2026-09-20',
        lastVerifiedAt: '2026-09-20',
        evidenceStatus: 'VERIFIED'
      }
    ],
    lastVerifiedAt: '2026-09-20'
  }
];

export const CANONICAL_PRODUCTS: FinancingProduct[] = [
  // 1. BFPME Création
  {
    id: 'bfpme_creation',
    providerId: 'bfpme',
    name: {
      fr: 'Crédit d\'Investissement Création PME',
      ar: 'قرض استثمار إحداث مؤسسة صغرى ومتوسطة',
      en: 'SME Creation Investment Loan'
    },
    shortDescription: {
      fr: 'Co-financement à moyen et long terme pour la création de projets industriels, technologiques et de services.',
      ar: 'تمويل مشترك متوسط وطويل المدى لإحداث مشاريع صناعية وتكنولوجية وخدمية.',
      en: 'Medium and long term co-financing for industrial and tech SME creation.'
    },
    category: 'STARTUP',
    financingDomains: ['STARTUP', 'BUSINESS', 'EQUIPMENT'],
    financingPurposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE', 'BUSINESS_EXPANSION'],
    applicantTypes: ['STARTUP', 'BUSINESS', 'LIBERAL_PROFESSION'],
    applicability: {
      domains: ['STARTUP', 'BUSINESS', 'EQUIPMENT'],
      purposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE', 'BUSINESS_EXPANSION'],
      applicantTypes: ['STARTUP', 'BUSINESS', 'LIBERAL_PROFESSION'],
      requiresBusinessEntity: true,
      allowedSectors: ['industry', 'services', 'ict_tech', 'renewable_energy', 'crafts_trades', 'agriculture_agribusiness'],
      allowedBusinessStages: ['idea_project', 'creation_underway', 'established_under_2y']
    },
    criteria: [
      {
        id: 'crit_bfpme_creation_amount',
        field: 'financingRequested',
        operator: 'LTE',
        expectedValue: 2500000,
        critical: true,
        description: {
          fr: 'Montant de crédit CMLT BFPME plafonné à 2 500 000 TND (dans la limite de 65% du coût total)',
          ar: 'سقف تمويل CMLT يصل إلى 2.5 مليون دينار (في حدود 65% من كلفة الاستثمار)'
        }
      },
      {
        id: 'crit_bfpme_creation_min_cost',
        field: 'totalProjectCost',
        operator: 'GTE',
        expectedValue: 150000,
        critical: true,
        description: {
          fr: 'Coût d\'investissement total minimum de 150 000 TND pour éligibilité CMLT',
          ar: 'الكلفة الاستثمارية الجملية لا تقل عن 150 ألف دينار'
        }
      }
    ],
    financialTerms: {
      amount: { max: 2500000, currency: 'TND' },
      projectCost: { min: 150000, max: 15000000, currency: 'TND' },
      rate: {
        type: 'UNKNOWN',
        currency: 'PERCENT',
        explanation: {
          fr: 'La page BFPME publie une marge de 2 à 4,5 points selon les conditions. La relation exacte avec le TMM et la tarification applicable au dossier restent à confirmer; aucune simulation automatique de taux n’est effectuée.',
          ar: 'هامش منشور من 2 إلى 4.5 نقاط؛ العلاقة الدقيقة مع TMM غير مثبتة. لا يتم عرض المدة والمساهمة وفترة الإمهال وهيكلة السداد دون دليل حالي دقيق.'
        }
      },
      verification: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'contributionPercentage', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'rate', status: 'UNKNOWN', sourceIds: ['src_bfpme_official'], notes: { fr: 'Marge exacte déterminée selon le profil de risque en comité', ar: 'الهامش البنكي الدقيق يحدد في لجنة التمويل' } }
      ]
    },
    guarantees: [
      {
        id: 'guar_sotugar',
        type: 'STATE_GUARANTEE_SOTUGAR',
        description: {
          fr: 'Couverture par le fonds de garantie SOTUGAR jusqu\'à 75% du risque.',
          ar: 'تغطية صندوق الضمان سوتوغار بنسبة تصل إلى 75% من المخاطر.'
        },
        mandatory: false
      }
    ],
    requiredDocuments: [
      { id: 'doc_bp', category: 'PROJECT_PROFORMA', name: { fr: 'Étude technico-économique & Business Plan', ar: 'دراسة الجدوى الفنية والاقتصادية' }, mandatory: true },
      { id: 'doc_proforma', category: 'PROJECT_PROFORMA', name: { fr: 'Devis pro-forma récents des équipements', ar: 'فواتير تقديرية حديثة للمعدات' }, mandatory: true },
      { id: 'doc_rne', category: 'LEGAL', name: { fr: 'Statuts de la société et extrait RNE récent', ar: 'القانون الأساسي للشركة ومضمون السجل الوطني للمؤسسات' }, mandatory: true }
    ],
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'rate', status: 'PARTIALLY_VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'eligibility', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] }
      ],
      lastVerifiedAt: '2026-09-15'
    },
    sources: [
      {
        id: 'src_bfpme_official',
        url: 'https://www.bfpme.com.tn/fr/nos-produits/credit-dinvestissement',
        title: 'Guide BFPME Crédit Création',
        publisher: 'BFPME',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-09-15',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },

  // 2. BTS — Crédit Professionnel (current official product)
  {
    id: 'bts_diplomes',
    providerId: 'bts',
    name: { fr: 'BTS — Crédit Professionnel', ar: 'البنك التونسي للتضامن — القرض المهني', en: 'BTS Professional Credit' },
    shortDescription: {
      fr: 'Crédit professionnel pour créer, développer ou moderniser une activité, avec financement pouvant atteindre 90% du coût du projet.',
      ar: 'قرض مهني لإحداث أو تطوير أو تحديث النشاط مع تمويل يصل إلى 90% من كلفة المشروع.',
      en: 'Professional credit for creating, developing or modernizing an activity, financing up to 90% of project cost.'
    },
    category: 'BUSINESS',
    financingDomains: ['BUSINESS', 'EQUIPMENT', 'MICROFINANCE'],
    financingPurposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE', 'WORKING_CAPITAL', 'BUSINESS_EXPANSION'],
    applicantTypes: ['INDIVIDUAL', 'BUSINESS', 'LIBERAL_PROFESSION', 'MICRO_ENTERPRISE'],
    applicability: {
      domains: ['BUSINESS', 'EQUIPMENT', 'MICROFINANCE'],
      purposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE', 'WORKING_CAPITAL', 'BUSINESS_EXPANSION'],
      applicantTypes: ['INDIVIDUAL', 'BUSINESS', 'LIBERAL_PROFESSION', 'MICRO_ENTERPRISE'],
      allowedBusinessStages: ['idea_project', 'creation_underway', 'established_under_2y', 'established_over_2y']
    },
    criteria: [{
      id: 'crit_bts_age',
      field: 'applicantAge',
      operator: 'BETWEEN',
      expectedValue: [20, 60],
      critical: true,
      description: { fr: 'Âge de 20 à 60 ans selon la page officielle du Crédit Professionnel BTS.', ar: 'العمر من 20 إلى 60 سنة وفق الصفحة الرسمية للقرض المهني.' }
    }],
    financialTerms: {
      amount: { max: 200000, currency: 'TND' },
      projectCost: { max: 200000, currency: 'TND' },
      durationMonths: { max: 84, currency: 'MONTHS' },
      maxFinancingPercentage: 90,
      rate: {
        type: 'FIXED',
        explanation: {
          fr: 'Taux d’intérêt fixe annoncé par BTS; le taux numérique n’est pas publié sur la fiche actuelle et reste UNKNOWN.',
          ar: 'نسبة فائدة ثابتة معلنة من BTS؛ النسبة الرقمية غير منشورة في البطاقة الحالية وتبقى غير معلومة.'
        }
      },
      gracePeriodMonths: { min: 3, max: 12, currency: 'MONTHS' },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'maxAmount', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'maxFinancingPercentage', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'gracePeriodMonths', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'rateType', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'rate', status: 'UNKNOWN', sourceIds: ['src_bts_official'], unknownReason: 'Current official page states a fixed rate but does not publish the numeric rate.' },
        { field: 'fees', status: 'VERIFIED', sourceIds: ['src_bts_official'] }
      ]
    },
    guarantees: [{
      id: 'guar_bts_no_real',
      type: 'NONE',
      description: { fr: 'Aucune garantie réelle exigée selon la fiche actuelle.', ar: 'لا يطلب ضمان عيني وفق البطاقة الحالية.' },
      mandatory: false
    }],
    requiredDocuments: [
      { id: 'doc_bts_business_plan', category: 'PROJECT_PROFORMA', name: { fr: 'Business plan et justificatifs du projet', ar: 'دراسة المشروع والوثائق المثبتة' }, mandatory: true }
    ],
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'currentProduct', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'financialTerms', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'numericRate', status: 'UNVERIFIED', sourceIds: ['src_bts_official'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [{
      id: 'src_bts_official',
      url: 'https://www.btsbank.net/solutions/produit/credit-professionnel-Mg',
      title: 'BTS — Crédit Professionnel',
      publisher: 'BTS Bank',
      sourceType: 'OFFICIAL_PRODUCT_PAGE',
      language: 'fr',
      retrievedAt: '2026-10-08',
      lastVerifiedAt: '2026-10-08',
      evidenceStatus: 'VERIFIED'
    }],
    status: 'ACTIVE',
    lastCheckedAt: '2026-10-08'
  },

  // 3. Premier Logement (Housing)
  {
    id: 'premier_logement',
    providerId: 'bh_bank',
    name: {
      fr: 'Programme Premier Logement (Crédit Autofinancement Bonifié)',
      ar: 'برنامج المسكن الأول (قرض التمويل الذاتي الميسر)',
      en: 'First Home Government Subsidized Scheme'
    },
    shortDescription: {
      fr: 'Dispositif d\'État accordant un crédit d\'autofinancement à 2% de taux d\'intérêt et 5 ans de différé pour l\'acquisition d\'un premier logement neuf.',
      ar: 'برنامج حكومي يمنح قرضاً لتغطية التمويل الذاتي بنسبة فائدة 2% وفترة إمهال 5 سنوات لاقتناء مسكن أول جديد.',
      en: 'State-subsidized scheme providing a 2% loan covering own-contribution with 5 years grace period.'
    },
    category: 'HOME',
    financingDomains: ['HOME'],
    financingPurposes: ['FIRST_HOME'],
    applicantTypes: ['INDIVIDUAL'],
    assetTypes: ['REAL_ESTATE'],
    applicability: {
      domains: ['HOME'],
      purposes: ['FIRST_HOME'],
      applicantTypes: ['INDIVIDUAL'],
      assetTypes: ['REAL_ESTATE'],
      isFirstPropertyOnly: true,
      allowedPropertyConditions: ['new']
    },
    criteria: [
      {
        id: 'crit_first_property',
        field: 'isFirstPropertyPurchase',
        operator: 'EQ',
        expectedValue: true,
        critical: true,
        description: {
          fr: 'Ne pas être déjà propriétaire d\'un logement (première acquisition résidentielle)',
          ar: 'عدم ملكية مسكن سابق (المسكن الأول للأسرة)'
        }
      },
      {
        id: 'crit_property_price_cap',
        field: 'totalProjectCost',
        operator: 'LTE',
        expectedValue: 220000,
        critical: true,
        description: {
          fr: 'Prix du logement plafonné à 220 000 TND selon la fiche actuelle Al Masken Al Awal',
          ar: 'ثمن المسكن لا يتجاوز سقف 220 ألف دينار وفق بطاقة المسكن الأول الحالية'
        }
      }
    ],
    financialTerms: {
      amount: { max: 40000, currency: 'TND' }, // Covers 20% own contribution
      projectCost: { max: 220000, currency: 'TND' },
      durationMonths: { max: 84, currency: 'MONTHS' }, // 7 years repayment after 5 years grace
      contributionPercentage: { min: 0, max: 0, currency: 'PERCENT' }, // The mechanism replaces own contribution
      rate: {
        type: 'FIXED',
        value: 0.02, // 2% fixed decree rate
        currency: 'PERCENT',
        explanation: {
          fr: 'Taux réglementaire bonifié fixé à 2% fixe l\'an sur les fonds de l\'État, avec 5 ans de différé initial.',
          ar: 'نسبة فائدة قانونية محددة بـ 2% قارة سنوياً على أموال الدولة مع 5 سنوات إمهال.'
        }
      },
      gracePeriodMonths: { min: 60, max: 60, currency: 'MONTHS' }, // 5 years grace
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] },
        { field: 'gracePeriodMonths', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] },
        { field: 'projectCost', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] },
        { field: 'gracePeriodMonths', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] },
        { field: 'caps', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
        id: 'src_premier_logement_jort',
        url: 'https://www.bhbank.tn/le-credit-masken-awal',
        title: 'BH Bank — Le Crédit Masken Awal',
        publisher: 'BH Bank',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },

  // 4. Crédit Automobile Classique (Car Financing)
  {
    id: 'banque_credit_auto',
    providerId: 'bh_bank',
    name: {
      fr: 'Crédit Automobile Particuliers',
      ar: 'قرض سيارة للأفراد',
      en: 'Conventional Retail Auto Loan'
    },
    shortDescription: {
      fr: 'Financement bancaire amortissable pour véhicule neuf ou d\'occasion avec apport personnel réglementaire.',
      ar: 'تمويل بنكي لاقتناء سيارة جديدة أو مستعملة مع شرط التمويل الذاتي القانوني.',
      en: 'Amortizing bank loan for new or used passenger vehicles.'
    },
    category: 'CAR',
    financingDomains: ['CAR'],
    financingPurposes: ['VEHICLE_PERSONAL'],
    applicantTypes: ['INDIVIDUAL'],
    assetTypes: ['VEHICLE_NEW', 'VEHICLE_USED'],
    applicability: {
      domains: ['CAR'],
      purposes: ['VEHICLE_PERSONAL'],
      applicantTypes: ['INDIVIDUAL'],
      assetTypes: ['VEHICLE_NEW', 'VEHICLE_USED'],
      allowedVehicleConditions: ['new', 'used']
    },
    criteria: [],
    financialTerms: {
      durationMonths: { max: 84, currency: 'MONTHS' },
      rate: {
        type: 'UNKNOWN',
        currency: 'PERCENT',
        explanation: {
          fr: 'La page officielle indique un taux avantageux sans publier de taux numérique ni de marge TMM. Aucun taux automatique n’est calculé.',
          ar: 'الصفحة الرسمية تذكر نسبة فائدة ملائمة دون نشر نسبة رقمية أو هامش مرتبط بـ TMM. لا يتم احتساب نسبة آلية.'
        }
      },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_bh_simulator'] },
        { field: 'rate', status: 'UNKNOWN', sourceIds: ['src_bh_simulator'], unknownReason: 'Current official page does not publish a numeric rate or margin.' }
      ]
    },
    simulator: {
      id: 'sim_car_bh',
      providerId: 'bh_bank',
      url: 'https://bhbank.tn/credit_bh_auto',
      simulatorType: 'CAR',
      official: true,
      evidence: {
        id: 'src_bh_simulator',
        url: 'https://bhbank.tn/credit_bh_auto',
        publisher: 'BH Bank',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'bct_rules', status: 'VERIFIED', sourceIds: ['src_bct_car_rules'] },
        { field: 'rate', status: 'UNKNOWN', sourceIds: ['src_bh_simulator'], unknownReason: 'Current official page does not publish a numeric rate or margin.' }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
        id: 'src_bct_car_rules',
        url: 'https://www.bct.gov.tn/bct/siteproc/circulaires.jsp',
        title: 'Circulaire BCT relative aux conditions de crédit à la consommation et acquisition de véhicules',
        publisher: 'Banque Centrale de Tunisie',
        sourceType: 'OFFICIAL_REGULATION',
        retrievedAt: '2026-09-20',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },

  // 5. Leasing Véhicule Professionnel (TLF)
  {
    id: 'leasing_vehicule_pro',
    providerId: 'tlf',
    name: {
      fr: 'Leasing Véhicule Utilitaire & Professionnel',
      ar: 'إيجار مالي للعربات النفعية والمهنية',
      en: 'Commercial Vehicle & Fleet Leasing'
    },
    shortDescription: {
      fr: 'Location avec option d\'achat pour véhicules utilitaires, camionnettes et flottes d\'entreprise avec déductibilité fiscale des loyers.',
      ar: 'إيجار مالي مع خيار الشراء للعربات التجارية والمهنية مع ميزات جبائية للأقساط.',
      en: 'Finance lease with purchase option for commercial vehicles and corporate fleets.'
    },
    category: 'LEASING',
    financingDomains: ['LEASING', 'CAR', 'EQUIPMENT'],
    financingPurposes: ['VEHICLE_PRO', 'EQUIPMENT_PURCHASE'],
    applicantTypes: ['BUSINESS', 'LIBERAL_PROFESSION', 'STARTUP', 'MICRO_ENTERPRISE', 'INDIVIDUAL'],
    assetTypes: ['VEHICLE_NEW', 'VEHICLE_USED'],
    applicability: {
      domains: ['LEASING', 'CAR', 'EQUIPMENT'],
      purposes: ['VEHICLE_PRO', 'EQUIPMENT_PURCHASE'],
      applicantTypes: ['BUSINESS', 'LIBERAL_PROFESSION', 'STARTUP', 'MICRO_ENTERPRISE', 'INDIVIDUAL'],
      allowedVehicleConditions: ['new', 'used']
    },
    criteria: [
      {
        id: 'crit_leasing_proforma',
        field: 'hasProformaInvoice',
        operator: 'EQ',
        expectedValue: true,
        critical: false,
        description: {
          fr: 'Présentation d\'un devis pro-forma émis par un concessionnaire ou vendeur agréé',
          ar: 'تقديم فاتورة تقديرية من وكيل سيارات أو بائع معتمد'
        }
      }
    ],
    financialTerms: {
      durationMonths: { min: 36, max: 60, currency: 'MONTHS' },
      rate: {
        type: 'FIXED',
        currency: 'PERCENT',
        explanation: {
          fr: 'TLF indique que le taux du contrat de leasing est fixe; aucun taux numérique n’est publié sur la page actuelle. Les véhicules légers sont financés généralement sur 3 à 5 ans.',
          ar: 'تذكر TLF أن نسبة عقد الإيجار المالي ثابتة؛ لا تنشر الصفحة الحالية نسبة رقمية. وتمول العربات الخفيفة عادة على 3 إلى 5 سنوات.'
        }
      },
      paymentStructure: 'LEASING_RENTAL',
      verification: [
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_tlf_official'] },
        { field: 'rateType', status: 'VERIFIED', sourceIds: ['src_tlf_official'] },
        { field: 'rate', status: 'UNKNOWN', sourceIds: ['src_tlf_official'], unknownReason: 'Current official page confirms fixed rate but does not publish the numeric rate.' }
      ]
    },
    simulator: {
      id: 'sim_leasing_tlf',
      providerId: 'tlf',
      url: 'https://www.tlf.com.tn/site/fr/conditions-financieres.316.html',
      simulatorType: 'LEASING',
      official: true,
      evidence: {
        id: 'src_tlf_official',
        url: 'https://www.tlf.com.tn/simulateur-leasing',
        publisher: 'Tunisie Leasing & Factoring',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'simulator', status: 'VERIFIED', sourceIds: ['src_tlf_official'] },
        { field: 'terms', status: 'VERIFIED', sourceIds: ['src_tlf_official'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
        id: 'src_tlf_official',
        url: 'https://www.tlf.com.tn/simulateur-leasing',
        title: 'Conditions officielles TLF Leasing Automobile Pro',
        publisher: 'TLF',
        sourceType: 'OFFICIAL_SIMULATOR',
        retrievedAt: '2026-09-26',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },

  // 6. SOTUGAR Guarantee (Guarantee Mechanism - NOT a direct loan)
  {
    id: 'sotugar_guarantee',
    providerId: 'sotugar',
    name: {
      fr: 'Garantie SOTUGAR Lignes Crédits & Investissement PME',
      ar: 'ضمان سوتوغار لقروض الاستثمار للمؤسسات الصغرى والمتوسطة',
      en: 'SOTUGAR National SME Loan Guarantee Scheme'
    },
    shortDescription: {
      fr: 'Mécanisme national de garantie facilitant l\'accès des PME au financement; SOTUGAR ne prête pas directement et la couverture dépend du mécanisme.',
      ar: 'آلية وطنية للضمان وتيسير التمويل؛ سوتوغار لا تمنح قروضا مباشرة وتختلف التغطية حسب الآلية.',
      en: 'Public guarantee mechanism covering up to 75% of bank credit default risk (not a direct lending fund).'
    },
    category: 'GUARANTEE',
    financingDomains: ['GUARANTEE', 'STARTUP', 'BUSINESS', 'EQUIPMENT', 'AGRICULTURE'],
    financingPurposes: ['BUSINESS_CREATION', 'BUSINESS_EXPANSION', 'EQUIPMENT_PURCHASE', 'WORKING_CAPITAL', 'INNOVATION_RD'],
    applicantTypes: ['STARTUP', 'BUSINESS', 'MICRO_ENTERPRISE', 'LIBERAL_PROFESSION'],
    applicability: {
      domains: ['GUARANTEE', 'STARTUP', 'BUSINESS', 'EQUIPMENT', 'AGRICULTURE'],
      purposes: ['BUSINESS_CREATION', 'BUSINESS_EXPANSION', 'EQUIPMENT_PURCHASE', 'WORKING_CAPITAL', 'INNOVATION_RD'],
      applicantTypes: ['STARTUP', 'BUSINESS', 'MICRO_ENTERPRISE', 'LIBERAL_PROFESSION'],
      requiresBusinessEntity: true
    },
    criteria: [
      {
        id: 'crit_sotugar_bank_coop',
        field: 'hasPartnerBankFiling',
        operator: 'REQUIRED',
        critical: true,
        description: {
          fr: 'Le dossier doit être instruit et transmis par une banque partenaire conventionnée avec la SOTUGAR',
          ar: 'يتم تقديم الملف وجوباً عن طريق بنك شريك متعاقد مع الشركة التونسية للضمان'
        }
      }
    ],
    financialTerms: {
      guaranteeDetails: {
        coveragePercentMin: 50,
        coveragePercentMax: 75,
        coverageBasis: 'UNRECOVERABLE_AMOUNT'
      },
      rate: {
        type: 'NOT_APPLICABLE',
        explanation: {
          fr: 'SOTUGAR ne prête pas directement. Dans le système de garantie PME documenté, la prise en charge varie selon le mécanisme: 75% pour certaines catégories éligibles, 60% pour les autres projets et 50% pour les opérations de leasing.',
          ar: 'سوتوغار لا تمنح قروضا مباشرة. في نظام ضمان المؤسسات الصغرى والمتوسطة الموثق تختلف التغطية حسب الآلية: 75% لبعض الفئات و60% للمشاريع الأخرى و50% لعمليات الإيجار المالي.'
        }
      },
      paymentStructure: 'OTHER',
      verification: [
        { field: 'coverage', status: 'VERIFIED', sourceIds: ['src_sotugar_official'] },
        { field: 'directLending', status: 'VERIFIED', sourceIds: ['src_sotugar_official'] },
        { field: 'fees', status: 'UNKNOWN', sourceIds: ['src_sotugar_official'], unknownReason: 'No generic current fee should be projected across guarantee mechanisms.' }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'guarantee_terms', status: 'VERIFIED', sourceIds: ['src_sotugar_official'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
        id: 'src_sotugar_official',
        url: 'https://sotugar.com.tn/garantie-des-credits-accordes-aux-pme/',
        title: 'SOTUGAR — Garantie des crédits accordés aux PME',
        publisher: 'SOTUGAR',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },

  // 7. Startup Act Bourse (Smart Capital)
  {
    id: 'startup_act_bourse',
    providerId: 'smart_capital',
    name: {
      fr: 'Bourse de Startup & Avantages Startup Act',
      ar: 'منحة التفرغ والامتيازات لقانون المؤسسات الناشئة',
      en: 'Startup Act Founder Stipend & Tax Shield'
    },
    shortDescription: {
      fr: 'Allocation mensuelle pour co-fondateurs labellisés (jusqu\'à 3 000 TND/mois pendant 1 an) et exonération de charges patronales.',
      ar: 'منحة شهرية لمؤسسي الشركات المتحصلة على علامة مؤسسة ناشئة (حتى 3000 د/شهرياً) وإعفاءات جبائية.',
      en: 'Monthly stipend up to 3,000 TND for labeled startup founders for 12 months.'
    },
    category: 'STARTUP',
    financingDomains: ['STARTUP', 'PUBLIC_FUNDING'],
    financingPurposes: ['BUSINESS_CREATION', 'INNOVATION_RD'],
    applicantTypes: ['STARTUP', 'INDIVIDUAL'],
    applicability: {
      domains: ['STARTUP', 'PUBLIC_FUNDING'],
      purposes: ['BUSINESS_CREATION', 'INNOVATION_RD'],
      applicantTypes: ['STARTUP', 'INDIVIDUAL'],
      requiresStartupActLabel: true,
      allowedBusinessStages: ['idea_project', 'creation_underway', 'established_under_2y']
    },
    criteria: [
      {
        id: 'crit_startup_label',
        field: 'hasStartupActLabel',
        operator: 'EQ',
        expectedValue: true,
        critical: true,
        description: {
          fr: 'Obtention préalable du label officiel accordé par le Collège des Startups',
          ar: 'الحصول المسبق على علامة مؤسسة ناشئة الرسمية من لجنة الستارتاب'
        }
      }
    ],
    financialTerms: {
      rate: {
        type: 'UNKNOWN',
        currency: 'PERCENT',
        explanation: {
          fr: 'Subvention directe non remboursable versée mensuellement aux fondateurs labellisés.',
          ar: 'منحة عمومية مباشرة غير مستردة تصرف شهرياً للمؤسسين.'
        }
      },
      paymentStructure: 'OTHER',
      verification: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_startup_act_jort'] },
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_startup_act_jort'] }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'decree', status: 'VERIFIED', sourceIds: ['src_startup_act_jort'] }
      ],
      lastVerifiedAt: '2026-09-20'
    },
    sources: [
      {
        id: 'src_startup_act_jort',
        url: 'https://startup.gov.tn/fr/startup-act/avantages',
        title: 'Avantages officiels du label Startup Act',
        publisher: 'Smart Capital / JORT',
        sourceType: 'OFFICIAL_REGULATION',
        retrievedAt: '2026-09-20',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },

  // 8. Banque Zitouna - Financement Mourabaha Équipements
  {
    id: 'banque_zitouna_mourabaha',
    providerId: 'banque_zitouna',
    name: {
      fr: 'Financement Mourabaha Équipements & Investissement',
      ar: 'تمويل مرابحة للتجهيزات والمعدات المهنية',
      en: 'Mourabaha Equipment & Business Assets Financing'
    },
    shortDescription: {
      fr: 'Achat par la banque des équipements et revente à terme au professionnel avec marge bénéficiaire convenue d\'avance.',
      ar: 'شراء البنك للتجهيزات وإعادة بيعها بالتقسيط للتاجر أو الباعث بهامش ربح متفق عليه مسبقاً دون فوائد ربوية.',
      en: 'Sharia-compliant cost-plus financing where the bank purchases the equipment and resells at fixed markup.'
    },
    category: 'ISLAMIC_FINANCE',
    financingDomains: ['ISLAMIC_FINANCE', 'EQUIPMENT', 'BUSINESS', 'CAR'],
    financingPurposes: ['EQUIPMENT_PURCHASE', 'VEHICLE_PRO', 'BUSINESS_EXPANSION', 'BUSINESS_CREATION'],
    applicantTypes: ['BUSINESS', 'LIBERAL_PROFESSION', 'STARTUP', 'MICRO_ENTERPRISE', 'INDIVIDUAL'],
    assetTypes: ['INDUSTRIAL_EQUIPMENT', 'VEHICLE_NEW', 'AGRICULTURAL_EQUIPMENT'],
    applicability: {
      domains: ['ISLAMIC_FINANCE', 'EQUIPMENT', 'BUSINESS', 'CAR'],
      purposes: ['EQUIPMENT_PURCHASE', 'VEHICLE_PRO', 'BUSINESS_EXPANSION', 'BUSINESS_CREATION'],
      applicantTypes: ['BUSINESS', 'LIBERAL_PROFESSION', 'STARTUP', 'MICRO_ENTERPRISE', 'INDIVIDUAL']
    },
    criteria: [
      {
        id: 'crit_mourabaha_halal',
        field: 'hasProformaInvoice',
        operator: 'REQUIRED',
        critical: true,
        description: {
          fr: 'Bien meuble identifiable avec facture pro-forma conforme aux normes de conformité Charia',
          ar: 'بضاعة أو تجهيزات محددة بفاتورة تقديرية مطابقة لضوابط الهيئة الشرعية'
        }
      }
    ],
    financialTerms: {
      rate: {
        type: 'UNKNOWN',
        currency: 'PERCENT',
        explanation: {
          fr: 'La marge bénéficiaire est fixée contractuellement; la page produit actuelle indique un financement pouvant atteindre 70% des besoins d’investissement, avec le reliquat en fonds propres.',
          ar: 'يحدد هامش الربح تعاقديا؛ وتذكر صفحة المنتج الحالية تمويلا يصل إلى 70% من احتياجات الاستثمار مع تغطية الباقي من الأموال الذاتية.'
        }
      },
      maxFinancingPercentage: 70,
      durationMonths: { max: 84, currency: 'MONTHS' },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'structure', status: 'VERIFIED', sourceIds: ['src_zitouna_mourabaha'] },
        { field: 'rate', status: 'UNKNOWN', sourceIds: ['src_zitouna_mourabaha'], unknownReason: 'Current product page confirms Mourabaha and the financing structure but does not publish a numeric margin.' }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'sharia_rules', status: 'VERIFIED', sourceIds: ['src_zitouna_mourabaha'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
        id: 'src_zitouna_mourabaha',
        url: 'https://www.banquezitouna.com/fr/business/financer-mon-activite/developper-mon-activite/tamouil-mouaddet-mehnia',
        title: 'Banque Zitouna — Tamouil Mouaddet Mehnia',
        publisher: 'Banque Zitouna',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
  },
  // 7. FOPROLOS — salaried housing finance
  {
    id: 'foprolos_construction',
    providerId: 'mehat',
    name: {
      fr: 'FOPROLOS — Construction de logement',
      ar: 'فوبرولوس — بناء مسكن',
      en: 'FOPROLOS — Home Construction'
    },
    shortDescription: {
      fr: 'Dispositif public de prêts et dons pour le logement des salariés, notamment la construction d’un logement principal.',
      ar: 'آلية عمومية في شكل قروض ومنح لفائدة الأجراء، ومنها تمويل بناء المسكن الرئيسي.',
      en: 'Public housing-finance mechanism providing loans and grants to eligible salaried employees, including home construction.'
    },
    category: 'PUBLIC_FUNDING',
    financingDomains: ['HOME', 'PUBLIC_FUNDING'],
    financingPurposes: ['HOME_CONSTRUCTION', 'FIRST_HOME'],
    applicantTypes: ['INDIVIDUAL'],
    assetTypes: ['REAL_ESTATE'],
    applicability: {
      domains: ['HOME', 'PUBLIC_FUNDING'],
      purposes: ['HOME_CONSTRUCTION', 'FIRST_HOME'],
      applicantTypes: ['INDIVIDUAL'],
      isFirstPropertyOnly: true
    },
    criteria: [
      {
        id: 'crit_foprolos_salaried',
        field: 'employmentStatus',
        operator: 'CUSTOM',
        expectedValue: 'SALARIED',
        critical: true,
        description: {
          fr: 'Réservé aux catégories de salariés répondant aux conditions légales du FOPROLOS.',
          ar: 'مخصص لفئات الأجراء المستوفين للشروط القانونية لفوبرولوس.'
        }
      },
      {
        id: 'crit_foprolos_income',
        field: 'monthlyGrossHouseholdIncomeSmigMultiple',
        operator: 'LTE',
        expectedValue: 'UNKNOWN',
        critical: true,
        description: {
          fr: 'Revenu mensuel brut du ménage ne dépassant pas six fois le SMIG selon la page officielle actuelle.',
          ar: 'الدخل الشهري الخام للأسرة لا يتجاوز ست مرات الأجر الأدنى المهني المضمون وفق الصفحة الرسمية الحالية.'
        }
      }
    ],
    financialTerms: {
      maxFinancingPercentage: 90,
      contributionPercentage: { min: 5, max: 12.5, currency: 'PERCENT' },
      durationMonths: { max: 300, currency: 'MONTHS' },
      gracePeriodMonths: { max: 24, currency: 'MONTHS' },
      rate: {
        type: 'FIXED',
        min: 0.01,
        max: 0.07,
        currency: 'PERCENT',
        explanation: {
          fr: 'Barème par catégorie de revenu FOPROLOS: 1%, 3%, 5% ou 7%. Le prêt peut couvrir jusqu’à 90% du coût; le montant maximal est exprimé à 300 fois le SMIG et ne doit pas être converti en plafond DT fixe sans SMIG applicable vérifié.',
          ar: 'نسب حسب فئة الدخل في فوبرولوس: 1% أو 3% أو 5% أو 7%. يمكن أن يصل القرض إلى 90% من الكلفة؛ السقف الأقصى يعادل 300 مرة الأجر الأدنى المهني المضمون ولا ينبغي تحويله إلى سقف ثابت بالدينار دون التثبت من قيمة SMIG المعمول بها.'
        }
      },
      verification: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'constructionPurpose', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'incomeCap', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'maxFinancingPercentage', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'contributionPercentage', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'gracePeriodMonths', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'financialTerms', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos', 'src_mehat_foprolos_flyer'] }
      ]
    },
    verification: {
      status: 'PARTIALLY_VERIFIED',
      fields: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'constructionPurpose', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'incomeCap', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'maxFinancingPercentage', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'contributionPercentage', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'gracePeriodMonths', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos_flyer'] },
        { field: 'financialTerms', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos', 'src_mehat_foprolos_flyer'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
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
      {
        id: 'src_mehat_foprolos_flyer',
        url: 'https://www.mehat.gov.tn/wp-content/uploads/2024/02/new-flyer-Foprolos-2-0-24-P2-2.pdf',
        title: 'FOPROLOS — Flyer officiel',
        publisher: 'Ministère de l’Équipement et de l’Habitat',
        sourceType: 'OFFICIAL_PDF',
        language: 'fr',
        retrievedAt: '2026-10-08',
        lastVerifiedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      },
    ],
    status: 'ACTIVE',
    lastCheckedAt: '2026-10-08'
  },

  // 8. FOPRODI — public industrial-development funding mechanism
  {
    id: 'foprodi_dotation',
    providerId: 'apii',
    name: {
      fr: 'FOPRODI — Fonds de Promotion et de Décentralisation Industrielle',
      ar: 'فوبرودي — صندوق النهوض باللامركزية الصناعية',
      en: 'FOPRODI — Industrial Development Fund'
    },
    shortDescription: {
      fr: 'Mécanisme public d’incitation et de financement pour la création et le développement de projets industriels et de services.',
      ar: 'آلية عمومية للتحفيز والتمويل موجهة لإحداث وتطوير المشاريع الصناعية والخدماتية.',
      en: 'Public incentive and financing mechanism supporting industrial and service project creation and development.'
    },
    category: 'QUASI_EQUITY',
    financingDomains: ['PUBLIC_FUNDING', 'BUSINESS', 'EQUIPMENT'],
    financingPurposes: ['BUSINESS_CREATION', 'BUSINESS_EXPANSION', 'EQUIPMENT_PURCHASE'],
    applicantTypes: ['BUSINESS', 'STARTUP', 'MICRO_ENTERPRISE'],
    applicability: {
      domains: ['PUBLIC_FUNDING', 'BUSINESS', 'EQUIPMENT'],
      purposes: ['BUSINESS_CREATION', 'BUSINESS_EXPANSION', 'EQUIPMENT_PURCHASE'],
      applicantTypes: ['BUSINESS', 'STARTUP', 'MICRO_ENTERPRISE']
    },
    criteria: [],
    financialTerms: {
      projectCost: { max: 500000, currency: 'TND' },
      durationMonths: { max: 144, currency: 'MONTHS' },
      gracePeriodMonths: { max: 60, currency: 'MONTHS' },
      rate: {
        type: 'FIXED',
        value: 0.03,
        currency: 'PERCENT',
        explanation: {
          fr: 'Pour la dotation remboursable: 3% par an sur 12 ans. avec 5 ans de délai de grâce.',
          ar: 'بالنسبة للـdotation القابلة للاسترجاع: 3% سنوياً لمدة 12 سنة. مع 5 سنوات إمهال.'
        }
      },
      quasiEquity: {
        instrument: 'REPAYABLE_DOTATION',
        projectCostThreshold: 500000,
        dotationMaxPercentOfMinimumCapital: 30,
        interpretation: 'MINIMUM_CAPITAL_NOT_TOTAL_PROJECT_COST'
      },
      verification: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'industrialDevelopmentPurpose', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'projectCostThreshold', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'repayableDotation', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'dotationMaxPercentOfMinimumCapital', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'repaymentDuration', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'interestRate', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'gracePeriod', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] }
      ]
    },
    verification: {
      status: 'PARTIALLY_VERIFIED',
      fields: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'industrialDevelopmentPurpose', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'financialTerms', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
        id: 'src_apii_foprodi',
        url: 'https://www.tunisieindustrie.nat.tn/en/doc.asp?mcat=12&mrub=208',
        title: 'Granting and release of financial benefits — FOPRODI',
        publisher: 'APII',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        language: 'en',
        retrievedAt: '2026-10-08',
        lastVerifiedAt: '2026-10-08',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE',
    lastCheckedAt: '2026-10-08'
  },

  // 9. Enda Bidaya — current microfinance creation product
  {
    id: 'enda_microcredit_equip',
    providerId: 'enda_tamweel',
    name: {
      fr: 'Crédit Bidaya — Enda Tamweel',
      ar: 'قرض بداية — أندا تمويل',
      en: 'Bidaya Microcredit — Enda Tamweel'
    },
    shortDescription: {
      fr: 'Microcrédit destiné aux jeunes entrepreneurs tunisiens pour la création ou le redémarrage d’une micro-entreprise.',
      ar: 'قرض تمويل صغير موجه للشباب التونسيين لإحداث أو إعادة إطلاق مؤسسة صغرى.',
      en: 'Microcredit for young Tunisian entrepreneurs creating or relaunching a micro-enterprise.'
    },
    category: 'MICROFINANCE',
    financingDomains: ['MICROFINANCE', 'BUSINESS', 'EQUIPMENT'],
    financingPurposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE'],
    applicantTypes: ['INDIVIDUAL', 'MICRO_ENTERPRISE', 'STARTUP'],
    applicability: {
      domains: ['MICROFINANCE', 'BUSINESS', 'EQUIPMENT'],
      purposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE'],
      applicantTypes: ['INDIVIDUAL', 'MICRO_ENTERPRISE', 'STARTUP'],
      allowedBusinessStages: ['idea_project', 'creation_underway']
    },
    criteria: [
      {
        id: 'crit_enda_bidaya_age',
        field: 'applicantAge',
        operator: 'BETWEEN',
        expectedValue: [18, 40],
        critical: true,
        description: {
          fr: 'Âge de 18 à 40 ans pour le Crédit Bidaya.',
          ar: 'العمر بين 18 و40 سنة لقرض بداية.'
        }
      }
    ],
    financialTerms: {
      amount: { min: 200, max: 40000, currency: 'TND' },
      durationMonths: { min: 1, max: 60, currency: 'MONTHS' },
      rate: {
        type: 'UNKNOWN',
        explanation: {
          fr: 'Tarification exacte non projetée comme taux fixe : elle dépend de l’offre et de l’étude du dossier.',
          ar: 'لا يتم اعتماد نسبة ثابتة محددة؛ التسعير يعتمد على العرض ودراسة الملف.'
        }
      },
      verification: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_enda_bidaya'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_enda_bidaya'] },
        { field: 'rate', status: 'UNVERIFIED', sourceIds: ['src_enda_bidaya'] }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_enda_bidaya'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_enda_bidaya'] },
        { field: 'rate', status: 'UNVERIFIED', sourceIds: ['src_enda_bidaya'] }
      ],
      lastVerifiedAt: '2026-10-08'
    },
    sources: [
      {
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
    ],
    status: 'ACTIVE',
    lastCheckedAt: '2026-10-08'
  }

];

export const CANONICAL_METADATA: CatalogueMetadata = {
  version: '3.4.0',
  generatedAt: '2026-10-02T06:00:00Z',
  lastRefreshAt: '2026-10-02T06:00:00Z',
  providerCount: CANONICAL_PROVIDERS.length,
  productCount: CANONICAL_PRODUCTS.length,
  sourceCount: CANONICAL_PROVIDERS.reduce((acc, p) => acc + p.sources.length, 0) +
               CANONICAL_PRODUCTS.reduce((acc, pr) => acc + pr.sources.length, 0),
  productsRequiringReview: CANONICAL_PRODUCTS.filter(p => p.verification?.status !== 'VERIFIED').length
};
