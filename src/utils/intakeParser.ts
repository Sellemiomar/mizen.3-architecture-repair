import { ApplicantProfile, FinancingPurpose, BusinessSector, LegalStructure, BusinessStage } from '../types/financing';

export interface ExtractedIntakeResult {
  detectedAmount?: number;
  extractedProfile: Partial<ApplicantProfile>;
  confidence: number;
  summary: {
    fr: string;
    ar: string;
  };
  missingCrucialFields: string[];
}

/**
 * Parses raw number strings like "1,5 million", "1.5 MD", "200 000 DT", "50k", "200 ألف" into numbers.
 */
export function parseTunisianAmount(rawText: string): number | undefined {
  if (!rawText) return undefined;
  const cleanStr = rawText.toLowerCase().trim();

  // 1. Millions notation: "1,5 million", "1.5 millions", "1.5 md", "1,5 md", "1.5m", "1,5m", "1.5 مليون", "1,5 مليون"
  const millionMatch = cleanStr.match(/(\d+(?:[.,]\d+)?)\s*(?:millions?|md\b|m\b|مليون)/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Math.round(val * 1000000);
    }
  }

  // 2. Thousands notation: "200k", "200 mille", "200 ألف", "200 الف"
  const thousandMatch = cleanStr.match(/(\d+(?:[.,]\d+)?)\s*(?:k\b|mille|ألف|الف)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Math.round(val * 1000);
    }
  }

  // 3. Spaced / Dotted thousands notation: "1 500 000", "200 000", "50 000", "200.000", "1.500.000"
  // If there are spaces or dots between groups of 3 digits
  const spacedNumberMatch = cleanStr.match(/(\d{1,3}(?:[\s.]\d{3})+(?:,\d+)?)/);
  if (spacedNumberMatch) {
    const cleaned = spacedNumberMatch[1].replace(/[\s.]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }

  // 4. Standard contiguous integer or decimal followed optionally by DT / dinars
  const stdMatch = cleanStr.match(/(\d+(?:[.,]\d+)?)/);
  if (stdMatch) {
    const parsed = parseFloat(stdMatch[1].replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      // If user typed e.g. "1500" or "80000"
      return Math.round(parsed);
    }
  }

  return undefined;
}

export function parseTextToProfileFallback(query: string = '', language: string = 'fr'): Partial<ApplicantProfile> {
  const lower = query.toLowerCase();

  let detectedProjectCost: number | undefined = undefined;
  let detectedContribution: number | undefined = undefined;
  let detectedFinancing: number | undefined = undefined;

  // 1. Total Project Cost Patterns
  // "coûte 200 000 DT", "coût 1,5 million", "projet de 200 000 DT", "كلفة 200 ألف"
  const costRegexes = [
    /(?:co[ûu]te|co[ûu]t(?:\s+total|\s+global|\s+du\s+projet)?|investissement(?:\s+total|\s+global)?|budget(?:\s+total)?|projet\s+de)\s*(?:est\s+de|de|d['’]|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i,
    /(?:كلفة|تكلفة|ميزانية|مشروع\s+بقيمة|قيمة\s+المشروع|استثمار\s+إجمالي)\s*(?:المشروع|الإجمالية|الجملية)?\s*(?:تبلغ|هي|:)?\s*([0-9][0-9\s.,]*(?:مليون|ألف|الف|دينار|د)?)/i
  ];
  for (const reg of costRegexes) {
    const m = query.match(reg);
    if (m && m[1]) {
      const parsed = parseTunisianAmount(m[1]);
      if (parsed) {
        detectedProjectCost = parsed;
        break;
      }
    }
  }

  // 2. User Contribution Patterns
  // "50 000 DT d'apport", "apport 50 000 DT", "autofinancement de 50k", "مساهمة ذاتية 50 ألف"
  const contributionRegexes = [
    /(?:j['’]ai\s+([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)\s*(?:d['’]apport|de\s+fonds\s+propres))/i,
    /(?:apport(?:\s+personnel|\s+propre|\s+en\s+fonds\s+propres)?|fonds\s+propres|autofinancement)\s*(?:de|d['’]|est\s+de|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i,
    /(?:مساهمة\s+ذاتية|تمويل\s+ذاتي|أموال\s+خاصة|عندي\s+مساهمة|لدي\s+تمويل\s+ذاتي)\s*(?:تبلغ|هي|:)?\s*([0-9][0-9\s.,]*(?:مليون|ألف|الف|دينار|د)?)/i
  ];
  for (const reg of contributionRegexes) {
    const m = query.match(reg);
    if (m && m[1]) {
      const parsed = parseTunisianAmount(m[1]);
      if (parsed) {
        detectedContribution = parsed;
        break;
      }
    }
  }

  // 3. Financing Requested Patterns
  // "besoin de 150 000 DT", "besoin de 800 000 DT", "financement de 150k", "أحتاج إلى 800 ألف"
  const financingRegexes = [
    /(?:besoin\s+de|besoin\s+d['’]|financement(?:\s+demandé|\s+souhaité|\s+requis)?|crédit(?:\s+demandé|\s+bancaire)?|emprunter|cherche|demande)\s*(?:un\s+financement\s+de|de|d['’]|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i,
    /(?:تمويل\s+مطلوب|بحاجة\s+إلى|أحتاج\s+إلى|طلب\s+تمويل|قرض\s+بقيمة|أريد\s+تمويل|تمويل)\s*(?:يبلغ|هو|:)?\s*([0-9][0-9\s.,]*(?:مليون|ألف|الف|دينار|د)?)/i
  ];
  for (const reg of financingRegexes) {
    const m = query.match(reg);
    if (m && m[1]) {
      const parsed = parseTunisianAmount(m[1]);
      if (parsed) {
        detectedFinancing = parsed;
        break;
      }
    }
  }

  // If no contextual financing match was found, but a single general number exists
  if (!detectedFinancing && !detectedProjectCost) {
    const generalMatch = query.match(/(\d+[\d\s.,]*(?:millions?|md\b|m\b|k\b|mille|ألف|الف|مليون|dt|dinar|tnd|دينار|د)?)/i);
    if (generalMatch && generalMatch[1]) {
      const parsed = parseTunisianAmount(generalMatch[1]);
      if (parsed) {
        detectedFinancing = parsed;
      }
    }
  }

  // Purpose detection
  let purpose: FinancingPurpose | undefined = undefined;
  if (lower.includes('équipement') || lower.includes('equipement') || lower.includes('matériel') || lower.includes('materiel') || lower.includes('machine') || lower.includes('outillage') || lower.includes('معدات') || lower.includes('آلات') || lower.includes('عتاد')) {
    purpose = 'equipment';
  } else if (lower.includes('créer') || lower.includes('création') || lower.includes('creation') || lower.includes('nouveau projet') || lower.includes('lancement') || lower.includes('بعث') || lower.includes('تأسيس')) {
    purpose = 'creation';
  } else if (lower.includes('roulement') || lower.includes('trésorerie') || lower.includes('tresorerie') || lower.includes('تسيير') || lower.includes('سيولة')) {
    purpose = 'working_capital';
  } else if (lower.includes('agricole') || lower.includes('fella') || lower.includes('فلاحة') || lower.includes('أرض')) {
    purpose = 'agriculture';
  } else if (lower.includes('startup') || lower.includes('innov') || lower.includes('تجديد') || lower.includes('تكنولوج')) {
    purpose = 'innovation_rd';
  } else if (lower.includes('extension') || lower.includes('développement') || lower.includes('croissance') || lower.includes('توسعة')) {
    purpose = 'expansion';
  }

  // Sector detection
  let sector: BusinessSector | undefined = undefined;
  if (lower.includes('vêtement') || lower.includes('vetement') || lower.includes('confection') || lower.includes('textile') || lower.includes('habillement') || lower.includes('usine') || lower.includes('industr') || lower.includes('صناعة') || lower.includes('ملابس')) {
    sector = 'industry';
  } else if (lower.includes('agri') || lower.includes('fella') || lower.includes('فلاح')) {
    sector = 'agriculture_agribusiness';
  } else if (lower.includes('tech') || lower.includes('logiciel') || lower.includes('app') || lower.includes('برمجة') || lower.includes('digital')) {
    sector = 'ict_tech';
  } else if (lower.includes('artisan') || lower.includes('نجارة') || lower.includes('خياطة') || lower.includes('حرف')) {
    sector = 'crafts_trades';
  } else if (lower.includes('service') || lower.includes('conseil') || lower.includes('خدمات')) {
    sector = 'services';
  } else if (lower.includes('commerce') || lower.includes('boutique') || lower.includes('magasin') || lower.includes('تجارة')) {
    sector = 'commerce';
  } else if (lower.includes('tourisme') || lower.includes('hôtel') || lower.includes('restaurant') || lower.includes('سياحة')) {
    sector = 'tourism';
  } else if (lower.includes('énergie') || lower.includes('solaire') || lower.includes('طاقة')) {
    sector = 'renewable_energy';
  }

  // Location detection
  let location: string | undefined = undefined;
  const arabicGovMap: Record<string, string> = {
    'سوسة': 'Sousse', 'صفاقس': 'Sfax', 'القصرين': 'Kasserine', 'سيدي بوزيد': 'Sidi Bouzid',
    'قفصة': 'Gafsa', 'بنزرت': 'Bizerte', 'نابل': 'Nabeul', 'المنستير': 'Monastir',
    'المهدية': 'Mahdia', 'القيروان': 'Kairouan', 'باجة': 'Béja', 'جندوبة': 'Jendouba',
    'سليانة': 'Siliana', 'الكاف': 'Le Kef', 'مدنين': 'Médenine', 'تطاوين': 'Tataouine',
    'قابس': 'Gabès', 'قبلي': 'Kébili', 'توزر': 'Tozeur', 'زغوان': 'Zaghouan',
    'أريانة': 'Ariana', 'اريانة': 'Ariana', 'بن عروس': 'Ben Arous', 'منوبة': 'La Manouba', 'تونس': 'Tunis'
  };

  for (const [arName, frName] of Object.entries(arabicGovMap)) {
    if (query.includes(arName)) {
      location = frName;
      break;
    }
  }

  if (!location) {
    const frenchGovs = [
      'Tunis', 'Ariana', 'Ben Arous', 'La Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba',
      'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
      'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
    ];
    for (const g of frenchGovs) {
      if (lower.includes(g.toLowerCase())) {
        location = g;
        break;
      }
    }
  }

  // Business stage detection
  let businessStage: BusinessStage | undefined = undefined;
  if (lower.includes('idée') || lower.includes('idee') || lower.includes('étude') || lower.includes('فكرة') || lower.includes('دراسة')) {
    businessStage = 'idea_project';
  } else if (lower.includes('créer') || lower.includes('création') || lower.includes('creation') || lower.includes('en cours de constitution') || lower.includes('en cours de création') || lower.includes('طور التأسيس') || lower.includes('بعث')) {
    businessStage = 'creation_underway';
  } else if (lower.includes('moins de 2 ans') || lower.includes('nouvelle entreprise') || lower.includes('حديثة')) {
    businessStage = 'established_under_2y';
  } else if (lower.includes('plus de 2 ans') || lower.includes('établie') || lower.includes('existante') || lower.includes('extension') || lower.includes('قديمة') || lower.includes('قائمة')) {
    businessStage = 'established_over_2y';
  }

  // ZDR regions list
  const zdrGovernorates = ['Kasserine', 'Sidi Bouzid', 'Gafsa', 'Tataouine', 'Kébili', 'Tozeur', 'Jendouba', 'Le Kef', 'Siliana', 'Béja', 'Kairouan', 'Médenine', 'Gabès', 'Zaghouan'];
  const isZdr = location ? zdrGovernorates.includes(location) : false;

  // Islamic finance indicator
  const isIslamic = lower.includes('islamique') || lower.includes('mourabaha') || lower.includes('halal') || lower.includes('حلال') || lower.includes('إسلامي') || lower.includes('مرابحة');

  // Return strictly extracted fields with ZERO fabricated defaults
  return {
    financingRequested: detectedFinancing,
    totalProjectCost: detectedProjectCost,
    userContribution: detectedContribution,
    purpose,
    sector,
    location,
    isRegionalDevelopmentZone: isZdr,
    structurePreference: isIslamic ? 'islamic' : 'any',
    businessStage,
    legalStructure: undefined,
    hasHigherEducationDegree: undefined,
    hasStartupActLabel: undefined
  };
}
