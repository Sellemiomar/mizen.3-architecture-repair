import React, { useState } from 'react';
import { 
  Building2, 
  Wrench, 
  TrendingUp, 
  Coins, 
  Tractor, 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Edit2,
  RotateCcw,
  Info,
  Home,
  Hammer
} from 'lucide-react';
import { 
  Language, 
  FinancingPurpose, 
  FinancingJourney,
  ApplicantProfile,
  BusinessSector,
  BusinessStage,
  DemoScenario
} from '../types/financing';
import { TUNISIAN_GOVERNORATES } from '../data/geography';
import { TRANSLATIONS } from '../i18n/translations';
import { TrustBadge } from './TrustBadge';
import { parseTextToProfileFallback } from '../utils/intakeParser';
import { DemoScenarioDeck } from './DemoScenarioDeck';
import { JOURNEY_METAS } from '../engine/journeyEngine';

interface HeroSectionProps {
  language: Language;
  onSelectPurpose: (purpose: FinancingPurpose) => void;
  onSelectJourney?: (journey: FinancingJourney) => void;
  onAiParsed: (extractedProfile: Partial<ApplicantProfile>) => void;
  onSelectDemoScenario?: (scenario: DemoScenario) => void;
  onExploreAll: () => void;
  onStartFullDiagnostic: () => void;
}

interface ExtractedDraft {
  financingRequested?: number;
  totalProjectCost?: number;
  userContribution?: number;
  purpose?: FinancingPurpose;
  sector?: BusinessSector;
  location?: string;
  businessStage?: BusinessStage;
  hasHigherEducationDegree?: boolean;
  missingCriticalFields?: string[];
  unassumedFields?: string[];
  summaryText?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  onSelectPurpose,
  onSelectJourney,
  onAiParsed,
  onSelectDemoScenario,
  onExploreAll,
  onStartFullDiagnostic
}) => {
  const t = TRANSLATIONS[language];
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // AI Confirmation State
  const [extractedDraft, setExtractedDraft] = useState<ExtractedDraft | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  const sectorLabels: Record<BusinessSector, { fr: string; ar: string }> = {
    industry: { fr: 'Industrie manufacturière', ar: 'الصناعات المعملية' },
    services: { fr: 'Services & Conseil', ar: 'الخدمات والاستشارات' },
    ict_tech: { fr: 'Technologies & Logiciels', ar: 'تكنولوجيا المعلومات' },
    agriculture_agribusiness: { fr: 'Agriculture & Agroalimentaire', ar: 'الفلاحة والصناعات الغذائية' },
    crafts_trades: { fr: 'Artisanat & Métiers', ar: 'الصناعات التقليدية' },
    commerce: { fr: 'Commerce & Distribution', ar: 'التجارة والتوزيع' },
    renewable_energy: { fr: 'Énergies renouvelables', ar: 'الطاقات المتجددة' },
    tourism: { fr: 'Tourisme & Restauration', ar: 'السياحة والإطعام' },
    real_estate: { fr: 'Immobilier & Promotion', ar: 'العقارات والبعث العقاري' },
    residential_real_estate_promotion: { fr: 'Promotion immobilière résidentielle', ar: 'البعث العقاري السكني' },
    other: { fr: 'Autre secteur', ar: 'قطاع آخر' }
  };

  const stageLabels: Record<BusinessStage, { fr: string; ar: string }> = {
    idea_project: { fr: 'Idée ou étude en cours', ar: 'فكرة أو دراسة' },
    creation_underway: { fr: 'Création en cours', ar: 'في طور التأسيس' },
    established_under_2y: { fr: 'Moins de 2 ans d’activité', ar: 'أقل من سنتين نشاط' },
    established_over_2y: { fr: 'Plus de 2 ans d’activité', ar: 'أكثر من سنتين نشاط' }
  };

  const purposeLabels: Record<FinancingPurpose, { fr: string; ar: string }> = {
    creation: { fr: 'Création d’entreprise', ar: 'بعث وتأسيس مشروع' },
    equipment: { fr: 'Achat d’équipements', ar: 'اقتناء معدات وآلات' },
    expansion: { fr: 'Extension / Développement', ar: 'توسعة النشاط' },
    working_capital: { fr: 'Fonds de roulement', ar: 'رأس مال عامل وسيولة' },
    agriculture: { fr: 'Projet agricole', ar: 'مشروع فلاحي' },
    innovation_rd: { fr: 'Tech & R&D', ar: 'تجديد وتكنولوجيا' },
    export: { fr: 'Développement export', ar: 'تصدير وأسواق خارجية' },
    first_home: { fr: 'Premier Logement (Achat)', ar: 'المسكن الأول (شراء)' },
    home_construction: { fr: 'Construction de logement', ar: 'بناء مسكن فردي' },
    vehicle: { fr: 'Financement Véhicule', ar: 'تمويل سيارة / وسيلة نقل' }
  };

  const purposeOptions: { id: FinancingPurpose; title: { fr: string; ar: string }; icon: React.ReactNode; desc: { fr: string; ar: string } }[] = [
    {
      id: 'creation',
      title: { fr: 'Créer une entreprise', ar: 'بعث وتأسيس مشروع جديد' },
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      desc: { fr: 'PME, nouveaux promoteurs, diplômés ou artisans', ar: 'مؤسسات صغرى، باعثون جدد، أصحاب شهادات' }
    },
    {
      id: 'equipment',
      title: { fr: 'Acheter un équipement', ar: 'اقتناء معدات وآلات' },
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      desc: { fr: 'Machines de production, outillage, véhicules utilitaires', ar: 'آلات إنتاج، أدوات صناعية، وسائل نقل مهنية' }
    },
    {
      id: 'expansion',
      title: { fr: 'Développer mon entreprise', ar: 'توسعة النشاط التجاري' },
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      desc: { fr: 'Nouveau local, augmentation des capacités, modernisation', ar: 'مقر جديد، زيادة طاقة الإنتاج، تحديث الوسائل' }
    },
    {
      id: 'working_capital',
      title: { fr: 'Financer mon fonds de roulement', ar: 'تمويل رأس المال العامل والسيولة' },
      icon: <Coins className="w-5 h-5 text-indigo-600" />,
      desc: { fr: 'Trésorerie d’exploitation, stocks, créances clients', ar: 'سيولة الاستغلال، مخزون المواد، تغطية المستحقات' }
    },
    {
      id: 'agriculture',
      title: { fr: 'Financer un projet agricole', ar: 'تمويل مشروع فلاحي' },
      icon: <Tractor className="w-5 h-5 text-lime-600" />,
      desc: { fr: 'Élevage, arboriculture, serres, irrigation moderne', ar: 'تربية الماشية، الأشجار المثمرة، الري الحديث' }
    },
    {
      id: 'innovation_rd',
      title: { fr: 'Projet Tech & Startup', ar: 'مشروع مبتكر أو شركة ناشئة' },
      icon: <Lightbulb className="w-5 h-5 text-purple-600" />,
      desc: { fr: 'Startup Act, bourses, R&D, levée de fonds préliminaire', ar: 'قانون ستارت آب آكت، المنحة، البحث والتطوير' }
    }
  ];

  const handleAiIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/gemini/parse-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalQuery, language })
      });

      if (!res.ok) {
        throw new Error('Erreur lors du traitement de la requête');
      }

      const data = await res.json();
      if (data.extracted) {
        // Do NOT jump directly to results! Present the extracted draft for user confirmation
        setExtractedDraft({
          financingRequested: data.extracted.financingRequested ?? undefined,
          totalProjectCost: data.extracted.totalProjectCost ?? undefined, // Must NEVER default to financingRequested
          userContribution: data.extracted.userContribution ?? undefined,
          purpose: data.extracted.purpose ?? undefined,
          sector: data.extracted.sector ?? undefined,
          location: data.extracted.location ?? undefined,
          businessStage: data.extracted.businessStage ?? undefined,
          missingCriticalFields: data.extracted.missingCriticalFields || [],
          unassumedFields: data.extracted.unassumedFields || [],
          summaryText: data.extracted.summaryText
        });
      }
    } catch (err: any) {
      console.warn('AI intake fallback or network error:', err);
      // Fallback: robust heuristic extraction without fabricating unmentioned data
      const parsed = parseTextToProfileFallback(naturalQuery, language);
      const missing: string[] = [];
      if (!parsed.financingRequested) missing.push(language === 'ar' ? 'مبلغ التمويل المطلوب' : 'Montant du financement souhaité');
      if (!parsed.totalProjectCost) missing.push(language === 'ar' ? 'الكلفة الجملية للمشروع' : 'Coût global du projet');
      if (!parsed.userContribution) missing.push(language === 'ar' ? 'المساهمة الذاتية' : 'Apport personnel');
      if (!parsed.purpose) missing.push(language === 'ar' ? 'موضوع التمويل' : 'Objet du financement');
      if (!parsed.location) missing.push(language === 'ar' ? 'الولاية' : 'Gouvernorat');

      setExtractedDraft({
        purpose: parsed.purpose,
        financingRequested: parsed.financingRequested,
        totalProjectCost: parsed.totalProjectCost,
        userContribution: parsed.userContribution,
        location: parsed.location,
        sector: parsed.sector,
        businessStage: parsed.businessStage,
        missingCriticalFields: missing,
        unassumedFields: [
          language === 'ar' ? 'لم يتم اختلاق أي فائدة أو نسبة' : 'Aucun taux ou marge inventé',
          language === 'ar' ? 'الشكل القانوني غير مفترض' : 'Forme juridique non assumée'
        ]
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmDraft = () => {
    if (!extractedDraft) return;
    onAiParsed({
      financingRequested: extractedDraft.financingRequested,
      totalProjectCost: extractedDraft.totalProjectCost,
      userContribution: extractedDraft.userContribution,
      purpose: extractedDraft.purpose,
      sector: extractedDraft.sector,
      location: extractedDraft.location,
      businessStage: extractedDraft.businessStage,
      hasHigherEducationDegree: extractedDraft.hasHigherEducationDegree
    });
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle architectural background */}
      <div className="absolute inset-0 bg-radial from-blue-50/50 via-slate-50 to-slate-100/80 -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Value Proposition */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Mizen • Financing Intelligence for Tunisia</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.2] mb-5">
            {t.heroHeadline}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.heroSubheadline}
          </p>

          {/* Core CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-cta-start"
              onClick={onStartFullDiagnostic}
              className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <span>{t.heroStartBtn}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            <button
              id="hero-cta-explore"
              onClick={onExploreAll}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200 shadow-xs transition-all"
            >
              {t.heroExploreBtn}
            </button>
          </div>
        </div>

        {/* AI Natural Language Intake Box */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{t.heroAiIntakeTitle}</span>
              </div>
              <TrustBadge type="ai_interpretation" language={language} subtle />
            </div>

            {/* If no draft yet: input form */}
            {!extractedDraft ? (
              <form onSubmit={handleAiIntake} className="space-y-3">
                <div className="relative">
                  <textarea
                    id="hero-ai-input"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    placeholder={t.heroAiIntakePlaceholder}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-slate-800 text-sm placeholder-slate-400 transition-all outline-hidden resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 hidden sm:inline-block">
                    {t.heroAiIntakeHint}
                  </span>

                  <button
                    id="hero-ai-submit-btn"
                    type="submit"
                    disabled={isParsing || !naturalQuery.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ml-auto shadow-xs"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'ar' ? 'جارٍ التحليل...' : 'Analyse en cours...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t.heroAiIntakeSubmit}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation & Review Step */
              <div id="ai-confirmation-review-card" className="space-y-4 pt-1">
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      {language === 'ar' 
                        ? 'إليك ما استوعبناه من معطيات مشروعك :' 
                        : 'Voici ce que nous avons compris de votre projet :'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingDraft ? (language === 'ar' ? 'تم التعديل' : 'Terminer') : (language === 'ar' ? 'تعديل المعطيات' : 'Corriger')}</span>
                    </button>
                  </div>
                  {extractedDraft.summaryText && (
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      {extractedDraft.summaryText}
                    </p>
                  )}
                </div>

                {/* Extracted Fields Table / Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Secteur */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'القطاع :' : 'Secteur d’activité :'}
                    </span>
                    {isEditingDraft ? (
                      <select
                        value={extractedDraft.sector || ''}
                        onChange={(e) => setExtractedDraft({ ...extractedDraft, sector: (e.target.value as BusinessSector) || undefined })}
                        className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>
                        {Object.entries(sectorLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label[language]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.sector ? 'text-slate-900' : 'text-amber-700'}`}>
                        {extractedDraft.sector ? sectorLabels[extractedDraft.sector][language] : (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>

                  {/* Montant souhaité */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'التمويل المطلوب :' : 'Financement souhaité :'}
                    </span>
                    {isEditingDraft ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={extractedDraft.financingRequested || ''}
                          onChange={(e) => setExtractedDraft({
                            ...extractedDraft,
                            financingRequested: parseFloat(e.target.value) || undefined
                          })}
                          placeholder="Ex: 80000"
                          className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                        />
                        <span className="font-bold text-slate-500">DT</span>
                      </div>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.financingRequested ? 'text-blue-900' : 'text-amber-700'}`}>
                        {extractedDraft.financingRequested ? `${extractedDraft.financingRequested.toLocaleString('fr-FR')} DT` : (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>

                  {/* Coût global du projet */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'الكلفة الجملية للمشروع :' : 'Coût global du projet :'}
                    </span>
                    {isEditingDraft ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={extractedDraft.totalProjectCost || ''}
                          onChange={(e) => setExtractedDraft({
                            ...extractedDraft,
                            totalProjectCost: parseFloat(e.target.value) || undefined
                          })}
                          placeholder="Ex: 100000"
                          className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                        />
                        <span className="font-bold text-slate-500">DT</span>
                      </div>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.totalProjectCost ? 'text-slate-900' : 'text-slate-500'}`}>
                        {extractedDraft.totalProjectCost ? `${extractedDraft.totalProjectCost.toLocaleString('fr-FR')} DT` : (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>

                  {/* Apport personnel */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'المساهمة الذاتية :' : 'Apport personnel :'}
                    </span>
                    {isEditingDraft ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={extractedDraft.userContribution || ''}
                          onChange={(e) => setExtractedDraft({
                            ...extractedDraft,
                            userContribution: parseFloat(e.target.value) || undefined
                          })}
                          placeholder="Ex: 20000"
                          className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                        />
                        <span className="font-bold text-slate-500">DT</span>
                      </div>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.userContribution ? 'text-slate-900' : 'text-slate-500'}`}>
                        {extractedDraft.userContribution ? `${extractedDraft.userContribution.toLocaleString('fr-FR')} DT` : (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>

                  {/* Région / Gouvernorat */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'الولاية :' : 'Région / Gouvernorat :'}
                    </span>
                    {isEditingDraft ? (
                      <select
                        value={extractedDraft.location || ''}
                        onChange={(e) => setExtractedDraft({ ...extractedDraft, location: e.target.value || undefined })}
                        className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>
                        {TUNISIAN_GOVERNORATES.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.location ? 'text-slate-900' : 'text-amber-700'}`}>
                        {extractedDraft.location || (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>

                  {/* Stade */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'مرحلة المشروع :' : 'Stade d’avancement :'}
                    </span>
                    {isEditingDraft ? (
                      <select
                        value={extractedDraft.businessStage || ''}
                        onChange={(e) => setExtractedDraft({ ...extractedDraft, businessStage: (e.target.value as BusinessStage) || undefined })}
                        className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>
                        {Object.entries(stageLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label[language]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.businessStage ? 'text-slate-900' : 'text-slate-500'}`}>
                        {extractedDraft.businessStage ? stageLabels[extractedDraft.businessStage][language] : (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>

                  {/* Objet */}
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 block mb-1 font-medium">
                      {language === 'ar' ? 'موضوع التمويل :' : 'Objet du financement :'}
                    </span>
                    {isEditingDraft ? (
                      <select
                        value={extractedDraft.purpose || ''}
                        onChange={(e) => setExtractedDraft({ ...extractedDraft, purpose: (e.target.value as FinancingPurpose) || undefined })}
                        className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>
                        {Object.entries(purposeLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label[language]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`font-semibold ${extractedDraft.purpose ? 'text-slate-900' : 'text-slate-500'}`}>
                        {extractedDraft.purpose ? purposeLabels[extractedDraft.purpose][language] : (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing / Unassumed items notice */}
                {((extractedDraft.missingCriticalFields && extractedDraft.missingCriticalFields.length > 0) || 
                  (extractedDraft.unassumedFields && extractedDraft.unassumedFields.length > 0)) && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === 'ar' ? 'معطيات لم يتم اختلاقها (تبقى للتثبت) :' : 'Données non assumées (restent à vérifier) :'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...(extractedDraft.unassumedFields || []), ...(extractedDraft.missingCriticalFields || [])].map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmation Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedDraft(null);
                      setIsEditingDraft(false);
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'ar' ? 'إعادة الصياغة' : 'Recommencer la saisie'}</span>
                  </button>

                  <button
                    id="ai-confirm-submit-btn"
                    type="button"
                    onClick={handleConfirmDraft}
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span>{language === 'ar' ? 'تأكيد والبحث عن التمويل' : 'Confirmer et lancer la recherche'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {parseError && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Demo Scenarios Deck for Bank Evaluators */}
        {onSelectDemoScenario && (
          <div className="mb-14">
            <DemoScenarioDeck
              language={language}
              onSelectScenario={onSelectDemoScenario}
            />
          </div>
        )}

        {/* "What are you financing?" Direct grid */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {language === 'ar' ? 'ما الذي ترغب في تمويله بالتحديد؟' : 'Que souhaitez-vous financer ?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'ar'
                ? 'اختر موضوع التمويل لعرض الآليات البنكية وصناديق الضمان المخصصة'
                : 'Sélectionnez votre objet de financement pour isoler les dispositifs réglementaires concernés'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                journey: 'home_purchase' as FinancingJourney,
                purpose: 'first_home' as FinancingPurpose,
                title: { fr: 'Acheter un logement', ar: 'شراء مسكن' },
                icon: <Home className="w-5 h-5 text-blue-600" />,
                desc: { fr: 'Premier Logement (MEHAT/BH), crédit bancaire acquéreur', ar: 'المسكن الأول، قروض عقارية مدعمة وبنك الإسكان' }
              },
              {
                journey: 'home_construction' as FinancingJourney,
                purpose: 'home_construction' as FinancingPurpose,
                title: { fr: 'Construire / Rénover', ar: 'بناء أو تهيئة مسكن' },
                icon: <Hammer className="w-5 h-5 text-emerald-600" />,
                desc: { fr: 'FOPROLOS, travaux sur terrain propre, surélévation', ar: 'فوبرولوس، بناء على أرض خاصة، أشغال وتوسعة' }
              },
              {
                journey: 'car' as FinancingJourney,
                purpose: 'vehicle' as FinancingPurpose,
                title: { fr: 'Acheter un véhicule', ar: 'شراء سيارة / وسيلة نقل' },
                icon: <Wrench className="w-5 h-5 text-amber-600" />,
                desc: { fr: 'Véhicule neuf ou occasion, leasing utilitaire, crédit auto', ar: 'سيارة جديدة أو مستعملة، ليزينغ نفعي، قرض سيارة' }
              },
              {
                journey: 'startup' as FinancingJourney,
                purpose: 'creation' as FinancingPurpose,
                title: { fr: 'Créer une entreprise', ar: 'بعث وتأسيس مشروع' },
                icon: <Building2 className="w-5 h-5 text-indigo-600" />,
                desc: { fr: 'BFPME, Startup Act, dotations APII, diplômés', ar: 'BFPME، ستارت آب آكت، منح APII، باعثون جدد' }
              },
              {
                journey: 'business_expansion' as FinancingJourney,
                purpose: 'expansion' as FinancingPurpose,
                title: { fr: 'Développer une PME', ar: 'توسعة وتحديث مؤسسة' },
                icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
                desc: { fr: 'Augmentation de capacité, fonds de roulement, SOTUGAR', ar: 'زيادة طاقة الإنتاج، سيولة الاستغلال، كفالة سوتوغار' }
              },
              {
                journey: 'equipment' as FinancingJourney,
                purpose: 'equipment' as FinancingPurpose,
                title: { fr: 'Équipements & Machines', ar: 'اقتناء معدات وآلات' },
                icon: <Wrench className="w-5 h-5 text-purple-600" />,
                desc: { fr: 'Machines de production, outillage, matériel technique', ar: 'آلات إنتاج، أدوات صناعية، معدات تقنية' }
              },
              {
                journey: 'agriculture' as FinancingJourney,
                purpose: 'agriculture' as FinancingPurpose,
                title: { fr: 'Projet agricole', ar: 'مشروع فلاحي' },
                icon: <Tractor className="w-5 h-5 text-lime-600" />,
                desc: { fr: 'Arboriculture, élevage, serres, irrigation moderne', ar: 'غراسات، تربية ماشية، ري قطرة قطرة، بيوت مكيفة' }
              },
              {
                journey: 'other_professional' as FinancingJourney,
                purpose: 'working_capital' as FinancingPurpose,
                title: { fr: 'Autre financement pro', ar: 'تمويل مهني آخر' },
                icon: <Coins className="w-5 h-5 text-slate-600" />,
                desc: { fr: 'Commerces, services généraux, professions libérales', ar: 'تجارة، خدمات عامة، مهن حرة، حاجيات متنوعة' }
              }
            ].map((item) => (
              <div
                key={item.journey}
                id={`journey-card-${item.journey}`}
                onClick={() => {
                  if (onSelectJourney) {
                    onSelectJourney(item.journey);
                  } else {
                    onSelectPurpose(item.purpose);
                  }
                }}
                className="group p-4 sm:p-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center mb-3 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title[language]}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc[language]}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>{language === 'ar' ? 'بدء هذا المسار' : 'Lancer ce parcours'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Trust bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
            {language === 'ar'
              ? 'تغطية رسمية متكاملة للمنظومة المالية التونسية'
              : 'Écosystème institutionnel et bancaire couvert par Mizen'}
          </span>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">BFPME</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">BTS Bank</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">SOTUGAR</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">FOPRODI / APII</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">Startup Act / ANAVA</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">Microfinance</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md">Banque Zitouna</span>
          </div>
        </div>
      </div>
    </section>
  );
};
