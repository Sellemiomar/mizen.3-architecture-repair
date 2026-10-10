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
import { getStackCompatibility } from '../knowledge/stackCompatibility';

const UNKNOWN_EVIDENCE = new Set(['UNKNOWN', 'CONFLICTING', 'OUTDATED']);

/** Direct cash roles. Guarantees and support instruments are never cash. */
export function isCashRole(role: StackFundingRole): boolean {
  return role === 'CASH_FINANCING' || role === 'DEBT' || role === 'EQUITY' ||
    role === 'QUASI_EQUITY' || role === 'GRANT' || role === 'SUBSIDY' ||
    role === 'LEASING' || role === 'PROMOTER_CONTRIBUTION';
}

export function determineStackFundingRole(program: FinancingProgram): StackFundingRole {
  const category = (program.category || '').toLowerCase();
  const type = String((program as any).type || '').toLowerCase();
  const id = program.id.toLowerCase();

  if (category === 'guarantee' || type === 'guarantee' || id.includes('sotugar') || id.includes('guarantee')) return 'GUARANTEE';
  if (id === 'startup_act_bourse' || id === 'aneti_cheque_entreprendre') return 'OTHER_SUPPORT';
  // ANETI's Chèque Entreprendre support type is not verified; its name is not evidence of a grant.
  if (category === 'grant_subsidy' || category === 'grant' || category === 'subsidy' || type === 'grant' || type === 'subsidy' || id.includes('prime') || id.includes('subvention') || id.includes('grant')) return 'GRANT';
  if (id === 'foprodi_dotation' || category === 'quasi_equity' || category === 'equity_quasi_equity' || category === 'equity' || type === 'quasi_equity' || type === 'equity' || id.includes('capital') || id.includes('fond') || id.includes('equity') || id.includes('venture')) return id === 'foprodi_dotation' || category === 'quasi_equity' || type === 'quasi_equity' ? 'QUASI_EQUITY' : 'EQUITY';
  if (category === 'leasing' || type === 'leasing' || id.includes('leasing') || id.includes('ijara')) return 'LEASING';
  if (category === 'bank_loan' || category === 'subsidized_loan' || category === 'credit' || category === 'debt' || type === 'debt' || id.includes('cmlt') || id.includes('bank') || id.includes('credit') || id.includes('mourabaha')) return 'DEBT';
  return 'CASH_FINANCING';
}

export function mapProgramToStackComponent(program: FinancingProgram, options?: { financingRequested?: number; totalProjectCost?: number }): StackComponent {
  const role = determineStackFundingRole(program);
  const requested = options?.financingRequested;
  let allocatedAmount: number | undefined;
  if (isCashRole(role) && typeof requested === 'number' && requested > 0) {
    const cap = typeof program.maxAmount === 'number' && program.maxAmount > 0 ? program.maxAmount : requested;
    allocatedAmount = Math.min(cap, requested);
  }
  const ruleStatus = (program as any).ruleStatus || program.verification?.status || 'VERIFIED';
  const evidenceConfidence = ruleStatus === 'VERIFIED_HISTORICAL' || UNKNOWN_EVIDENCE.has(ruleStatus) ? 'LOW' : ruleStatus === 'PARTIALLY_VERIFIED' ? 'MEDIUM' : 'HIGH';
  return {
    programId: program.id,
    programName: program.name,
    providerId: program.providerId,
    providerName: { fr: program.providerId.toUpperCase(), ar: program.providerId.toUpperCase() },
    role,
    isCashFunding: isCashRole(role),
    allocatedAmount,
    maxPotentialAmount: program.maxAmount,
    coveragePercentage: program.maxFinancingPercentage ? program.maxFinancingPercentage / 100 : undefined,
    rateType: program.rateType,
    evidenceStatus: ruleStatus,
    evidenceConfidence,
    operationalStatus: (program as any).operationalStatus || 'ACTIVE_NOT_CONFIRMED',
    caveats: program.importantCaveats
  };
}

/**
 * Cash accounting is deliberately conservative:
 * - only an explicitly allocated positive amount counts as cash;
 * - maxPotentialAmount is never silently converted into cash;
 * - guarantees are tracked separately and never reduce the cash gap.
 */
export function calculateFundingGap(requiredFunding: number, components: StackComponent[]): FundingGapResult {
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

    if (comp.role === 'GUARANTEE' || !comp.isCashFunding) {
      if (comp.role === 'GUARANTEE') {
        const coverage = comp.coveragePercentage;
        const maxCover = comp.maxPotentialAmount;
        if (typeof maxCover === 'number' && maxCover > 0) guaranteeCoverageAmount += maxCover;
        else if (typeof coverage === 'number' && coverage > 0) guaranteeCoverageAmount += requiredFunding * coverage;
      }
      continue;
    }

    // An unknown/unresolved amount is not zero-valued financing and is not
    // allowed to inherit the program ceiling merely because it exists.
    if (typeof comp.allocatedAmount !== 'number' || comp.allocatedAmount <= 0) continue;
    if (UNKNOWN_EVIDENCE.has(String(comp.evidenceStatus)) || comp.evidenceStatus === 'VERIFIED_HISTORICAL') continue;
    if (comp.operationalStatus === 'HISTORICAL_ONLY' || comp.operationalStatus === 'INACTIVE_CONFIRMED') continue;

    verifiedCashFunding += comp.allocatedAmount;
  }

  verifiedCashFunding = Math.min(requiredFunding, verifiedCashFunding);
  const remainingFundingGap = Math.max(0, requiredFunding - verifiedCashFunding);
  const cashCoverageRatio = requiredFunding > 0 ? Math.min(1, verifiedCashFunding / requiredFunding) : 1;
  return { requiredFunding, verifiedCashFunding, remainingFundingGap, cashCoverageRatio, guaranteeCoverageAmount, hasDoubleCounting, warnings };
}

export function createStackComponent(match: MatchResult, allocatedAmount?: number): StackComponent {
  const prog = match.program;
  const role = determineStackFundingRole(prog);
  const isCash = isCashRole(role);
  const ruleStatus = (prog as any).ruleStatus || prog.verification?.status || 'VERIFIED';
  const validAllocatedAmount = isCash && typeof allocatedAmount === 'number' && allocatedAmount > 0 ? allocatedAmount : undefined;
  return {
    programId: prog.id,
    programName: prog.name,
    providerId: prog.providerId,
    providerName: { fr: prog.providerId.toUpperCase(), ar: prog.providerId.toUpperCase() },
    role,
    isCashFunding: isCash,
    allocatedAmount: validAllocatedAmount,
    maxPotentialAmount: prog.maxAmount,
    coveragePercentage: prog.maxFinancingPercentage ? prog.maxFinancingPercentage / 100 : undefined,
    rateType: prog.rateType,
    evidenceStatus: ruleStatus,
    evidenceConfidence: match.evidenceEvaluation?.confidenceScore || (ruleStatus === 'VERIFIED_HISTORICAL' || UNKNOWN_EVIDENCE.has(ruleStatus) ? 'LOW' : 'MEDIUM'),
    operationalStatus: (match.evidenceEvaluation as any)?.operationalStatus || (prog as any).operationalStatus || 'ACTIVE_NOT_CONFIRMED',
    caveats: prog.importantCaveats
  };
}

export function evaluateStackCandidate(cashComponents: StackComponent[], supportComponents: StackComponent[], requiredFunding: number, userContribution?: number): FinancingStackCandidate | null {
  const allComponents = [...cashComponents, ...supportComponents];
  if (allComponents.length < 2) return null;
  const ids = allComponents.map(c => c.programId);
  if (new Set(ids).size !== ids.length) return null;

  if (cashComponents.length > 1 && cashComponents.some(c => !c.allocatedAmount || c.allocatedAmount <= 0)) return null;

  const compatibilityEvaluations: StackCompatibilityEvaluation[] = [];
  let overallStatus: FinancingStackCandidate['overallStatus'] = 'SUPPORTED';
  let overallConfidence: FinancingStackCandidate['confidence'] = 'HIGH';
  const unresolvedAssumptions: { fr: string; ar: string }[] = [];
  const missingInformation: { fr: string; ar: string }[] = [];
  const calculationLimitations: { fr: string; ar: string }[] = [];
  let isReliablyCalculable = true;

  for (const comp of allComponents) {
    if (comp.evidenceConfidence === 'LOW' || UNKNOWN_EVIDENCE.has(String(comp.evidenceStatus))) overallConfidence = 'LOW';
    else if (comp.evidenceConfidence === 'MEDIUM' && overallConfidence !== 'LOW') overallConfidence = 'MEDIUM';

    if (UNKNOWN_EVIDENCE.has(String(comp.evidenceStatus))) {
      overallStatus = 'UNKNOWN';
      unresolvedAssumptions.push({
        fr: `Évidence actuelle insuffisante pour ${comp.programName.fr} : cette composante ne peut pas être présentée comme financement confirmé.`,
        ar: `الأدلة الحالية غير كافية لـ ${comp.programName.ar} : لا يمكن عرض هذا المكوّن كتمويل مؤكد.`
      });
    } else if (comp.evidenceStatus === 'VERIFIED_HISTORICAL') {
      if (overallStatus === 'SUPPORTED') overallStatus = 'CONDITIONAL';
      unresolvedAssumptions.push({
        fr: `La preuve de ${comp.programName.fr} est historique et doit être confirmée pour le montage actuel.`,
        ar: `الدليل الخاص بـ ${comp.programName.ar} تاريخي ويجب تأكيده للتركيب الحالي.`
      });
    }

    if (comp.operationalStatus === 'ACTIVE_NOT_CONFIRMED' || comp.operationalStatus === 'UNKNOWN') {
      unresolvedAssumptions.push({
        fr: `Statut opérationnel de ${comp.programName.fr} à confirmer au guichet.`,
        ar: `الوضعية العملية لـ ${comp.programName.ar} تتطلب التأكيد لدى الشباك.`
      });
    }
  }

  for (let i = 0; i < allComponents.length; i++) {
    for (let j = i + 1; j < allComponents.length; j++) {
      const evalPair = getStackCompatibility(allComponents[i].programId, allComponents[j].programId);
      compatibilityEvaluations.push(evalPair);
      if (evalPair.compatibilityStatus === 'INCOMPATIBLE') overallStatus = 'INCOMPATIBLE';
      else if (evalPair.compatibilityStatus === 'UNKNOWN') {
        overallStatus = 'UNKNOWN';
        unresolvedAssumptions.push({ fr: evalPair.rationale.fr || '', ar: evalPair.rationale.ar || '' });
      } else if (evalPair.compatibilityStatus === 'POTENTIALLY_COMPATIBLE' && overallStatus === 'SUPPORTED') {
        overallStatus = evalPair.isHistoricalOnly ? 'CONDITIONAL' : 'POTENTIALLY_COMPATIBLE';
        unresolvedAssumptions.push({ fr: evalPair.rationale.fr || '', ar: evalPair.rationale.ar || '' });
      }
      if (evalPair.confidence === 'LOW') overallConfidence = 'LOW';
      else if (evalPair.confidence === 'MEDIUM' && overallConfidence !== 'LOW') overallConfidence = 'MEDIUM';
    }
  }

  if (overallStatus === 'INCOMPATIBLE') return null;
  const gap = calculateFundingGap(requiredFunding, allComponents);
  if (gap.hasDoubleCounting) return null;

  for (const comp of cashComponents) {
    if (comp.role === 'DEBT' && (comp.rateType === 'unknown' || comp.programId === 'bfpme_creation' || UNKNOWN_EVIDENCE.has(String(comp.evidenceStatus)))) {
      isReliablyCalculable = false;
      calculationLimitations.push({
        fr: `Taux ou marge non confirmés pour ${comp.programName.fr} : simulation de mensualité désactivée.`,
        ar: `نسبة الفائدة أو الهامش غير مؤكدة لـ ${comp.programName.ar} : تم تعطيل احتساب القسط الشهري.`
      });
    }
  }

  return {
    id: `stack_${allComponents.map(c => c.programId).sort().join('_')}`,
    title: { fr: `Montage financier : ${allComponents.map(c => c.programName.fr).join(' + ')}`, ar: `هيكل تمويلي : ${allComponents.map(c => c.programName.ar).join(' + ')}` },
    description: {
      fr: `Combinaison de ${cashComponents.length} source(s) de financement direct et ${supportComponents.length} mécanisme(s) de garantie/support.`,
      ar: `مزيج من ${cashComponents.length} مصدر تمويل مباشر و ${supportComponents.length} آلية ضمان أو دعم.`
    },
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
    profile = profileArg || ({ totalProjectCost: 100000, financingRequested: 80000, purpose: 'creation' } as ApplicantProfile);
    requiredFunding = requestedFundingArg ?? profile.financingRequested ?? (profile.totalProjectCost ? profile.totalProjectCost - (profile.userContribution || 0) : 80000);
  } else {
    const raw = input as any;
    matches = raw.eligibleMatches || raw.matchResults || raw.matchedPrograms || [];
    profile = raw.applicantProfile || raw.profile || ({ totalProjectCost: 100000, financingRequested: 80000, purpose: 'creation' } as ApplicantProfile);
    requiredFunding = raw.requiredFunding ?? profile.financingRequested ?? (profile.totalProjectCost ? profile.totalProjectCost - (profile.userContribution || 0) : 80000);
  }

  const eligible = matches.filter(m =>
    ['STRONG_ALIGNMENT', 'POTENTIAL_ALIGNMENT', 'REQUIRES_CONFIRMATION', 'ELIGIBLE', 'PARTIALLY_ELIGIBLE'].includes(m.status as string) ||
    ['strong_alignment', 'partial_alignment'].includes(m.reasons?.alignmentLevel)
  );
  const cash = eligible.filter(m => isCashRole(determineStackFundingRole(m.program)));
  const support = eligible.filter(m => !isCashRole(determineStackFundingRole(m.program)));
  const stacks: FinancingStackCandidate[] = [];
  const unverified: FinancingStackCandidate[] = [];
  const signatures = new Set<string>();
  let evaluatedPairCount = 0, verifiedPairs = 0, potentialPairs = 0, unknownPairs = 0;
  const unknownPairEvaluations: StackCompatibilityEvaluation[] = [];

  const ids = eligible.map(m => m.program.id);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    evaluatedPairCount++;
    const c = getStackCompatibility(ids[i], ids[j]);
    if (c.compatibilityStatus === 'VERIFIED_COMPATIBLE') verifiedPairs++;
    else if (c.compatibilityStatus === 'POTENTIALLY_COMPATIBLE') potentialPairs++;
    else if (c.compatibilityStatus === 'UNKNOWN') {
      unknownPairs++;
      unknownPairEvaluations.push(c);
    }
  }

  const addCandidate = (candidate: FinancingStackCandidate | null) => {
    if (!candidate || signatures.has(candidate.id)) return;
    signatures.add(candidate.id);
    if (candidate.overallStatus === 'UNKNOWN') unverified.push(candidate);
    else if (candidate.overallStatus === 'SUPPORTED' || candidate.overallStatus === 'POTENTIALLY_COMPATIBLE' || candidate.overallStatus === 'CONDITIONAL') stacks.push(candidate);
  };

  for (const cashMatch of cash) {
    const cap = typeof cashMatch.program.maxAmount === 'number' && cashMatch.program.maxAmount > 0 ? cashMatch.program.maxAmount : requiredFunding;
    const amount = Math.min(cap, requiredFunding);
    if (amount <= 0) continue;
    const cashComp = createStackComponent(cashMatch, amount);
    for (const supportMatch of support) addCandidate(evaluateStackCandidate([cashComp], [createStackComponent(supportMatch)], requiredFunding, profile.userContribution));
  }

  for (let i = 0; i < cash.length; i++) for (let j = i + 1; j < cash.length; j++) {
    const a = cash[i], b = cash[j];
    const pair = getStackCompatibility(a.program.id, b.program.id);
    if (pair.compatibilityStatus === 'INCOMPATIBLE') continue;

    const capA0 = typeof a.program.maxAmount === 'number' && a.program.maxAmount > 0 ? a.program.maxAmount : requiredFunding;
    const pctA = a.program.maxFinancingPercentage && profile.totalProjectCost ? profile.totalProjectCost * a.program.maxFinancingPercentage / 100 : requiredFunding;
    const amountA = Math.min(capA0, pctA, requiredFunding);
    const remaining = Math.max(0, requiredFunding - amountA);
    if (amountA <= 0 || remaining <= 0) continue;

    const capB0 = typeof b.program.maxAmount === 'number' && b.program.maxAmount > 0 ? b.program.maxAmount : remaining;
    const pctB = b.program.maxFinancingPercentage && profile.totalProjectCost ? profile.totalProjectCost * b.program.maxFinancingPercentage / 100 : remaining;
    const amountB = Math.min(capB0, pctB, remaining);
    if (amountB <= 0) continue;

    const ca = createStackComponent(a, amountA);
    const cb = createStackComponent(b, amountB);
    addCandidate(evaluateStackCandidate([ca, cb], [], requiredFunding, profile.userContribution));
    for (const supportMatch of support) addCandidate(evaluateStackCandidate([ca, cb], [createStackComponent(supportMatch)], requiredFunding, profile.userContribution));
  }

  const statusWeight: Record<string, number> = { SUPPORTED: 4, POTENTIALLY_COMPATIBLE: 3, CONDITIONAL: 2, UNKNOWN: 1, INCOMPATIBLE: 0 };
  const confidenceWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  stacks.sort((a, b) => {
    const s = (statusWeight[b.overallStatus] || 0) - (statusWeight[a.overallStatus] || 0);
    if (s) return s;
    const c = (confidenceWeight[b.confidence] || 0) - (confidenceWeight[a.confidence] || 0);
    if (c) return c;
    const gap = a.remainingFundingGap - b.remainingFundingGap;
    if (gap) return gap;
    return (a.unresolvedAssumptions.length + a.components.length + a.supportComponents.length) - (b.unresolvedAssumptions.length + b.components.length + b.supportComponents.length);
  });

  return {
    requiredFunding,
    totalProjectCost: profile.totalProjectCost,
    userContribution: profile.userContribution,
    stacks,
    unverifiedCombinations: unverified,
    unknownPairEvaluations,
    evaluatedPairCount,
    evidenceSummary: { verifiedPairs, potentialPairs, unknownPairs }
  };
}
