import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getAuthoritativeCatalogueProviders,
  getAuthoritativeCatalogueProducts,
  getAuthoritativeCatalogueMetadata,
} from './src/knowledge/authoritativeCatalogueProjection';
import { DISCOVERY_QUERIES } from './src/knowledge/searchRegistry';
import { extractFinancingFactsDeterministically, searchFinancingCatalogue } from './src/knowledge/discoveryEngine';
import { getCatalogueHealthSummary } from './src/knowledge/catalogueAdapter';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK lazily / safely on server side
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// =========================================================================
// KNOWLEDGE LAYER ENDPOINTS
// =========================================================================

// 1. Catalogue Metadata & Health
app.get('/api/knowledge/metadata', (req, res) => {
  res.json({
    success: true,
    metadata: getAuthoritativeCatalogueMetadata(),
    summary: getCatalogueHealthSummary()
  });
});

// 2. Providers Registry
app.get('/api/knowledge/providers', (req, res) => {
  res.json({
    success: true,
    count: getAuthoritativeCatalogueProviders().length,
    providers: getAuthoritativeCatalogueProviders()
  });
});

// 3. Products Catalogue
app.get('/api/knowledge/products', (req, res) => {
  const { category, providerId } = req.query;
  let products = getAuthoritativeCatalogueProducts();

  if (category) {
    products = products.filter(p => p.category === category || p.financingDomains.includes(category as any));
  }
  if (providerId) {
    products = products.filter(p => p.providerId === providerId);
  }

  res.json({
    success: true,
    count: products.length,
    products
  });
});

// 4. Discovery Queries
app.get('/api/knowledge/queries', (req, res) => {
  res.json({
    success: true,
    count: DISCOVERY_QUERIES.length,
    queries: DISCOVERY_QUERIES
  });
});

// 5. Knowledge Search
app.post('/api/knowledge/search', (req, res) => {
  const { domain, keyword, providerId, applicantType, language } = req.body || {};
  const searchResults = searchFinancingCatalogue({
    domain,
    keyword,
    providerId,
    applicantType,
    language
  });
  res.json({
    success: true,
    ...searchResults
  });
});

// 6. Fact Discovery / Extraction
app.post('/api/knowledge/discover', async (req, res) => {
  const { sourceText, sourceUrl, publisher } = req.body || {};
  if (!sourceText || typeof sourceText !== 'string') {
    return res.status(400).json({ error: 'sourceText is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    const extracted = extractFinancingFactsDeterministically(sourceText, sourceUrl, publisher);
    return res.json({
      success: true,
      source: 'deterministic_extractor',
      result: extracted
    });
  }

  try {
    const prompt = `You are Mizen's financial knowledge extraction engine for the Tunisian financing market.
Analyze the following source document excerpt from a Tunisian bank, public agency, or decree:
"""${sourceText}"""

Extract factual parameters without inventing missing data.
Rules:
- maxAmount: numerical maximum funding amount in TND if stated
- minContributionPercent: numerical minimum own contribution percentage if stated
- rateFormula: string describing rate (e.g. "TMM + 2.5%" or "2% fixe") if stated
- durationMonthsMax: maximum duration in months if stated
- gracePeriodMonths: grace period in months if stated
- identifiedProvider: name or acronym of Tunisian institution if identifiable
- targetAudience: summary of eligible applicants
- requiresReview: boolean (always true for newly extracted data)
- confidence: "HIGH" | "MEDIUM" | "LOW"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            maxAmount: { type: Type.STRING, nullable: true },
            minContributionPercent: { type: Type.STRING, nullable: true },
            rateFormula: { type: Type.STRING, nullable: true },
            durationMonthsMax: { type: Type.STRING, nullable: true },
            gracePeriodMonths: { type: Type.STRING, nullable: true },
            identifiedProvider: { type: Type.STRING, nullable: true },
            targetAudience: { type: Type.STRING, nullable: true },
            requiresReview: { type: Type.BOOLEAN },
            confidence: { type: Type.STRING }
          },
          required: ['requiresReview', 'confidence']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const deterministic = extractFinancingFactsDeterministically(sourceText, sourceUrl, publisher);

    return res.json({
      success: true,
      source: 'gemini_with_provenance',
      result: {
        ...deterministic,
        geminiExtraction: parsed,
        requiresReview: true
      }
    });
  } catch (err) {
    console.warn('Gemini discovery extraction fallback:', err);
    const extracted = extractFinancingFactsDeterministically(sourceText, sourceUrl, publisher);
    return res.json({
      success: true,
      source: 'deterministic_extractor',
      result: extracted
    });
  }
});

// Helper to parse numbers & million notations
function parseTunisianAmountServer(rawText: string): number | undefined {
  if (!rawText) return undefined;
  const cleanStr = rawText.toLowerCase().trim();

  // Millions notation: "1,5 million", "1.5 millions", "1.5 md", "1,5 md", "1.5m", "1,5m", "1.5 مليون"
  const millionMatch = cleanStr.match(/(\d+(?:[.,]\d+)?)\s*(?:millions?|md\b|m\b|مليون)/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Math.round(val * 1000000);
    }
  }

  // Thousands notation: "200k", "200 mille", "200 ألف", "200 الف"
  const thousandMatch = cleanStr.match(/(\d+(?:[.,]\d+)?)\s*(?:k\b|mille|ألف|الف)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Math.round(val * 1000);
    }
  }

  // Spaced / Dotted thousands notation: "1 500 000", "200 000", "50 000", "200.000", "1.500.000"
  const spacedNumberMatch = cleanStr.match(/(\d{1,3}(?:[\s.]\d{3})+(?:,\d+)?)/);
  if (spacedNumberMatch) {
    const cleaned = spacedNumberMatch[1].replace(/[\s.]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }

  // Standard contiguous integer or decimal
  const stdMatch = cleanStr.match(/(\d+(?:[.,]\d+)?)/);
  if (stdMatch) {
    const parsed = parseFloat(stdMatch[1].replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }

  return undefined;
}

// Deterministic rule-based extraction fallback for natural language intake
function getIntakeFallback(query: string = '', language: string = 'fr') {
  const lower = query.toLowerCase();

  let detectedProjectCost: number | undefined = undefined;
  let detectedContribution: number | undefined = undefined;
  let detectedFinancing: number | undefined = undefined;

  // 1. Total Project Cost Patterns
  const costRegexes = [
    /(?:co[ûu]te|co[ûu]t(?:\s+total|\s+global|\s+du\s+projet)?|investissement(?:\s+total|\s+global)?|budget(?:\s+total)?|projet\s+de)\s*(?:est\s+de|de|d['’]|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i,
    /(?:كلفة|تكلفة|ميزانية|مشروع\s+بقيمة|قيمة\s+المشروع|استثمار\s+إجمالي)\s*(?:المشروع|الإجمالية|الجملية)?\s*(?:تبلغ|هي|:)?\s*([0-9][0-9\s.,]*(?:مليون|ألف|الف|دينار|د)?)/i
  ];
  for (const reg of costRegexes) {
    const m = query.match(reg);
    if (m && m[1]) {
      const parsed = parseTunisianAmountServer(m[1]);
      if (parsed) {
        detectedProjectCost = parsed;
        break;
      }
    }
  }

  // 2. User Contribution Patterns
  const contributionRegexes = [
    /(?:j['’]ai\s+([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)\s*(?:d['’]apport|de\s+fonds\s+propres))/i,
    /(?:apport(?:\s+personnel|\s+propre|\s+en\s+fonds\s+propres)?|fonds\s+propres|autofinancement)\s*(?:de|d['’]|est\s+de|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i,
    /(?:مساهمة\s+ذاتية|تمويل\s+ذاتي|أموال\s+خاصة|عندي\s+مساهمة|لدي\s+تمويل\s+ذاتي)\s*(?:تبلغ|هي|:)?\s*([0-9][0-9\s.,]*(?:مليون|ألف|الف|دينار|د)?)/i
  ];
  for (const reg of contributionRegexes) {
    const m = query.match(reg);
    if (m && m[1]) {
      const parsed = parseTunisianAmountServer(m[1]);
      if (parsed) {
        detectedContribution = parsed;
        break;
      }
    }
  }

  // 3. Financing Requested Patterns
  const financingRegexes = [
    /(?:besoin\s+de|besoin\s+d['’]|financement(?:\s+demandé|\s+souhaité|\s+requis)?|crédit(?:\s+demandé|\s+bancaire)?|emprunter|cherche|demande)\s*(?:un\s+financement\s+de|de|d['’]|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i,
    /(?:تمويل\s+مطلوب|بحاجة\s+إلى|أحتاج\s+إلى|طلب\s+تمويل|قرض\s+بقيمة|أريد\s+تمويل|تمويل)\s*(?:يبلغ|هو|:)?\s*([0-9][0-9\s.,]*(?:مليون|ألف|الف|دينار|د)?)/i
  ];
  for (const reg of financingRegexes) {
    const m = query.match(reg);
    if (m && m[1]) {
      const parsed = parseTunisianAmountServer(m[1]);
      if (parsed) {
        detectedFinancing = parsed;
        break;
      }
    }
  }

  // Single general number fallback
  if (!detectedFinancing && !detectedProjectCost) {
    const generalMatch = query.match(/(\d+[\d\s.,]*(?:millions?|md\b|m\b|k\b|mille|ألف|الف|مليون|dt|dinar|tnd|دينار|د)?)/i);
    if (generalMatch && generalMatch[1]) {
      const parsed = parseTunisianAmountServer(generalMatch[1]);
      if (parsed) {
        detectedFinancing = parsed;
      }
    }
  }

  let purpose: string | undefined = undefined;
  if (lower.includes('équipement') || lower.includes('equipement') || lower.includes('machine') || lower.includes('outillage') || lower.includes('معدات') || lower.includes('آلات')) {
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

  let sector: string | undefined = undefined;
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
    const knownGovs = ['Sousse', 'Sfax', 'Kasserine', 'Sidi Bouzid', 'Gafsa', 'Bizerte', 'Nabeul', 'Monastir', 'Mahdia', 'Kairouan', 'Béja', 'Jendouba', 'Siliana', 'Le Kef', 'Médenine', 'Tataouine', 'Gabès', 'Kébili', 'Tozeur', 'Zaghouan', 'Ariana', 'Ben Arous', 'La Manouba', 'Tunis'];
    for (const gov of knownGovs) {
      if (lower.includes(gov.toLowerCase())) {
        location = gov;
        break;
      }
    }
  }

  let businessStage: string | undefined = undefined;
  if (lower.includes('idée') || lower.includes('idee') || lower.includes('étude') || lower.includes('فكرة') || lower.includes('دراسة')) {
    businessStage = 'idea_project';
  } else if (lower.includes('créer') || lower.includes('création') || lower.includes('creation') || lower.includes('en cours de constitution') || lower.includes('en cours de création') || lower.includes('طور التأسيس') || lower.includes('بعث')) {
    businessStage = 'creation_underway';
  } else if (lower.includes('moins de 2 ans') || lower.includes('nouvelle entreprise') || lower.includes('حديثة')) {
    businessStage = 'established_under_2y';
  } else if (lower.includes('plus de 2 ans') || lower.includes('établie') || lower.includes('existante') || lower.includes('extension') || lower.includes('قديمة') || lower.includes('قائمة')) {
    businessStage = 'established_over_2y';
  }

  const missingCriticalFields: string[] = [];
  if (!detectedFinancing) missingCriticalFields.push(language === 'ar' ? 'مبلغ التمويل المطلوب' : 'montant_financement');
  if (!detectedContribution) missingCriticalFields.push(language === 'ar' ? 'المساهمة الذاتية (Apport personnel)' : 'apport_personnel');
  if (!detectedProjectCost) missingCriticalFields.push(language === 'ar' ? 'الكلفة الجملية للمشروع' : 'cout_projet');
  if (!purpose) missingCriticalFields.push(language === 'ar' ? 'طبيعة الاحتياج (بعث، معدات، سيولة...)' : 'objet_financement');
  if (!sector) missingCriticalFields.push(language === 'ar' ? 'قطاع النشاط' : 'secteur_activite');
  if (!location) missingCriticalFields.push(language === 'ar' ? 'الولاية / الموقع الجغرافي' : 'gouvernorat');
  if (!businessStage) missingCriticalFields.push(language === 'ar' ? 'مرحلة تقدم المشروع (فكرة، قيد التأسيس، مؤسسة قائمة)' : 'stade_avancement');

  const unassumedFields = language === 'ar'
    ? [
        'لم يتم افتراض ولاية أو مقر للمشروع تلقائياً',
        'لم يتم افتراض أي قطاع أو نشاط تلقائياً',
        'لم يتم افتراض شكل قانوني (SARL/SUARL)',
        'لم يتم افتراض شهادة جامعية أو سن للمشرف',
        'لم يتم اختلاق أي نسبة فائدة أو هامش ربح'
      ]
    : [
        'Aucune localisation géographique assumée par défaut',
        'Aucun secteur d’activité imposé d’office',
        'Aucune forme juridique prédéfinie (SUARL, SARL...)',
        'Aucun statut de diplôme ou d’âge assumé',
        'Aucun taux d’intérêt ou marge financière inventé'
      ];

  const summaryParts: string[] = [];
  if (detectedProjectCost) summaryParts.push(`Coût: ${detectedProjectCost.toLocaleString('fr-FR')} DT`);
  if (detectedContribution) summaryParts.push(`Apport: ${detectedContribution.toLocaleString('fr-FR')} DT`);
  if (detectedFinancing) summaryParts.push(`Besoin: ${detectedFinancing.toLocaleString('fr-FR')} DT`);
  if (purpose) summaryParts.push(purpose);
  if (sector) summaryParts.push(sector);
  if (location) summaryParts.push(location);

  const summaryText = language === 'ar'
    ? (summaryParts.length > 0
        ? `المعطيات المكتشفة في نصكم: ${summaryParts.join(' • ')}. يرجى استكمال المعطيات الناقصة في خطوة التأكيد.`
        : `لم يتم التعرف على معطيات دقيقة في النص. يرجى مراجعة وتحديد التفاصيل في شاشة التأكيد.`)
    : (summaryParts.length > 0
        ? `Paramètres identifiés dans votre texte : ${summaryParts.join(' • ')}. Veuillez vérifier ou corriger les données ci-dessous.`
        : `Aucun paramètre chiffré ou sectoriel précis n'a pu être extrait avec certitude. Veuillez renseigner directement votre projet ci-dessous.`);

  return {
    financingRequested: detectedFinancing,
    totalProjectCost: detectedProjectCost,
    userContribution: detectedContribution,
    purpose,
    sector,
    location,
    businessStage,
    missingCriticalFields,
    unassumedFields,
    summaryText
  };
}

/**
 * 1. Natural Language Intake
 * Extracts financing parameters from French or Arabic text
 */
app.post('/api/gemini/parse-intake', async (req, res) => {
  const { query, language = 'fr' } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query text is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      source: 'fallback_heuristic',
      extracted: getIntakeFallback(query, language)
    });
  }

  try {
    // Call Gemini with schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are Mizen's financial intake engine for Tunisian SME & entrepreneur financing.
Analyze the user's natural language request describing their financing project in Tunisia.
User input: "${query}"

Strict extraction discipline:
- Extract ONLY what the user explicitly stated or directly implied. NEVER fabricate unstated numbers.
- financingRequested: numerical amount in Tunisian Dinars (TND / DT) if stated, or null if not stated.
- totalProjectCost: numerical amount in TND if explicitly stated, or null if not stated.
- userContribution: numerical amount in TND if explicitly stated, or null if not stated.
- monthlyNetIncome: net monthly personal/household income in TND if explicitly stated, or null if not stated.
- monthlyDebtPayments: existing monthly loan/debt payments in TND if explicitly stated, or null if not stated.
- purpose: one of ['creation', 'equipment', 'working_capital', 'expansion', 'agriculture', 'innovation_rd', 'export'] ONLY IF explicitly indicated. If not indicated, return null and add "objet_financement" to missingCriticalFields.
- sector: one of ['industry', 'services', 'agriculture_agribusiness', 'ict_tech', 'crafts_trades', 'commerce', 'renewable_energy', 'tourism', 'other'] ONLY IF indicated. If not indicated, return null and add "secteur_activite" to missingCriticalFields.
- location: exact Tunisian governorate if identifiable (e.g. Sousse, Tunis, Sfax, Kasserine, etc.), or null if not mentioned. Do NOT assume Tunis by default. If unmentioned, return null and add "gouvernorat" to missingCriticalFields.
- businessStage: one of ['idea_project', 'creation_underway', 'established_under_2y', 'established_over_2y'] ONLY IF indicated. If not indicated, return null and add "stade_avancement" to missingCriticalFields.
- missingCriticalFields: array of strings explicitly listing what is missing from the user's description to evaluate eligibility (e.g., 'montant_financement', 'apport_personnel', 'objet_financement', 'secteur_activite', 'gouvernorat', 'stade_avancement').
- unassumedFields: array of strings stating what assumptions Mizen intentionally did NOT make (e.g., 'Localisation non assumée', 'Secteur non assumé', 'Forme juridique non assumée', 'Diplôme non assumé').
- summaryText: objective 1-2 sentence confirmation of detected parameters in ${language === 'ar' ? 'Arabic' : 'French'}, noting what still needs to be specified.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            financingRequested: { type: Type.NUMBER, nullable: true },
            totalProjectCost: { type: Type.NUMBER, nullable: true },
            userContribution: { type: Type.NUMBER, nullable: true },
            monthlyNetIncome: { type: Type.NUMBER, nullable: true },
            monthlyDebtPayments: { type: Type.NUMBER, nullable: true },
            purpose: { type: Type.STRING, nullable: true },
            sector: { type: Type.STRING, nullable: true },
            location: { type: Type.STRING, nullable: true },
            businessStage: { type: Type.STRING, nullable: true },
            missingCriticalFields: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            unassumedFields: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summaryText: { type: Type.STRING }
          },
          required: ['missingCriticalFields', 'summaryText']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      extracted: parsed
    });
  } catch (error) {
    console.warn('Gemini parse error, recovering with deterministic fallback:', error);
    return res.json({
      success: true,
      source: 'fallback_heuristic',
      extracted: getIntakeFallback(query, language)
    });
  }
});

/**
 * 2. Plain Language Explanation
 * Explains why an option matches and what nuances to negotiate
 */
app.post('/api/gemini/explain', async (req, res) => {
  try {
    const { programName, providerName, reasons, language = 'fr' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        explanation: language === 'ar'
          ? `تم تحديد ${programName} كخيار ملائم لتمويل مشروعكم لدى ${providerName}. يُنصح بإعداد دراسة الجدوى وتجهيز الفواتير التقديرية قبل موعد مقابلة مسؤول التمويل.`
          : `Le dispositif ${programName} auprès de ${providerName} présente des conditions adaptées à votre profil. Veillez à bien formaliser vos devis pro-forma et votre prévisionnel financier avant l'entretien en agence.`
      });
    }

    const prompt = `You are a senior Tunisian corporate banking & SME financing advisor for Mizen.
Explain in straightforward, professional ${language === 'ar' ? 'Arabic' : 'French'} why the program "${programName}" from "${providerName}" is relevant for this applicant, based on these criteria:
- Matched factors: ${JSON.stringify(reasons?.matchedBecause || [])}
- Potential issues/risks: ${JSON.stringify(reasons?.potentialIssues || [])}
- Needs verification: ${JSON.stringify(reasons?.needsVerification || [])}

Provide:
1. A 2-3 sentence clear synthesis of why this mechanism fits.
2. 3 actionable tips for negotiating with the local branch manager in Tunisia.
3. Common administrative pitfalls to avoid (e.g. valid RNE, CNSS clearance, quote validity).
Keep tone objective, encouraging, and anchored in Tunisian realities (TMM, SOTUGAR, BTS, BFPME procedures). Never promise guaranteed approval.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return res.json({
      success: true,
      source: 'gemini',
      explanation: response.text
    });
  } catch (err) {
    console.warn('Gemini explain error, returning fallback:', err);
    const { programName = '', providerName = '', language = 'fr' } = req.body || {};
    return res.json({
      success: true,
      source: 'fallback',
      explanation: language === 'ar'
        ? `تم تحديد ${programName} كخيار ملائم لتمويل مشروعكم لدى ${providerName}. يُنصح بإعداد دراسة الجدوى وتجهيز الفواتير التقديرية قبل موعد مقابلة مسؤول التمويل.`
        : `Le dispositif ${programName} auprès de ${providerName} présente des conditions adaptées à votre profil. Veillez à bien formaliser vos devis pro-forma et votre prévisionnel financier avant l'entretien en agence.`
    });
  }
});

/**
 * 3. Document Analysis & Contradiction Detection
 * Analyzes uploaded business plan, RNE, or quote text against user profile.
 * When AI is unavailable or fails, returns explicit 'unavailable' status.
 * NEVER fabricates extracted data or claims false consistency.
 */
app.post('/api/gemini/analyze-document', async (req, res) => {
  const { language = 'fr' } = req.body || {};
  try {
    const { documentText, applicantProfile } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: false,
        status: 'unavailable',
        error: language === 'ar'
          ? 'التحليل الآلي للوثائق غير متوفر حالياً. الفحص اليدوي ضروري.'
          : 'Analyse automatique indisponible. Vérification manuelle nécessaire.',
        reason: 'ai_service_unreachable'
      });
    }

    const prompt = `You are Mizen's document analysis and compliance checker for Tunisian financing applications.
The applicant declared:
- Project Cost: ${applicantProfile?.totalProjectCost ?? 'Non spécifié'} DT
- Financing Requested: ${applicantProfile?.financingRequested ?? 'Non spécifié'} DT
- User Contribution: ${applicantProfile?.userContribution ?? 'Non spécifié'} DT
- Purpose: ${applicantProfile?.purpose ?? 'Non spécifié'}
- Sector: ${applicantProfile?.sector ?? 'Non spécifié'}
- Business Stage: ${applicantProfile?.businessStage ?? 'Non spécifié'}
- Location: ${applicantProfile?.location ?? 'Non spécifié'}
- Legal Form: ${applicantProfile?.legalStructure ?? 'Non spécifié'}

Here is the document excerpt provided:
"""${documentText}"""

Task:
1. Extract any concrete financial figures, dates, legal forms, or addresses found in the text.
2. Check for CONTRADICTIONS between what the user declared and what is written (e.g. user claims 2 years old, but document shows creation 5 months ago; or devis amount differs from requested funding).
3. Identify missing critical components for a Tunisian bank dossier.
4. Output in JSON in ${language === 'ar' ? 'Arabic' : 'French'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  label: { type: Type.STRING },
                  extractedValue: { type: Type.STRING },
                  status: { type: Type.STRING }, // 'matches_profile' | 'contradiction' | 'neutral'
                  comment: { type: Type.STRING }
                },
                required: ['key', 'label', 'extractedValue', 'status']
              }
            },
            contradictions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingMandatoryDocs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['identifiedFields', 'contradictions', 'missingMandatoryDocs', 'recommendations']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      status: 'analyzed',
      source: 'gemini',
      analysis: parsed
    });
  } catch (err) {
    console.warn('Gemini analyze-document error, returning explicit unavailable status:', err);
    return res.json({
      success: false,
      status: 'unavailable',
      error: language === 'ar'
        ? 'التحليل الآلي للوثائق غير متوفر حالياً. الفحص اليدوي ضروري.'
        : 'Analyse automatique indisponible. Vérification manuelle nécessaire.',
      reason: 'analysis_failed'
    });
  }
});

/**
 * 4. Dossier Readiness & Interview Prep
 */
app.post('/api/gemini/dossier-advice', async (req, res) => {
  try {
    const { applicantProfile, selectedPrograms, language = 'fr' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        advice: {
          readinessScore: 75,
          checklist: language === 'ar'
            ? [
                'التأكد من صلاحية الفواتير التقديرية (صالحة لمدة لا تقل عن 60 يوماً)',
                'إعداد مخطط السيولة والتدفقات النقدية للأشهر الـ 12 الأولى',
                'جمع بطاقات الهوية وشهادات الكفاءة المهنية أو الجامعية',
                'مراجعة شروط تدخل الشركة التونسية للضمان (SOTUGAR) أو بنك تمويل المؤسسات (BFPME)'
              ]
            : [
                'Vérifier la validité des devis pro-forma (durée de validité min 60 jours)',
                'Préparer le plan de trésorerie mensuel sur les 12 premiers mois',
                'Rassembler les pièces d’identité et justificatifs de qualification professionnelle',
                'Solliciter la SOTUGAR ou la BFPME pour le cadrage du dossier d’investissement'
              ],
          questionsForOfficer: language === 'ar'
            ? [
                'ما هي نسبة التغطية القصوى للضمان العمومي سوتوغار في قطاعنا ؟',
                'كم يستغرق متوسط الأجل بين موافقة لجنة التمويل وأول صرف للأموال ؟',
                'هل توجد اتفاقيات قطاعية تفاضلية تخفض من هامش الفائدة فوق نسبة TMM ؟',
                'ما هي متطلبات فترة الإمهال (différé) المناسبة لمرحلة انطلاق المشروع ؟'
              ]
            : [
                'Quelle est la quotité d’intervention maximale de la SOTUGAR sur notre secteur ?',
                'Quel est le délai moyen actuel entre la décision du comité et le premier décaissement ?',
                'Existe-t-il des conventions sectorielles réduisant la marge sur TMM ?',
                'Quelles sont les conditions d’octroi du différé d’amortissement ?'
              ]
        }
      });
    }

    const prompt = `You are Mizen's dossier coach preparing an entrepreneur in Tunisia for financing.
Applicant context:
- Project: ${applicantProfile?.purpose}, ${applicantProfile?.financingRequested} DT in ${applicantProfile?.location} (${applicantProfile?.sector})
- Target programs: ${JSON.stringify(selectedPrograms || [])}

Generate a concise, high-impact preparation guide in ${language === 'ar' ? 'Arabic' : 'French'}:
1. Prioritized dossier preparation checklist (actionable, specific to Tunisian administration: RNE, JORT, CNSS, pro-forma, attestation APII).
2. Top 4 key questions the applicant should ask the loan officer during their first bank meeting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            questionsForOfficer: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['checklist', 'questionsForOfficer']
        }
      }
    });

    return res.json({
      success: true,
      source: 'gemini',
      advice: JSON.parse(response.text || '{}')
    });
  } catch (err) {
    console.warn('Gemini dossier-advice error, returning fallback:', err);
    const { language = 'fr' } = req.body || {};
    return res.json({
      success: true,
      source: 'fallback',
      advice: {
        readinessScore: 75,
        checklist: language === 'ar'
          ? [
              'التأكد من صلاحية الفواتير التقديرية (صالحة لمدة لا تقل عن 60 يوماً)',
              'إعداد مخطط السيولة والتدفقات النقدية للأشهر الـ 12 الأولى',
              'جمع بطاقات الهوية وشهادات الكفاءة المهنية أو الجامعية',
              'مراجعة شروط تدخل الشركة التونسية للضمان (SOTUGAR) أو بنك تمويل المؤسسات (BFPME)'
            ]
          : [
              'Vérifier la validité des devis pro-forma (durée de validité min 60 jours)',
              'Préparer le plan de trésorerie mensuel sur les 12 premiers mois',
              'Rassembler les pièces d’identité et justificatifs de qualification professionnelle',
              'Solliciter la SOTUGAR ou la BFPME pour le cadrage du dossier d’investissement'
            ],
        questionsForOfficer: language === 'ar'
          ? [
              'ما هي نسبة التغطية القصوى للضمان العمومي سوتوغار في قطاعنا ؟',
              'كم يستغرق متوسط الأجل بين موافقة لجنة التمويل وأول صرف للأموال ؟',
              'هل توجد اتفاقيات قطاعية تفاضلية تخفض من هامش الفائدة فوق نسبة TMM ؟',
              'ما هي متطلبات فترة الإمهال (différé) المناسبة لمرحلة انطلاق المشروع ؟'
            ]
          : [
              'Quelle est la quotité d’intervention maximale de la SOTUGAR sur notre secteur ?',
              'Quel est le délai moyen actuel entre la décision du comité et le premier décaissement ?',
              'Existe-t-il des conventions sectorielles réduisant la marge sur TMM ?',
              'Quelles sont les conditions d’octroi du différé d’amortissement ?'
            ]
      }
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mizen Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
