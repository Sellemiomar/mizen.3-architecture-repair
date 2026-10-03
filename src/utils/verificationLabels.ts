import { Language } from '../types/financing';

export const FIELD_VERIFICATION_LABELS: Record<string, { fr: string; ar: string }> = {
  maxAmount: { fr: "Plafond d'intervention (Montant max)", ar: "سقف التمويل الأقصى" },
  minAmount: { fr: "Montant plancher", ar: "الحد الأدنى للتمويل" },
  minContributionPercent: { fr: "Apport personnel minimum", ar: "نسبة التمويل الذاتي الأدنى" },
  rate: { fr: "Taux d'intérêt / Formule", ar: "نسبة الفائدة / كلفة التمويل" },
  rateType: { fr: "Formule de taux réglementée", ar: "صيغة الفائدة القانونية" },
  durationMonths: { fr: "Durée d'amortissement", ar: "مدة السداد" },
  durationMonthsMax: { fr: "Durée maximale d'amortissement", ar: "أقصى مدة سداد" },
  gracePeriodMonths: { fr: "Période de différé (franchise)", ar: "فترة الإمهال" },
  gracePeriodMonthsMax: { fr: "Différé maximal", ar: "أقصى فترة إمهال" },
  guaranteeRequirements: { fr: "Garanties & Sûretés exigées", ar: "شروط الضمانات المطلوبة" },
  requiresDegree: { fr: "Exigence de diplôme supérieur", ar: "شرط الشهادة الجامعية" },
  requiresStartupLabel: { fr: "Label officiel Startup Act", ar: "علامة مؤسسة ناشئة الرسمية" },
  targetAudience: { fr: "Public cible admissible", ar: "الفئات المؤهلة" },
  purposes: { fr: "Dépenses & objets éligibles", ar: "نفقات الاستثمار المؤهلة" },
  eligibilityCriteria: { fr: "Critères d'accès & secteur", ar: "شروط الأهلية والقطاع" },
  businessAge: { fr: "Ancienneté d'activité de l'entreprise", ar: "أقدمية النشاط الفعلي للشركة" },
  
  // Specific financial & banking underwriting parameters
  exactMarginOverTMM: { fr: "Marge bancaire commerciale sur TMM", ar: "الهامش التجاري البنكي فوق TMM" },
  variableCommercialSpread: { fr: "Marge bancaire négociée", ar: "الهامش البنكي التفاوضي" },
  exactEffectiveRatePerProfile: { fr: "Taux effectif selon profil", ar: "النسبة الفعلية حسب التقييم" },
  processingFees: { fr: "Frais de dossier d'agence", ar: "مصاريف دراسة الملف" },
  fileProcessingFees: { fr: "Frais d'instruction du dossier", ar: "مصاريف دراسة الملف" },
  administrativeFolderFees: { fr: "Frais administratifs d'ouverture de dossier", ar: "المصاريف الإدارية لفتح الملف" },
  exactMonthlyLeaseRate: { fr: "Loyer financier mensuel exact", ar: "القسط الشهري الدقيق للإيجار المالي" },
  inspectionFees: { fr: "Frais de visite et de contrôle technique", ar: "مصاريف المعاينة والرقابة الفنية" },
  exactInsuranceQuote: { fr: "Prime d'assurance tous risques", ar: "معلوم التأمين الشامل" },
  commercialBankSpread: { fr: "Marge de la banque partenaire", ar: "هامش البنك التجاري الشريك" },
  exactPropertyCapUpdate: { fr: "Actualisation du barème du prix du logement", ar: "تحيين سقف ثمن المسكن" },
  exactIncomeScaleCeiling: { fr: "Barème précis des catégories de revenus", ar: "جدول فئات الدخل المصرح بها" },
  exactProfitMarginRate: { fr: "Marge Mourabaha contractuelle", ar: "هامش المرابحة التعاقدي" },
  takafulInsuranceRate: { fr: "Coût de l'assurance Takaful", ar: "كلفة التأمين التكافلي" },
  partnerBankApproval: { fr: "Accord préalable de la banque partenaire", ar: "موافقة البنك الشريك المسبقة" },
  commissionRate: { fr: "Commission/contribution de garantie", ar: "عمولة ومساهمة الضمان" },
  exactGuaranteeShare: { fr: "Quotité de garantie finale", ar: "نسبة الضمان النهائية" },
  regionalBonusRate: { fr: "Prime ZDR selon délégation exacte", ar: "منحة التنمية الجهوية الدقيقة" },
  collegeDecision: { fr: "Décision du Collège des Startups", ar: "قرار لجنة علامة المؤسسات الناشئة" },
  regionalQuota: { fr: "Quota budgétaire du bureau d'emploi", ar: "الحصة المالية لمكتب التشغيل" },
  applicationSteps: { fr: "Circuit & étapes d'instruction", ar: "مسار دراسة الملف" },
  requiredDocuments: { fr: "Checklist documentaire requise", ar: "قائمة الوثائق المطلوبة" },
  caveats: { fr: "Délais réels & contraintes de décaissement", ar: "الآجال الفعلية وضوابط الصرف" },
};

/**
 * Returns a human-readable, safe localized label for any field key.
 * NEVER returns raw camelCase, database identifiers, or internal tokens.
 */
export function getFieldLabel(fieldKey: string, language: Language): string {
  if (FIELD_VERIFICATION_LABELS[fieldKey]) {
    return FIELD_VERIFICATION_LABELS[fieldKey][language];
  }
  
  // Safe human-readable fallbacks (Never expose raw camelCase)
  return language === 'ar' 
    ? 'معطيات مالية وشروط إضافية للتأكيد' 
    : 'Condition financière spécifique à confirmer';
}

/**
 * Formats a list of fields into human-readable text.
 */
export function formatFieldList(fields: string[], language: Language): string {
  if (!fields || fields.length === 0) return language === 'ar' ? 'لا يوجد' : 'Aucun';
  return fields.map(f => getFieldLabel(f, language)).join(' • ');
}

export type VerificationCategory = 
  | 'USER_INPUT_REQUIRED'
  | 'LENDER_CONFIRMATION_REQUIRED'
  | 'DATA_NOT_VERIFIED_IN_MIZEN'
  | 'PROGRAMME_RULE_UNCLEAR_OR_OUTDATED';

/**
 * Generates an institutional, context-aware explanation for unverified or unknown items,
 * clearly distinguishing user inputs, lender underwriting terms, public catalog limits, and regulatory updates.
 */
export function formatVerificationNeed(
  category: VerificationCategory,
  fieldsOrTopic: string | string[],
  language: Language
): string {
  const formattedFields = Array.isArray(fieldsOrTopic)
    ? fieldsOrTopic.map(f => getFieldLabel(f, language)).join(', ')
    : getFieldLabel(fieldsOrTopic, language);

  switch (category) {
    case 'USER_INPUT_REQUIRED':
      return language === 'ar'
        ? `بيانات مطلوب استكمالها في استبيان المشروع : ${formattedFields}.`
        : `Information requise à préciser dans votre profil : ${formattedFields}.`;

    case 'LENDER_CONFIRMATION_REQUIRED':
      return language === 'ar'
        ? `يتم تأكيده مع المؤسسة الممولة عند دراسة الملف واللجنة الفنية : ${formattedFields}.`
        : `À confirmer auprès de l'établissement prêteur lors de l'instruction du dossier : ${formattedFields}.`;

    case 'DATA_NOT_VERIFIED_IN_MIZEN':
      return language === 'ar'
        ? `معطيات قيد التحديث في الدليل العمومي لمنصة ميزان : ${formattedFields}.`
        : `Donnée en cours de consolidation dans le référentiel public Mizen : ${formattedFields}.`;

    case 'PROGRAMME_RULE_UNCLEAR_OR_OUTDATED':
      return language === 'ar'
        ? `شروط قانونية أو سقف تنظيمي قيد التحيين بالرائد الرسمي : ${formattedFields}.`
        : `Cadre réglementaire ou barème officiel sujet à actualisation : ${formattedFields}.`;
  }
}
