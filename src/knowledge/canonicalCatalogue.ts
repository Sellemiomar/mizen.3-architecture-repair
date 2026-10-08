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
    website: 'https://www.bts.com.tn',
    officialDomain: 'bts.com.tn',
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
        url: 'https://www.bts.com.tn/produits-et-services/credits-dinvestissement/',
        title: 'Conditions d\'octroi des crédits BTS',
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
        url: 'https://www.sotugar.com.tn/mecanismes-de-garantie/',
        title: 'Barème et mécanismes de garantie SOTUGAR',
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
        url: 'https://www.bhbank.tn/particuliers/simulateur-de-credit',
        title: 'Simulateur officiel de crédit BH Bank',
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
        url: 'https://www.tlf.com.tn/simulateur-leasing',
        title: 'Simulateur officiel de leasing TLF',
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
        url: 'https://www.banquezitouna.com/fr/financement-entreprises/mourabaha-equipement',
        title: 'Conditions Mourabaha Entreprises Zitouna',
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
      amount: { min: 50000, max: 2500000, currency: 'TND' },
      projectCost: { min: 150000, max: 15000000, currency: 'TND' },
      durationMonths: { min: 36, max: 120, currency: 'MONTHS' },
      contributionPercentage: { min: 20, max: 35, currency: 'PERCENT' },
      rate: {
        type: 'TMM_PLUS_MARGIN',
        margin: 0.03,
        referenceIndex: 'TMM',
        currency: 'PERCENT',
        explanation: {
          fr: 'Marge commerciale publiée de 2 à 4,5 points (relation exacte avec TMM et tarification effective à confirmer par votre agence).',
          ar: 'هامش تجاري منشور بين 2 و 4.5 نقطة مئوية (العلاقة الدقيقة مع TMM والشروط النهائية تحدد مع الفرع).'
        }
      },
      gracePeriodMonths: { min: 12, max: 36, currency: 'MONTHS' },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'contributionPercentage', status: 'VERIFIED', sourceIds: ['src_bfpme_official'] },
        { field: 'rate', status: 'PARTIALLY_VERIFIED', sourceIds: ['src_bfpme_official'], notes: { fr: 'Marge exacte déterminée selon le profil de risque en comité', ar: 'الهامش البنكي الدقيق يحدد في لجنة التمويل' } }
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
        mandatory: true
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

  // 2. BTS Diplômés
  {
    id: 'bts_diplomes',
    providerId: 'bts',
    name: {
      fr: 'Crédit BTS Diplômés de l\'Enseignement Supérieur',
      ar: 'قرض البنك التونسي للتضامن لحاملي الشهادات العليا',
      en: 'BTS Higher Education Graduates Loan'
    },
    shortDescription: {
      fr: 'Crédit à taux d\'intérêt bonifié sans exigence de garanties lourdes pour diplômés créant leur entreprise.',
      ar: 'قرض بنسبة فائدة ميسرة ودون ضمانات عينية معقدة لحاملي الشهادات العليا.',
      en: 'Subsidized loan for university and higher technical graduates with zero heavy collateral requirement.'
    },
    category: 'STARTUP',
    financingDomains: ['STARTUP', 'EQUIPMENT', 'AGRICULTURE', 'BUSINESS'],
    financingPurposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE', 'WORKING_CAPITAL', 'AGRICULTURE'],
    applicantTypes: ['INDIVIDUAL', 'STARTUP', 'LIBERAL_PROFESSION', 'MICRO_ENTERPRISE'],
    applicability: {
      domains: ['STARTUP', 'EQUIPMENT', 'AGRICULTURE', 'BUSINESS'],
      purposes: ['BUSINESS_CREATION', 'EQUIPMENT_PURCHASE', 'WORKING_CAPITAL', 'AGRICULTURE'],
      applicantTypes: ['INDIVIDUAL', 'STARTUP', 'LIBERAL_PROFESSION', 'MICRO_ENTERPRISE'],
      requiresHigherEducationDegree: true,
      allowedBusinessStages: ['idea_project', 'creation_underway', 'established_under_2y']
    },
    criteria: [
      {
        id: 'crit_bts_degree',
        field: 'hasHigherEducationDegree',
        operator: 'EQ',
        expectedValue: true,
        critical: true,
        description: {
          fr: 'Diplôme de l\'enseignement supérieur (Licence, Master, Ingénieur) ou BTP/BTS homologué requis',
          ar: 'شهادة جامعية (إجازة، ماجستير، مهندس) أو مؤهل تقني سامي معترف به'
        }
      },
      {
        id: 'crit_bts_amount_cap',
        field: 'financingRequested',
        operator: 'LTE',
        expectedValue: 150000,
        critical: true,
        description: {
          fr: 'Plafond réglementaire d\'intervention BTS fixé à 150 000 TND pour les diplômés',
          ar: 'سقف التمويل الأقصى محدد بـ 150 ألف دينار لحاملي الشهادات العليا'
        }
      }
    ],
    financialTerms: {
      amount: { min: 5000, max: 150000, currency: 'TND' },
      projectCost: { min: 5000, max: 200000, currency: 'TND' },
      durationMonths: { min: 24, max: 84, currency: 'MONTHS' },
      contributionPercentage: { min: 0, max: 10, currency: 'PERCENT' },
      rate: {
        type: 'INTEREST_FREE_SUBSIDIZED',
        value: 0.05, // 5% subsidized fixed rate under state decree
        currency: 'PERCENT',
        explanation: {
          fr: 'Taux bonifié par l\'État tunisien fixé à 5% l\'an sans commissions cachées.',
          ar: 'نسبة فائدة تفاضلية مدعمة من الدولة محددة بـ 5% سنوياً دون عمولات إضافية.'
        }
      },
      gracePeriodMonths: { min: 6, max: 18, currency: 'MONTHS' },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'contributionPercentage', status: 'VERIFIED', sourceIds: ['src_bts_official'] }
      ]
    },
    requiredDocuments: [
      { id: 'doc_diploma', category: 'LEGAL', name: { fr: 'Copie conforme du diplôme universitaire', ar: 'نسخة مطابقة للأصل من الشهادة الجامعية' }, mandatory: true },
      { id: 'doc_bp', category: 'PROJECT_PROFORMA', name: { fr: 'Fiche descriptive du projet & Devis d\'équipement', ar: 'بطاقة وصف المشروع وفواتير تقديرية' }, mandatory: true },
      { id: 'doc_cin', category: 'IDENTITY', name: { fr: 'Copie CIN du promoteur', ar: 'نسخة من بطاقة التعريف الوطنية' }, mandatory: true }
    ],
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'amount', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_bts_official'] },
        { field: 'criteria', status: 'VERIFIED', sourceIds: ['src_bts_official'] }
      ],
      lastVerifiedAt: '2026-09-20'
    },
    sources: [
      {
        id: 'src_bts_official',
        url: 'https://www.bts.com.tn/produits-et-services/credits-dinvestissement/',
        title: 'Guide BTS Crédits Diplômés',
        publisher: 'BTS',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-09-20',
        evidenceStatus: 'VERIFIED'
      }
    ],
    status: 'ACTIVE'
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
        expectedValue: 250000,
        critical: true,
        description: {
          fr: 'Prix d\'acquisition du logement neuf plafonné à 250 000 TND selon barème réglementaire',
          ar: 'ثمن المسكن الجديد لا يتجاوز سقف 250 ألف دينار'
        }
      }
    ],
    financialTerms: {
      amount: { min: 10000, max: 50000, currency: 'TND' }, // Covers 20% own contribution
      projectCost: { min: 80000, max: 250000, currency: 'TND' },
      durationMonths: { min: 180, max: 240, currency: 'MONTHS' }, // 15 to 20 years
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
    simulator: {
      id: 'sim_bh_housing',
      providerId: 'bh_bank',
      url: 'https://www.bhbank.tn/particuliers/simulateur-de-credit',
      simulatorType: 'MORTGAGE',
      official: true,
      evidence: {
        id: 'src_bh_simulator',
        url: 'https://www.bhbank.tn/particuliers/simulateur-de-credit',
        publisher: 'BH Bank',
        sourceType: 'OFFICIAL_SIMULATOR',
        retrievedAt: '2026-09-25',
        evidenceStatus: 'VERIFIED'
      }
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'rate', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] },
        { field: 'gracePeriodMonths', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] },
        { field: 'caps', status: 'VERIFIED', sourceIds: ['src_premier_logement_jort'] }
      ],
      lastVerifiedAt: '2026-09-20'
    },
    sources: [
      {
        id: 'src_premier_logement_jort',
        url: 'http://www.legislation.tn/detailtexte/Decret-Gouvernemental-num-2017-278',
        title: 'Décret gouvernemental n° 2017-278 fixant les conditions du Premier Logement',
        publisher: 'JORT / Ministère de l\'Équipement',
        sourceType: 'OFFICIAL_REGULATION',
        retrievedAt: '2026-09-20',
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
    criteria: [
      {
        id: 'crit_car_min_contribution',
        field: 'userContribution',
        operator: 'GTE',
        expectedValue: 20, // 20% minimum under BCT guidelines
        critical: true,
        description: {
          fr: 'Apport personnel minimum de 20% à 40% selon puissance fiscale et nature du véhicule (circulaire BCT)',
          ar: 'تمويل ذاتي لا يقل عن 20% إلى 40% حسب القوة الجبائية للسيارة (منشور البنك المركزي)'
        }
      }
    ],
    financialTerms: {
      amount: { min: 5000, max: 100000, currency: 'TND' },
      durationMonths: { min: 12, max: 84, currency: 'MONTHS' },
      contributionPercentage: { min: 20, max: 40, currency: 'PERCENT' },
      rate: {
        type: 'TMM_PLUS_MARGIN',
        margin: 0.035, // Market spread ~3.5% over TMM
        referenceIndex: 'TMM',
        currency: 'PERCENT',
        explanation: {
          fr: 'Taux variable indexé sur le TMM (~7,99%) majoré d\'une marge commerciale de 3,0% à 4,5% selon le profil emprunteur.',
          ar: 'نسبة فائدة متغيرة مرتبطة بنسبة TMM مع هامش تجاري يتراوح بين 3.0% و 4.5% حسب تقييم الملف.'
        }
      },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_bh_simulator'] },
        { field: 'contributionPercentage', status: 'VERIFIED', sourceIds: ['src_bct_car_rules'] },
        { field: 'rate', status: 'PARTIALLY_VERIFIED', sourceIds: ['src_bh_simulator'], notes: { fr: 'Marge exacte négociée en agence', ar: 'الهامش الدقيق يخضع للتفاوض في الفرع' } }
      ]
    },
    simulator: {
      id: 'sim_car_bh',
      providerId: 'bh_bank',
      url: 'https://www.bhbank.tn/particuliers/simulateur-de-credit',
      simulatorType: 'CAR',
      official: true,
      evidence: {
        id: 'src_bh_simulator',
        url: 'https://www.bhbank.tn/particuliers/simulateur-de-credit',
        publisher: 'BH Bank',
        sourceType: 'OFFICIAL_SIMULATOR',
        retrievedAt: '2026-09-25',
        evidenceStatus: 'VERIFIED'
      }
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'bct_rules', status: 'VERIFIED', sourceIds: ['src_bct_car_rules'] },
        { field: 'rate', status: 'PARTIALLY_VERIFIED', sourceIds: ['src_bh_simulator'] }
      ],
      lastVerifiedAt: '2026-09-25'
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
      amount: { min: 10000, max: 300000, currency: 'TND' },
      durationMonths: { min: 24, max: 60, currency: 'MONTHS' },
      contributionPercentage: { min: 10, max: 30, currency: 'PERCENT' }, // First increased rent
      rate: {
        type: 'NEGOTIATED',
        currency: 'PERCENT',
        explanation: {
          fr: 'Loyer financier calculé selon la durée et le premier loyer majoré. Barème exact établi sur devis pro-forma.',
          ar: 'قسط إيجار مالي محدد حسب المدة والقسط الأول التمهيدي. العرض المالي الدقيق يصدر بناءً على الفاتورة التقديرية.'
        }
      },
      paymentStructure: 'LEASING_RENTAL',
      verification: [
        { field: 'durationMonths', status: 'VERIFIED', sourceIds: ['src_tlf_official'] },
        { field: 'rate', status: 'PARTIALLY_VERIFIED', sourceIds: ['src_tlf_official'], notes: { fr: 'Simulation en ligne indicative, offre contractuelle sur devis', ar: 'المحاكاة تأشيرية والعرض النهائي يصدر على الفاتورة' } }
      ]
    },
    simulator: {
      id: 'sim_leasing_tlf',
      providerId: 'tlf',
      url: 'https://www.tlf.com.tn/simulateur-leasing',
      simulatorType: 'LEASING',
      official: true,
      evidence: {
        id: 'src_tlf_official',
        url: 'https://www.tlf.com.tn/simulateur-leasing',
        publisher: 'Tunisie Leasing & Factoring',
        sourceType: 'OFFICIAL_SIMULATOR',
        retrievedAt: '2026-09-26',
        evidenceStatus: 'VERIFIED'
      }
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'simulator', status: 'VERIFIED', sourceIds: ['src_tlf_official'] },
        { field: 'terms', status: 'VERIFIED', sourceIds: ['src_tlf_official'] }
      ],
      lastVerifiedAt: '2026-09-26'
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
      fr: 'Mécanisme national de couverture des risques facilitant l\'octroi des crédits bancaires aux PME (couvre jusqu\'à 75% du risque de crédit, ne prête pas de fonds).',
      ar: 'آلية وطنية لتغطية المخاطر وتيسير حصول المؤسسات على قروض بنكية (تغطي حتى 75% من المخاطر وليست جهة إقراض مباشر).',
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
      amount: { min: 10000, max: 10000000, currency: 'TND' }, // Maximum guaranteeable volume
      guaranteeDetails: {
        coverageBasis: 'UNRECOVERABLE_AMOUNT',
        governorates: [
          'Kasserine', 'Sidi Bouzid', 'Gafsa', 'Kébili', 'Tataouine', 'Tozeur',
          'Siliana', 'Le Kef', 'Jendouba', 'Béja', 'Kairouan', 'Médenine', 'Gabès', 'Zaghouan'
        ]
      },
      rate: {
        type: 'NOT_APPLICABLE',
        explanation: {
          fr: 'La SOTUGAR ne facture pas d\'intérêts d\'emprunt mais une commission de garantie réglementée (généralement 0,5% à 1% flat sur l\'encours garanti).',
          ar: 'سوتوغار لا تتقاضى فوائد إقراض وإنما عمولة ضمان قانونية (عادة 0.5% إلى 1% على المبلغ المضمون).'
        }
      },
      fees: [
        {
          id: 'fee_sotugar_commission',
          name: { fr: 'Commission de garantie SOTUGAR', ar: 'عمولة الضمان سوتوغار' },
          type: 'PERCENTAGE',
          percentage: 0.0075, // 0.75%
          mandatory: true
        }
      ],
      paymentStructure: 'OTHER',
      verification: [
        { field: 'fees', status: 'VERIFIED', sourceIds: ['src_sotugar_official'] },
        { field: 'coverage', status: 'VERIFIED', sourceIds: ['src_sotugar_official'] }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'guarantee_terms', status: 'VERIFIED', sourceIds: ['src_sotugar_official'] }
      ],
      lastVerifiedAt: '2026-09-18'
    },
    sources: [
      {
        id: 'src_sotugar_official',
        url: 'https://www.sotugar.com.tn/mecanismes-de-garantie/',
        title: 'Mécanismes de garantie SOTUGAR',
        publisher: 'SOTUGAR',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-09-18',
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
      amount: { min: 12000, max: 36000, currency: 'TND' }, // 1000 to 3000 TND / month over 12 months
      rate: {
        type: 'INTEREST_FREE_SUBSIDIZED',
        value: 0,
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
      amount: { min: 5000, max: 2000000, currency: 'TND' },
      durationMonths: { min: 12, max: 84, currency: 'MONTHS' },
      contributionPercentage: { min: 10, max: 30, currency: 'PERCENT' }, // Hamish Jiddiyya (marge de sérieux)
      rate: {
        type: 'FIXED', // Sharia requirement: fixed profit rate agreed upfront
        margin: 0.03,
        referenceIndex: 'TMM_BENCHMARK',
        currency: 'PERCENT',
        explanation: {
          fr: 'Marge bénéficiaire contractuelle fixe sur le coût d\'acquisition du bien, arrêtée définitivement à la signature.',
          ar: 'هامش ربح معلوم ومحدد نهائياً عند إبرام العقد دون أي زيادة في حال التأخير.'
        }
      },
      paymentStructure: 'AMORTIZING_MONTHLY',
      verification: [
        { field: 'structure', status: 'VERIFIED', sourceIds: ['src_zitouna_mourabaha'] },
        { field: 'rate', status: 'PARTIALLY_VERIFIED', sourceIds: ['src_zitouna_mourabaha'], notes: { fr: 'Marge exacte fixée selon l\'étude du comité', ar: 'الهامش الدقيق يحدد في لجنة التمويل' } }
      ]
    },
    verification: {
      status: 'VERIFIED',
      fields: [
        { field: 'sharia_rules', status: 'VERIFIED', sourceIds: ['src_zitouna_mourabaha'] }
      ],
      lastVerifiedAt: '2026-09-21'
    },
    sources: [
      {
        id: 'src_zitouna_mourabaha',
        url: 'https://www.banquezitouna.com/fr/financement-entreprises/mourabaha-equipement',
        title: 'Guide Mourabaha Entreprises Banque Zitouna',
        publisher: 'Banque Zitouna',
        sourceType: 'OFFICIAL_PRODUCT_PAGE',
        retrievedAt: '2026-09-21',
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
      rate: {
        type: 'UNKNOWN',
        explanation: {
          fr: 'Taux et barèmes financiers détaillés non repris ici tant qu’ils ne sont pas vérifiés champ par champ.',
          ar: 'لا يتم عرض النسب والجداول المالية التفصيلية قبل التثبت منها خانة بخانة.'
        }
      },
      verification: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'constructionPurpose', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'incomeCap', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'financialTerms', status: 'UNVERIFIED', sourceIds: ['src_mehat_foprolos'], notes: { fr: 'Montants et taux détaillés non projetés sans preuve primaire exploitable.', ar: 'المبالغ والنسب التفصيلية غير مسقطة دون دليل أولي قابل للتحقق.' } }
      ]
    },
    verification: {
      status: 'PARTIALLY_VERIFIED',
      fields: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'constructionPurpose', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'incomeCap', status: 'VERIFIED', sourceIds: ['src_mehat_foprolos'] },
        { field: 'financialTerms', status: 'UNVERIFIED', sourceIds: ['src_mehat_foprolos'] }
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
      }
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
    category: 'PUBLIC_FUNDING',
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
      rate: {
        type: 'UNKNOWN',
        explanation: {
          fr: 'Structure financière et barèmes détaillés non projetés sans preuve actuelle suffisamment précise.',
          ar: 'لا يتم إسقاط الهيكلة المالية والجداول التفصيلية دون دليل حالي دقيق بما يكفي.'
        }
      },
      verification: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'industrialDevelopmentPurpose', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'financialTerms', status: 'UNVERIFIED', sourceIds: ['src_apii_foprodi'] }
      ]
    },
    verification: {
      status: 'PARTIALLY_VERIFIED',
      fields: [
        { field: 'programExistence', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'industrialDevelopmentPurpose', status: 'VERIFIED', sourceIds: ['src_apii_foprodi'] },
        { field: 'financialTerms', status: 'UNVERIFIED', sourceIds: ['src_apii_foprodi'] }
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
