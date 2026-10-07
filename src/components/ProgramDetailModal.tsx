import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Calculator, 
  HelpCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { FinancingProgram, Provider, MatchReason, Language, ApplicantProfile } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { VerificationBadge } from './VerificationBadge';
import { TrustBadge } from './TrustBadge';
import { getFieldLabel } from '../utils/verificationLabels';
import { getOfficialSimulator } from '../knowledge/catalogueAdapter';
import { CLAIMS_REPOSITORY } from '../knowledge/claimsRepository';

interface ProgramDetailModalProps {
  program: FinancingProgram;
  provider: Provider;
  reasons?: MatchReason;
  applicantProfile: ApplicantProfile;
  language: Language;
  onClose: () => void;
  onPrepareDossier: (programId: string) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  provider,
  reasons,
  applicantProfile,
  language,
  onClose,
  onPrepareDossier
}) => {
  const t = TRANSLATIONS[language];
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const programClaims = CLAIMS_REPOSITORY.getAllClaims(program.id);

  const fetchAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programName: program.name[language],
          providerName: provider.name,
          reasons: reasons || {},
          language
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                {provider.acronym}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-900/60 text-blue-200 text-xs font-medium">
                {program.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              {program.name[language]}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {program.tagline[language]}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Verification & Provenance Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <VerificationBadge verification={program.verification} language={language} showSourceLink />
              <span className="text-xs text-slate-500 font-mono">
                Réf: {program.id} • {provider.headquarters}
              </span>
            </div>

            {/* Source Information */}
            <div className="text-xs text-slate-700 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">
                {language === 'ar' ? 'المصدر المرجعي :' : 'Source de vérification :'}
              </span>
              <span>{program.verification.sourceTitle}</span>
              {program.verification.sourceUrl && (
                <a
                  href={program.verification.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 font-medium underline"
                >
                  <span>{language === 'ar' ? 'الرابط الرسمي' : 'Consulter le portail'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Notes */}
            {program.verification.notes && (
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/70 leading-relaxed">
                {program.verification.notes[language]}
              </p>
            )}

            {/* Verified vs Unverified Fields Breakdown */}
            <div className="pt-1 flex flex-wrap gap-4 text-xs">
              {program.verification.verifiedFields.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    {language === 'ar' ? 'معايير رسمية مؤكدة :' : 'Données certifiées conformes :'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {program.verification.verifiedFields.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                        ✓ {getFieldLabel(f, language)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {program.verification.unverifiedFields.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    {language === 'ar' ? 'نقاط متغيرة تخضع للجنة التمويل :' : 'Variables soumises au comité de crédit :'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {program.verification.unverifiedFields.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                        ⚠ {getFieldLabel(f, language)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Parameters 4-Grid with field-level claims verification */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>{language === 'ar' ? 'المعايير المالية الأساسية' : 'Paramètres financiers officiels'}</span>
              <span className="text-[11px] font-normal text-slate-500">
                {language === 'ar' ? 'تأكيد مستوى كل حقل' : 'Certification champ par champ'}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-slate-500">Montant admissible</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    {program.verification.verifiedFields.includes('maxAmount') ? '✓ Vérifié' : 'Indicatif'}
                  </span>
                </div>
                <span className="text-base font-extrabold text-slate-900">
                  {program.minAmount > 0
                    ? `${program.minAmount.toLocaleString('fr-FR')} à ${program.maxAmount.toLocaleString('fr-FR')} DT`
                    : `Montant minimum non établi — plafond ${program.maxAmount.toLocaleString('fr-FR')} DT`}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-slate-500">Taux & Coût</span>
                  <span className={`text-[10px] font-semibold px-1 py-0.2 rounded border ${
                    program.rateType === 'subsidized'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : program.category === 'guarantee'
                      ? 'text-blue-700 bg-blue-50 border-blue-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}>
                    {program.rateType === 'subsidized' 
                      ? '✓ Décret' 
                      : program.category === 'guarantee'
                      ? 'Garantie publique'
                      : (program.rateType === 'variable_tmm' ? 'TMM BCT' : 'À négocier')}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {program.rateDescription[language]}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-slate-500">Durée maximale</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    {program.verification.verifiedFields.includes('durationMonths') ? '✓ Vérifié' : 'Indicatif'}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Jusqu'à {Math.round(program.durationMonthsMax / 12)} ans ({program.durationMonthsMax} mois)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-slate-500">Différé (Franchise)</span>
                  <span className={`text-[10px] font-semibold px-1 py-0.2 rounded border ${
                    program.verification.verifiedFields.includes('gracePeriodMonths') || program.verification.verifiedFields.includes('gracePeriodMonthsMax')
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}>
                    {program.verification.verifiedFields.includes('gracePeriodMonths') || program.verification.verifiedFields.includes('gracePeriodMonthsMax')
                      ? '✓ Réglementaire'
                      : '⚠ Selon comité'}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {program.gracePeriodMonthsMin} à {program.gracePeriodMonthsMax} mois
                </span>
              </div>
            </div>
          </div>

          {/* Guarantees & Collateral */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Garanties & Sûretés exigées</span>
              </h3>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                program.verification.verifiedFields.includes('guaranteeRequirements')
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200'
              }`}>
                {program.verification.verifiedFields.includes('guaranteeRequirements')
                  ? '✓ Source réglementaire vérifiée'
                  : '⚠ Exigences variables selon l’agence'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {program.guaranteeRequirements[language]}
            </p>
          </div>

          {/* Target Audience & Eligible Sectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-1 mb-2">
                <h4 className="font-bold text-slate-900">À qui s’adresse ce dispositif ?</h4>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                  {program.verification.verifiedFields.includes('targetAudience') ? '✓ Critères d\'accès' : 'Indicatif'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-3">
                {program.targetAudience[language]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {program.eligibilityCriteria.stages.map(st => (
                  <span key={st} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {st.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-1 mb-2">
                <h4 className="font-bold text-slate-900">Secteurs admis & Dépenses éligibles</h4>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {program.verification.verifiedFields.includes('purposes') ? '✓ Nomenclature légale' : 'Indicatif'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {program.purposes.map(pur => (
                  <span key={pur} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold">
                    {pur.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <p className="text-slate-500 text-[11px]">
                Apport personnel minimum imposé par la réglementation : <strong>{program.minContributionPercent}%</strong> du coût de projet.
              </p>
            </div>
          </div>

          {/* Step-by-Step Application Process */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                {language === 'ar' ? 'مراحل تقديم ومعالجة الملف' : 'Étapes concrètes de demande & instruction'}
              </h3>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                program.verification.verifiedFields.includes('applicationSteps')
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200'
              }`}>
                {program.verification.verifiedFields.includes('applicationSteps')
                  ? '✓ Processus réglementaire'
                  : '⚠ Circuit type (délais soumis à l\'agence)'}
              </span>
            </div>
            <div className="space-y-2.5">
              {program.applicationSteps.map((stepItem, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {stepItem.step || idx + 1}
                  </span>
                  <div>
                    <span className="text-slate-900 font-bold block">{stepItem.title[language]}</span>
                    <span className="text-slate-700 leading-relaxed block mt-0.5">{stepItem.description[language]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>{language === 'ar' ? 'الوثائق الإدارية والمالية المطلوبة' : 'Dossier documentaire à fournir'}</span>
              </h3>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                program.verification.verifiedFields.includes('requiredDocuments')
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200'
              }`}>
                {program.verification.verifiedFields.includes('requiredDocuments')
                  ? '✓ Checklist officielle'
                  : '⚠ Liste indicative (pièces complémentaires possibles)'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {program.requiredDocuments.map((docItem, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-800 font-medium">{docItem.name[language]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Claims & Temporal Provenance Layer */}
          {programClaims.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'سجل المطالبات والمصادر الزمنية' : 'Registre des Revendications & Traçabilité Temporelle'}</span>
                </h4>
                <span className="text-[10px] font-semibold text-slate-500">
                  {programClaims.length} {language === 'ar' ? 'معطيات موثقة' : 'faits enregistrés'}
                </span>
              </div>

              <div className="space-y-2">
                {programClaims.map(claim => {
                  const isHistorical = claim.ruleStatus === 'VERIFIED_HISTORICAL' || claim.conflictStatus === 'SUPERSEDED';
                  return (
                    <div 
                      key={claim.claimId} 
                      className={`p-3 rounded-xl border text-xs ${
                        isHistorical 
                          ? 'bg-amber-50/60 border-amber-200/80 text-slate-700' 
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold">
                          {claim.field}: {typeof claim.value === 'object' ? JSON.stringify(claim.value) : String(claim.value)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isHistorical
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isHistorical ? (language === 'ar' ? 'أرشيف تاريخي' : 'Historique archivé') : (language === 'ar' ? 'ساري ومؤكد' : 'Vérifié actuel')}
                        </span>
                      </div>
                      {claim.notes && (
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {claim.notes[language] || claim.notes.fr}
                        </p>
                      )}
                      {claim.supersededReason && (
                        <p className="text-[10px] text-amber-800 font-medium mt-1">
                          ↳ {claim.supersededReason}
                        </p>
                      )}
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Source: {claim.source.title} ({claim.source.publisher})</span>
                        <span>{claim.retrievalDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Realistic Caveats & Delays */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <h4 className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>{language === 'ar' ? 'تنبيهات وتوقعات واقعية للإجراءات :' : 'Mises en garde & Réalités du terrain :'}</span>
            </h4>
            <div className="space-y-1">
              {program.importantCaveats.map((c, i) => (
                <p key={i} className="leading-relaxed text-amber-900">
                  • {c[language]}
                </p>
              ))}
            </div>
          </div>

          {/* Gemini AI Strategic Advice */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  {language === 'ar' ? 'نصائح ذكاء ميزان لمقابلة البنك' : 'Conseils stratégiques pour votre entretien bancaire'}
                </h4>
              </div>
              <TrustBadge type="ai_interpretation" language={language} subtle />
            </div>

            {aiExplanation ? (
              <div className="mt-3 p-4 rounded-xl bg-white border border-indigo-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-xs">
                {aiExplanation}
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  {language === 'ar'
                    ? 'اطلب تحليلاً ذكياً مخصصاً لنقاط القوة والأسئلة المفتاحية لهذا البرنامج.'
                    : 'Générez les arguments clés et les points de négociation pour ce financeur.'}
                </p>
                <button
                  onClick={fetchAiExplanation}
                  disabled={isLoadingAi}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  {isLoadingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyse...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Générer mes conseils</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {program.verification.sourceUrl && (
              <a
                href={program.verification.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>{t.officialSourceBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {getOfficialSimulator(program.id) && (
              <a
                href={getOfficialSimulator(program.id)?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-700" />
                <span>{language === 'ar' ? 'المحاكي الرسمي' : 'Simulateur officiel'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Fermer
            </button>

            <button
              onClick={() => {
                onClose();
                onPrepareDossier(program.id);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>{t.prepareDossierBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
