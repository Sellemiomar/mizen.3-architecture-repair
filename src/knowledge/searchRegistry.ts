/**
 * Mizen - Discovery Query & Source Registry
 * Bilingual (French / Arabic) search queries covering all Tunisian financing market segments.
 */

import { DiscoveryQuery, FinancingDomain, SourceReference, SourceType } from '../types/knowledge';

export const DISCOVERY_QUERIES: DiscoveryQuery[] = [
  // 1. Home Financing
  {
    id: 'query_home_mortgage',
    domain: 'HOME',
    queryFr: 'crédit immobilier Tunisie banque taux montant apport',
    queryAr: 'قرض سكني بنكي تونس نسبة الفائدة التمويل الذاتي',
    description: 'Crédits immobiliers bancaires classiques et réglementés pour achat de logement',
    targetSources: ['BH Bank', 'Banque de l\'Habitat', 'BCT', 'Ministère de l\'Équipement']
  },
  {
    id: 'query_home_foprolos',
    domain: 'HOME',
    queryFr: 'FOPROLOS logement social construction acquisition Tunisie barème',
    queryAr: 'فوبرولوس مسكن اجتماعي بناء واقتناء تونس جدول المداخيل',
    description: 'Fonds de Promotion des Logements pour les Salariés (FOPROLOS)',
    targetSources: ['Ministère de l\'Équipement', 'JORT', 'BH Bank']
  },
  {
    id: 'query_home_first_home',
    domain: 'HOME',
    queryFr: 'programme premier logement Tunisie conditions éligibilité revenu plafond',
    queryAr: 'برنامج المسكن الأول تونس شروط الأهلية سقف الدخل وسعر المسكن',
    description: 'Programme gouvernemental Premier Logement (crédit autofinancement bonifié)',
    targetSources: ['Ministère de l\'Équipement', 'BCT', 'BH Bank']
  },

  // 2. Car Financing
  {
    id: 'query_car_conventional',
    domain: 'CAR',
    queryFr: 'crédit automobile Tunisie auto occasion neuf taux durée apport',
    queryAr: 'قرض سيارة تونس جديدة أو مستعملة نسبة الفائدة المدة التمويل الذاتي',
    description: 'Crédit automobile classique pour particuliers et professionnels',
    targetSources: ['BH Bank', 'Attijari Bank', 'BIAT', 'Banque de Tunisie', 'STB']
  },
  {
    id: 'query_car_leasing',
    domain: 'LEASING',
    queryFr: 'leasing automobile Tunisie leasing véhicule utilitaire professionnel loyer premier loyer',
    queryAr: 'إيجار مالي سيارة تونس ليزينغ عربات نفعية وتجارية القسط الأول',
    description: 'Leasing de véhicules utilitaires et de tourisme pour professionnels et sociétés',
    targetSources: ['Tunisie Leasing & Factoring', 'Arab Tunisian Lease', 'Hannibal Lease', 'Attijari Leasing']
  },

  // 3. Startup & Entrepreneurship Creation
  {
    id: 'query_startup_bfpme',
    domain: 'STARTUP',
    queryFr: 'BFPME création entreprise Tunisie montant plafond apport fonds propres',
    queryAr: 'بنك تمويل المؤسسات الصغرى والمتوسطة إحداث مؤسسة سقف التمويل والتمويل الذاتي',
    description: 'Financement de création de PME par la BFPME',
    targetSources: ['BFPME', 'APII', 'Ministère de l\'Industrie']
  },
  {
    id: 'query_startup_bts_diplomes',
    domain: 'STARTUP',
    queryFr: 'BTS diplômés de l\'enseignement supérieur crédit création entreprise taux bonifié',
    queryAr: 'البنك التونسي للتضامن حاملي الشهادات العليا قرض إحداث مؤسسة فائدة ميسرة',
    description: 'Crédit BTS pour diplômés de l\'enseignement supérieur et techniciens',
    targetSources: ['BTS', 'Ministère de l\'Emploi', 'APII']
  },
  {
    id: 'query_startup_act_bourse',
    domain: 'STARTUP',
    queryFr: 'Startup Act Tunisie bourse de startup label conditions éligibilité collège',
    queryAr: 'قانون المؤسسات الناشئة تونس منحة الستارتاب شروط علامة المؤسسة الناشئة',
    description: 'Mécanismes d\'incitation et bourse des fondateurs Startup Act (Smart Capital)',
    targetSources: ['Smart Capital', 'Startup Tunisia', 'Ministère des TIC']
  },
  {
    id: 'query_startup_aneti',
    domain: 'STARTUP',
    queryFr: 'ANETI chèque entreprendre prime d\'étude démarrage accompagnement',
    queryAr: 'الوكالة الوطنية للتشغيل والعمل المستقل صك مرافقة بعث المؤسسات',
    description: 'Dispositifs Chèque Entreprendre de l\'ANETI pour porteurs de projet',
    targetSources: ['ANETI', 'Ministère de l\'Emploi']
  },

  // 4. Business Expansion & SME Investment
  {
    id: 'query_business_expansion_bfpme',
    domain: 'BUSINESS',
    queryFr: 'crédit investissement extension PME Tunisie BFPME modernisation',
    queryAr: 'قرض استثمار توسعة المؤسسات الصغرى والمتوسطة تونس BFPME التحديث',
    description: 'Crédit à moyen et long terme pour extension et modernisation de PME',
    targetSources: ['BFPME', 'APII']
  },
  {
    id: 'query_business_sotugar',
    domain: 'GUARANTEE',
    queryFr: 'SOTUGAR garantie des crédits PME création extension quotité commission',
    queryAr: 'الشركة التونسية للضمان سوتوغار ضمان قروض المؤسسات الصغرى والمتوسطة النسبة والعمولة',
    description: 'Fonds nationaux de garantie des crédits et investissements (SOTUGAR)',
    targetSources: ['SOTUGAR', 'BCT', 'Ministère des Finances']
  },
  {
    id: 'query_business_foprodi',
    domain: 'PUBLIC_FUNDING',
    queryFr: 'FOPRODI dotation fonds propres prime investissement schéma de financement',
    queryAr: 'صندوق النهوض بالصناعات التقليدية واللامركزية منحة الاستثمار والتمويل الذاتي',
    description: 'Fonds de Promotion et de Décentralisation Industrielle (FOPRODI / APII)',
    targetSources: ['APII', 'Ministère de l\'Industrie']
  },

  // 5. Equipment & Machinery
  {
    id: 'query_equipment_leasing',
    domain: 'EQUIPMENT',
    queryFr: 'leasing équipement matériel industriel médical BTP Tunisie',
    queryAr: 'إيجار مالي تجهيزات ومعدات صناعية وطبية وأشغال عامة تونس',
    description: 'Financement en crédit-bail d\'équipements de production et machines',
    targetSources: ['Tunisie Leasing & Factoring', 'Arab Tunisian Lease', 'CIL']
  },
  {
    id: 'query_equipment_enda',
    domain: 'MICROFINANCE',
    queryFr: 'Enda Tamweel microcrédit matériel professionnel artisan commerçant',
    queryAr: 'أندا تمويل قرض مصغر معدات مهنية وتجهيزات تجارية وحرفية',
    description: 'Microfinance pour équipements et fonds de roulement d\'activités indépendantes',
    targetSources: ['Enda Tamweel', 'Autorité de Contrôle de la Microfinance (ACM)']
  },

  // 6. Agricultural Financing
  {
    id: 'query_agriculture_bts_apia',
    domain: 'AGRICULTURE',
    queryFr: 'financement agricole Tunisie BTS APIA crédit de campagne investissement agricole',
    queryAr: 'تمويل فلاحي تونس البنك التونسي للتضامن وكالة الاستثمارات الفلاحية قرض موسمي',
    description: 'Financement des projets agricoles, bétail, irrigation et arboriculture',
    targetSources: ['BTS', 'APIA', 'Ministère de l\'Agriculture']
  },

  // 7. Islamic Financing
  {
    id: 'query_islamic_mourabaha',
    domain: 'ISLAMIC_FINANCE',
    queryFr: 'financement islamique Mourabaha Ijara Banque Zitouna Wifak Bank',
    queryAr: 'تمويل إسلامي مرابحة إجارة بنك الزيتونة مصرف الوفاق تونس',
    description: 'Structures de financement conformes aux principes de la finance islamique',
    targetSources: ['Banque Zitouna', 'Wifak International Bank', 'Al Baraka Bank Tunisia']
  },

  // 8. Official Simulators
  {
    id: 'query_official_simulators',
    domain: 'OTHER',
    queryFr: 'simulateur crédit officiel banque Tunisie simulateur leasing en ligne',
    queryAr: 'محاكي قروض بنكية رسمي تونس محاكي ليزينغ على الخط',
    description: 'Simulateurs de calcul officiels publiés par les établissements de crédit',
    targetSources: ['BH Bank', 'Tunisie Leasing & Factoring', 'Attijari Bank', 'Banque Zitouna']
  }
];

export interface SourcePriorityRule {
  sourceType: SourceType;
  priorityLevel: number;
  description: string;
  weight: number;
}

export const SOURCE_PRIORITY_RULES: SourcePriorityRule[] = [
  {
    sourceType: 'OFFICIAL_REGULATION', // JORT, BCT Circulars, Ministerial Decrees
    priorityLevel: 1,
    description: 'Textes réglementaires, décrets officiels et circulaires de la BCT',
    weight: 100
  },
  {
    sourceType: 'OFFICIAL_PRODUCT_PAGE', // Bank & Agency public product pages
    priorityLevel: 2,
    description: 'Pages descriptives officielles des établissements et agences publiques',
    weight: 90
  },
  {
    sourceType: 'OFFICIAL_SIMULATOR', // Official online simulators
    priorityLevel: 2,
    description: 'Simulateurs financiers officiels publiés en ligne par l\'institution',
    weight: 90
  },
  {
    sourceType: 'OFFICIAL_PDF', // Official brochures, scale sheets, charters
    priorityLevel: 3,
    description: 'Brochures officielles, barèmes et fiches produit téléchargeables',
    weight: 85
  },
  {
    sourceType: 'OFFICIAL_NOTICE', // Official agency notices & circular letters
    priorityLevel: 4,
    description: 'Avis publics et communiqués d\'agences (APII, ANETI, APIA)',
    weight: 75
  },
  {
    sourceType: 'OTHER', // Verified secondary institutional compilations
    priorityLevel: 5,
    description: 'Sources institutionnelles secondaires répertoriées',
    weight: 60
  }
];

/**
 * Evaluates the freshness status of a source given its retrieved date and optional publication date.
 */
export function evaluateSourceFreshness(
  retrievedAt: string,
  publishedAt?: string,
  maxStaleMonths: number = 12
): {
  isOutdated: boolean;
  status: 'VERIFIED' | 'OUTDATED' | 'PARTIALLY_VERIFIED';
  monthsSinceVerification: number;
} {
  const now = new Date();
  const checkDate = new Date(retrievedAt);
  const diffTime = Math.abs(now.getTime() - checkDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsSinceVerification = Math.round(diffDays / 30);

  const isOutdated = monthsSinceVerification > maxStaleMonths;

  return {
    isOutdated,
    status: isOutdated ? 'OUTDATED' : 'VERIFIED',
    monthsSinceVerification
  };
}
