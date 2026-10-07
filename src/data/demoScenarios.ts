import { DemoScenario } from '../types/financing';

/**
 * 6 Realistic Synthetic Scenarios for Bank/Lender Pilot Demonstration
 * Cleanly marked with synthetic demo metadata across specialized journeys.
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo_first_home',
    number: 1,
    title: {
      fr: 'Cas 1 : Primo-accédant — Premier Logement',
      ar: 'الحالة 1 : مسكن أول — اقتناء شقة جديدة'
    },
    subtitle: {
      fr: 'Salarié du privé (30 ans) achetant un appartement neuf (S+2) à Ariana',
      ar: 'أجير بالقطاع الخاص (30 سنة) يقتني شقة جديدة بأريانة'
    },
    badge: {
      fr: 'Cas Démo Synthétique #1',
      ar: 'حالة تجريبية نموذجية 1'
    },
    targetInstitutions: ['BH Bank', 'MEHAT'],
    description: {
      fr: 'Projet d’acquisition d’un premier logement neuf d’une valeur de 180 000 DT avec un apport personnel de 36 000 DT (20%). Revenu net mensuel ménage : 2 200 DT (Tranche 1 500 – 2 500 DT).',
      ar: 'مشروع اقتناء مسكن أول جديد بقيمة 180 ألف دينار مع تمويل ذاتي 36 ألف د (20%). الدخل الشهري الصافي للأسرة 2200 د.'
    },
    profile: {
      journey: 'home_purchase',
      totalProjectCost: 180000,
      userContribution: 36000,
      financingRequested: 144000,
      purpose: 'first_home',
      location: 'Ariana',
      monthlyIncomeRange: '1500_2500',
      employmentStatus: 'salaried_private',
      propertyType: 'new_apartment',
      propertyCondition: 'new',
      isFirstPropertyPurchase: true,
      isPrincipalResidence: true,
      desiredTermYears: 20,
      applicantAge: 30,
      legalStructure: 'individual',
      isDemoCase: true,
      demoCaseId: 'demo_first_home',
      demoCaseTitle: {
        fr: 'Primo-accédant — Premier Logement (180k DT)',
        ar: 'اقتناء مسكن أول جديد (180 ألف د)'
      },
      projectDescription: 'Acquisition d’un appartement neuf S+2 à Ariana. Premier achat immobilier.'
    }
  },
  {
    id: 'demo_home_construction',
    number: 2,
    title: {
      fr: 'Cas 2 : Construction de maison individuelle',
      ar: 'الحالة 2 : بناء مسكن فردي على أرض خاصة'
    },
    subtitle: {
      fr: 'Salarié du secteur public (38 ans) avec terrain propre à Nabeul',
      ar: 'موظف بالقطاع العمومي (38 سنة) يملك قطعة أرض بنابل'
    },
    badge: {
      fr: 'Cas Démo Synthétique #2',
      ar: 'حالة تجريبية نموذجية 2'
    },
    targetInstitutions: ['BH Bank', 'FOPROLOS'],
    description: {
      fr: 'Construction d’une maison individuelle sur terrain propre titré à Nabeul. Coût des travaux : 120 000 DT, apport : 25 000 DT (~21%), besoin : 95 000 DT. Revenu net mensuel : 1 800 DT.',
      ar: 'بناء مسكن فردي على قطعة أرض مسجلة بنابل. كلفة الأشغال 120 ألف د، التمويل الذاتي 25 ألف د (~21%)، والحاجة 95 ألف د.'
    },
    profile: {
      journey: 'home_construction',
      totalProjectCost: 120000,
      userContribution: 25000,
      financingRequested: 95000,
      purpose: 'home_construction',
      constructionType: 'construction',
      hasLandOwnershipTitle: true,
      location: 'Nabeul',
      monthlyIncomeRange: '1500_2500',
      employmentStatus: 'salaried_public',
      propertyType: 'individual_house',
      isFirstPropertyPurchase: true,
      isPrincipalResidence: true,
      desiredTermYears: 15,
      applicantAge: 38,
      legalStructure: 'individual',
      isDemoCase: true,
      demoCaseId: 'demo_home_construction',
      demoCaseTitle: {
        fr: 'Construction maison individuelle (120k DT)',
        ar: 'بناء مسكن فردي بنابل (120 ألف د)'
      },
      projectDescription: 'Construction d’une maison individuelle sur terrain propre titré à Nabeul.'
    }
  },
  {
    id: 'demo_manufacturing',
    number: 3,
    title: {
      fr: 'Cas 3 : Création industrielle en ZDR',
      ar: 'الحالة 3 : إحداث وحدة صناعية بمنطقة تنمية جهوية'
    },
    subtitle: {
      fr: 'Ingénieur diplômé (34 ans) — Unité d’injection plastique à Zaghouan (ZDR)',
      ar: 'مهندس جامعي (34 سنة) — وحدة حقن البلاستيك بزغوان'
    },
    badge: {
      fr: 'Cas Démo Synthétique #3',
      ar: 'حالة تجريبية نموذجية 3'
    },
    targetInstitutions: ['BFPME', 'FOPRODI / APII', 'SOTUGAR'],
    description: {
      fr: 'Création d’une unité industrielle de composants plastiques techniques à Zaghouan. Budget total : 300 000 DT, apport : 60 000 DT (20%), financement demandé : 240 000 DT.',
      ar: 'إحداث مصنع لمكونات البلاستيك الصناعية بزغوان (منطقة تنمية جهوية). الكلفة الجملية 300 ألف د، التمويل الذاتي 60 ألف د (20%).'
    },
    profile: {
      journey: 'startup',
      totalProjectCost: 300000,
      userContribution: 60000,
      financingRequested: 240000,
      purpose: 'creation',
      sector: 'industry',
      location: 'Zaghouan',
      isRegionalDevelopmentZone: true,
      businessStage: 'idea_project',
      startupProjectStage: 'idea',
      isIncorporated: false,
      needsEquipmentOrPremises: true,
      legalStructure: 'sarl',
      hasHigherEducationDegree: true,
      applicantAge: 34,
      isDemoCase: true,
      demoCaseId: 'demo_manufacturing',
      demoCaseTitle: {
        fr: 'Création PME Industrielle Zaghouan (300k DT)',
        ar: 'إحداث مؤسسة صناعية بزغوان (300 ألف د)'
      },
      projectDescription: 'Création d’une unité de pièces plastiques techniques à Zaghouan avec déclaration APII.'
    }
  },
  {
    id: 'demo_sme_expansion',
    number: 4,
    title: {
      fr: 'Cas 4 : Extension & Modernisation PME',
      ar: 'الحالة 4 : توسعة وتحديث خطوط إنتاج PME'
    },
    subtitle: {
      fr: 'Entreprise manufacturière (+4 ans à Sfax) renforçant son parc de machines',
      ar: 'شركة صناعية قائمة بصفاقس لتحديث المعدات الصناعية'
    },
    badge: {
      fr: 'Cas Démo Synthétique #4',
      ar: 'حالة تجريبية نموذجية 4'
    },
    targetInstitutions: ['BFPME', 'SOTUGAR'],
    description: {
      fr: 'Extension de capacité et acquisition de machines CNC pour une PME établie à Sfax. Budget : 500 000 DT, apport : 120 000 DT (24%), financement demandé : 380 000 DT.',
      ar: 'توسعة طاقة إنتاجية واقتناء آلات تحكم رقمي لمؤسسة بصفاقس. الكلفة 500 ألف د، التمويل الذاتي 120 ألف د، التمويل 380 ألف د.'
    },
    profile: {
      journey: 'business_expansion',
      totalProjectCost: 500000,
      userContribution: 120000,
      financingRequested: 380000,
      purpose: 'expansion',
      sector: 'industry',
      location: 'Sfax',
      businessStage: 'established_over_2y',
      businessAgeYears: 4,
      annualTurnoverRange: '500k_2m',
      employeesCountRange: '21_50',
      expansionPurpose: 'expansion',
      hasExistingBankDebt: true,
      legalStructure: 'sarl',
      hasHigherEducationDegree: true,
      applicantAge: 42,
      isDemoCase: true,
      demoCaseId: 'demo_sme_expansion',
      demoCaseTitle: {
        fr: 'Extension PME Industrielle Sfax (500k DT)',
        ar: 'توسعة مصنع بصفاقس (500 ألف د)'
      },
      projectDescription: 'Extension d’atelier et renouvellement de machines outils CNC pour une SARL existante.'
    }
  },
  {
    id: 'demo_equipment',
    number: 5,
    title: {
      fr: 'Cas 5 : Équipement professionnel & Outillage',
      ar: 'الحالة 5 : تمويل معدات وورشة مهنية'
    },
    subtitle: {
      fr: 'Jeune diplômé technicien supérieur (26 ans) — Atelier de maintenance à Sousse',
      ar: 'تقني سام (26 سنة) يفتتح ورشة صيانة وميكانيك بسوسة'
    },
    badge: {
      fr: 'Cas Démo Synthétique #5',
      ar: 'حالة تجريبية نموذجية 5'
    },
    targetInstitutions: ['BTS Bank', 'Enda Tamweel'],
    description: {
      fr: 'Lancement d’un atelier spécialisé en maintenance électromécanique à Sousse. Coût global : 70 000 DT, apport : 10 000 DT (~14%), besoin : 60 000 DT.',
      ar: 'بعث ورشة صيانة كهروميكانيكية بسوسة. الكلفة 70 ألف د، التمويل الذاتي 10 آلاف د، التمويل المطلوب 60 ألف د.'
    },
    profile: {
      journey: 'equipment',
      totalProjectCost: 70000,
      userContribution: 10000,
      financingRequested: 60000,
      purpose: 'equipment',
      equipmentCategory: 'manufacturing',
      equipmentCondition: 'new',
      hasProformaInvoice: true,
      sector: 'crafts_trades',
      location: 'Sousse',
      businessStage: 'creation_underway',
      legalStructure: 'suarl',
      hasHigherEducationDegree: true,
      applicantAge: 26,
      isDemoCase: true,
      demoCaseId: 'demo_equipment',
      demoCaseTitle: {
        fr: 'Équipement Atelier Pro Sousse (70k DT)',
        ar: 'تجهيز ورشة مهنية بسوسة (70 ألف د)'
      },
      projectDescription: 'Acquisition d’outillage de diagnostic et banc d’essai pour atelier de maintenance.'
    }
  },
  {
    id: 'demo_car_financing',
    number: 6,
    title: {
      fr: 'Cas 6 : Financement Véhicule Particulier',
      ar: 'الحالة 6 : تمويل سيارة مستعملة لفرد'
    },
    subtitle: {
      fr: 'Salarié du privé (29 ans) achetant un véhicule d’occasion récent à Tunis',
      ar: 'أجير بالقطاع الخاص (29 سنة) يقتني سيارة مستعملة بتونس'
    },
    badge: {
      fr: 'Cas Démo Synthétique #6',
      ar: 'حالة تجريبية نموذجية 6'
    },
    targetInstitutions: ['BH Bank', 'Banque Zitouna'],
    description: {
      fr: 'Achat d’un véhicule d’occasion récent d’une valeur de 65 000 DT. Apport personnel : 15 000 DT (~23%), financement demandé : 50 000 DT sur 60 mois. Revenu mensuel net : 1 900 DT.',
      ar: 'اقتناء سيارة مستعملة بقيمة 65 ألف دينار. تمويل ذاتي 15 ألف د، تمويل مطلوب 50 ألف د على 60 شهراً. الدخل الشهري 1900 د.'
    },
    profile: {
      journey: 'car',
      totalProjectCost: 65000,
      userContribution: 15000,
      financingRequested: 50000,
      purpose: 'vehicle',
      vehicleCondition: 'used',
      vehicleBuyerType: 'individual',
      vehicleUsage: 'personal',
      vehicleDesiredTermMonths: 60,
      vehicleCategory: 'passenger',
      location: 'Tunis',
      monthlyIncomeRange: '1500_2500',
      employmentStatus: 'salaried_private',
      legalStructure: 'individual',
      applicantAge: 29,
      isDemoCase: true,
      demoCaseId: 'demo_car_financing',
      demoCaseTitle: {
        fr: 'Achat Véhicule Particulier (65k DT)',
        ar: 'اقتناء سيارة فردية (65 ألف د)'
      },
      projectDescription: 'Acquisition d’une voiture d’occasion récente pour usage personnel quotidien à Tunis.'
    }
  }
];
