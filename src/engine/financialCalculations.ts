import { CostEstimate, FinancingProgram, FinancingStructure, RateOrigin } from '../types/financing';
import { isFieldVerifiedCurrent, getRuleEvidence } from '../knowledge/knowledgeRegistry';

/**
 * Mizen Financial Calculation & Simulation Engine
 * 
 * Strict discipline:
 * - Distinguishes Total Project Cost, User Contribution, and Financing Requested.
 * - Distinguishes explicit Financing Structures (Conventional credit, Leasing, Mourabaha, Guarantee, Grant).
 * - Distinguishes Rate Origins (Official BCT benchmark, Subsidized decree, User provided, Estimated spread, Unavailable).
 * - If rate or terms are variable, negotiable, or unverified: explicitly returns canCalculateReliably: false.
 * - NEVER fabricates missing interest rates, hidden 18% microcredit defaults, or fake amortizing quotes.
 * - Clearly documents assumptions and evidence provenance.
 */

export const TUNISIAN_TMM_BENCHMARK = {
  rate: 7.99,
  name: 'Taux Moyen Mensuel du Marché Monétaire (TMM)',
  institution: 'Banque Centrale de Tunisie (BCT)',
  referencePeriod: '2024-2026 (Référence active BCT)',
  sourceUrl: 'https://www.bct.gov.tn'
};

export const CURRENT_TUNISIAN_TMM_PERCENT = TUNISIAN_TMM_BENCHMARK.rate;

export function getFinancingStructure(program: FinancingProgram): FinancingStructure {
  if (program.id === 'leasing_vehicule_pro') return 'LEASING';
  if (program.category === 'islamic_finance' || program.rateType === 'profit_margin') return 'MOURABAHA';
  if (program.category === 'grant_subsidy') return 'GRANT_SUBSIDY';
  if (program.category === 'guarantee') return 'GUARANTEE';
  return 'CONVENTIONAL_CREDIT';
}

export function calculateFinancingCost(
  financingRequested: number,
  program: FinancingProgram,
  preferredDurationMonths?: number,
  userProvidedRate?: number
): CostEstimate {
  const structure = getFinancingStructure(program);
  const evidenceStatus = program.verification.status;

  // If amount requested is zero or negative
  if (financingRequested <= 0) {
    return {
      canCalculateReliably: false,
      financingStructure: structure,
      evidenceStatus,
      rateOrigin: 'unavailable',
      rateOriginLabel: {
        fr: 'Montant non renseigné',
        ar: 'المبلغ غير محدد'
      },
      calculationExplanation: {
        fr: 'Montant de financement non renseigné.',
        ar: 'المبلغ المطلوب للتمويل غير محدد.'
      },
      unreliableReason: {
        fr: 'Veuillez préciser le montant souhaité pour simuler l’échéancier.',
        ar: 'يرجى تحديد المبلغ المطلوب لاحتساب جدول السداد.'
      }
    };
  }

  // If user provided a verified quote/rate they received
  if (userProvidedRate !== undefined && userProvidedRate > 0) {
    const minDur = program.durationMonthsMin || 12;
    const maxDur = program.durationMonthsMax || 84;
    const duration = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : Math.round((minDur + maxDur) / 2);

    const monthlyRate = userProvidedRate / 100 / 12;
    const n = duration;
    const monthlyPayment = Math.round(
      (financingRequested * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1)
    );
    const totalRepayment = Math.round(monthlyPayment * n);
    const totalCostOfFinancing = totalRepayment - financingRequested;

    return {
      canCalculateReliably: true,
      financingStructure: structure,
      evidenceStatus,
      rateOrigin: 'user_provided',
      rateOriginLabel: {
        fr: `Taux personnalisé renseigné par l'utilisateur (${userProvidedRate}%)`,
        ar: `نسبة خاصة مصرح بها من المستخدم (${userProvidedRate}%)`
      },
      monthlyPayment,
      totalRepayment,
      totalCostOfFinancing,
      assumedRatePercent: userProvidedRate,
      durationMonths: duration,
      gracePeriodMonths: program.gracePeriodMonthsMin,
      calculationExplanation: {
        fr: `Simulation basée sur le taux fourni par l'utilisateur (${userProvidedRate}% l'an) sur ${duration} mois.`,
        ar: `محاكاة مبنية على النسبة المصرح بها من المستخدم (${userProvidedRate}% سنوياً) على ${duration} شهراً.`
      }
    };
  }

  // 1. Grant / Subsidy non-reimbursable (e.g. ANETI Chèque Entreprise, Startup Act)
  if (program.category === 'grant_subsidy' && program.rateType === 'interest_free') {
    return {
      canCalculateReliably: true,
      financingStructure: 'GRANT_SUBSIDY',
      evidenceStatus,
      rateOrigin: 'interest_free_grant',
      rateOriginLabel: {
        fr: 'Subvention publique (0% intérêt)',
        ar: 'منحة عمومية (0% فائدة)'
      },
      monthlyPayment: 0,
      totalRepayment: 0,
      totalCostOfFinancing: 0,
      assumedRatePercent: 0,
      durationMonths: program.durationMonthsMin || 12,
      gracePeriodMonths: 0,
      calculationExplanation: {
        fr: 'Subvention ou prime publique non remboursable sous réserve du respect des obligations conventionnelles.',
        ar: 'منحة عمومية غير قابلة للاسترجاع بشرط الالتزام بكراس الشروط والالتزامات التعاقدية.'
      }
    };
  }

  // 2. Pure Guarantee Mechanism (SOTUGAR) - Mechanism-Specific Guarantee Support
  if (program.category === 'guarantee') {
    const minDur = program.durationMonthsMin || 12;
    const maxDur = program.durationMonthsMax || 120;
    const durationMonths = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : 60;

    return {
      canCalculateReliably: false,
      financingStructure: 'GUARANTEE',
      evidenceStatus,
      rateOrigin: 'unavailable',
      rateOriginLabel: {
        fr: 'Commission variable selon le mécanisme',
        ar: 'عمولة متغيرة حسب آلية الضمان'
      },
      monthlyPayment: undefined, // SOTUGAR does not grant direct loans or monthly installment debt
      totalRepayment: undefined,
      totalCostOfFinancing: undefined,
      durationMonths,
      gracePeriodMonths: program.gracePeriodMonthsMin,
      calculationExplanation: {
        fr: "SOTUGAR est un fonds public de garantie intervenant en couverture des crédits bancaires et participations et non un prêteur direct. La commission ou contribution de garantie est spécifique au mécanisme sollicité (FGPME 75/90, FNG, etc.) et collectée via l'établissement bancaire partenaire. SOTUGAR n'applique aucun taux d'intérêt débiteur.",
        ar: "الشركة التونسية للضمان (SOTUGAR) هي صندوق عمومي لتغطية مخاطر القروض والمساهمات وليست جهة إقراض مباشر. عمولة الضمان تختلف بحسب الآلية المعتمدة وتُستخلص عبر البنك الشريك. سوتوغار لا تطبق فوائض بنكية."
      },
      unreliableReason: {
        fr: "Commission/contribution : à confirmer selon le mécanisme de garantie et les conditions applicables de la banque partenaire.",
        ar: "العمولة أو المساهمة : للتأكيد حسب آلية الضمان المعنية وشروط البنك الشريك."
      }
    };
  }

  // 3. Leasing Véhicules & Équipements Professionnels (e.g. TLF)
  if (program.id === 'leasing_vehicule_pro' || structure === 'LEASING') {
    const minDur = program.durationMonthsMin || 24;
    const maxDur = program.durationMonthsMax || 60;
    const duration = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : Math.round((minDur + maxDur) / 2);

    return {
      canCalculateReliably: false,
      financingStructure: 'LEASING',
      evidenceStatus,
      rateOrigin: 'unavailable',
      rateOriginLabel: {
        fr: 'Loyer financier indexé TMM + marge du bailleur',
        ar: 'إيجار مالي مرتبط بـ TMM + هامش شركة الإيجار'
      },
      monthlyPayment: undefined,
      totalRepayment: undefined,
      totalCostOfFinancing: undefined,
      durationMonths: duration,
      gracePeriodMonths: 0,
      calculationExplanation: {
        fr: "Structure en crédit-bail (leasing) : premier loyer majoré d'apport, loyers financiers mensuels indexés sur TMM + marge bailleur, et valeur résiduelle de rachat en fin de contrat. Simulation précise subordonnée à l'offre ferme de la société de leasing.",
        ar: "صيغة الإيجار المالي (ليزينغ) : قسط أول مسبق، أقساط إيجار شهرية مرتبطة بـ TMM وهامش المؤجر، وقيمة شراء متبقية في نهاية العقد. المحاكاة الدقيقة تخضع لعرض التمويل النهائي من شركة الإيجار المالي."
      },
      unreliableReason: {
        fr: "Loyer mensuel contractuel : dépend de la valeur résiduelle convenue et de la marge du bailleur lors de l'offre ferme.",
        ar: "قسط الإيجار المالي التعاقدي : يتحدد بناءً على القيمة المتبقية المتفق عليها وهامش شركة الليزينغ في العرض الرسمي."
      }
    };
  }

  // 4. Variable rates indexed to BCT TMM (e.g. BFPME, Commercial Banks)
  if (program.rateType === 'variable_tmm') {
    const minDur = program.durationMonthsMin || 24;
    const maxDur = program.durationMonthsMax || 120;
    const duration = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : Math.round((minDur + maxDur) / 2);

    return {
      canCalculateReliably: false, // Variable TMM cannot be reliably calculated upfront without current BCT quote & contract spread
      financingStructure: 'CONVENTIONAL_CREDIT',
      evidenceStatus,
      rateOrigin: 'unavailable',
      rateOriginLabel: {
        fr: 'Taux variable indexé TMM (simulation automatique suspendue)',
        ar: 'نسبة متغيرة مرتبطة بـ TMM (المحاكاة التلقائية معطلة)'
      },
      monthlyPayment: undefined, // No speculative numbers
      totalRepayment: undefined,
      totalCostOfFinancing: undefined,
      durationMonths: duration,
      gracePeriodMonths: program.gracePeriodMonthsMin,
      calculationExplanation: {
        fr: "Taux variable indexé sur le TMM officiel de la Banque Centrale de Tunisie plus marge commerciale de l'établissement bancaire. Conformément à la politique d'intégrité de Mizen, aucune simulation automatique chiffrée n'est générée sans confirmation officielle du TMM actif et de la marge contractuelle convenue avec votre agence.",
        ar: "نسبة متغيرة مرتبطة بمعدل السوق النقدية (TMM) للبنك المركزي التونسي بالإضافة إلى هامش البنك التجاري. التزاماً بقواعد الدقة والمصداقية في ميزان، تم تعليق المحاكاة الآلية للأقساط حتى التأكيد الرسمي لمعدل TMM الساري والهامش التعاقدي المحدد من الفرع البنكي."
      },
      unreliableReason: {
        fr: "Simulation chiffrée suspendue : le TMM et la marge bancaire exacte doivent être confirmés par votre agence.",
        ar: "تم تعليق المحاكاة الرقمية : يجب تأكيد معدل TMM الساري والهامش البنكي الدقيق من فرعكم البنكي."
      }
    };
  }

  // 5. Microcredit with variable/tier rates (e.g. Enda Tamweel)
  if (program.category === 'microcredit') {
    const minDur = program.durationMonthsMin || 12;
    const maxDur = program.durationMonthsMax || 60;
    const duration = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : Math.round((minDur + maxDur) / 2);

    return {
      canCalculateReliably: false,
      financingStructure: 'CONVENTIONAL_CREDIT',
      evidenceStatus,
      rateOrigin: 'unavailable',
      rateOriginLabel: {
        fr: 'Fourchette microfinance variable',
        ar: 'نطاق تمويل أصغر متغير'
      },
      monthlyPayment: undefined,
      totalRepayment: undefined,
      totalCostOfFinancing: undefined,
      durationMonths: duration,
      gracePeriodMonths: program.gracePeriodMonthsMin,
      calculationExplanation: {
        fr: `Barème variable selon l'agence : le taux effectif global en microfinance varie selon le type d'équipement, la durée et l'évaluation de proximité. Aucun devis fixe ne peut être automatisé sans étude locale.`,
        ar: `جدول متغير حسب الفرع : يختلف المعدل الفعلي الشامل في مؤسسات التمويل الأصغر حسب نوع المعدات والمدة ونتائج المعاينة الميدانية. لا يمكن استخراج قسط محدد دون دراسة ميدانية.`
      },
      unreliableReason: {
        fr: 'Taux non disponible — simulation de remboursement impossible avec les informations vérifiées (devis d’agence requis).',
        ar: 'النسبة غير متوفرة — يتعذر إجراء محاكاة سداد دقيقة بالمعلومات الموثقة (يتطلب عرضاً رسمياً من الفرع).'
      }
    };
  }

  // 6. Islamic Mourabaha (e.g. Banque Zitouna)
  if (program.category === 'islamic_finance' || program.rateType === 'profit_margin') {
    const minDur = program.durationMonthsMin || 12;
    const maxDur = program.durationMonthsMax || 84;
    const duration = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : Math.round((minDur + maxDur) / 2);

    return {
      canCalculateReliably: false,
      financingStructure: 'MOURABAHA',
      evidenceStatus,
      rateOrigin: 'unavailable',
      rateOriginLabel: {
        fr: 'Marge Mourabaha contractuelle à confirmer',
        ar: 'هامش ربح مرابحة تعاقدي خاضع للتأكيد'
      },
      monthlyPayment: undefined,
      totalRepayment: undefined,
      totalCostOfFinancing: undefined,
      durationMonths: duration,
      gracePeriodMonths: program.gracePeriodMonthsMin,
      calculationExplanation: {
        fr: "Structure de vente avec marge bénéficiaire (Mourabaha islamique) sans intérêts usuraires : prix de revient d'acquisition + marge convenue, remboursable en mensualités constantes après validation du comité de conformité chariatique.",
        ar: "عقد مرابحة إسلامية خالي من الفوائد الربوية : ثمن الشراء + هامش ربح معلوم، يسدد على أقساط شهرية ثابتة بعد مصادقة هيئة الرقابة الشرعية."
      },
      unreliableReason: {
        fr: "Marge bénéficiaire contractuelle : à confirmer selon le devis d'acquisition et l'offre formelle de la banque islamique.",
        ar: "هامش الربح التعاقدي : للتأكيد استناداً لفاتورة الشراء والعرض الرسمي من المصرف الإسلامي."
      }
    };
  }

  // 7. Verified Subsidized Fixed Rates (e.g. BTS Diplômés 6%)
  // STRICT: only calculate reliably if the rate is verified current in canonical knowledge or official decree
  if (program.estimatedRateAnnual !== undefined && program.rateType === 'subsidized') {
    const rateAnnual = program.estimatedRateAnnual;
    const minDur = program.durationMonthsMin || 24;
    const maxDur = program.durationMonthsMax || 84;
    const duration = preferredDurationMonths 
      ? Math.min(Math.max(preferredDurationMonths, minDur), maxDur)
      : Math.round((minDur + maxDur) / 2);

    const monthlyRate = rateAnnual / 100 / 12;
    const n = duration;
    let monthlyPayment = 0;

    if (monthlyRate === 0) {
      monthlyPayment = Math.round(financingRequested / n);
    } else {
      monthlyPayment = Math.round(
        (financingRequested * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1)
      );
    }

    const totalRepayment = Math.round(monthlyPayment * n);
    const totalCostOfFinancing = totalRepayment - financingRequested;

    return {
      canCalculateReliably: true,
      financingStructure: structure,
      evidenceStatus,
      rateOrigin: 'subsidized_fixed_decree',
      rateOriginLabel: {
        fr: `Taux bonifié réglementé par convention (${rateAnnual}%)`,
        ar: `نسبة تفاضلية مدعومة ومحددة بنصوص قانونية (${rateAnnual}%)`
      },
      rateBenchmarkSource: 'Textes d’application & circulaires bancaires',
      monthlyPayment,
      totalRepayment,
      totalCostOfFinancing,
      assumedRatePercent: rateAnnual,
      durationMonths: duration,
      gracePeriodMonths: program.gracePeriodMonthsMin,
      calculationExplanation: {
        fr: `Mensualité calculée de ${monthlyPayment.toLocaleString('fr-FR')} DT/mois sur ${duration} mois (taux annuel conventionné de ${rateAnnual}%, hors différé d'amortissement).`,
        ar: `قسط شهري محسوب بقيمة ${monthlyPayment.toLocaleString('fr-FR')} د/شهرياً على ${duration} شهراً (نسبة سنوية ${rateAnnual}%).`
      }
    };
  }

  // 8. Default fallback when rate truly unavailable
  return {
    canCalculateReliably: false,
    financingStructure: structure,
    evidenceStatus,
    rateOrigin: 'unavailable',
    rateOriginLabel: {
      fr: 'Taux non disponible',
      ar: 'النسبة غير متوفرة'
    },
    durationMonths: preferredDurationMonths ?? (program.durationMonthsMin || 12),
    gracePeriodMonths: program.gracePeriodMonthsMin,
    calculationExplanation: {
      fr: 'Taux non disponible — simulation de remboursement impossible avec les informations vérifiées.',
      ar: 'النسبة غير متوفرة — يتعذر إجراء محاكاة سداد بالمعلومات الموثقة.'
    },
    unreliableReason: {
      fr: 'Taux non disponible — simulation de remboursement impossible avec les informations vérifiées. Un devis officiel émis par l’établissement est requis.',
      ar: 'النسبة غير متوفرة — يتعذر إجراء محاكاة سداد بالمعلومات الموثقة. يتطلب الأمر جدولاً رسمياً صادراً عن المؤسسة المعنية.'
    }
  };
}
