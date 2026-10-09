import type { Language } from '../types/financing';

/**
 * Render only evidenced financing boundaries. Runtime zero values mean that a
 * floor/ceiling has not been established; they are not literal 0 DT limits.
 */
export function formatFinancingAmountRange(
  minAmount: number,
  maxAmount: number,
  language: Language
): string {
  const min = minAmount > 0 ? minAmount.toLocaleString('fr-FR') : undefined;
  const max = maxAmount > 0 ? maxAmount.toLocaleString('fr-FR') : undefined;

  if (min && max) return `${min} – ${max} DT`;
  if (min) {
    return language === 'ar'
      ? `ابتداءً من ${min} د.ت — السقف غير محدد`
      : `À partir de ${min} DT — plafond non établi`;
  }
  if (max) {
    return language === 'ar'
      ? `الحد الأدنى غير محدد — السقف ${max} د.ت`
      : `Montant minimum non établi — plafond ${max} DT`;
  }
  return language === 'ar'
    ? 'السقف غير منشور — يرجى التأكد لدى الجهة المعنية'
    : 'Plafond non publié — à confirmer auprès de l’organisme';
}
