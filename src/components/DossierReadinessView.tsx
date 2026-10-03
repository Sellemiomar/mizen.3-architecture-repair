import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Building2,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ApplicantProfile, FinancingProgram, Provider, Language } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { TrustBadge } from './TrustBadge';
import { VerificationBadge } from './VerificationBadge';

interface DossierReadinessViewProps {
  applicantProfile: ApplicantProfile;
  selectedProgram?: FinancingProgram;
  provider?: Provider;
  allPrograms: FinancingProgram[];
  language: Language;
}

export const DossierReadinessView: React.FC<DossierReadinessViewProps> = ({
  applicantProfile,
  selectedProgram,
  provider,
  allPrograms,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [completedDocs, setCompletedDocs] = useState<Record<string, boolean>>({});

  const [currentProgramId, setCurrentProgramId] = useState<string>(
    selectedProgram?.id || (allPrograms.length > 0 ? allPrograms[0].id : '')
  );

  const toggleDoc = (id: string) => {
    setCompletedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeProgram = allPrograms.find(p => p.id === currentProgramId) || selectedProgram || allPrograms[0];

  // Specific program required documents
  const programDocuments = activeProgram.requiredDocuments || [];

  // General documents required by Tunisian financial institutions
  const customaryDocuments = [
    {
      id: 'doc-cin',
      name: { fr: 'Copie de la Carte d’Identité Nationale (CIN) des promoteurs', ar: 'نسخة من بطاقة التعريف الوطنية للمروجين' },
      mandatory: true,
      category: 'identity' as const
    },
    {
      id: 'doc-justif-domicile',
      name: { fr: 'Justificatif de domicile récent (Facture STEG / SONEDE)', ar: 'فاتورة كهرباء أو ماء تثبت العنوان' },
      mandatory: true,
      category: 'identity' as const
    },
    {
      id: 'doc-releve-bancaire',
      name: { fr: 'Relevés bancaires des 3 derniers mois ou déclaration fiscale', ar: 'كشوف بنكية لآخر 3 أشهر أو تصريح بالدخل' },
      mandatory: true,
      category: 'financial' as const
    }
  ];

  const allDocumentsList = [
    ...programDocuments.map(d => ({ ...d, isProgramSpecific: true })),
    ...customaryDocuments.filter(c => !programDocuments.some(p => p.id === c.id)).map(c => ({ ...c, isProgramSpecific: false }))
  ];

  const totalMandatory = allDocumentsList.filter(d => d.mandatory).length;
  const completedMandatory = allDocumentsList.filter(d => d.mandatory && completedDocs[d.id]).length;
  const readinessPercent = totalMandatory > 0 ? Math.round((completedMandatory / totalMandatory) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {t.readinessTitle}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <label htmlFor="dossier-program-select" className="text-slate-400 font-medium">
                {language === 'ar' ? 'البرنامج المختار :' : 'Dispositif :'}
              </label>
              <select
                id="dossier-program-select"
                value={currentProgramId}
                onChange={(e) => setCurrentProgramId(e.target.value)}
                className="bg-slate-800 text-white rounded-lg px-2.5 py-1 text-xs border border-slate-700 outline-hidden font-semibold cursor-pointer"
              >
                {allPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name[language]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            {activeProgram.name[language]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {t.readinessSub}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ar' ? 'طباعة التقرير' : 'Imprimer la fiche'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Information Available vs Information Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Information Currently Available */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{language === 'ar' ? 'المعطيات المتوفرة حالياً' : 'Informations actuellement disponibles'}</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              {language === 'ar' ? 'مصرح بها' : 'Déclarées'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.totalCostLabel}</span>
              <strong className="text-slate-900 font-bold">
                {applicantProfile.totalProjectCost ? `${applicantProfile.totalProjectCost.toLocaleString('fr-FR')} DT` : 'Non précisé'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.userContributionLabel}</span>
              <strong className="text-emerald-700 font-bold">
                {applicantProfile.userContribution ? `${applicantProfile.userContribution.toLocaleString('fr-FR')} DT` : 'Non précisé'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.financingRequestedLabel}</span>
              <strong className="text-blue-700 font-bold">
                {applicantProfile.financingRequested ? `${applicantProfile.financingRequested.toLocaleString('fr-FR')} DT` : 'Non précisé'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.locationLabel}</span>
              <strong className="text-slate-900 font-bold">
                {applicantProfile.location || 'Non précisé'} {applicantProfile.isRegionalDevelopmentZone ? '★ (ZDR)' : ''}
              </strong>
            </div>

            {applicantProfile.monthlyIncomeRange && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">{t.incomeLabel}</span>
                <strong className="text-slate-900 font-bold">
                  {applicantProfile.monthlyIncomeRange.replace('_', ' – ')} DT
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Right: Information & Documents Required by Lender */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>{language === 'ar' ? 'الوثائق المطلوبة بنكياً' : 'Justificatifs exigés par l’organisme'}</span>
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-700">
              {completedMandatory}/{totalMandatory} {language === 'ar' ? 'جاهزة' : 'cochées'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs max-h-[380px] overflow-y-auto pr-1">
            {allDocumentsList.map((doc) => {
              const isChecked = Boolean(completedDocs[doc.id]);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`min-h-[44px] p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 leading-snug">{doc.name[language]}</span>
                      {doc.isProgramSpecific && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-200 shrink-0">
                          {language === 'ar' ? 'خاص بالبرنامج' : 'Spécifique'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strategic Questions to ask the Banker */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-700" />
          <span>{t.interviewQuestionsTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">1. Modalités de garantie</span>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'ما هي نسبة تغطية سوتوغار أو الضمانات العينية المطلوبة من قبل لجنتكم الجهوية لهذا الملف ؟'
                : 'Quelle est la quotité de garantie SOTUGAR ou la caution personnelle retenue par votre comité pour ce type de dossier ?'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">2. Taux & Marge commerciale</span>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'ما هو هامش الفائدة أو الربح المطبق حالياً فوق TMM في فرعكم لهذا القطاع ؟'
                : 'Quelle est la marge commerciale exacte appliquée actuellement au-dessus du TMM pour notre secteur d’activité ?'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">3. Calendrier & Déblocage</span>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'ما هي الآجال التقديرية بين إيداع الملف الكامل ومصادقة لجنة التمويل وصرف القسط الأول للمزودين ؟'
                : 'Quels sont les délais moyens d’instruction entre le dépôt complet et le premier déblocage direct aux fournisseurs ?'}
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Disclaimer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 leading-relaxed">
        {t.disclaimerText}
      </div>
    </div>
  );
};
