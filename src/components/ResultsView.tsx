import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Calculator, 
  ArrowRight, 
  BarChart3, 
  Building2, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Info,
  Send,
  Sparkles,
  Shield,
  Layers,
  XCircle,
  Link as LinkIcon,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { MatchResult, Language, ApplicantProfile, AlignmentLevel, FinancingProgram, Provider } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { VerificationBadge } from './VerificationBadge';
import { TrustBadge } from './TrustBadge';
import { getFieldLabel } from '../utils/verificationLabels';
import { LenderHandoffModal } from './LenderHandoffModal';
import { getJourneyResultHeader } from '../engine/journeyEngine';
import { generateFinancingStacks } from '../engine/financingStackEngine';

interface ResultsViewProps {
  results: MatchResult[];
  applicantProfile: ApplicantProfile;
  language: Language;
  onSelectProgram: (programId: string) => void;
  onToggleCompare: (programId: string) => void;
  comparedProgramIds: string[];
  onOpenDossier: (programId: string) => void;
  onRestartDiagnostic: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  applicantProfile,
  language,
  onSelectProgram,
  onToggleCompare,
  comparedProgramIds,
  onOpenDossier,
  onRestartDiagnostic
}) => {
  const t = TRANSLATIONS[language];
  const [filterLevel, setFilterLevel] = useState<'all' | AlignmentLevel>('all');
  const [showInapplicableAudit, setShowInapplicableAudit] = useState(false);
  const [handoffTarget, setHandoffTarget] = useState<{ program: FinancingProgram; provider: Provider; result: MatchResult } | null>(null);

  const applicableResults = results.filter(r => r.status !== 'NOT_APPLICABLE');
  const nonApplicableResults = results.filter(r => r.status === 'NOT_APPLICABLE');

  const filteredResults = applicableResults.filter(r => {
    if (filterLevel === 'all') return true;
    return r.reasons.alignmentLevel === filterLevel;
  });

  const isProfileEmpty = !applicantProfile.financingRequested && 
    !applicantProfile.totalProjectCost && 
    !applicantProfile.purpose && 
    !applicantProfile.sector && 
    !applicantProfile.location && 
    !applicantProfile.businessStage;

  const stackResult = useMemo(() => {
    return generateFinancingStacks({
      applicantProfile,
      matchResults: results
    });
  }, [applicantProfile, results]);

  if (isProfileEmpty) {
    return (
      <div id="results-empty-state" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">
          {language === 'ar' ? 'لم يتم تحديد أي ملف تعريف بعد' : 'Aucun profil défini'}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          {language === 'ar'
            ? 'لبدء تحليل الأهلية ومطابقة آليات التمويل التونسية، يرجى ملء الاستبيان أو اختيار حالة نموذجية من الصفحة الرئيسية.'
            : 'Commencez par le questionnaire ou choisissez un cas pilote de démonstration pour identifier les dispositifs compatibles.'}
        </p>
        <button
          id="empty-results-start-btn"
          type="button"
          onClick={onRestartDiagnostic}
          className="min-h-[44px] px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-all shadow-xs"
        >
          {language === 'ar' ? 'بدء تشخيص المشروع' : 'Remplir le questionnaire'}
        </button>
      </div>
    );
  }

  const journeyHeader = getJourneyResultHeader(applicantProfile.journey, language);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Active Demo Case Notice */}
      {applicantProfile.isDemoCase && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold block sm:inline mr-1.5">
                {t.demoBadge} : {applicantProfile.demoCaseTitle?.[language] || 'Cas de démonstration'}
              </strong>
              <span className="text-amber-900/90 leading-relaxed">
                {t.activeDemoNotice}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRestartDiagnostic}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors shrink-0 text-xs"
          >
            {t.clearDemoBtn}
          </button>
        </div>
      )}

      {/* 1. EXECUTIVE SUMMARY SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                {t.executiveSummaryTitle}
              </span>
              <span className="text-xs text-slate-400">
                {results.length} {language === 'ar' ? 'آليات محللة' : 'mécanismes analysés'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white">
              {journeyHeader.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
              {journeyHeader.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRestartDiagnostic}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              {language === 'ar' ? 'تعديل المعطيات' : 'Modifier mes critères'}
            </button>
          </div>
        </div>

        {/* Profile Snapshot Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Coût global / bien</span>
            <strong className="text-sm sm:text-base font-bold text-white mt-0.5 block">
              {applicantProfile.totalProjectCost ? `${applicantProfile.totalProjectCost.toLocaleString('fr-FR')} DT` : 'Non précisé'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Apport personnel</span>
            <strong className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block">
              {applicantProfile.userContribution ? `${applicantProfile.userContribution.toLocaleString('fr-FR')} DT` : 'Non précisé'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Financement sollicité</span>
            <strong className="text-sm sm:text-base font-bold text-blue-400 mt-0.5 block">
              {applicantProfile.financingRequested ? `${applicantProfile.financingRequested.toLocaleString('fr-FR')} DT` : 'Non précisé'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block font-medium">Localisation</span>
            <strong className="text-sm sm:text-base font-bold text-white mt-0.5 block truncate">
              {applicantProfile.location || 'Tunisie'} {applicantProfile.isRegionalDevelopmentZone ? '★ (ZDR)' : ''}
            </strong>
          </div>
        </div>
      </div>

      {/* POTENTIAL FINANCING STRUCTURES (STACK ENGINE) */}
      {stackResult.stacks.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'هندسة التمويل المركب' : 'Ingénierie de co-financement'}
                </span>
                <span className="text-xs text-slate-500">
                  {stackResult.stacks.length} {language === 'ar' ? 'هياكل تمويل محتملة' : 'combinaisons analysées'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                {language === 'ar' ? 'الهياكل التمويلية المتوافقة مع مشروعكم' : 'Structures de financement combinées potentielles'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {language === 'ar'
                  ? 'يقوم ميزان بتحليل التوافق القانوني والاتفاقيات المشتركة بين البنوك وصناديق الضمان لتركيب خطة تمويل واقعية بدون افتراض موافقات مسبقة.'
                  : 'Mizen évalue la compatibilité réglementaire et les conventions conjointes entre banques, bailleurs et fonds de garantie pour structurer votre besoin de financement.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {stackResult.stacks.map((stack) => (
              <div
                key={stack.id}
                className={`p-5 rounded-2xl border transition-all ${
                  stack.overallStatus === 'SUPPORTED'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : stack.overallStatus === 'POTENTIALLY_COMPATIBLE'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        stack.overallStatus === 'SUPPORTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stack.overallStatus === 'POTENTIALLY_COMPATIBLE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {stack.overallStatus === 'SUPPORTED'
                          ? (language === 'ar' ? 'توافق موثق' : 'Compatibilité confirmée')
                          : stack.overallStatus === 'POTENTIALLY_COMPATIBLE'
                          ? (language === 'ar' ? 'توافق مشروط بالتأكيد' : 'Compatibilité potentielle / conditionnelle')
                          : (language === 'ar' ? 'توافق غير موثق' : 'Compatibilité non documentée')}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {language === 'ar' ? `مستوى الثقة في الأدلة: ${stack.confidence}` : `Confiance des preuves : ${stack.confidence}`}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                      {stack.title[language]}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block font-medium">
                      {language === 'ar' ? 'تغطية التمويل النقدي' : 'Couverture en cash'}
                    </span>
                    <strong className="text-base font-bold text-slate-900">
                      {stack.verifiedCashFunding.toLocaleString('fr-FR')} DT
                      <span className="text-xs text-slate-500 font-normal"> / {stack.requiredFunding.toLocaleString('fr-FR')} DT</span>
                    </strong>
                    {stack.remainingFundingGap > 0 && (
                      <span className="text-[11px] text-amber-700 block font-semibold mt-0.5">
                        {language === 'ar' ? `فارق متبقي: ${stack.remainingFundingGap.toLocaleString('fr-FR')} DT` : `Écart restant : ${stack.remainingFundingGap.toLocaleString('fr-FR')} DT`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Components Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-700 block">
                    {language === 'ar' ? 'مكونات الهيكل التمويلي :' : 'Composition de la structure :'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {stack.components.map((comp) => (
                      <div key={comp.programId} className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-2 shadow-2xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {language === 'ar' ? 'تمويل نقدي' : 'FINANCEMENT DIRECT'}
                            </span>
                            <strong className="text-slate-900 text-xs">{comp.programName[language]}</strong>
                          </div>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            {language === 'ar' ? `الدور : ${comp.role}` : `Rôle : ${comp.role}`}
                          </span>
                        </div>
                        {comp.allocatedAmount !== undefined && (
                          <strong className="text-blue-700 font-bold text-xs shrink-0">
                            {comp.allocatedAmount.toLocaleString('fr-FR')} DT
                          </strong>
                        )}
                      </div>
                    ))}

                    {stack.supportComponents.map((comp) => (
                      <div key={comp.programId} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-start justify-between gap-2 shadow-2xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                              {language === 'ar' ? 'ضمان مخاطر (ليس تمويلاً نقدياً)' : 'GARANTIE (PAS DE CASH)'}
                            </span>
                            <strong className="text-slate-900 text-xs">{comp.programName[language]}</strong>
                          </div>
                          <span className="text-amber-800 text-[11px] block mt-0.5">
                            {language === 'ar' ? 'تغطية مخاطر القروض البنكية' : 'Partage et couverture du risque bancaire'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 shrink-0">
                          {language === 'ar' ? 'دعم ضمان' : 'Support'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanations & Assumptions */}
                {stack.unresolvedAssumptions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                    {stack.unresolvedAssumptions.map((assump, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{assump[language]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        <button
          type="button"
          onClick={() => setFilterLevel('all')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            filterLevel === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'جميع الآليات المؤهلة' : 'Dispositifs applicables'} ({applicableResults.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterLevel('strong_alignment')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            filterLevel === 'strong_alignment'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'توافق قوي' : 'Forte adéquation'} ({applicableResults.filter(r => r.reasons.alignmentLevel === 'strong_alignment').length})
        </button>

        <button
          type="button"
          onClick={() => setFilterLevel('partial_alignment')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            filterLevel === 'partial_alignment'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'توافق جزئي' : 'Adéquation partielle'} ({applicableResults.filter(r => r.reasons.alignmentLevel === 'partial_alignment').length})
        </button>

        <button
          type="button"
          onClick={() => setFilterLevel('potential_blockers')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            filterLevel === 'potential_blockers'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {language === 'ar' ? 'شروط تتطلب المراجعة' : 'Points d’attention'} ({applicableResults.filter(r => r.reasons.alignmentLevel === 'potential_blockers').length})
        </button>
      </div>

      {/* 2. POTENTIAL FINANCING MECHANISMS LIST */}
      <div className="space-y-5">
        {filteredResults.length === 0 && (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl">
            <p className="text-sm font-semibold text-slate-700">
              {language === 'ar' 
                ? 'لا توجد آليات تمويل تطابق هذا التصنيف تحديداً.'
                : 'Aucun mécanisme ne correspond à ce filtre spécifique.'}
            </p>
          </div>
        )}

        {filteredResults.map((item) => {
          const { program, provider, reasons, costEstimate } = item;
          const isCompared = comparedProgramIds.includes(program.id);

          return (
            <div
              key={program.id}
              id={`result-card-${program.id}`}
              className={`rounded-3xl border transition-all duration-200 bg-white overflow-hidden ${
                reasons.alignmentLevel === 'strong_alignment'
                  ? 'border-slate-300 shadow-xs hover:border-blue-400'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div className="p-5 sm:p-7">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                        {provider.acronym}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {program.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <VerificationBadge verification={program.verification} language={language} />
                    </div>

                    <h3
                      onClick={() => onSelectProgram(program.id)}
                      className="text-lg sm:text-xl font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer font-display"
                    >
                      {program.name[language]}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {program.tagline[language]}
                    </p>
                  </div>

                  {/* Alignment Level Badge */}
                  <div className="shrink-0 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      reasons.alignmentLevel === 'strong_alignment'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : reasons.alignmentLevel === 'partial_alignment'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {reasons.alignmentLevel === 'strong_alignment' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>
                        {reasons.alignmentLevel === 'strong_alignment'
                          ? t.alignmentStrong
                          : reasons.alignmentLevel === 'partial_alignment'
                          ? t.alignmentPartial
                          : t.alignmentBlockers}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Key Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Plafond d’intervention</span>
                    <strong className="text-slate-900 font-bold sm:text-sm">
                      {program.minAmount.toLocaleString('fr-FR')} – {program.maxAmount.toLocaleString('fr-FR')} DT
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Taux / Formule</span>
                    <strong className="text-slate-900 font-bold sm:text-sm truncate block">
                      {program.rateDescription[language]}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Durée & Différé</span>
                    <strong className="text-slate-900 font-bold sm:text-sm">
                      Jusqu’à {Math.round(program.durationMonthsMax / 12)} ans ({program.gracePeriodMonthsMin}m différé)
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Apport minimal requis</span>
                    <strong className="text-slate-900 font-bold sm:text-sm">
                      Min. {program.minContributionPercent}%
                    </strong>
                  </div>
                </div>

                {/* 3. "WHY THIS RESULT?" TRANSPARENT CRITERIA BREAKDOWN */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 text-xs mb-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700" />
                    <span>{t.whyThisResultTitle}</span>
                  </h4>

                  <div className="space-y-2.5">
                    {/* Satisfied Criteria */}
                    {reasons.matchedBecause.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{t.matchedBecauseTitle}</span>
                        </div>
                        <ul className="space-y-1 pl-5 rtl:pr-5 text-slate-700">
                          {reasons.matchedBecause.map((r, idx) => (
                            <li key={idx} className="list-disc leading-relaxed">
                              {r[language]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Potential Issues / Blocker Points */}
                    {reasons.potentialIssues.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{t.potentialIssuesTitle}</span>
                        </div>
                        <ul className="space-y-1 pl-5 rtl:pr-5 text-amber-950">
                          {reasons.potentialIssues.map((r, idx) => (
                            <li key={idx} className="list-disc leading-relaxed">
                              {r[language]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Needs Verification */}
                    {reasons.needsVerification.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{t.needsVerificationTitle}</span>
                        </div>
                        <ul className="space-y-1 pl-5 rtl:pr-5 text-slate-600">
                          {reasons.needsVerification.map((r, idx) => (
                            <li key={idx} className="list-disc leading-relaxed">
                              {r[language]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. FINANCIAL SCENARIO / ILLUSTRATION (WHERE VERIFIED) */}
                {costEstimate && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Calculator className="w-4 h-4 text-blue-700" />
                        <span>{t.estMonthlyPayment} :</span>
                        {costEstimate.canCalculateReliably && costEstimate.monthlyPayment ? (
                          <span className="text-blue-900 text-sm font-extrabold ml-1">
                            ~{costEstimate.monthlyPayment.toLocaleString('fr-FR')} DT/mois
                          </span>
                        ) : (
                          <span className="text-amber-800 font-semibold ml-1 text-[11px]">
                            {costEstimate.unreliableReason?.[language] || t.cannotCalculateReliably}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {costEstimate.rateOriginLabel && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {costEstimate.rateOriginLabel[language]}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {costEstimate.calculationExplanation[language]}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-50 text-[10px] text-slate-500 leading-relaxed">
                      {t.illustrativeEstimateNotice}
                    </div>
                  </div>
                )}

                {/* 5. ACTION TOOLBAR */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id={`btn-detail-${program.id}`}
                      type="button"
                      onClick={() => onSelectProgram(program.id)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>{t.viewDetailBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>

                    <button
                      id={`btn-compare-${program.id}`}
                      type="button"
                      onClick={() => onToggleCompare(program.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        isCompared
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isCompared ? t.removeFromCompare : t.addToCompare}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDossier(program.id)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>{t.prepareDossierBtn}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Handoff CTA */}
                    <button
                      type="button"
                      onClick={() => setHandoffTarget({ program, provider, result: item })}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>{t.lenderHandoffBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inapplicable Mechanisms Audit Section */}
      {nonApplicableResults.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-slate-500" />
              <h4 className="font-bold text-slate-800 text-sm">
                {language === 'ar' 
                  ? `آليات تم فحصها ولكنها غير مطابقة لنوعية الحاجة (${nonApplicableResults.length})` 
                  : `Mécanismes examinés mais non applicables (${nonApplicableResults.length})`}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowInapplicableAudit(!showInapplicableAudit)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              {showInapplicableAudit 
                ? (language === 'ar' ? 'إخفاء التفاصيل' : 'Masquer') 
                : (language === 'ar' ? 'عرض أسباب الاستبعاد' : 'Afficher les motifs d’inapplicabilité')}
            </button>
          </div>

          {showInapplicableAudit && (
            <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
              <p className="text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'ميزان يعتمد بوابة فحص مبدئي تمنع اقتراح آليات موجهة لغايات تمويلية أخرى (مثل برامج السكن لتمويل السيارات، أو برامج الشركات للمصاريف الفردية).'
                  : 'Mizen applique une porte d’applicabilité stricte : les dispositifs ci-dessous sont légalement ou structurellement réservés à d’autres types de financement (ex. programmes logement vs achat véhicule).'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nonApplicableResults.map((item) => (
                  <div key={item.program.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <strong className="font-bold text-slate-900 text-xs">
                        {item.provider.acronym} — {item.program.name[language]}
                      </strong>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {language === 'ar' ? 'غير مطابق' : 'Non applicable'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {item.applicabilityReason?.[language] || item.compatibilitySummary[language]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. "WHAT MIZEN DOES NOT DETERMINE" INSTITUTIONAL DISCLAIMER */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200 text-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Shield className="w-4 h-4 text-slate-700" />
          <span>{t.whatMizenDoesNotDetermineTitle}</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          {t.whatMizenDoesNotDetermineText}
        </p>
      </div>

      {/* Persistent Disclaimer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-500 text-center leading-relaxed">
        {t.persistentDisclaimer}
      </div>

      {/* Simulated Lender Handoff Modal */}
      {handoffTarget && (
        <LenderHandoffModal
          program={handoffTarget.program}
          provider={handoffTarget.provider}
          result={handoffTarget.result}
          applicantProfile={applicantProfile}
          language={language}
          onClose={() => setHandoffTarget(null)}
        />
      )}
    </div>
  );
};
