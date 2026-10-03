/**
 * Mizen - Catalogue Adapter & Normalization Layer
 * Bridges canonical knowledge repository with runtime matching engine & UI components.
 */

import { FinancingProgram, Provider } from '../types/financing';
import { 
  FinancingProduct, 
  FinancingProvider, 
  ExclusionReason,
  ExclusionReasonCode,
  LocalizedText,
  SimulatorReference
} from '../types/knowledge';
import { CANONICAL_PROVIDERS, CANONICAL_PRODUCTS, CANONICAL_METADATA } from './canonicalCatalogue';

/**
 * Finds the official simulator reference for a program/product if one exists.
 */
export function getOfficialSimulator(productId: string): SimulatorReference | undefined {
  const product = CANONICAL_PRODUCTS.find(p => p.id === productId);
  return product?.simulator;
}

/**
 * Generates an explicit, transparent exclusion explanation for why a mechanism was NOT proposed.
 */
export function generateExclusionReason(
  product: FinancingProduct | FinancingProgram,
  reasonCode: ExclusionReasonCode,
  customNote?: LocalizedText
): ExclusionReason {
  const isCanonical = 'category' in product;
  const productName: LocalizedText = isCanonical 
    ? (product as FinancingProduct).name 
    : { fr: (product as FinancingProgram).name.fr, ar: (product as FinancingProgram).name.ar };
  const providerId = product.providerId;

  let explanation: LocalizedText = {
    fr: "Ce mécanisme n'a pas été retenu pour ce profil de financement.",
    ar: "لم يتم اقتراح هذه الآلية لعدم تطابقها مع معطيات هذا الملف."
  };

  switch (reasonCode) {
    case 'PURPOSE_MISMATCH':
      explanation = {
        fr: "Non retenu car ce dispositif est exclusivement destiné à d'autres objets de financement (ex. logement, industrie ou équipement).",
        ar: "غير مقترح لأن هذا البرنامج مخصص حصرياً لمجالات تمويلية أخرى (مثل السكن أو الصناعة أو المعدات)."
      };
      break;
    case 'APPLICANT_TYPE_MISMATCH':
      explanation = {
        fr: "Non retenu car ce dispositif exige un statut juridique ou profil d'emprunteur distinct (ex. personne morale, diplômé du supérieur).",
        ar: "غير مقترح لأن هذا الإجراء يتطلب صفة قانونية أو وضعية خاصة للمقترض (مثل شركة قائمة أو شهادة جامعية)."
      };
      break;
    case 'ASSET_MISMATCH':
      explanation = {
        fr: "Non retenu en raison de la nature du bien financé (condition neuf/occasion ou type d'actif).",
        ar: "غير مقترح بسبب طبيعة الأصل الممول (شرط الجديد أو المستعمل أو صنف الأصل)."
      };
      break;
    case 'AMOUNT_OUT_OF_RANGE':
      explanation = {
        fr: "Non retenu car le montant demandé se situe en dehors des plafonds ou planchers réglementaires de ce dispositif.",
        ar: "غير مقترح لأن مبلغ التمويل المطلوب خارج السقف أو الحد الأدنى القانوني لهذا البرنامج."
      };
      break;
    case 'CRITICAL_FAILURE':
      explanation = {
        fr: "Non retenu en raison d'un critère d'éligibilité bloquant non satisfait.",
        ar: "غير مقترح لوجود شرط أهلية مانع غير متوفر في هذا الملف."
      };
      break;
    case 'PRODUCT_INACTIVE':
      explanation = {
        fr: "Ce dispositif est actuellement inactif ou suspendu.",
        ar: "هذا البرنامج غير مفعل أو معلق حالياً."
      };
      break;
    default:
      if (customNote) explanation = customNote;
  }

  if (customNote) {
    explanation = customNote;
  }

  return {
    productId: product.id,
    productName,
    providerId,
    reasonCode,
    explanation
  };
}

/**
 * Returns metadata summary of the canonical catalogue.
 */
export function getCatalogueHealthSummary() {
  return {
    metadata: CANONICAL_METADATA,
    providers: CANONICAL_PROVIDERS.map(p => ({
      id: p.id,
      name: p.name,
      acronym: p.acronym,
      type: p.type,
      sourcesCount: p.sources.length,
      status: p.status
    })),
    products: CANONICAL_PRODUCTS.map(pr => ({
      id: pr.id,
      nameFr: pr.name.fr,
      category: pr.category,
      providerId: pr.providerId,
      verificationStatus: pr.verification.status,
      sourcesCount: pr.sources.length,
      hasSimulator: Boolean(pr.simulator)
    }))
  };
}
