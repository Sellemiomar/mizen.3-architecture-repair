import { StackCompatibilityEvaluation } from '../types/financingStack';
import { CLAIMS_REPOSITORY } from './claimsRepository';

/**
 * Explicit Financing Stack Compatibility Matrix
 * 
 * Strict constraints:
 * - No compatibility is inferred purely from product category, provider, or mathematical convenience.
 * - Current authoritative claims outrank historical or weaker claims.
 * - UNKNOWN remains UNKNOWN.
 * - Historical compatibility (e.g. SOTUGAR + VC) remains VERIFIED_HISTORICAL / CONDITIONAL.
 */

const DOCUMENTED_COMPATIBILITY_RULES: StackCompatibilityEvaluation[] = [
  // 1. BFPME CMLT + Commercial Bank Loan (Standard Co-financing)
  {
    programAId: 'bfpme_creation',
    programBId: 'bh_bank_loan',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'HIGH',
    rationale: {
      fr: "Schéma classique de co-financement BFPME : la BFPME intervient obligatoirement ou préférentiellement en co-financement avec une banque de la place.",
      ar: "مخطط التمويل المشترك التقليدي لـ BFPME : يتدخل البنك بالاشتراك مع بنك تجاري شريك."
    },
    isHistoricalOnly: false
  },
  {
    programAId: 'bfpme_creation',
    programBId: 'banque_credit_auto',
    compatibilityStatus: 'POTENTIALLY_COMPATIBLE',
    confidence: 'MEDIUM',
    rationale: {
      fr: "Co-financement possible sous réserve de séparation stricte entre le prêt d'investissement industriel/services et le crédit véhicule d'exploitation.",
      ar: "تمويل مشترك محتمل بشرط الفصل التام بين قرض الاستثمار وقرض العربة المهنية."
    },
    isHistoricalOnly: false
  },

  // 2. BFPME CMLT + SOTUGAR Guarantee
  {
    programAId: 'bfpme_creation',
    programBId: 'sotugar_guarantee',
    compatibilityStatus: 'POTENTIALLY_COMPATIBLE',
    confidence: 'LOW',
    rationale: {
      fr: "La SOTUGAR garantit les concours bancaires des PME. L'intervention conjointe BFPME + SOTUGAR est documentée historiquement mais le mécanisme actif exact requiert confirmation au montage du dossier.",
      ar: "تضمن سوتوغار قروض المؤسسات الصغرى والمتوسطة. التدخل المشترك موثق تاريخياً ولكن الآلية الدقيقة الحالية تتطلب التأكيد عند دراسة الملف."
    },
    isHistoricalOnly: false
  },

  // 3. BFPME CMLT + Equipment Leasing
  {
    programAId: 'bfpme_creation',
    programBId: 'leasing_vehicule_pro',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    rationale: {
      fr: "La compatibilité formelle et le partage d'assiette d'investissement entre crédit BFPME et contrat de leasing ne font pas l'objet d'une convention universelle automatique.",
      ar: "التوافق الرسمي وتقاسم وعاء الاستثمار بين قرض BFPME وعقد الإيجار المالي غير مثبت باتفاقية شاملة آلية."
    },
    isHistoricalOnly: false
  },

  // 4. SOTUGAR Guarantee + Bank Credit (Historical Primary Convention)
  {
    programAId: 'sotugar_guarantee',
    programBId: 'bh_bank_loan',
    compatibilityStatus: 'POTENTIALLY_COMPATIBLE',
    confidence: 'MEDIUM',
    rationale: {
      fr: "Garantie SOTUGAR en couverture du crédit bancaire (FGPME 75/90 ou FNG) : mécanisme public de partage des risques, instruit par la banque partenaire.",
      ar: "ضمان سوتوغار لتغطية القرض البنكي : آلية عمومية لتقاسم المخاطر، تقدم وجوباً عبر البنك الشريك."
    },
    isHistoricalOnly: true
  },

  // 5. SOTUGAR Guarantee + Movable Leasing
  {
    programAId: 'sotugar_guarantee',
    programBId: 'leasing_vehicule_pro',
    compatibilityStatus: 'POTENTIALLY_COMPATIBLE',
    confidence: 'LOW',
    rationale: {
      fr: "Une couverture peut exister pour certaines opérations de leasing mobilier éligibles. Le mécanisme actif, le matériel, le bailleur et l'accord du partenaire doivent être confirmés pour le dossier.",
      ar: "قد تتوفر تغطية لبعض عمليات الإيجار المالي المنقول المؤهلة. يجب تأكيد الآلية السارية والمعدات وشركة الإيجار وموافقة الشريك للملف المحدد."
    },
    isHistoricalOnly: false
  },

  // 6. Startup Act Guarantee Fund + Venture Capital / Seed Fund (Historical)
  {
    programAId: 'startup_guarantee_fund',
    programBId: 'venture_capital_fund',
    compatibilityStatus: 'VERIFIED_COMPATIBLE',
    confidence: 'MEDIUM',
    rationale: {
      fr: "Le Fonds de Garantie des Startups (Décret 2018-840) couvre les prises de participation des fonds d'investissement (FCPR / Seed Funds) dans les startups labellisées.",
      ar: "صندوق ضمان المؤسسات الناشئة يغطي مساهمات صناديق الاستثمار في رأس المال المخاطر للشركات الحاصلة على العلامة."
    },
    isHistoricalOnly: true
  },

  // 7. Startup Act Guarantee Fund + Bank Credit (Unknown)
  {
    programAId: 'startup_guarantee_fund',
    programBId: 'bh_bank_loan',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    rationale: {
      fr: "La garantie Startup Act pour les crédits bancaires commerciaux directs reste non confirmée au plan opérationnel.",
      ar: "ضمان قانون المؤسسات الناشئة للقروض البنكية التجارية المباشرة غير مثبت من الناحية العملية."
    },
    isHistoricalOnly: false
  },

  // 8. BTS Diplômés + Commercial Bank Loan / BFPME CMLT
  // No direct primary rule is recorded that establishes either combination
  // as universally prohibited. Keep both UNKNOWN until the exact programme
  // conventions and same-project financing rules are verified.
  {
    programAId: 'bts_diplomes',
    programBId: 'bh_bank_loan',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    rationale: {
      fr: "Aucune règle primaire directe enregistrée ne confirme une interdiction générale ni n'autorise le cumul sur le même investissement. Vérification écrite auprès de la BTS et du prêteur requise.",
      ar: "لا توجد قاعدة أولية مباشرة مسجلة تؤكد منعاً عاماً أو تجيز الجمع في الاستثمار نفسه. يلزم التثبت كتابياً لدى BTS والممول."
    },
    isHistoricalOnly: false
  },
  {
    programAId: 'bts_diplomes',
    programBId: 'bfpme_creation',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    rationale: {
      fr: "Les seuils de coût de projet publiés se chevauchent entre 150 000 et 200 000 TND selon le profil et le dispositif. L'échelle du projet ne prouve donc pas une incompatibilité; le cumul sur un même investissement reste à confirmer.",
      ar: "تتداخل حدود كلفة المشروع المنشورة بين 150 ألفاً و200 ألف دينار حسب الملف والبرنامج. لذلك لا يثبت حجم المشروع عدم التوافق؛ ويجب تأكيد الجمع في الاستثمار نفسه."
    },
    isHistoricalOnly: false
  },

  // 9. BTS Diplômés + ANETI Chèque Entreprendre (Compatible Subsidy + Microcredit)
  {
    programAId: 'bts_diplomes',
    programBId: 'aneti_cheque_entreprendre',
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    rationale: {
      fr: "Aucune source primaire actuellement enregistrée ne prouve explicitement le cumul sur un même projet. Confirmer auprès de l’ANETI et de la BTS avant de présenter un montage combiné.",
      ar: "لا يثبت أي مصدر أولي مسجل حالياً الجمع صراحةً في المشروع نفسه. يجب التأكيد لدى ANETI وBTS قبل عرض تركيبة تمويل مشتركة."
    },
    isHistoricalOnly: false
  }
];

export function getStackCompatibility(programAId: string, programBId: string): StackCompatibilityEvaluation {
  if (programAId === programBId) {
    return {
      programAId,
      programBId,
      compatibilityStatus: 'INCOMPATIBLE',
      confidence: 'HIGH',
      rationale: {
        fr: "Un même dispositif ne peut être additionné deux fois à lui-même dans une même structure.",
        ar: "لا يمكن مضاعفة نفس البرنامج مرتين في نفس الهيكل التمويلي."
      },
      isHistoricalOnly: false
    };
  }

  // 1. Check direct repository claim
  const claimCompat = CLAIMS_REPOSITORY.getDirectCompatibility(programAId, programBId);
  if (claimCompat) {
    const status = claimCompat.compatibilityStatus as string;
    return {
      programAId,
      programBId,
      compatibilityStatus: (status === 'COMPATIBLE' || status === 'VERIFIED_COMPATIBLE')
        ? 'VERIFIED_COMPATIBLE' 
        : status === 'POTENTIALLY_COMPATIBLE'
        ? 'POTENTIALLY_COMPATIBLE'
        : status === 'HISTORICAL_COMPATIBILITY'
        ? 'POTENTIALLY_COMPATIBLE'
        : status === 'UNKNOWN'
        ? 'UNKNOWN'
        : 'INCOMPATIBLE',
      confidence: claimCompat.confidence || 'MEDIUM',
      rationale: claimCompat.notes || {
        fr: "Évaluation de compatibilité issue du registre des revendications.",
        ar: "تقييم التوافق مستخرج من سجل المعطيات الرسمية."
      },
      isHistoricalOnly: claimCompat.ruleStatus === 'VERIFIED_HISTORICAL'
    };
  }

  // 2. Check local matrix (both orientations)
  const match = DOCUMENTED_COMPATIBILITY_RULES.find(
    r => (r.programAId === programAId && r.programBId === programBId) ||
         (r.programAId === programBId && r.programBId === programAId)
  );

  if (match) {
    return match;
  }

  // 3. Fallback: Strict UNKNOWN (never assume compatible)
  return {
    programAId,
    programBId,
    compatibilityStatus: 'UNKNOWN',
    confidence: 'LOW',
    rationale: {
      fr: "Compatibilité conjointe non documentée par une convention officielle ou un texte législatif publié.",
      ar: "التوافق المشترك غير موثق باتفاقية رسمية أو نص قانوني منشور."
    },
    isHistoricalOnly: false
  };
}

export function getAllCompatibilityRules(): StackCompatibilityEvaluation[] {
  return [...DOCUMENTED_COMPATIBILITY_RULES];
}

export const getPairwiseStackCompatibility = getStackCompatibility;

export const DEFAULT_STACK_COMPOSITION_RULES = [
  {
    ruleId: 'single_guarantee_limit',
    description: {
      fr: 'Une seule garantie publique de risque par assiette de crédit.',
      en: 'Only one public guarantee instrument per debt portion.'
    }
  }
];
