import { 
  ApplicantProfile, 
  FinancingProgram, 
  MatchReason, 
  MatchResult, 
  Provider,
  ApplicabilityStatus,
  RuleEvaluation,
  FinancialEvaluation,
  EvidenceEvaluation,
  MatchStatus,
  ApplicationReadiness,
  EligibilityOutcome,
  CriteriaFit
} from '../types/financing';
import { 
  getAuthoritativeFinancingPrograms, 
  getAuthoritativeProviders, 
  getAuthoritativeRegionalDevelopmentZones,
  getAuthoritativeClaim
} from '../knowledge/authoritativeProjection';
import { calculateFinancingCost } from './financialCalculations';
import { formatVerificationNeed, getFieldLabel } from '../utils/verificationLabels';
import { getOfficialSimulator, generateExclusionReason } from '../knowledge/catalogueAdapter';
import { CLAIMS_REPOSITORY } from '../knowledge/claimsRepository';

/**
 * Evaluates whether a program is applicable to the applicant's financing need.
 * Hard applicability gate executed BEFORE any criteria scoring or rule evaluations.
 * Purely data-driven from program metadata, supportedJourneys, supportedPurposes, and buyerTypes.
 */
export function evaluateApplicability(
  applicant: ApplicantProfile,
  program: FinancingProgram
): { status: ApplicabilityStatus; reason: { fr: string; ar: string } } {
  const journey = applicant.journey;
  const purpose = applicant.purpose;

  // When neither journey nor purpose is specified by applicant, applicability cannot be judged definitively
  if (!journey && !purpose) {
    return {
      status: 'UNKNOWN',
      reason: {
        fr: `Objet ou besoin de financement non précisé : vérifier l'éligibilité pour ce mécanisme (${program.purposes.join(', ')}).`,
        ar: `موضوع أو طبيعة التمويل غير محددة : يرجى التأكد من تطابق النفقات مع هذا البرنامج (${program.purposes.join(', ')}).`
      }
    };
  }

  // 1. Check supportedJourneys metadata
  if (program.applicability?.supportedJourneys && journey) {
    if (!program.applicability.supportedJourneys.includes(journey)) {
      // If purpose is specified and supported, check if cross-journey match is valid
      const hasDirectPurposeMatch = purpose && program.purposes.includes(purpose);
      if (!hasDirectPurposeMatch) {
        return {
          status: 'NOT_APPLICABLE',
          reason: {
            fr: `Non applicable au parcours sélectionné (${journey}) : ce dispositif est destiné à d'autres objets (${program.purposes.join(', ')}).`,
            ar: `غير مطابق لهذا المسار : هذا البرنامج مخصص لأغراض تمويلية أخرى (${program.purposes.join(', ')}).`
          }
        };
      }
    }
  }

  // 2. Check supportedPurposes metadata
  if (program.applicability?.supportedPurposes && purpose) {
    if (!program.applicability.supportedPurposes.includes(purpose)) {
      return {
        status: 'NOT_APPLICABLE',
        reason: {
          fr: `Non applicable à cet objet de dépense (${purpose}) : dépenses admises (${program.applicability.supportedPurposes.join(', ')}).`,
          ar: `غير مطابق لهذا النوع من النفقات : النفقات المؤهلة تشمل (${program.applicability.supportedPurposes.join(', ')}).`
        }
      };
    }
  }

  // 3. Check Buyer Type metadata (individual vs business)
  if (program.applicability?.supportedBuyerTypes) {
    const isBusinessBuyer = applicant.vehicleBuyerType === 'business' || 
                            applicant.generalApplicantType === 'business' ||
                            applicant.legalStructure === 'suarl' ||
                            applicant.legalStructure === 'sarl' ||
                            applicant.legalStructure === 'sa';
    
    const isIndividualBuyer = (applicant.vehicleBuyerType === 'individual' && applicant.vehicleUsage === 'personal') ||
                              applicant.generalApplicantType === 'individual' ||
                              (applicant.journey === 'car' && applicant.vehicleBuyerType === 'individual') ||
                              applicant.journey === 'home_purchase' ||
                              applicant.journey === 'home_construction';

    if (isBusinessBuyer && !program.applicability.supportedBuyerTypes.includes('business')) {
      return {
        status: 'NOT_APPLICABLE',
        reason: {
          fr: "Non applicable aux entreprises : ce dispositif est réservé aux particuliers.",
          ar: "غير مطابق للمؤسسات : هذا التمويل مخصص حصراً للأفراد."
        }
      };
    }

    if (isIndividualBuyer && !program.applicability.supportedBuyerTypes.includes('individual') && !isBusinessBuyer) {
      return {
        status: 'NOT_APPLICABLE',
        reason: {
          fr: "Non applicable aux particuliers à usage privé : ce dispositif est réservé aux professionnels et personnes morales.",
          ar: "غير مطابق للأفراد للاستعمال الشخصي : هذا البرنامج موجه حصراً للشركات والمهنيين."
        }
      };
    }
  }

  // 4. Check Business Entity Requirement
  if (program.applicability?.requiresBusinessEntity) {
    const isStrictPersonal = (journey === 'car' && applicant.vehicleBuyerType === 'individual' && applicant.vehicleUsage === 'personal') ||
                            (applicant.generalApplicantType === 'individual' && !applicant.legalStructure);

    if (isStrictPersonal) {
      return {
        status: 'NOT_APPLICABLE',
        reason: {
          fr: "Dispositif réservé aux structures professionnelles ou personnes morales immatriculées.",
          ar: "آلية مخصصة حصراً للهياكل المهنية أو الشركات المسجلة بالسجل الوطني للمؤسسات."
        }
      };
    }
  }

  // 5. Check First Property Only Requirement
  if (program.applicability?.isFirstPropertyOnly && applicant.isFirstPropertyPurchase === false) {
    return {
      status: 'NOT_APPLICABLE',
      reason: {
        fr: "Non applicable : réservé exclusivement à l'acquisition d'un premier logement.",
        ar: "غير مطابق : مخصص حصراً لاقتناء المسكن الأول للأسرة."
      }
    };
  }

  // 6. Check Purpose alignment with program.purposes
  if (purpose && !program.purposes.includes(purpose)) {
    const isMatchingJourney = journey && program.applicability?.supportedJourneys?.includes(journey);
    if (!isMatchingJourney) {
      return {
        status: 'NOT_APPLICABLE',
        reason: {
          fr: `Objet non pris en charge (${purpose}) : objets admis (${program.purposes.join(', ')}).`,
          ar: `غرض التمويل غير مشمول بهذا البرنامج (${program.purposes.join(', ')}).`
        }
      };
    }
  }

  // Only after checking clear purpose/journey exclusions do we apply the
  // unresolved-applicability gate. Known mismatches remain NOT_APPLICABLE;
  // an otherwise plausible case stays UNKNOWN until its rules are verified.
  if (program.applicability?.unverifiedApplicability) {
    return {
      status: 'UNKNOWN',
      reason: {
        fr: "Applicabilité du mécanisme non vérifiée auprès des sources officielles.",
        ar: "مجال تطبيق هذه الآلية غير مؤكد استناداً للمصادر الرسمية."
      }
    };
  }

  return {
    status: 'APPLICABLE',
    reason: {
      fr: "Mécanisme applicable à ce domaine de financement.",
      ar: "آلية تمويلية مطابقة لمجال التدخل المطلوب."
    }
  };
}

export function evaluateApplicationReadiness(
  applicant: ApplicantProfile,
  program: FinancingProgram,
  ruleEvaluations: RuleEvaluation[]
): ApplicationReadiness {
  const knownFields: ApplicationReadiness['knownFields'] = [];
  const missingApplicantFields: ApplicationReadiness['missingApplicantFields'] = [];
  const lenderConfirmationFields: ApplicationReadiness['lenderConfirmationFields'] = [];

  if (applicant.financingRequested) {
    knownFields.push({
      key: 'financingRequested',
      label: { fr: 'Financement demandé', ar: 'التمويل المطلوب' },
      value: `${applicant.financingRequested.toLocaleString('fr-TN')} TND`
    });
  }
  if (applicant.userContribution !== undefined) {
    knownFields.push({
      key: 'userContribution',
      label: { fr: 'Apport personnel', ar: 'التمويل الذاتي' },
      value: `${applicant.userContribution.toLocaleString('fr-TN')} TND`
    });
  }
  if (applicant.location) {
    knownFields.push({
      key: 'location',
      label: { fr: "Gouvernorat d'implantation", ar: 'الولاية' },
      value: applicant.location
    });
  }
  if (applicant.sector) {
    knownFields.push({
      key: 'sector',
      label: { fr: "Secteur d'activité", ar: 'قطاع النشاط' },
      value: applicant.sector
    });
  }
  if (applicant.monthlyNetIncome !== undefined) {
    knownFields.push({
      key: 'monthlyNetIncome',
      label: { fr: 'Revenu net mensuel', ar: 'الدخل الصافي الشهري' },
      value: String(applicant.monthlyNetIncome.toLocaleString('fr-TN')) + ' TND'
    });
  }
  if (applicant.monthlyGrossHouseholdIncomeSmigMultiple !== undefined) {
    knownFields.push({
      key: 'monthlyGrossHouseholdIncomeSmigMultiple',
      label: { fr: 'Revenu brut du ménage (multiple du SMIG, déclaré)', ar: 'الدخل الخام للأسرة (مضاعف SMIG، تصريح)' },
      value: `${applicant.monthlyGrossHouseholdIncomeSmigMultiple.toLocaleString('fr-TN')} × SMIG`
    });
  }
  if (applicant.applicantOwnsDwelling !== undefined) {
    knownFields.push({
      key: 'applicantOwnsDwelling',
      label: { fr: 'Propriété d’un logement par le demandeur (déclarée)', ar: 'امتلاك طالب التمويل لمسكن (تصريح)' },
      value: applicant.applicantOwnsDwelling ? 'Oui / نعم' : 'Non / لا'
    });
  }
  if (applicant.hasSpouse !== undefined) {
    knownFields.push({
      key: 'hasSpouse',
      label: { fr: 'Présence d’un conjoint (déclarée)', ar: 'وجود زوج أو زوجة (تصريح)' },
      value: applicant.hasSpouse ? 'Oui / نعم' : 'Non / لا'
    });
  }
  if (applicant.hasSpouse === true && applicant.spouseOwnsDwelling !== undefined) {
    knownFields.push({
      key: 'spouseOwnsDwelling',
      label: { fr: 'Propriété d’un logement par le conjoint (déclarée)', ar: 'امتلاك الزوج أو الزوجة لمسكن (تصريح)' },
      value: applicant.spouseOwnsDwelling ? 'Oui / نعم' : 'Non / لا'
    });
  }
  if (applicant.monthlyDebtPayments !== undefined) {
    knownFields.push({
      key: 'monthlyDebtPayments',
      label: { fr: 'Mensualités de dettes existantes', ar: 'الأقساط الشهرية للديون الحالية' },
      value: String(applicant.monthlyDebtPayments.toLocaleString('fr-TN')) + ' TND'
    });
  }

  // Separate facts the applicant can supply from rules that need an official
  // interpretation. FOPROLOS' household-ownership exception and employee-category
  // gate must not be presented as applicant omissions once the relevant declarations
  // are present: those are legal/program confirmations, not missing form answers.
  for (const rule of ruleEvaluations) {
    if (rule.status !== 'UNKNOWN') continue;

    if (program.id === 'foprolos_construction' &&
        rule.ruleId === 'catalogue_crit_foprolos_household_ownership') {
      const applicantFactsMissing =
        applicant.applicantOwnsDwelling === undefined ||
        applicant.hasSpouse === undefined ||
        (applicant.hasSpouse === true && applicant.spouseOwnsDwelling === undefined);
      if (!applicantFactsMissing) {
        lenderConfirmationFields.push({
          key: rule.ruleId,
          label: {
            fr: 'Confirmation officielle requise : exception applicable aux travaux d’extension',
            ar: 'يلزم تأكيد رسمي: الاستثناء المطبق على أعمال التوسعة'
          }
        });
        continue;
      }
    }

    if (program.id === 'foprolos_construction' &&
        rule.ruleId === 'catalogue_crit_foprolos_salaried' &&
        applicant.employmentStatus !== undefined) {
      lenderConfirmationFields.push({
        key: rule.ruleId,
        label: {
          fr: 'Confirmation officielle requise : catégorie de salarié admise',
          ar: 'يلزم تأكيد رسمي: فئة الأجراء المقبولة'
        }
      });
      continue;
    }

    missingApplicantFields.push({
      key: rule.ruleId,
      label: rule.label
    });
  }

  // Unverified/Lender confirmation fields from program verification
  if (program.verification.unverifiedFields && program.verification.unverifiedFields.length > 0) {
    for (const field of program.verification.unverifiedFields) {
      lenderConfirmationFields.push({
        key: field,
        label: {
          fr: getFieldLabel(field, 'fr'),
          ar: getFieldLabel(field, 'ar')
        }
      });
    }
  }

  const requiredDocuments = program.requiredDocuments || [];
  const totalWeight = Math.max(knownFields.length + missingApplicantFields.length, 1);
  const readinessScorePercent = Math.min(100, Math.round((knownFields.length / totalWeight) * 100));

  return {
    knownFields,
    missingApplicantFields,
    lenderConfirmationFields,
    requiredDocuments,
    readinessScorePercent
  };
}

/**
 * Main compatibility evaluator combining the 4 independent dimensions:
 * 1. Applicability Gate
 * 2. Rule Evaluations (Critical vs Informational)
 * 3. Financial Compatibility
 * 4. Evidence Confidence
 */
function evaluateCatalogueCriteria(
  applicant: ApplicantProfile,
  program: FinancingProgram,
  ruleEvaluations: RuleEvaluation[],
  matchedBecause: MatchReason['matchedBecause'],
  potentialIssues: MatchReason['potentialIssues'],
  needsVerification: MatchReason['needsVerification']
): void {
  for (const criterion of program.criteria || []) {
    // These constraints already have specialized, user-facing evaluators below.
    if (criterion.field === 'financingRequested') continue;
    if (criterion.field === 'totalProjectCost' && ['bfpme_creation', 'premier_logement'].includes(program.id)) continue;
    if (criterion.field === 'hasStartupActLabel' && program.eligibilityCriteria.requiresStartupLabel) continue;
    if (criterion.field === 'isFirstPropertyPurchase' && program.applicability?.isFirstPropertyOnly) continue;

    const rawValue = (applicant as unknown as Record<string, unknown>)[criterion.field];
    const expected = criterion.expectedValue;
    let status: RuleEvaluation['status'] = 'UNKNOWN';
    let explanationFr = criterion.unknownReason || '';
    let explanationAr = '';

    if (criterion.operator === 'CUSTOM') {
      // FOPROLOS applicant answers make missing facts actionable, but do not
      // convert self-declarations into documentary proof or legal eligibility.
      if (program.id === 'foprolos_construction' && criterion.id === 'crit_foprolos_household_ownership') {
        const missing: string[] = [];
        if (applicant.applicantOwnsDwelling === undefined) missing.push('la propriété actuelle du demandeur');
        if (applicant.hasSpouse === undefined) missing.push('la présence ou non d’un conjoint');
        if (applicant.hasSpouse === true && applicant.spouseOwnsDwelling === undefined) missing.push('la propriété actuelle du conjoint');
        if (applicant.journey === 'home_construction' && applicant.constructionType === undefined) missing.push('le type de travaux (construction, rénovation ou extension)');
        if (missing.length) {
          explanationFr = `Condition FOPROLOS non évaluée : information(s) manquante(s) — ${missing.join(', ')}. Les réponses déclaratives ne remplacent pas les justificatifs.`;
        } else if (applicant.constructionType === 'extension') {
          explanationFr = 'Réponses déclaratives recueillies. L’exception liée à l’extension et les justificatifs de propriété doivent être confirmés officiellement ; statut UNKNOWN.';
        } else {
          const householdOwns = applicant.applicantOwnsDwelling === true ||
            (applicant.hasSpouse === true && applicant.spouseOwnsDwelling === true);
          explanationFr = householdOwns
            ? 'Le profil déclare une propriété dans le ménage : incompatibilité potentielle à examiner selon les règles FOPROLOS applicables et les justificatifs ; aucune exclusion automatique.'
            : 'Le profil déclare ne pas avoir de logement dans le ménage. Les justificatifs et la règle juridique applicable doivent être vérifiés avant toute conclusion.';
        }
        explanationAr = 'تم جمع التصريحات الأولية فقط؛ يجب التثبت من الوثائق وقاعدة فوبرولوس والاستثناءات المعمول بها رسمياً. تبقى النتيجة غير محسومة (UNKNOWN).';
      } else if (program.id === 'foprolos_construction' && criterion.id === 'crit_foprolos_salaried') {
        explanationFr = applicant.employmentStatus
          ? `Statut déclaré : ${applicant.employmentStatus}. Il faut vérifier la catégorie de salarié admissible et les justificatifs requis ; le seul statut professionnel ne suffit pas. Résultat UNKNOWN.`
          : 'Statut professionnel manquant. Renseignez-le, puis vérifiez la catégorie de salarié admissible et les justificatifs requis ; résultat UNKNOWN en attendant.';
        explanationAr = 'الوضعية المهنية المصرح بها لا تكفي وحدها؛ يجب التثبت من فئة الأجير المقبولة والوثائق المطلوبة. تبقى النتيجة غير محسومة.';
      } else {
        explanationFr = explanationFr || 'Cette condition nécessite une vérification spécifique qui n’est pas encore automatisée.';
        explanationAr = 'يتطلب هذا الشرط تحققاً خاصاً لم تتم أتمتته بعد.';
      }
    } else if (criterion.evidenceStatus !== 'VERIFIED' || !criterion.evidenceSourceIds?.length) {
      explanationFr = explanationFr || 'La preuve au niveau de ce critère n’est pas vérifiée : aucune conclusion automatique ne sera tirée.';
      explanationAr = 'الدليل الخاص بهذا الشرط غير مثبت؛ لن يتم استخلاص نتيجة آلية.';
    } else if (rawValue === undefined || rawValue === null || (expected === undefined && criterion.operator !== 'REQUIRED')) {
      explanationFr = explanationFr || 'Une information nécessaire au contrôle de cette condition manque dans le profil.';
      explanationAr = 'تنقص الملف معلومة ضرورية للتحقق من هذا الشرط.';
    } else {
      const value = rawValue;
      switch (criterion.operator) {
        case 'EQ': status = value === expected ? 'PASS' : 'FAIL'; break;
        case 'NEQ': status = value !== expected ? 'PASS' : 'FAIL'; break;
        case 'GT': status = typeof value === 'number' && typeof expected === 'number' ? (value > expected ? 'PASS' : 'FAIL') : 'UNKNOWN'; break;
        case 'GTE': status = typeof value === 'number' && typeof expected === 'number' ? (value >= expected ? 'PASS' : 'FAIL') : 'UNKNOWN'; break;
        case 'LT': status = typeof value === 'number' && typeof expected === 'number' ? (value < expected ? 'PASS' : 'FAIL') : 'UNKNOWN'; break;
        case 'LTE': status = typeof value === 'number' && typeof expected === 'number' ? (value <= expected ? 'PASS' : 'FAIL') : 'UNKNOWN'; break;
        case 'IN': status = Array.isArray(expected) ? (expected.includes(value) ? 'PASS' : 'FAIL') : 'UNKNOWN'; break;
        case 'NOT_IN': status = Array.isArray(expected) ? (!expected.includes(value) ? 'PASS' : 'FAIL') : 'UNKNOWN'; break;
        case 'BETWEEN': {
          const range = Array.isArray(expected) ? expected : [];
          status = typeof value === 'number' && range.length === 2 &&
            typeof range[0] === 'number' && typeof range[1] === 'number'
            ? (value >= range[0] && value <= range[1] ? 'PASS' : 'FAIL')
            : 'UNKNOWN';
          break;
        }
        case 'REQUIRED': status = value ? 'PASS' : 'FAIL'; break;
      }
      if (status === 'UNKNOWN') {
        explanationFr = explanationFr || 'La condition ne peut pas être évaluée avec les données disponibles.';
        explanationAr = explanationAr || 'لا يمكن تقييم الشرط بالمعطيات المتاحة.';
      } else if (status === 'PASS') {
        explanationFr = `Condition vérifiée : ${criterion.description.fr}`;
        explanationAr = `تم التحقق من الشرط: ${criterion.description.ar}`;
      } else {
        explanationFr = `Condition non satisfaite : ${criterion.description.fr}`;
        explanationAr = `الشرط غير مستوفى: ${criterion.description.ar}`;
      }
    }

    ruleEvaluations.push({
      ruleId: `catalogue_${criterion.id}`,
      label: criterion.description,
      criticality: criterion.critical ? 'CRITICAL' : 'IMPORTANT',
      status,
      explanation: { fr: explanationFr, ar: explanationAr || explanationFr }
    });

    if (status === 'PASS') matchedBecause.push(criterion.description);
    else if (status === 'FAIL') potentialIssues.push({ fr: explanationFr, ar: explanationAr || explanationFr });
    else needsVerification.push({ fr: explanationFr, ar: explanationAr || explanationFr });
  }
}

export function evaluateProgramCompatibility(
  applicant: ApplicantProfile,
  program: FinancingProgram,
  provider: Provider
): MatchResult {
  const matchedBecause: MatchReason['matchedBecause'] = [];
  const potentialIssues: MatchReason['potentialIssues'] = [];
  const needsVerification: MatchReason['needsVerification'] = [];
  const ruleEvaluations: RuleEvaluation[] = [];

  // Source-tracked catalogue criteria must be evaluated; missing or unverified
  // critical criteria remain UNKNOWN instead of disappearing from matching.
  evaluateCatalogueCriteria(applicant, program, ruleEvaluations, matchedBecause, potentialIssues, needsVerification);

  // =========================================================================
  // DIMENSION 1 — APPLICABILITY GATE
  // =========================================================================
  const applicability = evaluateApplicability(applicant, program);
  const officialSimulator = getOfficialSimulator(program.id);

  if (applicability.status === 'NOT_APPLICABLE') {
    potentialIssues.push(applicability.reason);

    const costEstimate = calculateFinancingCost(0, program);
    const applicationReadiness = evaluateApplicationReadiness(applicant, program, []);
    const exclusionReason = generateExclusionReason(program, 'PURPOSE_MISMATCH', applicability.reason);

    return {
      program,
      provider,
      status: 'NOT_APPLICABLE',
      eligibilityOutcome: 'INCOMPATIBLE_ON_DOCUMENTED_RULES',
      applicabilityStatus: 'NOT_APPLICABLE',
      applicabilityReason: applicability.reason,
      ruleEvaluations: [],
      financialEvaluation: {
        amountStatus: 'NOT_APPLICABLE',
        contributionStatus: 'NOT_APPLICABLE',
        overallFinancialStatus: 'INCOMPATIBLE',
        details: [applicability.reason]
      },
      evidenceEvaluation: {
        status: program.verification.status,
        isOutdated: program.verification.status === 'OUTDATED',
        hasUnverifiedFields: program.verification.unverifiedFields.length > 0,
        confidenceScore: (program.id === 'sotugar_guarantee' || (program as any).operationalStatus === 'HISTORICAL_ONLY' || program.verification.status === 'OUTDATED')
          ? 'LOW'
          : (program.verification.unverifiedFields.length > 0 || program.verification.status === 'PARTIALLY_VERIFIED')
            ? 'MEDIUM'
            : program.verification.status === 'VERIFIED' ? 'HIGH' : 'LOW',
        notes: program.verification.notes
      },
      reasons: {
        matchedBecause: [],
        potentialIssues,
        needsVerification: [],
        alignmentLevel: 'not_applicable'
      },
      costEstimate,
      applicationReadiness,
      exclusionReason,
      officialSimulator,
      compatibilitySummary: {
        fr: `Non applicable à ce besoin de financement.`,
        ar: `غير مطابق لهذا الاحتياج التمويلي.`
      },
      scoreWeight: 0
    };
  }

  // If applicability is unknown / unverified
  if (applicability.status === 'UNKNOWN') {
    needsVerification.push(applicability.reason);
  } else {
    matchedBecause.push(applicability.reason);
  }

  // Check for Full Financing ("financement intégral") request without verified terms
  const isFullFinancingCase = Boolean(
    (applicant as any).isFullFinancingRequested || 
    (applicant.userContribution === 0 && applicant.financingRequested && applicant.totalProjectCost && applicant.financingRequested >= applicant.totalProjectCost) ||
    (applicant.projectDescription && applicant.projectDescription.toLowerCase().includes('financement intégral'))
  );

  // =========================================================================
  // DIMENSION 2 — CRITERIA & RULE EVALUATIONS
  // =========================================================================

  // Rule: Degree requirement
  if (program.eligibilityCriteria.requiresDegree) {
    if (applicant.hasHigherEducationDegree === true) {
      ruleEvaluations.push({
        ruleId: 'requiresDegree',
        label: { fr: "Diplôme de l'enseignement supérieur", ar: "شهادة التعليم العالي" },
        criticality: 'CRITICAL',
        status: 'PASS',
        explanation: {
          fr: "Diplôme de l'enseignement supérieur validé.",
          ar: "شرط الشهادة الجامعية متوفر لدى المترشح."
        }
      });
      matchedBecause.push({
        fr: "Diplôme de l'enseignement supérieur validé.",
        ar: "شرط الشهادة الجامعية متوفر."
      });
    } else if (applicant.hasHigherEducationDegree === false) {
      ruleEvaluations.push({
        ruleId: 'requiresDegree',
        label: { fr: "Diplôme de l'enseignement supérieur", ar: "شهادة التعليم العالي" },
        criticality: 'CRITICAL',
        status: 'FAIL',
        explanation: {
          fr: "Ce programme exige obligatoirement un diplôme universitaire homologué.",
          ar: "هذا البرنامج يشترط وجوباً شهادة جامعية معترف بها."
        }
      });
      potentialIssues.push({
        fr: "Diplôme de l'enseignement supérieur obligatoire non renseigné ou non détenu.",
        ar: "شهادة التعليم العالي مشروطة قانوناً لهذا البرنامج."
      });
    } else {
      ruleEvaluations.push({
        ruleId: 'requiresDegree',
        label: { fr: "Diplôme de l'enseignement supérieur", ar: "شهادة التعليم العالي" },
        criticality: 'CRITICAL',
        status: 'UNKNOWN',
        explanation: {
          fr: "Diplôme universitaire à confirmer dans votre profil.",
          ar: "يرجى تأكيد توفر الشهادة الجامعية في الملف."
        }
      });
      needsVerification.push({
        fr: formatVerificationNeed('USER_INPUT_REQUIRED', 'requiresDegree', 'fr'),
        ar: formatVerificationNeed('USER_INPUT_REQUIRED', 'requiresDegree', 'ar')
      });
    }
  }

  // Rule: Startup Act Label requirement
  if (program.eligibilityCriteria.requiresStartupLabel) {
    if (applicant.hasStartupActLabel === true) {
      ruleEvaluations.push({
        ruleId: 'requiresStartupLabel',
        label: { fr: "Label officiel Startup Act", ar: "علامة مؤسسة ناشئة الرسمية" },
        criticality: 'CRITICAL',
        status: 'PASS',
        explanation: {
          fr: "Label officiel Startup Act obtenu auprès du Collège des Startups.",
          ar: "علامة مؤسسة ناشئة متحصل عليها رسمياً من لجنة الستارتاب."
        }
      });
      matchedBecause.push({
        fr: "Label officiel Startup Act validé.",
        ar: "علامة مؤسسة ناشئة رسمية متوفرة."
      });
    } else if (applicant.hasStartupActLabel === false) {
      ruleEvaluations.push({
        ruleId: 'requiresStartupLabel',
        label: { fr: "Label officiel Startup Act", ar: "علامة مؤسسة ناشئة الرسمية" },
        criticality: 'CRITICAL',
        status: 'FAIL',
        explanation: {
          fr: "Ce dispositif exige l'obtention préalable du label officiel Startup Act.",
          ar: "يشترط الحصول المسبق على علامة مؤسسة ناشئة الرسمية."
        }
      });
      potentialIssues.push({
        fr: "Label officiel Startup Act requis non obtenu.",
        ar: "علامة مؤسسة ناشئة الرسمية مطلوبة للاستفادة."
      });
    } else {
      ruleEvaluations.push({
        ruleId: 'requiresStartupLabel',
        label: { fr: "Label officiel Startup Act", ar: "علامة مؤسسة ناشئة الرسمية" },
        criticality: 'CRITICAL',
        status: 'UNKNOWN',
        explanation: {
          fr: "Statut du label Startup Act à confirmer.",
          ar: "يرجى تحديد صفة الحصول على علامة مؤسسة ناشئة."
        }
      });
      needsVerification.push({
        fr: formatVerificationNeed('USER_INPUT_REQUIRED', 'requiresStartupLabel', 'fr'),
        ar: formatVerificationNeed('USER_INPUT_REQUIRED', 'requiresStartupLabel', 'ar')
      });
    }
  }

  // Rule: First Property Purchase requirement
  if (program.applicability?.isFirstPropertyOnly) {
    if (applicant.isFirstPropertyPurchase === true) {
      ruleEvaluations.push({
        ruleId: 'isFirstPropertyPurchase',
        label: { fr: "Première acquisition résidentielle", ar: "المسكن الأول" },
        criticality: 'CRITICAL',
        status: 'PASS',
        explanation: {
          fr: "Condition de primo-accédant (premier logement) satisfaite.",
          ar: "شرط عدم ملكية مسكن سابق متوفر."
        }
      });
      matchedBecause.push({
        fr: "Éligible au titre du premier logement.",
        ar: "مؤهل بعنوان اقتناء المسكن الأول."
      });
    } else if (applicant.isFirstPropertyPurchase === false) {
      ruleEvaluations.push({
        ruleId: 'isFirstPropertyPurchase',
        label: { fr: "Première acquisition résidentielle", ar: "المسكن الأول" },
        criticality: 'CRITICAL',
        status: 'FAIL',
        explanation: {
          fr: "Réservé exclusivement aux personnes ne possédant aucun logement.",
          ar: "مخصص حصراً لمن لا يملك أي مسكن سابق."
        }
      });
      potentialIssues.push({
        fr: "Ce dispositif est strictement réservé aux primo-accédants.",
        ar: "هذا البرنامج مخصص حصراً لاقتناء المسكن الأول."
      });
    } else {
      ruleEvaluations.push({
        ruleId: 'isFirstPropertyPurchase',
        label: { fr: "Première acquisition résidentielle", ar: "المسكن الأول" },
        criticality: 'CRITICAL',
        status: 'UNKNOWN',
        explanation: {
          fr: "Vérifier l'absence de propriété immobilière antérieure.",
          ar: "التثبت من عدم ملكية مسكن سابق."
        }
      });
      needsVerification.push({
        fr: formatVerificationNeed('USER_INPUT_REQUIRED', 'exactIncomeScaleCeiling', 'fr'),
        ar: formatVerificationNeed('USER_INPUT_REQUIRED', 'exactIncomeScaleCeiling', 'ar')
      });
    }
  }

  // Specific Sector Exclusions & Exceptions for BFPME CMLT
  if (program.id === 'bfpme_creation') {
    const isResidentialDeveloper = 
      applicant.sector === 'real_estate' || 
      applicant.sector === 'residential_real_estate_promotion' ||
      (applicant as any).sector === 'real_estate_development' ||
      (applicant as any).subSector === 'residential_real_estate_promotion' ||
      (applicant.projectDescription && applicant.projectDescription.toLowerCase().includes('promotion immobilière résidentielle')) ||
      (applicant.projectDescription && applicant.projectDescription.toLowerCase().includes('promoteur immobilier'));

    if (isResidentialDeveloper) {
      ruleEvaluations.push({
        ruleId: 'sectorExclusionRealEstate',
        label: { fr: "Exclusion promotion immobilière résidentielle", ar: "استثناء البعث العقاري السكني" },
        criticality: 'CRITICAL',
        status: 'FAIL',
        explanation: {
          fr: "La promotion immobilière résidentielle est expressément exclue du périmètre BFPME.",
          ar: "البعث العقاري السكني مستثنى صراحة من نطاق تدخل بنك تمويل المؤسسات الصغرى والمتوسطة."
        }
      });
      potentialIssues.push({
        fr: "Promotion immobilière résidentielle exclue de l'intervention BFPME.",
        ar: "البعث العقاري السكني غير مؤهل لتمويل BFPME."
      });
    } else if (applicant.sector === 'tourism' || (applicant as any).sector === 'hotels_accommodation') {
      const isRuralGuesthouseException = Boolean(
        (applicant as any).subSector === 'rural_gite' ||
        (applicant as any).subSector === 'guesthouse' ||
        (applicant.projectDescription && (
          applicant.projectDescription.toLowerCase().includes('gîte rural') ||
          applicant.projectDescription.toLowerCase().includes('gite') ||
          applicant.projectDescription.toLowerCase().includes('maison d’hôtes') ||
          applicant.projectDescription.toLowerCase().includes("maison d'hôtes") ||
          applicant.projectDescription.toLowerCase().includes('guesthouse')
        ))
      );

      if (isRuralGuesthouseException) {
        ruleEvaluations.push({
          ruleId: 'bfpmeTourismGuesthouseException',
          label: { fr: "Exception gîte rural / maison d'hôtes", ar: "استثناء دار الضيافة والإقامة الريفية" },
          criticality: 'CRITICAL',
          status: 'PASS',
          explanation: {
            fr: "Exception admise : les gîtes ruraux et maisons d'hôtes sont expressément éligibles au financement BFPME.",
            ar: "استثناء مقبول : دور الضيافة والإقامات الريفية مؤهلة صراحة لتمويل BFPME."
          }
        });
        matchedBecause.push({
          fr: "Exception sectorielle BFPME : éligible au titre des maisons d'hôtes et gîtes ruraux.",
          ar: "استثناء قطاعي مقبول لدى BFPME بعنوان دور الضيافة والإقامات الريفية."
        });
      } else {
        ruleEvaluations.push({
          ruleId: 'sectorExclusionHotel',
          label: { fr: "Exclusion tourisme hôtelier classique", ar: "استثناء السياحة الفندقية الكلاسيكية" },
          criticality: 'CRITICAL',
          status: 'FAIL',
          explanation: {
            fr: "Le tourisme d'hébergement hôtelier classique est exclu de l'intervention BFPME (seuls les gîtes ruraux et maisons d'hôtes bénéficient d'une exception).",
            ar: "السياحة الفندقية الكلاسيكية مستثناة من BFPME (تستثنى دور الضيافة والإقامات الريفية فقط)."
          }
        });
        potentialIssues.push({
          fr: "Tourisme d'hébergement classique exclu de l'intervention BFPME.",
          ar: "السياحة الفندقية الكلاسيكية غير مؤهلة لتمويل BFPME."
        });
      }
    }
  }

  // Rule: Sector compatibility (General)
  const isIndividualJourney = applicant.journey === 'home_purchase' || 
                              applicant.journey === 'home_construction' || 
                              (applicant.journey === 'car' && applicant.vehicleBuyerType !== 'business');

  if (program.eligibilityCriteria.sectors && program.eligibilityCriteria.sectors.length > 0 && !isIndividualJourney && program.id !== 'bfpme_creation') {
    if (applicant.sector) {
      if (program.eligibilityCriteria.sectors.includes(applicant.sector)) {
        ruleEvaluations.push({
          ruleId: 'sector',
          label: { fr: "Secteur d'activité admissible", ar: "قطاع النشاط المؤهل" },
          criticality: 'CRITICAL',
          status: 'PASS',
          explanation: {
            fr: `Secteur "${applicant.sector}" éligible pour ce mécanisme.`,
            ar: `القطاع "${applicant.sector}" مؤهل للاستفادة من هذا البرنامج.`
          }
        });
        matchedBecause.push({
          fr: `Secteur d'activité (${applicant.sector}) éligible.`,
          ar: `قطاع النشاط (${applicant.sector}) مؤهل.`
        });
      } else {
        ruleEvaluations.push({
          ruleId: 'sector',
          label: { fr: "Secteur d'activité admissible", ar: "قطاع النشاط المؤهل" },
          criticality: 'CRITICAL',
          status: 'FAIL',
          explanation: {
            fr: `Secteur "${applicant.sector}" non admis (secteurs admis : ${program.eligibilityCriteria.sectors.join(', ')}).`,
            ar: `القطاع "${applicant.sector}" غير مشمول في هذا البرنامج.`
          }
        });
        potentialIssues.push({
          fr: `Secteur non couvert par les priorités de ce mécanisme.`,
          ar: `القطاع غير مدرج ضمن أولويات هذا البرنامج.`
        });
      }
    } else {
      ruleEvaluations.push({
        ruleId: 'sector',
        label: { fr: "Secteur d'activité admissible", ar: "قطاع النشاط المؤهل" },
        criticality: 'IMPORTANT',
        status: 'UNKNOWN',
        explanation: {
          fr: "Secteur d'activité à préciser pour confirmer l'admissibilité.",
          ar: "يرجى تحديد قطاع النشاط للتأكد من الأهلية."
        }
      });
      needsVerification.push({
        fr: formatVerificationNeed('USER_INPUT_REQUIRED', 'eligibilityCriteria', 'fr'),
        ar: formatVerificationNeed('USER_INPUT_REQUIRED', 'eligibilityCriteria', 'ar')
      });
    }
  }

  // Rule: Income Scale for Housing (Premier Logement / FOPROLOS)
  if (applicant.monthlyIncomeRange && (program.id === 'premier_logement' || program.id === 'foprolos_construction' || program.purposes.includes('first_home'))) {
    matchedBecause.push({
      fr: `Catégorie de revenu mensuel (${applicant.monthlyIncomeRange}) pour classe moyenne compatible avec le barème d'éligibilité du logement.`,
      ar: `شريحة الدخل الشهري للطبقة المتوسطة متطابقة مع جدول المداخيل المنشور.`
    });
  }

  // Rule: Vehicle purpose matching for Car journey
  if (applicant.purpose === 'vehicle' || applicant.journey === 'car') {
    if (program.purposes.includes('vehicle')) {
      matchedBecause.push({
        fr: "Acquisition de véhicule compatible avec les conditions de ce crédit.",
        ar: "اقتناء عربة متطابق مع شروط هذا القرض."
      });
    }
  }

  // Rule: Islamic Finance Structure Preference
  if (applicant.structurePreference === 'islamic' && (program.category === 'islamic_finance' || program.rateType === 'profit_margin')) {
    matchedBecause.push({
      fr: "Structure de financement islamique (Mourabaha) conforme à votre préférence.",
      ar: "صيغة تمويل إسلامي (مرابحة) متطابقة مع اختياركم."
    });
  }

  // Rule: Regional Development Zone (ZDR) bonus
  const zdrZones = getAuthoritativeRegionalDevelopmentZones();
  if (applicant.location && zdrZones.includes(applicant.location)) {
    if (program.hasRegionalDevelopmentBonus) {
      matchedBecause.push({
        fr: `Implantation à ${applicant.location} en Zone de Développement Régional (ZDR) : prime et bonification applicables.`,
        ar: `الانتصاب في ${applicant.location} بمنطقة تنمية جهوية : إمكانية التمتع بمنحة تشجيع وتفاضل.`
      });
    }
  }

  // =========================================================================
  // DIMENSION 3 — FINANCIAL COMPATIBILITY & SIMULATION
  // =========================================================================
  const financialDetails: { fr: string; ar: string }[] = [];
  let amountStatus: RuleEvaluation['status'] = 'PASS';
  let contributionStatus: RuleEvaluation['status'] = 'PASS';

  // Specific BFPME CMLT Investment Cost & Financing Ratio Checks
  if (program.id === 'bfpme_creation') {
    // 1. Min project cost boundary check: 150,000 TND
    if (applicant.totalProjectCost !== undefined) {
      if (program.projectCostMin === undefined || program.projectCostMax === undefined) {
        amountStatus = 'UNKNOWN';
        const detail = {
          fr: "Fourchette actuelle du coût de projet BFPME incomplète : les seuils minimum et maximum doivent être confirmés avant de conclure à l'adéquation.",
          ar: "نطاق كلفة المشروع الحالي لدى BFPME غير مكتمل: يجب تأكيد الحدين الأدنى والأقصى قبل استنتاج التوافق."
        };
        ruleEvaluations.push({
          ruleId: 'bfpmeProjectCostRange',
          label: { fr: "Fourchette d'investissement BFPME", ar: "نطاق الاستثمار BFPME" },
          criticality: 'CRITICAL',
          status: 'UNKNOWN',
          explanation: detail
        });
        financialDetails.push(detail);
        needsVerification.push(detail);
      } else if (applicant.totalProjectCost < program.projectCostMin) {
        amountStatus = 'FAIL';
        const detail = {
          fr: `Coût total du projet (${applicant.totalProjectCost.toLocaleString('fr-TN')} TND) inférieur au seuil minimum d'investissement de ${program.projectCostMin?.toLocaleString('fr-TN')} TND.`,
          ar: `كلفة المشروع الجملية (${applicant.totalProjectCost.toLocaleString('fr-TN')} د) أقل من الحد الأدنى للاستثمار المنشور (${program.projectCostMin?.toLocaleString('fr-TN')} د).`
        };
        ruleEvaluations.push({
          ruleId: 'bfpmeMinProjectCost',
          label: { fr: "Seuil minimum d'investissement BFPME (150 000 TND)", ar: "الحد الأدنى للاستثمار (150 ألف دينار)" },
          criticality: 'CRITICAL',
          status: 'FAIL',
          explanation: detail
        });
        financialDetails.push(detail);
        potentialIssues.push(detail);
      } else if (applicant.totalProjectCost > program.projectCostMax) {
        // 2. Max project cost boundary check: 15,000,000 TND
        amountStatus = 'FAIL';
        const detail = {
          fr: `Coût total du projet (${applicant.totalProjectCost.toLocaleString('fr-TN')} TND) dépasse le plafond d'investissement publié de ${program.projectCostMax?.toLocaleString('fr-TN')} TND.`,
          ar: `كلفة المشروع الجملية (${applicant.totalProjectCost.toLocaleString('fr-TN')} د) تتجاوز سقف الاستثمار المنشور (${program.projectCostMax?.toLocaleString('fr-TN')} د).`
        };
        ruleEvaluations.push({
          ruleId: 'bfpmeMaxProjectCost',
          label: { fr: "Plafond d'investissement BFPME (15 000 000 TND)", ar: "سقف الاستثمار BFPME (15 مليون دينار)" },
          criticality: 'CRITICAL',
          status: 'FAIL',
          explanation: detail
        });
        financialDetails.push(detail);
        potentialIssues.push(detail);
      } else {
        ruleEvaluations.push({
          ruleId: 'bfpmeProjectCostRange',
          label: { fr: "Fourchette d'investissement BFPME (150k - 15M TND)", ar: "نطاق الاستثمار BFPME (150 ألف - 15 مليون د)" },
          criticality: 'CRITICAL',
          status: 'PASS',
          explanation: {
            fr: `Coût total du projet (${applicant.totalProjectCost.toLocaleString('fr-TN')} TND) dans la fourchette d'investissement BFPME.`,
            ar: `كلفة المشروع الجملية (${applicant.totalProjectCost.toLocaleString('fr-TN')} د) ضمن نطاق الاستثمار المؤهل لـ BFPME.`
          }
        });
        matchedBecause.push({
          fr: `Investissement total (${applicant.totalProjectCost.toLocaleString('fr-TN')} TND) conforme aux normes CMLT BFPME (150k - 15M TND).`,
          ar: `كلفة الاستثمار الجملية متوافقة مع شروط BFPME (150 ألف - 15 مليون د).`
        });
      }
    }

    // 3. Absolute CMLT Ceiling: 2,500,000 TND
    if (applicant.financingRequested !== undefined && program.maxAmount <= 0) {
      amountStatus = 'UNKNOWN';
      const detail = {
        fr: "Plafond actuel du montant de crédit CMLT BFPME non établi : ne pas conclure à l'adéquation sans vérifier le plafond applicable.",
        ar: "السقف الحالي لمبلغ قرض BFPME غير مثبت: لا يمكن تأكيد التوافق دون التثبت من السقف المعمول به."
      };
      ruleEvaluations.push({
        ruleId: 'bfpmeMaxCmltCeiling',
        label: { fr: "Plafond CMLT BFPME", ar: "سقف قرض CMLT BFPME" },
        criticality: 'CRITICAL',
        status: 'UNKNOWN',
        explanation: detail
      });
      financialDetails.push(detail);
      needsVerification.push(detail);
    } else if (applicant.financingRequested !== undefined && applicant.financingRequested > program.maxAmount) {
      amountStatus = 'FAIL';
      const detail = {
        fr: `Montant CMLT demandé (${applicant.financingRequested.toLocaleString('fr-TN')} TND) dépasse le plafond de ${program.maxAmount.toLocaleString('fr-TN')} TND.`,
        ar: `مبلغ قرض CMLT المطلوب (${applicant.financingRequested.toLocaleString('fr-TN')} د) يتجاوز السقف المنشور (${program.maxAmount.toLocaleString('fr-TN')} د).`
      };
      ruleEvaluations.push({
        ruleId: 'bfpmeMaxCmltCeiling',
        label: { fr: "Plafond CMLT BFPME (2 500 000 TND)", ar: "سقف قرض CMLT (2.5 مليون دينار)" },
        criticality: 'CRITICAL',
        status: 'FAIL',
        explanation: detail
      });
      financialDetails.push(detail);
      potentialIssues.push(detail);
    }

    // 4. Percentage Ceiling: Max 65% of investment cost
    if (
      applicant.financingRequested !== undefined && 
      applicant.totalProjectCost !== undefined && 
      applicant.totalProjectCost > 0
    ) {
      const financingRatio = (applicant.financingRequested / applicant.totalProjectCost) * 100;
      const maxFinancingPercentage = program.maxFinancingPercentage;
      if (isFullFinancingCase) {
        // Full financing is an unresolved term in Mizen: do not evaluate as a simple calculation failure
        ruleEvaluations.push({
          ruleId: 'bfpmeUnresolvedFullFinancing',
          label: { fr: "Modalité de financement intégral", ar: "شروط التمويل الشامل" },
          criticality: 'CRITICAL',
          status: 'UNKNOWN',
          explanation: {
            fr: "La notion de 'Financement intégral' ne dispose pas de preuve primaire vérifiée : statut non résolu.",
            ar: "مفهوم 'التمويل الشامل' لا يتوفر على سند رسمي موثق : حالة غير مؤكدة."
          }
        });
      } else if (
        maxFinancingPercentage === undefined ||
        !Number.isFinite(maxFinancingPercentage) ||
        maxFinancingPercentage < 0 ||
        maxFinancingPercentage > 100
      ) {
        amountStatus = 'UNKNOWN';
        const invalidPercentage = typeof maxFinancingPercentage === 'number' &&
          (!Number.isFinite(maxFinancingPercentage) || maxFinancingPercentage < 0 || maxFinancingPercentage > 100);
        const detail = {
          fr: invalidPercentage
            ? "Quotité maximale de financement BFPME invalide : la valeur doit être comprise entre 0 et 100 %. Le contrôle d'éligibilité reste indéterminé."
            : "Quotité maximale de financement BFPME non établie par une revendication actuelle exploitable.",
          ar: invalidPercentage
            ? "نسبة التمويل القصوى لـ BFPME غير صالحة؛ يجب أن تكون بين 0 و100%. تظل أهلية التمويل غير محسومة."
            : "النسبة القصوى لتمويل BFPME غير مثبتة بمعلومة حالية صالحة."
        };
        ruleEvaluations.push({
          ruleId: 'bfpmeCmltRatioCeiling',
          label: { fr: "Quotité maximale CMLT BFPME", ar: "النسبة القصوى لقرض CMLT BFPME" },
          criticality: 'CRITICAL',
          status: 'UNKNOWN',
          explanation: detail
        });
        financialDetails.push(detail);
        needsVerification.push(detail);
      } else if (financingRatio > maxFinancingPercentage + 0.01) {
        amountStatus = 'FAIL';
        const detail = {
          fr: `Quotité de crédit CMLT demandée (${Math.round(financingRatio)}%) dépasse le plafond publié de ${maxFinancingPercentage}%.`,
          ar: `نسبة تمويل CMLT المطلوبة (${Math.round(financingRatio)}%) تتجاوز السقف المنشور المحدد بـ ${maxFinancingPercentage}%.`
        };
        ruleEvaluations.push({
          ruleId: 'bfpmeCmltRatioCeiling',
          label: { fr: "Plafond CMLT 65% de l'investissement", ar: "سقف التمويل 65% من كلفة الاستثمار" },
          criticality: 'CRITICAL',
          status: 'FAIL',
          explanation: detail
        });
        financialDetails.push(detail);
        potentialIssues.push(detail);
      } else {
        ruleEvaluations.push({
          ruleId: 'bfpmeCmltRatioCeiling',
          label: { fr: "Plafond CMLT 65% de l'investissement", ar: "سقف التمويل 65% من كلفة الاستثمار" },
          criticality: 'CRITICAL',
          status: 'PASS',
          explanation: {
            fr: `Quotité CMLT (${Math.round(financingRatio)}%) conforme au plafond légal de 65%.`,
            ar: `نسبة تمويل CMLT (${Math.round(financingRatio)}%) مطابقة للسقف القانوني 65%.`
          }
        });
      }
    }
  } else if (program.id === 'premier_logement') {
    const cost = applicant.totalProjectCost || 0;
    const isProjectCostOk = (!program.projectCostMin || cost >= program.projectCostMin) &&
                            (!program.projectCostMax || cost <= program.projectCostMax);
    const minimum = program.projectCostMin?.toLocaleString('fr-TN');
    const maximum = program.projectCostMax?.toLocaleString('fr-TN');
    const publishedRange = minimum && maximum
      ? `entre ${minimum} et ${maximum} TND`
      : maximum
        ? `plafonné à ${maximum} TND`
        : minimum
          ? `à partir de ${minimum} TND`
          : 'selon les conditions publiées par la banque';
    if (isProjectCostOk) {
      amountStatus = 'PASS';
      matchedBecause.push({
        fr: `Coût du logement (${cost.toLocaleString('fr-TN')} TND) conforme au plafond Premier Logement (${publishedRange}).`,
        ar: `كلفة المسكن (${cost.toLocaleString('fr-TN')} د) ضمن السقف المنشور لبرنامج المسكن الأول.`
      });
    } else {
      amountStatus = 'FAIL';
      const detail = {
        fr: `Coût du logement (${cost.toLocaleString('fr-TN')} TND) hors barème Premier Logement (${publishedRange}).`,
        ar: `كلفة المسكن (${cost.toLocaleString('fr-TN')} د) خارج السقف المنشور لبرنامج المسكن الأول.`
      };
      financialDetails.push(detail);
      potentialIssues.push(detail);
    }
  } else if (program.id === 'bts_credit_sur_honneur') {
    // The Honour Loan has category-specific maxima stored as authoritative claims,
    // not as one generic product.maxAmount. Use the applicable published tier
    // when known so a large request cannot pass as merely "unknown".
    const isMicroProject = applicant.legalStructure === 'not_yet_created' ||
      applicant.businessStage === 'idea_project';
    const isEstablishedBusiness =
      ['established_under_2y', 'established_over_2y'].includes(String(applicant.businessStage)) &&
      Boolean(applicant.legalStructure) &&
      applicant.legalStructure !== 'not_yet_created';
    // Do not default an unknown applicant category to the larger SME/community
    // tier: missing stage/structure evidence must keep the applicable ceiling UNKNOWN.
    const capField = isMicroProject
      ? 'maxFinancingAmountMicroProject'
      : isEstablishedBusiness
        ? 'maxFinancingAmountSmeCommunity'
        : undefined;
    const capClaim = capField
      ? getAuthoritativeClaim('bts_credit_sur_honneur', capField)
      : undefined;
    const tierCap = typeof capClaim?.value === 'number' ? capClaim.value : undefined;

    if (typeof applicant.financingRequested !== 'number' || !Number.isFinite(applicant.financingRequested) || applicant.financingRequested <= 0 || tierCap === undefined) {
      amountStatus = 'UNKNOWN';
      const detail = {
        fr: 'Le plafond applicable du Crédit sur l’honneur BTS doit être confirmé pour la catégorie du demandeur.',
        ar: 'يجب تأكيد السقف المطبق لقرض الشرف من BTS حسب فئة طالب التمويل.'
      };
      ruleEvaluations.push({
        ruleId: 'btsHonourLoanTierCap',
        label: { fr: 'Plafond par catégorie — Crédit sur l’honneur BTS', ar: 'السقف حسب الفئة — قرض الشرف BTS' },
        criticality: 'CRITICAL',
        status: 'UNKNOWN',
        explanation: detail
      });
      financialDetails.push(detail);
      needsVerification.push(detail);
    } else if (applicant.financingRequested > tierCap) {
      amountStatus = 'FAIL';
      const detail = {
        fr: `Montant demandé (${applicant.financingRequested.toLocaleString('fr-TN')} TND) supérieur au plafond annoncé de ${tierCap.toLocaleString('fr-TN')} TND pour cette catégorie.`,
        ar: `المبلغ المطلوب (${applicant.financingRequested.toLocaleString('fr-TN')} د) يتجاوز السقف المعلن لهذه الفئة وهو ${tierCap.toLocaleString('fr-TN')} د.`
      };
      ruleEvaluations.push({
        ruleId: 'btsHonourLoanTierCap',
        label: { fr: 'Plafond par catégorie — Crédit sur l’honneur BTS', ar: 'السقف حسب الفئة — قرض الشرف BTS' },
        criticality: 'CRITICAL',
        status: 'FAIL',
        explanation: detail
      });
      financialDetails.push(detail);
      potentialIssues.push(detail);
    } else {
      ruleEvaluations.push({
        ruleId: 'btsHonourLoanTierCap',
        label: { fr: 'Plafond par catégorie — Crédit sur l’honneur BTS', ar: 'السقف حسب الفئة — قرض الشرف BTS' },
        criticality: 'CRITICAL',
        status: 'PASS',
        explanation: {
          fr: `Montant demandé compatible avec le plafond annoncé de ${tierCap.toLocaleString('fr-TN')} TND; conditions détaillées et ouverture des dépôts à confirmer.`,
          ar: `المبلغ المطلوب ضمن السقف المعلن ${tierCap.toLocaleString('fr-TN')} د؛ يجب تأكيد الشروط التفصيلية وفتح قبول الملفات.`
        }
      });
    }
  } else if (program.category === 'guarantee' || program.id === 'startup_act_bourse') {
    // These mechanisms do not provide a project-loan amount: SOTUGAR guarantees a lender's credit,
    // while the Startup Act benefit is a founder stipend rather than a lump-sum project facility.
    amountStatus = 'UNKNOWN';
    needsVerification.push({
      fr: program.id === 'startup_act_bourse'
        ? "Cette bourse est une allocation au fondateur, pas un prêt de projet : ne pas l'imputer au montant de financement demandé."
        : "La SOTUGAR garantit un financement accordé par un prêteur; son plafond de garantie ne constitue pas un montant prêté directement.",
      ar: program.id === 'startup_act_bourse'
        ? "هذه المنحة إعانة للمؤسس وليست قرض مشروع؛ لا تُحتسب ضمن مبلغ التمويل المطلوب."
        : "سوتوغار تضمن تمويلاً يقدمه ممول آخر؛ ولا يمثل سقف الضمان مبلغ قرض مباشر."
    });
  } else {
    // A zero amount is the projection's sentinel for "not published", not a real zero-TND ceiling.
    if (applicant.financingRequested !== undefined && applicant.financingRequested > 0) {
      if (program.maxAmount > 0 && applicant.financingRequested > program.maxAmount) {
        amountStatus = 'FAIL';
        const detail = {
          fr: `Montant demandé (${applicant.financingRequested.toLocaleString('fr-TN')} TND) dépasse le plafond publié (${program.maxAmount.toLocaleString('fr-TN')} TND).`,
          ar: `المبلغ المطلوب (${applicant.financingRequested.toLocaleString('fr-TN')} د) يتجاوز السقف المنشور (${program.maxAmount.toLocaleString('fr-TN')} د).`
        };
        financialDetails.push(detail);
        potentialIssues.push(detail);
      } else if (program.minAmount > 0 && applicant.financingRequested < program.minAmount) {
        amountStatus = 'FAIL';
        const detail = {
          fr: `Montant demandé (${applicant.financingRequested.toLocaleString('fr-TN')} TND) inférieur au seuil minimal publié (${program.minAmount.toLocaleString('fr-TN')} TND).`,
          ar: `المبلغ المطلوب (${applicant.financingRequested.toLocaleString('fr-TN')} د) أقل من الحد الأدنى المنشور (${program.minAmount.toLocaleString('fr-TN')} د).`
        };
        financialDetails.push(detail);
        potentialIssues.push(detail);
      } else if (program.maxAmount > 0) {
        matchedBecause.push({
          fr: `Montant demandé (${applicant.financingRequested.toLocaleString('fr-TN')} TND) inférieur au plafond publié de ${program.maxAmount.toLocaleString('fr-TN')} TND.`,
          ar: `المبلغ المطلوب (${applicant.financingRequested.toLocaleString('fr-TN')} د) لا يتجاوز السقف المنشور ${program.maxAmount.toLocaleString('fr-TN')} د.`
        });
      } else {
        amountStatus = 'UNKNOWN';
        needsVerification.push({
          fr: "Aucun plafond de financement en montant fixe n'est établi dans les données vérifiées; confirmer la capacité du prêteur.",
          ar: "لم يتم إثبات سقف تمويل ثابت في البيانات المتحقق منها؛ يجب تأكيد قدرة الممول."
        });
      }
    } else {
      amountStatus = 'UNKNOWN';
    }
  }

  // Own contribution check
  if (applicant.userContribution !== undefined && applicant.totalProjectCost && applicant.totalProjectCost > 0) {
    const calculatedContributionPercent = (applicant.userContribution / applicant.totalProjectCost) * 100;
    if (calculatedContributionPercent < program.minContributionPercent && !isFullFinancingCase) {
      contributionStatus = 'FAIL';
      const detail = {
        fr: `Apport propre déclaré (${Math.round(calculatedContributionPercent)}%) inférieur au minimum réglementaire de ${program.minContributionPercent}%.`,
        ar: `التمويل الذاتي المصرح (${Math.round(calculatedContributionPercent)}%) أقل من النسبة المشروطة (${program.minContributionPercent}%).`
      };
      financialDetails.push(detail);
      potentialIssues.push(detail);
    } else if (!isFullFinancingCase) {
      matchedBecause.push({
        fr: `Apport personnel (${Math.round(calculatedContributionPercent)}%) conforme à l'exigence minimale de ${program.minContributionPercent}%.`,
        ar: `التمويل الذاتي (${Math.round(calculatedContributionPercent)}%) يستجيب للنسبة المطلوبة (${program.minContributionPercent}%).`
      });
    }
  }

  // Project cost verification note when either totalProjectCost or userContribution is missing
  if (applicant.totalProjectCost === undefined || applicant.userContribution === undefined) {
    needsVerification.push({
      fr: "Coût total du projet ou apport personnel non spécifié : vérification de l'apport requise.",
      ar: "الكلفة الجملية للمشروع أو التمويل الذاتي غير محددة : يتطلب التثبت لتحديد نسبة التمويل."
    });
  }

  const overallFinancialStatus: FinancialEvaluation['overallFinancialStatus'] = 
    amountStatus === 'FAIL' || contributionStatus === 'FAIL'
      ? 'INCOMPATIBLE'
      : amountStatus === 'UNKNOWN'
      ? 'UNKNOWN'
      : 'COMPATIBLE';

  const financialEvaluation: FinancialEvaluation = {
    amountStatus,
    contributionStatus,
    overallFinancialStatus,
    details: financialDetails
  };

  // Run financial calculations
  const costEstimate = calculateFinancingCost(
    applicant.financingRequested || 0,
    program
  );

  // =========================================================================
  // DIMENSION 4 — EVIDENCE CONFIDENCE & UNVERIFIED PARAMETERS
  // =========================================================================
  const isOutdated = program.verification.status === 'OUTDATED';
  const isUnverifiedEvidence = ['UNVERIFIED', 'SOURCE_UNAVAILABLE'].includes(String(program.verification.status));

  if (program.verification.unverifiedFields && program.verification.unverifiedFields.length > 0) {
    needsVerification.push({
      fr: formatVerificationNeed('LENDER_CONFIRMATION_REQUIRED', program.verification.unverifiedFields, 'fr'),
      ar: formatVerificationNeed('LENDER_CONFIRMATION_REQUIRED', program.verification.unverifiedFields, 'ar')
    });
  }

  const isHistorical = program.id === 'sotugar_guarantee' || 
    (program as any).operationalStatus === 'HISTORICAL_ONLY' || 
    program.verification.status === 'OUTDATED' ||
    (program.verification.status as string) === 'HISTORICAL';
  const operationalStatusNeedsConfirmation =
    ['ACTIVE_NOT_CONFIRMED', 'UNKNOWN'].includes(String((program as any).operationalStatus));

  const hasUnverified = program.verification.unverifiedFields && program.verification.unverifiedFields.length > 0;
  const isPartiallyVerified = program.verification.status === 'PARTIALLY_VERIFIED' || hasUnverified;

  const confidenceScore = isHistorical
    ? 'LOW'
    : isPartiallyVerified
      ? 'MEDIUM'
      : program.verification.status === 'VERIFIED'
        ? 'HIGH'
        : 'LOW';

  const evidenceEvaluation: EvidenceEvaluation = {
    status: isHistorical ? (program.verification.status === 'OUTDATED' ? 'OUTDATED' : 'PARTIALLY_VERIFIED') : isPartiallyVerified ? 'PARTIALLY_VERIFIED' : program.verification.status,
    isOutdated,
    hasUnverifiedFields: Boolean(hasUnverified),
    confidenceScore,
    notes: program.verification.notes
  };

  // =========================================================================
  // SYNTHESIS & CATEGORICAL ORDERING
  // =========================================================================
  const criticalFailures = ruleEvaluations.filter(r => r.criticality === 'CRITICAL' && r.status === 'FAIL');
  const criticalUnknowns = ruleEvaluations.filter(r => r.criticality === 'CRITICAL' && r.status === 'UNKNOWN');
  const passedRules = ruleEvaluations.filter(r => r.status === 'PASS');
  const failedRules = ruleEvaluations.filter(r => r.status === 'FAIL');
  const unknownRules = ruleEvaluations.filter(r => r.status === 'UNKNOWN');

  // Keep documented criteria fit independent from operational availability. A
  // programme can fit the published rules while current intake remains unconfirmed.
  const criteriaFit: CriteriaFit =
    criticalFailures.length > 0 || amountStatus === 'FAIL'
      ? 'BLOCKED'
      : applicability.status === 'UNKNOWN' ||
        criticalUnknowns.length > 0 ||
        amountStatus === 'UNKNOWN' ||
        isOutdated
        ? 'UNKNOWN'
        : failedRules.length > 0 || unknownRules.length > 1 || contributionStatus === 'FAIL'
          ? 'POTENTIAL'
          : 'STRONG';

  let status: MatchStatus = 'STRONG_ALIGNMENT';
  let alignmentLevel: MatchReason['alignmentLevel'] = 'strong_alignment';
  let eligibilityOutcome: EligibilityOutcome = 'DOCUMENTED_ELIGIBILITY';
  let scoreWeight = 800; // Categorical order aid

  if (criticalFailures.length > 0 || amountStatus === 'FAIL') {
    // 1. Critical failure on documented rule: cannot be a match
    status = 'NOT_MATCHED';
    alignmentLevel = 'potential_blockers';
    eligibilityOutcome = 'INCOMPATIBLE_ON_DOCUMENTED_RULES';
    scoreWeight = 200 + (passedRules.length * 10) - (failedRules.length * 20);
  } else if (isFullFinancingCase) {
    // 2. Full financing without primary proof: returns UNKNOWN_DUE_TO_MISSING_DATA
    status = 'REQUIRES_CONFIRMATION';
    alignmentLevel = 'partial_alignment';
    eligibilityOutcome = 'UNKNOWN_DUE_TO_MISSING_DATA';
    scoreWeight = 450;
    needsVerification.push({
      fr: "Mention 'Financement intégral' non assimilable à 100% sans apport sans confirmation directe de l'agence bancaire.",
      ar: "عبارة 'تمويل شامل' لا تعني 100% قرضاً بدون تمويل ذاتي دون تأكيد مباشر من الفرع البنكي."
    });
  } else if (
    applicability.status === 'UNKNOWN' ||
    criticalUnknowns.length > 0 ||
    amountStatus === 'UNKNOWN' ||
    isOutdated ||
    isUnverifiedEvidence ||
    isPartiallyVerified ||
    operationalStatusNeedsConfirmation
  ) {
    // 3. Critical information unknown or evidence outdated
    status = 'REQUIRES_CONFIRMATION';
    alignmentLevel = 'partial_alignment';
    eligibilityOutcome = 'UNKNOWN';
    scoreWeight = 400 + (passedRules.length * 10) - (unknownRules.length * 5);
    if (operationalStatusNeedsConfirmation) {
      needsVerification.push({
        fr: "Les critères publics peuvent correspondre, mais l'ouverture actuelle des dépôts doit être confirmée auprès de l'organisme.",
        ar: "قد تتوافق المعايير المنشورة، لكن يجب التأكد من الجهة المعنية من أن قبول الملفات متاح حالياً."
      });
    }
  } else if (failedRules.length > 0 || unknownRules.length > 1 || contributionStatus === 'FAIL') {
    // 4. Potential alignment: main criteria fit, minor points to adjust
    status = 'POTENTIAL_ALIGNMENT';
    alignmentLevel = 'partial_alignment';
    eligibilityOutcome = 'POTENTIAL_ELIGIBILITY';
    scoreWeight = 600 + (passedRules.length * 10) - (failedRules.length * 10);
  } else {
    // 5. Strong verified documented alignment
    status = 'STRONG_ALIGNMENT';
    alignmentLevel = 'strong_alignment';
    eligibilityOutcome = 'DOCUMENTED_ELIGIBILITY';
    scoreWeight = 800 + (passedRules.length * 10);
  }

  const compatibilitySummary = {
    fr: status === 'STRONG_ALIGNMENT'
      ? `Forte adéquation avec les critères publics de ${provider.acronym}.`
      : status === 'POTENTIAL_ALIGNMENT'
      ? `Adéquation potentielle — critères principaux alignés.`
      : status === 'REQUIRES_CONFIRMATION'
      ? `Adéquation à confirmer — informations ou conditions préalables à vérifier.`
      : `Critères bloquants identifiés pour ce dispositif.`,
    ar: status === 'STRONG_ALIGNMENT'
      ? `تطابق قوي مع المعايير العامة المنشورة لدى ${provider.acronym}.`
      : status === 'POTENTIAL_ALIGNMENT'
      ? `تطابق محتمل — المعايير الأساسية متوافقة.`
      : status === 'REQUIRES_CONFIRMATION'
      ? `أهلية تتطلب التأكيد — معطيات أو شروط قيد التثبت.`
      : `وجود شروط غير متوفرة تعيق الاستفادة من هذا البرنامج.`
  };

  const applicationReadiness = evaluateApplicationReadiness(applicant, program, ruleEvaluations);
  const exclusionReason = status === 'NOT_MATCHED' 
    ? generateExclusionReason(program, 'CRITICAL_FAILURE', potentialIssues[0])
    : undefined;

  return {
    program,
    provider,
    status,
    eligibilityOutcome,
    criteriaFit,
    applicabilityStatus: applicability.status,
    applicabilityReason: applicability.reason,
    ruleEvaluations,
    financialEvaluation,
    evidenceEvaluation,
    reasons: {
      matchedBecause,
      potentialIssues,
      needsVerification,
      alignmentLevel
    },
    costEstimate,
    applicationReadiness,
    exclusionReason,
    officialSimulator,
    compatibilitySummary,
    scoreWeight
  };
}

/**
 * Returns categorical rank for strictly explainable, transparent ordering.
 * 1. APPLICABLE + STRONG_ALIGNMENT
 * 2. APPLICABLE + POTENTIAL_ALIGNMENT
 * 3. APPLICABLE + REQUIRES_CONFIRMATION
 * 4. APPLICABLE + NOT_MATCHED
 * 5. UNKNOWN_APPLICABILITY
 * 6. NOT_APPLICABLE
 */
export function getCategoricalRank(result: MatchResult): number {
  if (result.applicabilityStatus === 'NOT_APPLICABLE') return 6;
  if (result.applicabilityStatus === 'UNKNOWN') return 5;
  switch (result.status) {
    case 'STRONG_ALIGNMENT': return 1;
    case 'POTENTIAL_ALIGNMENT': return 2;
    case 'REQUIRES_CONFIRMATION': return 3;
    case 'NOT_MATCHED': return 4;
    case 'NOT_APPLICABLE': return 6;
    default: return 5;
  }
}

export function runMatchingEngine(applicant: ApplicantProfile): MatchResult[] {
  const providers = getAuthoritativeProviders();
  const providerMap = new Map(providers.map(p => [p.id, p]));

  const results = getAuthoritativeFinancingPrograms().map(program => {
    const provider = providerMap.get(program.providerId) || providers[0];
    return evaluateProgramCompatibility(applicant, program, provider);
  });

  // Sort strictly by categorical ranking bucket (1 through 6)
  results.sort((a, b) => {
    const rankDiff = getCategoricalRank(a) - getCategoricalRank(b);
    if (rankDiff !== 0) return rankDiff;
    return b.scoreWeight - a.scoreWeight;
  });

  return results;
}
