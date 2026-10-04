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
import { TUNISIAN_GOVERNORATES } from '../data/financingData';
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
    <section className="relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[460px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full bg-indigo-100/40 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20 pb-14 lg:pb-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-slate-700 mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Mizen · Finance intelligence for Tunisia</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-[-0.035em] text-slate-950 leading-[1.08] mb-5 max-w-3xl">{t.heroHeadline}</h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-7">{t.heroSubheadline}</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <button id="hero-cta-start" onClick={onStartFullDiagnostic} className="min-h-[50px] px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                <span>{t.heroStartBtn}</span><ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button id="hero-cta-explore" onClick={onExploreAll} className="min-h-[50px] px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200 shadow-xs transition-all flex items-center justify-center">
                {t.heroExploreBtn}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
              {[
                language === 'ar' ? 'معايير ومصادر موثقة' : 'Critères et sources traçables',
                language === 'ar' ? 'لا وعود بالموافقة' : 'Aucune promesse d’approbation',
                language === 'ar' ? 'بالعربية والفرنسية' : 'Français & arabe'
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{item}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-5 sm:p-6 lg:p-7">
            {!extractedDraft ? (
              <>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                      <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Sparkles className="w-4 h-4 text-indigo-600" /></span>
                      {t.heroAiIntakeTitle}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {language === 'ar' ? 'صف مشروعك كما هو. ميزان يستخرج المعطيات دون افتراض ما لم تذكره.' : 'Décrivez votre projet comme vous le feriez à un conseiller. Mizen extrait les données sans inventer ce qui manque.'}
                    </p>
                  </div>
                  <TrustBadge type="ai_interpretation" language={language} subtle />
                </div>
                <form onSubmit={handleAiIntake} className="space-y-3">
                  <textarea id="hero-ai-input" value={naturalQuery} onChange={(e) => setNaturalQuery(e.target.value)} placeholder={t.heroAiIntakePlaceholder} rows={5} className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-slate-800 text-sm leading-relaxed placeholder-slate-400 transition-all outline-hidden resize-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 leading-relaxed">{t.heroAiIntakeHint}</span>
                    <button id="hero-ai-submit-btn" type="submit" disabled={isParsing || !naturalQuery.trim()} className="min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs">
                      {isParsing ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{language === 'ar' ? 'جارٍ التحليل...' : 'Analyse en cours...'}</span></> : <><Sparkles className="w-4 h-4 text-amber-300" /><span>{t.heroAiIntakeSubmit}</span></>}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div id="ai-confirmation-review-card" className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{language === 'ar' ? 'راجعنا ما فهمناه من مشروعك' : 'Vérifiez ce que Mizen a compris'}</div>
                    {extractedDraft.summaryText && <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{extractedDraft.summaryText}</p>}
                  </div>
                  <button type="button" onClick={() => setIsEditingDraft(!isEditingDraft)} className="min-h-[40px] px-3 rounded-lg text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-1.5 shrink-0">
                    <Edit2 className="w-3.5 h-3.5" /><span>{isEditingDraft ? (language === 'ar' ? 'تم' : 'Terminer') : (language === 'ar' ? 'تعديل' : 'Modifier')}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    ['sector', language === 'ar' ? 'القطاع' : 'Secteur d’activité'],
                    ['financingRequested', language === 'ar' ? 'التمويل المطلوب' : 'Financement souhaité'],
                    ['totalProjectCost', language === 'ar' ? 'كلفة المشروع' : 'Coût global du projet'],
                    ['userContribution', language === 'ar' ? 'المساهمة الذاتية' : 'Apport personnel'],
                    ['location', language === 'ar' ? 'الولاية' : 'Gouvernorat'],
                    ['businessStage', language === 'ar' ? 'مرحلة المشروع' : 'Stade du projet'],
                    ['purpose', language === 'ar' ? 'موضوع التمويل' : 'Objet du financement']
                  ].map(([key, label]) => (
                    <div key={key} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                      <span className="text-slate-500 block mb-1 font-medium">{label}</span>
                      {isEditingDraft && key === 'sector' ? (
                        <select value={extractedDraft.sector || ''} onChange={(e) => setExtractedDraft({ ...extractedDraft, sector: (e.target.value as BusinessSector) || undefined })} className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"><option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>{Object.entries(sectorLabels).map(([k, v]) => <option key={k} value={k}>{v[language]}</option>)}</select>
                      ) : isEditingDraft && key === 'location' ? (
                        <select value={extractedDraft.location || ''} onChange={(e) => setExtractedDraft({ ...extractedDraft, location: e.target.value || undefined })} className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"><option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>{TUNISIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}</select>
                      ) : isEditingDraft && key === 'businessStage' ? (
                        <select value={extractedDraft.businessStage || ''} onChange={(e) => setExtractedDraft({ ...extractedDraft, businessStage: (e.target.value as BusinessStage) || undefined })} className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"><option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>{Object.entries(stageLabels).map(([k, v]) => <option key={k} value={k}>{v[language]}</option>)}</select>
                      ) : isEditingDraft && key === 'purpose' ? (
                        <select value={extractedDraft.purpose || ''} onChange={(e) => setExtractedDraft({ ...extractedDraft, purpose: (e.target.value as FinancingPurpose) || undefined })} className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"><option value="">{language === 'ar' ? '-- غير محدد --' : '-- Non précisé --'}</option>{Object.entries(purposeLabels).map(([k, v]) => <option key={k} value={k}>{v[language]}</option>)}</select>
                      ) : isEditingDraft && ['financingRequested', 'totalProjectCost', 'userContribution'].includes(key) ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={Number(extractedDraft[key as keyof ExtractedDraft]) || ''} onChange={(e) => setExtractedDraft({ ...extractedDraft, [key]: parseFloat(e.target.value) || undefined })} className="w-full p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800" />
                          <span className="font-bold text-slate-500">DT</span>
                        </div>
                      ) : (
                        <span className={extractedDraft[key as keyof ExtractedDraft] ? 'font-semibold text-slate-900' : 'font-semibold text-amber-700'}>
                          {['financingRequested', 'totalProjectCost', 'userContribution'].includes(key)
                            ? extractedDraft[key as keyof ExtractedDraft] ? Number(extractedDraft[key as keyof ExtractedDraft]).toLocaleString('fr-FR') + ' DT' : (language === 'ar' ? 'غير محدد' : 'Non précisé')
                            : key === 'sector' && extractedDraft.sector ? sectorLabels[extractedDraft.sector][language]
                            : key === 'purpose' && extractedDraft.purpose ? purposeLabels[extractedDraft.purpose][language]
                            : key === 'businessStage' && extractedDraft.businessStage ? stageLabels[extractedDraft.businessStage][language]
                            : extractedDraft[key as keyof ExtractedDraft] || (language === 'ar' ? 'غير محدد' : 'Non précisé')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {((extractedDraft.missingCriticalFields?.length || 0) > 0 || (extractedDraft.unassumedFields?.length || 0) > 0) && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold mb-1.5"><Info className="w-3.5 h-3.5" /><span>{language === 'ar' ? 'ما لم نفترضه' : 'Ce que Mizen n’a pas supposé'}</span></div>
                    <div className="flex flex-wrap gap-1.5">{[...(extractedDraft.unassumedFields || []), ...(extractedDraft.missingCriticalFields || [])].map((item, idx) => <span key={idx} className="px-2 py-1 rounded-md bg-white/80 border border-amber-200">{item}</span>)}</div>
                  </div>
                )}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => { setExtractedDraft(null); setIsEditingDraft(false); }} className="min-h-[44px] px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 justify-center sm:justify-start"><RotateCcw className="w-3.5 h-3.5" /><span>{language === 'ar' ? 'إعادة الصياغة' : 'Recommencer'}</span></button>
                  <button id="ai-confirm-submit-btn" type="button" onClick={handleConfirmDraft} className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"><span>{language === 'ar' ? 'تأكيد ومتابعة' : 'Confirmer et continuer'}</span><ArrowRight className="w-4 h-4 rtl:rotate-180" /></button>
                </div>
              </div>
            )}
            {parseError && <div className="mt-3 text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /><span>{parseError}</span></div>}
          </div>
        </div>

        <div className="mt-14 lg:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 mb-2">{language === 'ar' ? 'من الفكرة إلى التمويل' : 'De votre projet à une stratégie de financement'}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">{language === 'ar' ? 'ليس مجرد محرك بحث للقروض.' : 'Mizen ne se contente pas de chercher un crédit.'}</h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">{language === 'ar' ? 'نحدد ما يمكن أن يناسب مشروعك، ما ينقصك، وكيف يمكن جمع مصادر تمويل متوافقة عندما لا يكفي مصدر واحد.' : 'Mizen identifie ce qui peut correspondre à votre projet, ce qui manque encore et, lorsque nécessaire, comment combiner plusieurs sources compatibles.'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: '01', title: language === 'ar' ? 'يفهم مشروعك' : 'Comprendre le projet', text: language === 'ar' ? 'التكلفة، المساهمة، النشاط، المرحلة، الموقع والدخل.' : 'Coût, apport, activité, stade, localisation et revenu.' },
              { n: '02', title: language === 'ar' ? 'يفحص الملاءمة' : 'Tester la compatibilité', text: language === 'ar' ? 'قواعد الأهلية، الشروط الصلبة، المعلومات الناقصة ومصدر كل معلومة.' : 'Règles d’éligibilité, conditions bloquantes, données manquantes et provenance.' },
              { n: '03', title: language === 'ar' ? 'يبني خطة تمويل' : 'Construire une stratégie', text: language === 'ar' ? 'إذا لم يكف مصدر واحد، نبحث عن مزيج متوافق دون احتساب الضمان كتمويل نقدي.' : 'Si une seule source ne suffit pas, Mizen cherche une combinaison compatible sans compter une garantie comme du cash.' }
            ].map((item) => (
              <div key={item.n} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                <span className="text-xs font-black text-blue-700">{item.n}</span><h3 className="text-base sm:text-lg font-bold text-slate-950 mt-2">{item.title}</h3><p className="text-sm text-slate-600 leading-relaxed mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 lg:mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 mb-2">{language === 'ar' ? 'ابدأ من احتياجك' : 'Commencez par votre besoin'}</p><h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">{language === 'ar' ? 'ماذا تريد أن تموّل؟' : 'Quel projet voulez-vous financer ?'}</h2></div>
            <button onClick={onExploreAll} className="text-sm font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1.5">{language === 'ar' ? 'استكشف كل الآليات' : 'Voir tous les dispositifs'}<ArrowRight className="w-4 h-4 rtl:rotate-180" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { journey: 'home_purchase' as FinancingJourney, purpose: 'first_home' as FinancingPurpose, title: { fr: 'Acheter un logement', ar: 'شراء مسكن' }, icon: <Home className="w-5 h-5 text-blue-600" />, desc: { fr: 'Premier logement et financement acquéreur', ar: 'المسكن الأول وتمويل الشراء' } },
              { journey: 'home_construction' as FinancingJourney, purpose: 'home_construction' as FinancingPurpose, title: { fr: 'Construire / Rénover', ar: 'بناء أو تهيئة مسكن' }, icon: <Hammer className="w-5 h-5 text-emerald-600" />, desc: { fr: 'Construction, travaux et extension', ar: 'بناء، أشغال وتوسعة' } },
              { journey: 'car' as FinancingJourney, purpose: 'vehicle' as FinancingPurpose, title: { fr: 'Acheter un véhicule', ar: 'شراء سيارة / وسيلة نقل' }, icon: <Wrench className="w-5 h-5 text-amber-600" />, desc: { fr: 'Auto, utilitaire et leasing', ar: 'سيارة، نقل مهني وليزينغ' } },
              { journey: 'startup' as FinancingJourney, purpose: 'creation' as FinancingPurpose, title: { fr: 'Créer une entreprise', ar: 'بعث وتأسيس مشروع' }, icon: <Building2 className="w-5 h-5 text-indigo-600" />, desc: { fr: 'Création, startup et premiers investissements', ar: 'تأسيس، شركة ناشئة واستثمار أولي' } },
              { journey: 'business_expansion' as FinancingJourney, purpose: 'expansion' as FinancingPurpose, title: { fr: 'Développer une PME', ar: 'توسعة وتحديث مؤسسة' }, icon: <TrendingUp className="w-5 h-5 text-teal-600" />, desc: { fr: 'Capacité, croissance et trésorerie', ar: 'النمو، الطاقة الإنتاجية والسيولة' } },
              { journey: 'equipment' as FinancingJourney, purpose: 'equipment' as FinancingPurpose, title: { fr: 'Équipements & Machines', ar: 'اقتناء معدات وآلات' }, icon: <Wrench className="w-5 h-5 text-purple-600" />, desc: { fr: 'Machines, outillage et matériel', ar: 'آلات، أدوات ومعدات' } },
              { journey: 'agriculture' as FinancingJourney, purpose: 'agriculture' as FinancingPurpose, title: { fr: 'Projet agricole', ar: 'مشروع فلاحي' }, icon: <Tractor className="w-5 h-5 text-lime-600" />, desc: { fr: 'Agriculture, élevage et irrigation', ar: 'فلاحة، تربية ماشية وري' } },
              { journey: 'other_professional' as FinancingJourney, purpose: 'working_capital' as FinancingPurpose, title: { fr: 'Autre financement pro', ar: 'تمويل مهني آخر' }, icon: <Coins className="w-5 h-5 text-slate-600" />, desc: { fr: 'Commerce, services et besoins divers', ar: 'تجارة، خدمات وحاجيات متنوعة' } }
            ].map((item) => (
              <button key={item.journey} id={"journey-card-" + item.journey} type="button" onClick={() => onSelectJourney ? onSelectJourney(item.journey) : onSelectPurpose(item.purpose)} className="group text-left rtl:text-right p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-sm transition-all min-h-[150px] flex flex-col justify-between focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                <div><div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center mb-3 transition-colors">{item.icon}</div><h3 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-blue-700 transition-colors">{item.title[language]}</h3><p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc[language]}</p></div>
                <div className="mt-3 text-xs font-semibold text-blue-700 inline-flex items-center gap-1.5"><span>{language === 'ar' ? 'ابدأ' : 'Commencer'}</span><ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" /></div>
              </button>
            ))}
          </div>
        </div>

        {onSelectDemoScenario && <div className="mt-14 lg:mt-20"><DemoScenarioDeck language={language} onSelectScenario={onSelectDemoScenario} /></div>}

        <div className="mt-14 lg:mt-20 rounded-2xl bg-slate-900 text-white p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{language === 'ar' ? 'شفافية قبل كل شيء' : 'La transparence avant tout'}</p><p className="text-sm sm:text-base text-slate-200 mt-1 max-w-2xl leading-relaxed">{language === 'ar' ? 'كل نتيجة تفرق بين ما هو موثق، ما هو محسوب، وما يزال يحتاج إلى تحقق.' : 'Chaque résultat distingue ce qui est vérifié, calculé ou encore à confirmer.'}</p></div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">{['BFPME', 'BTS Bank', 'SOTUGAR', 'FOPRODI / APII', 'Startup Act', 'Microfinance'].map((item) => <span key={item} className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-slate-200">{item}</span>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
