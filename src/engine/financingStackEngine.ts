import { ApplicantProfile, MatchResult, FinancingProgram } from '../types/financing';
import {
  FinancingStackCandidate,
  FinancingStackResult,
  FinancingStackInput,
  StackFundingRole,
  StackComponent,
  FundingGapResult,
  StackCompatibilityEvaluation,
} from '../types/financingStack';
import { getStackCompatibility, getAllCompatibilityRules } from '../knowledge/stackCompatibility';

/**
 * Determines whether a given funding role contributes direct cash financing.
 * Guarantees and support mechanisms NEVER count as cash funding.
 */
export function isCashRole(role: StackFundingRole): boolean {
  return role === 'CASH_FINANCING' ||
         role === 'DEBT' ||
         role === 'EQUITY' ||
         role === 'QUASI_EQUITY' ||
         role === 'GRANT' ||
         role === 'SUBSIDY' ||
         role === 'LEASING' ||
         role === 'PROMOTER_CONTRIBUTION';
}

/**
 * Maps program category / type to StackFundingRole
 */
export function determineStackFundingRole(program: FinancingProgram): StackFundingRole {
  const category = (program.category || '').toLowerCase();
  const type = ((program as any).type || '').toLowerCase();
  const id = program.id.toLowerCase();

  if (category === 'guarantee' || type === 'guarantee' || id.includes('sotugar') || id.includes('guarantee')) {
    return 'GUARANTEE';
  }
  if (category === 'grant_subsidy' || category === 'grant' || category === 'subsidy' || type === 'grant' || type === 'subsidy' || id.includes('prime') || id.includes('subvention') || id.includes('grant') || id.includes('cheque')) {
    return 'GRANT';
  }
  if (category === 'equity_quasi_equity' || category === 'equity' || type === 'equity' || id.includes('capital') || id.includes('fond') || id.includes('equity') || id.includes('venture')) {
    return 'EQUITY';
  }
  if (category === 'leasing' || type === 'leasing' || id.includes('leasing') || id.includes('ijara')) {
    return 'LEASING';
  }
  if (category === 'bank_loan' || category === 'subsidized_loan' || category === 'credit' || category === 'debt' || type === 'debt' || id.includes('cmlt') || id.includes('bank') || id.includes('credit')) {
    return 'DEBT';
  }
  return 'CASH_FINANCING';
}

/**
 * Maps a FinancingProgram directly to a StackComponent
 */
export function mapProgramToStackComponent(
  program: FinancingProgram,
  options?: { financingRequested?: number; totalProjectCost?: number }
): StackComponent {
  const role = determineStackFundingRole(program);
  const isCash = isCashRole(role);
  const requested = options?.financingRequested;
  const allocatedAmount = isCash
    ? Math.min(program.maxAmount || requested || 0, requested || program.maxAmount || 0)
    : undefined;

  const ruleStat = (program as any).ruleStatus || program.verification?.status || 'VERIFIED';
  const confidence = ruleStat === 'VERIFIED_HISTORICAL' ? 'LOW' : (ruleStat === 'PARTIALLY_VERIFIED' ? 'MEDIUM' : 'HIGH');

  return {
    programId: program.id,
    programName: program.name,
    providerId: program.providerId,
    providerName: { fr: program.providerId.toUpperCase(), ar: program.providerId.toUpperCase() },
    role,
    isCashFunding: isCash,
    allocatedAmount: isCash ? allocatedAmount : undefined,
    maxPotentialAmount: program.maxAmount,
    coveragePercentage: program.maxFinancingPercentage ? program.maxFinancingPercentage / 100 : undefined,
    evidenceStatus: ruleStat,
    evidenceConfidence: confidence,
    operationalStatus: (program.id === 'bfpme_creation' || program.id === 'sotugar_guarantee') ? 'ACTIVE_NOT_CONFIRMED' : 'ACTIVE_CONFIRMED',
    caveats: program.importantCaveats
  };
}

/**
 * Calculates funding gap and separates cash funding from guarantee coverage.
 * Detects duplicate program usage (double-counting).
 */
export function calculateFundingGap(
  requiredFunding: number,
  components: StackComponent[]
): FundingGapResult {
  const seenIds = new Set<string>();
  let hasDoubleCounting = false;
  let verifiedCashFunding = 0;
  let guaranteeCoverageAmount = 0;
  const warnings: string[] = [];

  for (const comp of components) {
    if (seenIds.has(comp.programId)) {
      hasDoubleCounting = true;
      warnings.push(`Double comptage détecté : le dispositif ${comp.programName.fr} apparaît plusieurs fois.`);
      continue;
    }
    seenIds.add(comp.programId);

    if (comp.isCashFunding) {
      const amount = comp.allocatedAmount ?? comp.maxPotentialAmount ?? 0;
      verifiedCashFunding += amount;
    } else if (comp.role === 'GUARANTEE') {
      const coverage = comp.coveragePercentage ?? 0.70;
      const maxCover = comp.maxPotentialAmount ?? (requiredFunding * coverage);
      guaranteeCoverageAmount += maxCover;
    }
  }

  const remainingFundingGap = Math.max(0, requiredFunding - verifiedCashFunding);
  const cashCoverageRatio = requiredFunding > 0 ? Math.min(1, verifiedCashFunding / requiredFunding) : 1;

  return {
    requiredFunding,
    verifiedCashFunding,
    remainingFundingGap,
    cashCoverageRatio,
    guaranteeCoverageAmount,
    hasDoubleCounting,
    warnings,
  };
}

/**
 * Converts a matched program into a StackComponent
 */
export function createStackComponent(
  match: MatchResult,
  allocatedAmount?: number
): StackComponent {
  const prog = match.program;
  const role = determineStackFundingRole(prog);
  const isCash = isCashRole(role);
  const ruleStat = (prog as any).ruleStatus || prog.verification?.status || 'VERIFIED';

  return {
    programId: prog.id,
    programName: prog.name,
    providerId: prog.providerId,
    providerName: { fr: prog.providerId.toUpperCase(), ar: prog.providerId.toUpperCase() },
    role,
    isCashFunding: isCash,
    allocatedAmount,
    maxPotentialAmount: prog.maxAmount,
    coveragePercentage: prog.maxFinancingPercentage ? prog.maxFinancingPercentage / 100 : undefined,
    evidenceStatus: ruleStat,
    evidenceConfidence: match.evidenceEvaluation?.confidenceScore || 'MEDIUM',
    operationalStatus: (match.evidenceEvaluation as any)?.operationalStatus || ((prog.id === 'bfpme_creation' || prog.id === 'sotugar_guarantee') ? 'ACTIVE_NOT_CONFIRMED' : 'ACTIVE_CONFIRMED'),
    caveats: prog.importantCaveats
  };
}

/**
 * Evaluates a stack candidate composed of 2 or more components.
 */
export function evaluateStackCandidate(
  cashComponents: StackComponent[],
  supportComponents: StackComponent[],
  requiredFunding: number,
  userContribution?: number
): FinancingStackCandidate | null {
  const allComponents = [...cashComponents, ...supportComponents];
  if (allComponents.length === 0) return null;

  // Check double counting
  const ids = allComponents.map(c => c.programId);
  if (new Set(ids).size !== ids.length) {
    return null;
  }

  // Evaluate pairwise compatibilities
  const compatibilityEvaluations: StackCompatibilityEvaluation[] = [];
  let overallStatus: FinancingStackCandidate['overallStatus'] = 'SUPPORTED';
  let overallConfidence: FinancingStackCandidate['confidence'] = 'HIGH';
  const unresolvedAssumptions: { fr: string; ar: string }[] = [];
  const missingInformation: { fr: string; ar: string }[] = [];
  const calculationLimitations: { fr: string; ar: string }[] = [];
  let isReliablyCalculable = true;

  for (let i = 0; i < allComponents.length; i++) {
    const compA = allComponents[i];

    // Weakest link on confidence
    if (compA.evidenceConfidence === 'LOW' || compA.evidenceStatus === 'UNKNOWN') {
      overallConfidence = 'LOW';
    } else if (compA.evidenceConfidence === 'MEDIUM' && overallConfidence !== 'LOW') {
      overallConfidence = 'MEDIUM';
    }

    if (compA.operationalStatus === 'ACTIVE_NOT_CONFIRMED' || compA.operationalStatus === 'UNKNOWN') {
      unresolvedAssumptions.push({
        fr: `Statut opérationnel de ${compA.programName.fr} à confirmer au guichet.`,
        ar: `الوضعية العملية لـ ${compA.programName.ar} تتطلب التأكيد لدى الشباك.`
      });
    }

    for (let j = i + 1; j < allComponents.length; j++) {
      const compB = allComponents[j];
      const evalPair = getStackCompatibility(compA.programId, compB.programId);
      compatibilityEvaluations.push(evalPair);

      if (evalPair.compatibilityStatus === 'INCOMPATIBLE') {
        overallStatus = 'INCOMPATIBLE';
      } else if (evalPair.compatibilityStatus === 'UNKNOWN' && overallStatus !== 'INCOMPATIBLE') {
        overallStatus = 'UNKNOWN';
        unresolvedAssumptions.push({
          fr: evalPair.rationale.fr || '',
          ar: evalPair.rationale.ar || ''
        });
      } else if (evalPair.compatibilityStatus === 'POTENTIALLY_COMPATIBLE' && (overallStatus === 'SUPPORTED' || overallStatus === 'POTENTIALLY_COMPATIBLE')) {
        overallStatus = 'POTENTIALLY_COMPATIBLE';
        if (evalPair.isHistoricalOnly) {
          overallStatus = 'CONDITIONAL';
        }
        unresolvedAssumptions.push({
          fr: evalPair.rationale.fr || '',
          ar: evalPair.rationale.ar || ''
        });
      }

      if (evalPair.confidence === 'LOW') {
        overallConfidence = 'LOW';
      } else if (evalPair.confidence === 'MEDIUM' && overallConfidence !== 'LOW') {
        overallConfidence = 'MEDIUM';
      }
    }
  }

  // If incompatible, discard from candidate stacks
  if (overallStatus === 'INCOMPATIBLE') {
    return null;
  }

  // Calculate funding gap
  const gap = calculateFundingGap(requiredFunding, allComponents);

  // Rate & calculation safety
  for (const comp of cashComponents) {
    if (comp.role === 'DEBT' && comp.evidenceStatus === 'UNKNOWN') {
      isReliablyCalculable = false;
      calculationLimitations.push({
        fr: `Taux ou marge non confirmés pour ${comp.programName.fr} : simulation de mensualité désactivée.`,
        ar: `نسبة الفائدة أو الهامش غير مؤكدة لـ ${comp.programName.ar} : تم تعطيل احتساب القسط الشهري.`
      });
    }
  }

  const title = {
    fr: `Montage financier : ${allComponents.map(c => c.programName.fr).join(' + ')}`,
    ar: `هيكل تمويلي : ${allComponents.map(c => c.programName.ar).join(' + ')}`
  };
  const description = {
    fr: `Combinaison de ${cashComponents.length} source(s) de financement et ${supportComponents.length} mécanisme(s) de garantie/support.`,
    ar: `مزيج من ${cashComponents.length} مصدر تمويل مباشر و ${supportComponents.length} آلية ضمان أو دعم.`
  };

  return {
    id: `stack_${allComponents.map(c => c.programId).sort().join('_')}`,
    title,
    description,
    overallStatus,
    confidence: overallConfidence,
    requiredFunding,
    verifiedCashFunding: gap.verifiedCashFunding,
    remainingFundingGap: gap.remainingFundingGap,
    cashCoverageRatio: gap.cashCoverageRatio,
    promoterContribution: userContribution,
    components: cashComponents,
    supportComponents,
    compatibilityEvaluations,
    unresolvedAssumptions,
    missingInformation,
    calculationLimitations,
    isReliablyCalculable,
  };
}

/**
 * Generates and ranks defensible financing stacks from matched programs.
 */
export function generateFinancingStacks(
  input: FinancingStackInput | { applicantProfile?: ApplicantProfile; matchResults?: MatchResult[]; profile?: ApplicantProfile; matchedPrograms?: MatchResult[]; requiredFunding?: number } | MatchResult[],
  profileArg?: ApplicantProfile,
  requestedFundingArg?: number
): FinancingStackResult {
  let profile: ApplicantProfile;
  let matches: MatchResult[];
  let requiredFunding: number;

  if (Array.isArray(input)) {
    matches = input;
    profile = profileArg || { totalProjectCost: 100000, financingRequested: 80000, purpose: 'creation' } as ApplicantProfile;
    requiredFunding = requestedFundingArg ?? profile.financingRequested ?? (profile.totalProjectCost ? profile.totalProjectCost - (profile.userContribution || 0) : 80000);
  } else {
    const raw = input as any;
    matches = raw.matchResults || raw.matchedPrograms || [];
    profile = raw.applicantProfile || raw.profile || { totalProjectCost: 100000, financingRequested: 80000, purpose: 'creation' } as ApplicantProfile;
    requiredFunding = raw.requiredFunding ?? profile.financingRequested ?? (profile.totalProjectCost ? profile.totalProjectCost - (profile.userContribution || 0) : 80000);
  }

  const eligibleMatches = matches.filter(m => m.status === 'STRONG_ALIGNMENT' || m.status === 'REQUIRES_CONFIRMATION' || (m.status as string) === 'ELIGIBLE' || (m.status as string) === 'PARTIALLY_ELIGIBLE');

  const cashMatches = eligibleMatches.filter(m => isCashRole(determineStackFundingRole(m.program)));
  const supportMatches = eligibleMatches.filter(m => !isCashRole(determineStackFundingRole(m.program)));

  const candidateStacks: FinancingStackCandidate[] = [];
  const processedSignatures = new Set<string>();
  let evaluatedPairCount = 0;
  let verifiedPairs = 0;
  let potentialPairs = 0;
  let unknownPairs = 0;

  // Track pair statistics
  const allEligibleProgs = eligibleMatches.map(m => m.program.id);
  for (let i = 0; i < allEligibleProgs.length; i++) {
    for (let j = i + 1; j < allEligibleProgs.length; j++) {
      evaluatedPairCount++;
      const compat = getStackCompatibility(allEligibleProgs[i], allEligibleProgs[j]);
      if (compat.compatibilityStatus === 'VERIFIED_COMPATIBLE') verifiedPairs++;
      else if (compat.compatibilityStatus === 'POTENTIALLY_COMPATIBLE') potentialPairs++;
      else if (compat.compatibilityStatus === 'UNKNOWN') unknownPairs++;
    }
  }

  // 1. Single cash program + Guarantee support (e.g. BFPME or Bank Loan + SOTUGAR)
  for (const cash of cashMatches) {
    const cashComp = createStackComponent(cash, Math.min(cash.program.maxAmount || requiredFunding, requiredFunding));
    
    for (const sup of supportMatches) {
      const supComp = createStackComponent(sup);
      const stack = evaluateStackCandidate([cashComp], [supComp], requiredFunding, profile.userContribution);
      if (stack && stack.overallStatus !== 'INCOMPATIBLE') {
        const sig = stack.id;
        if (!processedSignatures.has(sig)) {
          processedSignatures.add(sig);
          candidateStacks.push(stack);
        }
      }
    }
  }

  // 2. Co-financing pairs: Cash A + Cash B (e.g. BFPME + Commercial Bank, or Grant + Bank Debt)
  for (let i = 0; i < cashMatches.length; i++) {
    for (let j = i + 1; j < cashMatches.length; j++) {
      const cashA = cashMatches[i];
      const cashB = cashMatches[j];

      const amountA = Math.min(cashA.program.maxAmount || requiredFunding, requiredFunding);
      const remainingNeed = Math.max(0, requiredFunding - amountA);
      const amountB = Math.min(cashB.program.maxAmount || remainingNeed, remainingNeed);

      const compA = createStackComponent(cashA, amountA);
      const compB = createStackComponent(cashB, amountB);

      // Evaluate 2-cash stack
      const stack2 = evaluateStackCandidate([compA, compB], [], requiredFunding, profile.userContribution);
      if (stack2 && stack2.overallStatus !== 'INCOMPATIBLE') {
        const sig = stack2.id;
        if (!processedSignatures.has(sig)) {
          processedSignatures.add(sig);
          candidateStacks.push(stack2);
        }
      }

      // Evaluate 2-cash + Guarantee stack (e.g. BFPME + Bank + SOTUGAR)
      for (const sup of supportMatches) {
        const supComp = createStackComponent(sup);
        const stack3 = evaluateStackCandidate([compA, compB], [supComp], requiredFunding, profile.userContribution);
        if (stack3 && stack3.overallStatus !== 'INCOMPATIBLE') {
          const sig = stack3.id;
          if (!processedSignatures.has(sig)) {
            processedSignatures.add(sig);
            candidateStacks.push(stack3);
          }
        }
      }
    }
  }

  // Strict deterministic ranking according to spec:
  // 1. Verified compatible stacks (SUPPORTED)
  // 2. Fewer unresolved critical assumptions
  // 3. Fewer instruments when coverage is equivalent
  // 4. Stronger evidence confidence
  // 5. Smaller remaining funding gap
  const statusWeight: Record<string, number> = {
    SUPPORTED: 4,
    POTENTIALLY_COMPATIBLE: 3,
    CONDITIONAL: 2,
    UNKNOWN: 1,
    INCOMPATIBLE: 0,
  };

  const confidenceWeight: Record<string, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const rankedStacks = candidateStacks.sort((a, b) => {
    const diffStatus = (statusWeight[a.overallStatus] || 0) - (statusWeight[b.overallStatus] || 0);
    if (diffStatus !== 0) return -diffStatus;

    const diffAssumptions = a.unresolvedAssumptions.length - b.unresolvedAssumptions.length;
    if (diffAssumptions !== 0) return diffAssumptions;

    const totalInstA = a.components.length + a.supportComponents.length;
    const totalInstB = b.components.length + b.supportComponents.length;
    if (Math.abs(a.verifiedCashFunding - b.verifiedCashFunding) < 1 && totalInstA !== totalInstB) {
      return totalInstA - totalInstB;
    }

    const diffConf = (confidenceWeight[a.confidence] || 0) - (confidenceWeight[b.confidence] || 0);
    if (diffConf !== 0) return -diffConf;

    return a.remainingFundingGap - b.remainingFundingGap;
  });

  return {
    requiredFunding,
    totalProjectCost: profile.totalProjectCost,
    userContribution: profile.userContribution,
    stacks: rankedStacks,
    evaluatedPairCount,
    evidenceSummary: {
      verifiedPairs,
      potentialPairs,
      unknownPairs,
    }
  };
}
