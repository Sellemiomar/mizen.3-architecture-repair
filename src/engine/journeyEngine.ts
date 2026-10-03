import { 
  FinancingJourney, 
  ApplicantProfile, 
  Language, 
  FinancingPurpose 
} from '../types/financing';

export interface JourneyMeta {
  id: FinancingJourney;
  title: {
    fr: string;
    ar: string;
  };
  shortTitle: {
    fr: string;
    ar: string;
  };
  subtitle: {
    fr: string;
    ar: string;
  };
  defaultPurpose: FinancingPurpose;
  iconName: 'home' | 'hammer' | 'car' | 'rocket' | 'trendingUp' | 'wrench' | 'tractor' | 'briefcase';
  accentColor: string;
}

export const JOURNEY_METAS: Record<FinancingJourney, JourneyMeta> = {
  home_purchase: {
    id: 'home_purchase',
    title: {
      fr: 'Acheter un logement',
      ar: 'شراء مسكن'
    },
    shortTitle: {
      fr: 'Achat Logement',
      ar: 'اقتناء مسكن'
    },
    subtitle: {
      fr: 'Premier logement, crédit immobilier bancaire, logement neuf ou ancien',
      ar: 'المسكن الأول، القروض العقارية، مسكن جديد أو قديم'
    },
    defaultPurpose: 'first_home',
    iconName: 'home',
    accentColor: 'blue'
  },
  home_construction: {
    id: 'home_construction',
    title: {
      fr: 'Construire ou rénover un logement',
      ar: 'بناء أو تهيئة مسكن'
    },
    shortTitle: {
      fr: 'Construction & Rénovation',
      ar: 'بناء وتهيئة'
    },
    subtitle: {
      fr: 'Construction sur terrain propre, FOPROLOS, extension ou travaux',
      ar: 'البناء على أرض خاصة، فوبرولوس، توسعة أو أشغال تهيئة'
    },
    defaultPurpose: 'home_construction',
    iconName: 'hammer',
    accentColor: 'emerald'
  },
  car: {
    id: 'car',
    title: {
      fr: 'Acheter un véhicule',
      ar: 'شراء سيارة أو وسيلة نقل'
    },
    shortTitle: {
      fr: 'Financement Véhicule',
      ar: 'تمويل سيارة'
    },
    subtitle: {
      fr: 'Voiture neuve ou d’occasion, véhicule utilitaire, leasing ou crédit auto',
      ar: 'سيارة جديدة أو مستعملة، عربة نفعية، ليزينغ أو قرض سيارة'
    },
    defaultPurpose: 'vehicle',
    iconName: 'car',
    accentColor: 'amber'
  },
  startup: {
    id: 'startup',
    title: {
      fr: 'Créer une entreprise',
      ar: 'بعث وتأسيس مشروع'
    },
    shortTitle: {
      fr: 'Création d’Entreprise',
      ar: 'تأسيس مشروع'
    },
    subtitle: {
      fr: 'Nouveaux promoteurs, Startup Act, dotations APII, PME ou micro-projets',
      ar: 'باعثون جدد، ستارت آب آكت، منح وكالة النهوض بالصناعة، مؤسسات صغرى'
    },
    defaultPurpose: 'creation',
    iconName: 'rocket',
    accentColor: 'indigo'
  },
  business_expansion: {
    id: 'business_expansion',
    title: {
      fr: 'Développer une entreprise existante',
      ar: 'توسعة مشروع قائم'
    },
    shortTitle: {
      fr: 'Extension PME',
      ar: 'توسعة مؤسسة'
    },
    subtitle: {
      fr: 'Investissement matériel, modernisation, augmentation de capacité, fonds de roulement',
      ar: 'استثمار في الآلات، تحديث وسائل الإنتاج، زيادة الطاقة، سيولة الاستغلال'
    },
    defaultPurpose: 'expansion',
    iconName: 'trendingUp',
    accentColor: 'teal'
  },
  equipment: {
    id: 'equipment',
    title: {
      fr: 'Acheter des équipements ou machines',
      ar: 'اقتناء معدات وآلات'
    },
    shortTitle: {
      fr: 'Équipements & Matériel',
      ar: 'معدات وتجهيزات'
    },
    subtitle: {
      fr: 'Machines de production, outillage professionnel, matériel informatique ou médical',
      ar: 'آلات صناعية، معدات مهنية، تجهيزات إعلامية أو طبية'
    },
    defaultPurpose: 'equipment',
    iconName: 'wrench',
    accentColor: 'purple'
  },
  agriculture: {
    id: 'agriculture',
    title: {
      fr: 'Projet agricole',
      ar: 'مشروع فلاحي'
    },
    shortTitle: {
      fr: 'Financement Agricole',
      ar: 'تمويل فلاحي'
    },
    subtitle: {
      fr: 'Arboriculture, élevage, serres, irrigation moderne, équipement ou campagne',
      ar: 'غراسات، تربية ماشية، بيوت مكيفة، ري قطرة قطرة، تجهيزات فلاحية'
    },
    defaultPurpose: 'agriculture',
    iconName: 'tractor',
    accentColor: 'lime'
  },
  other_professional: {
    id: 'other_professional',
    title: {
      fr: 'Autre financement professionnel',
      ar: 'تمويل مهني آخر'
    },
    shortTitle: {
      fr: 'Autre Financement Pro',
      ar: 'تمويل مهني عام'
    },
    subtitle: {
      fr: 'Services généraux, commerces, professions libérales ou besoins mixtes',
      ar: 'خدمات عامة، تجارة، مهن حرة أو حاجيات تمويل متنوعة'
    },
    defaultPurpose: 'working_capital',
    iconName: 'briefcase',
    accentColor: 'slate'
  }
};

/**
 * Intelligently cleanses previous inputs when a user switches financing journey,
 * preserving only legitimate common fields (location, project costs, basic income)
 * and erasing irrelevant domain questions without inserting fabricated default answers.
 */
export function cleanProfileForJourney(
  prev: ApplicantProfile, 
  newJourney: FinancingJourney
): ApplicantProfile {
  const meta = JOURNEY_METAS[newJourney];
  const nextPurpose = meta.defaultPurpose;

  // Base fields that can safely carry over
  const base: ApplicantProfile = {
    journey: newJourney,
    purpose: nextPurpose,
    location: prev.location,
    totalProjectCost: prev.totalProjectCost,
    userContribution: prev.userContribution,
    financingRequested: prev.financingRequested,
    monthlyIncomeRange: prev.monthlyIncomeRange,
    employmentStatus: prev.employmentStatus,
    applicantAge: prev.applicantAge,
    structurePreference: prev.structurePreference,
    collateralPreference: prev.collateralPreference,
    isRegionalDevelopmentZone: prev.isRegionalDevelopmentZone,
    isDemoCase: prev.isDemoCase,
    demoCaseId: prev.demoCaseId,
    demoCaseTitle: prev.demoCaseTitle,
    projectDescription: prev.projectDescription
  };

  switch (newJourney) {
    case 'home_purchase':
      return {
        ...base,
        propertyType: prev.propertyType,
        propertyCondition: prev.propertyCondition,
        isFirstPropertyPurchase: prev.isFirstPropertyPurchase,
        isPrincipalResidence: prev.isPrincipalResidence,
        desiredTermYears: prev.desiredTermYears,
        legalStructure: prev.legalStructure === 'individual' ? 'individual' : undefined
      };

    case 'home_construction':
      return {
        ...base,
        propertyType: prev.propertyType,
        constructionType: prev.constructionType,
        hasLandOwnershipTitle: prev.hasLandOwnershipTitle,
        isFirstPropertyPurchase: prev.isFirstPropertyPurchase,
        isPrincipalResidence: prev.isPrincipalResidence,
        desiredTermYears: prev.desiredTermYears,
        legalStructure: prev.legalStructure === 'individual' ? 'individual' : undefined
      };

    case 'car':
      return {
        ...base,
        vehicleCondition: prev.vehicleCondition,
        vehicleBuyerType: prev.vehicleBuyerType,
        vehicleUsage: prev.vehicleUsage,
        vehicleDesiredTermMonths: prev.vehicleDesiredTermMonths,
        vehicleCategory: prev.vehicleCategory,
        vehicleIsReplacement: prev.vehicleIsReplacement,
        legalStructure: prev.legalStructure,
        sector: prev.vehicleBuyerType === 'business' ? prev.sector : undefined,
        businessAgeYears: prev.vehicleBuyerType === 'business' ? prev.businessAgeYears : undefined,
        annualTurnoverRange: prev.vehicleBuyerType === 'business' ? prev.annualTurnoverRange : undefined
      };

    case 'startup':
      return {
        ...base,
        sector: prev.sector,
        businessStage: prev.businessStage,
        startupProjectStage: prev.startupProjectStage,
        isIncorporated: prev.isIncorporated,
        hasHigherEducationDegree: prev.hasHigherEducationDegree,
        hasStartupActLabel: prev.hasStartupActLabel,
        legalStructure: prev.legalStructure,
        needsEquipmentOrPremises: prev.needsEquipmentOrPremises
      };

    case 'business_expansion':
      return {
        ...base,
        sector: prev.sector,
        businessStage: prev.businessStage,
        businessAgeYears: prev.businessAgeYears,
        annualTurnoverRange: prev.annualTurnoverRange,
        employeesCountRange: prev.employeesCountRange,
        expansionPurpose: prev.expansionPurpose,
        legalStructure: prev.legalStructure,
        hasExistingBankDebt: prev.hasExistingBankDebt,
        hasHigherEducationDegree: prev.hasHigherEducationDegree
      };

    case 'equipment':
      return {
        ...base,
        equipmentCategory: prev.equipmentCategory,
        equipmentCondition: prev.equipmentCondition,
        hasProformaInvoice: prev.hasProformaInvoice,
        sector: prev.sector,
        businessStage: prev.businessStage,
        legalStructure: prev.legalStructure,
        hasHigherEducationDegree: prev.hasHigherEducationDegree
      };

    case 'agriculture':
      return {
        ...base,
        agriculturalActivityType: prev.agriculturalActivityType,
        agriculturalLandStatus: prev.agriculturalLandStatus,
        isSeasonalRequirement: prev.isSeasonalRequirement,
        sector: prev.sector ?? 'agriculture_agribusiness',
        businessStage: prev.businessStage,
        legalStructure: prev.legalStructure
      };

    case 'other_professional':
      return {
        ...base,
        generalApplicantType: prev.generalApplicantType,
        sector: prev.sector,
        businessStage: prev.businessStage,
        legalStructure: prev.legalStructure
      };
  }
}

/**
 * Returns contextual results header information according to the specialized journey.
 */
export function getJourneyResultHeader(
  journey: FinancingJourney | undefined, 
  language: Language
): { title: string; subtitle: string } {
  if (!journey) {
    return {
      title: language === 'ar' ? 'نتائج تشخيص التمويل' : 'Résultats de l’Analyse de Financement',
      subtitle: language === 'ar' 
        ? 'تحليل تطابق آليات التمويل التونسية والبرامج البنكية المتاحة'
        : 'Évaluation d’adéquation technique avec les dispositifs et programmes publics tunisiens'
    };
  }

  const meta = JOURNEY_METAS[journey];
  switch (journey) {
    case 'home_purchase':
      return {
        title: language === 'ar' ? 'تشخيص تمويل اقتناء مسكن' : 'Diagnostic Financement — Achat Immobilier & Logement',
        subtitle: language === 'ar'
          ? 'برامج المسكن الأول والقروض العقارية المدعمة وبنك الإسكان'
          : 'Dispositifs Premier Logement, bonifications MEHAT / BCT et crédits immobiliers bancaires'
      };
    case 'home_construction':
      return {
        title: language === 'ar' ? 'تشخيص تمويل بناء أو تهيئة مسكن' : 'Diagnostic Financement — Construction & Rénovation',
        subtitle: language === 'ar'
          ? 'آليات فوبرولوس (FOPROLOS) وقروض البناء على أرض خاصة'
          : 'Mécanismes FOPROLOS, bonifications pour construction sur terrain propre et crédits travaux'
      };
    case 'car':
      return {
        title: language === 'ar' ? 'تشخيص تمويل العربات والسيارات' : 'Diagnostic Financement — Véhicule & Flotte',
        subtitle: language === 'ar'
          ? 'عروض الليزينغ والقروض البنكية وصيغ المرابحة للسيارات'
          : 'Formules de leasing automobile, crédits à la consommation et Mourabaha véhicule'
      };
    case 'startup':
      return {
        title: language === 'ar' ? 'تشخيص تمويل إحداث وتأسيس الشركات' : 'Diagnostic Financement — Création d’Entreprise',
        subtitle: language === 'ar'
          ? 'برامج BFPME، وكالة APII (فوبوردي)، ستارت آب آكت وصناديق الضمان'
          : 'Dispositifs BFPME, dotations FOPRODI / APII, Startup Act et garanties SOTUGAR'
      };
    case 'business_expansion':
      return {
        title: language === 'ar' ? 'تشخيص تمويل توسعة وتحديث المشاريع' : 'Diagnostic Financement — Extension & Modernisation PME',
        subtitle: language === 'ar'
          ? 'تمويل خطوط الإنتاج، قروض الاستثمار المتوسطة والطويلة، وضمان سوتوغار'
          : 'Investissements industriels, crédits moyen/long terme et couverture SOTUGAR'
      };
    case 'equipment':
      return {
        title: language === 'ar' ? 'تشخيص تمويل المعدات والآلات' : 'Diagnostic Financement — Équipements & Outillage',
        subtitle: language === 'ar'
          ? 'آليات تمويل الآلات، الليزينغ المهني وقروض بنك التضامن BTS'
          : 'Crédits d’équipement, leasing professionnel et micro-investissements BTS'
      };
    case 'agriculture':
      return {
        title: language === 'ar' ? 'تشخيص التمويل الفلاحي' : 'Diagnostic Financement — Projets Agricoles',
        subtitle: language === 'ar'
          ? 'تمويل الأنشطة الفلاحية، التجهيزات المائية وصناديق الدعم الفلاحي'
          : 'Lignes de financement agricole, équipements d’irrigation et microcrédit rural'
      };
    case 'other_professional':
      return {
        title: language === 'ar' ? 'تشخيص التمويل المهني العام' : 'Diagnostic Financement — Financement Professionnel',
        subtitle: language === 'ar'
          ? 'تحليل أولي للآليات البنكية والمصرفية المفتوحة لمختلف الأنشطة'
          : 'Analyse préliminaire des mécanismes généraux et des lignes de crédit ouvertes'
      };
  }
}
