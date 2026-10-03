import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Calculator, 
  MapPin, 
  Building, 
  GraduationCap, 
  Rocket, 
  Check, 
  Sparkles,
  Info,
  Home,
  Briefcase,
  Wallet,
  Car,
  Hammer,
  TrendingUp,
  Wrench,
  Tractor,
  RotateCcw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { 
  ApplicantProfile, 
  FinancingPurpose, 
  FinancingJourney,
  BusinessSector, 
  BusinessStage, 
  LegalStructure, 
  Language,
  MonthlyIncomeRange,
  EmploymentStatus,
  PropertyType,
  VehicleCondition,
  VehicleBuyerType,
  VehicleUsage,
  VehicleCategory,
  ConstructionType,
  StartupProjectStage,
  AnnualTurnoverRange,
  EmployeesCountRange,
  ExpansionPurpose,
  EquipmentCategory,
  AgriculturalActivityType,
  AgriculturalLandStatus
} from '../types/financing';
import { TUNISIAN_GOVERNORATES, REGIONAL_DEVELOPMENT_ZONES } from '../data/financingData';
import { TRANSLATIONS } from '../i18n/translations';
import { TrustBadge } from './TrustBadge';
import { JOURNEY_METAS, cleanProfileForJourney } from '../engine/journeyEngine';

interface QuestionnaireFlowProps {
  initialProfile: ApplicantProfile;
  language: Language;
  onComplete: (profile: ApplicantProfile) => void;
  onCancel: () => void;
}

export const QuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({
  initialProfile,
  language,
  onComplete,
  onCancel
}) => {
  const t = TRANSLATIONS[language];
  const [profile, setProfile] = useState<ApplicantProfile>(initialProfile);
  
  // Steps: 1 = Choose Journey, 2 = Journey Details & Project Scope, 3 = Financials & Capacity, 4 = Preferences & Verification
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(
    initialProfile.journey ? 2 : 1
  );

  const selectedJourney = profile.journey;

  // Auto-sync Financing Requested when Total Project Cost or User Contribution changes
  const handleCostChange = (total: number | undefined, contribution: number | undefined) => {
    const validTotal = total !== undefined ? Math.max(0, total) : undefined;
    const validContribution = contribution !== undefined ? Math.max(0, contribution) : undefined;
    const requested = (validTotal !== undefined && validContribution !== undefined)
      ? Math.max(0, validTotal - validContribution)
      : undefined;
      
    setProfile(prev => ({
      ...prev,
      totalProjectCost: validTotal,
      userContribution: validContribution,
      financingRequested: requested ?? prev.financingRequested
    }));
  };

  // Auto-detect Regional Development Zone (ZDR)
  useEffect(() => {
    if (profile.location) {
      const isZdr = REGIONAL_DEVELOPMENT_ZONES.includes(profile.location);
      if (isZdr !== profile.isRegionalDevelopmentZone) {
        setProfile(prev => ({ ...prev, isRegionalDevelopmentZone: isZdr }));
      }
    }
  }, [profile.location]);

  const handleSelectJourney = (journey: FinancingJourney) => {
    const cleaned = cleanProfileForJourney(profile, journey);
    setProfile(cleaned);
    setCurrentStep(2);
  };

  const totalCostVal = profile.totalProjectCost ?? 0;
  const userContribVal = profile.userContribution ?? 0;
  const contributionPercent = (totalCostVal > 0 && profile.userContribution !== undefined)
    ? Math.round((userContribVal / totalCostVal) * 100)
    : undefined;

  const journeyOptions: FinancingJourney[] = [
    'home_purchase',
    'home_construction',
    'car',
    'startup',
    'business_expansion',
    'equipment',
    'agriculture',
    'other_professional'
  ];

  const getJourneyIcon = (journey: FinancingJourney) => {
    switch (journey) {
      case 'home_purchase': return <Home className="w-5 h-5 text-blue-600" />;
      case 'home_construction': return <Hammer className="w-5 h-5 text-emerald-600" />;
      case 'car': return <Car className="w-5 h-5 text-amber-600" />;
      case 'startup': return <Rocket className="w-5 h-5 text-indigo-600" />;
      case 'business_expansion': return <TrendingUp className="w-5 h-5 text-teal-600" />;
      case 'equipment': return <Wrench className="w-5 h-5 text-purple-600" />;
      case 'agriculture': return <Tractor className="w-5 h-5 text-lime-600" />;
      case 'other_professional': return <Briefcase className="w-5 h-5 text-slate-600" />;
    }
  };

  const incomeRanges: { id: MonthlyIncomeRange; label: { fr: string; ar: string } }[] = [
    { id: 'under_1000', label: { fr: 'Moins de 1 000 DT / mois', ar: 'أقل من 1000 د.ت / شهرياً' } },
    { id: '1000_1500', label: { fr: '1 000 – 1 500 DT / mois', ar: '1000 – 1500 د.ت / شهرياً' } },
    { id: '1500_2500', label: { fr: '1 500 – 2 500 DT / mois (Classe moyenne)', ar: '1500 – 2500 د.ت / شهرياً (الفئة المتوسطة)' } },
    { id: '2500_4000', label: { fr: '2 500 – 4 000 DT / mois', ar: '2500 – 4000 د.ت / شهرياً' } },
    { id: 'over_4000', label: { fr: 'Plus de 4 000 DT / mois', ar: 'أكثر من 4000 د.ت / شهرياً' } }
  ];

  const employmentStatuses: { id: EmploymentStatus; label: { fr: string; ar: string } }[] = [
    { id: 'salaried_private', label: { fr: 'Salarié du secteur privé (CNSS)', ar: 'أجير بالقطاع الخاص (CNSS)' } },
    { id: 'salaried_public', label: { fr: 'Fonctionnaire / Secteur public (CNRPS)', ar: 'موظف / قطاع عمومي (CNRPS)' } },
    { id: 'business_owner', label: { fr: 'Chef d’entreprise / Gérant de société', ar: 'صاحب مؤسسة / وكيل شركة' } },
    { id: 'independent_professional', label: { fr: 'Profession libérale / Indépendant', ar: 'مهنة حرة / مستقل' } },
    { id: 'job_seeker', label: { fr: 'Primo-demandeur / Jeune diplômé', ar: 'طالب شغل / متخرج جديد' } }
  ];

  const businessSectors: { id: BusinessSector; label: { fr: string; ar: string } }[] = [
    { id: 'industry', label: { fr: 'Industrie manufacturière & Chimie', ar: 'الصناعات المعملية والكيميائية' } },
    { id: 'services', label: { fr: 'Services & Conseil aux entreprises', ar: 'الخدمات والاستشارات' } },
    { id: 'ict_tech', label: { fr: 'Technologies, Logiciels & Digital', ar: 'تكنولوجيا المعلومات والبرمجيات' } },
    { id: 'agriculture_agribusiness', label: { fr: 'Agriculture & Agroalimentaire', ar: 'الفلاحة والصناعات الغذائية' } },
    { id: 'crafts_trades', label: { fr: 'Artisanat & Métiers manuels', ar: 'الصناعات التقليدية والحرف' } },
    { id: 'commerce', label: { fr: 'Commerce & Distribution', ar: 'التجارة والتوزيع' } },
    { id: 'renewable_energy', label: { fr: 'Énergies renouvelables & Environnement', ar: 'الطاقات المتجددة والبيئة' } },
    { id: 'tourism', label: { fr: 'Tourisme, Hébergement & Restauration', ar: 'السياحة والإيواء والإطعام' } },
    { id: 'other', label: { fr: 'Autre secteur', ar: 'قطاع آخر' } }
  ];

  const legalForms: { id: LegalStructure; label: string }[] = [
    { id: 'individual', label: 'Personne Physique / Individuelle' },
    { id: 'suarl', label: 'SUARL (Société Unipersonnelle)' },
    { id: 'sarl', label: 'SARL (Société à Responsabilité Limitée)' },
    { id: 'sa', label: 'SA (Société Anonyme)' },
    { id: 'agricultural_coop', label: 'Société Mutuelle Agricole (SMSA)' },
    { id: 'not_yet_created', label: 'Non encore créée (Projet en cours)' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Step Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>
            {language === 'ar' ? `المرحلة ${currentStep} من 4` : `Étape ${currentStep} sur 4`}
          </span>
          {selectedJourney && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {JOURNEY_METAS[selectedJourney].shortTitle[language]}
            </span>
          )}
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-700 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Questionnaire Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs">
        
        {/* ========================================================================= */}
        {/* STEP 1: SELECT FINANCING NEED / JOURNEY */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left rtl:sm:text-right">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {language === 'ar' ? 'ما الذي ترغب في تمويله؟' : 'Que souhaitez-vous financer ?'}
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {language === 'ar'
                  ? 'اختر مسار التمويل ليقوم ميزان بعرض الأسئلة الخاصة بمشروعك فقط دون استمارات معقدة.'
                  : 'Sélectionnez votre besoin pour activer un parcours ciblé et adapté, sans questions superflues.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {journeyOptions.map((journeyKey) => {
                const meta = JOURNEY_METAS[journeyKey];
                const isSelected = selectedJourney === journeyKey;
                return (
                  <button
                    key={journeyKey}
                    type="button"
                    onClick={() => handleSelectJourney(journeyKey)}
                    className={`min-h-[72px] p-4 rounded-2xl border text-left rtl:text-right transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-100/70 shrink-0 transition-colors">
                      {getJourneyIcon(journeyKey)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700">
                          {meta.title[language]}
                        </strong>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 rtl:rotate-180" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">
                        {meta.subtitle[language]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SPECIALIZED PROJECT & NATURE DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 2 && selectedJourney && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  {JOURNEY_METAS[selectedJourney].title[language]}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar' ? 'طبيعة ومواصفات المشروع' : 'Spécifications et nature du projet'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'ar' ? 'تغيير الهدف' : 'Changer d’objectif'}</span>
              </button>
            </div>

            {/* A. HOME PURCHASE */}
            {selectedJourney === 'home_purchase' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'نوع العقار وحالته' : 'Nature et état du bien immobilier'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, propertyCondition: 'new', propertyType: 'new_apartment' }))}
                      className={`min-h-[44px] p-3 rounded-xl border text-left rtl:text-right text-xs font-semibold ${
                        profile.propertyCondition === 'new'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'ar' ? 'مسكن جديد (باعث عقاري معتمد)' : 'Logement neuf (Promoteur agréé)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, propertyCondition: 'existing', propertyType: 'individual_house' }))}
                      className={`min-h-[44px] p-3 rounded-xl border text-left rtl:text-right text-xs font-semibold ${
                        profile.propertyCondition === 'existing'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'ar' ? 'مسكن قديم / إعادة بيع' : 'Logement ancien / Revente'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'هل هذا أول اقتناء لمسكن؟' : 'Premier achat immobilier ?'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, isFirstPropertyPurchase: true }))}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                          profile.isFirstPropertyPurchase === true
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'نعم (مسكن أول)' : 'Oui (Primo-accédant)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, isFirstPropertyPurchase: false }))}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                          profile.isFirstPropertyPurchase === false
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'لا (مالك سابقاً)' : 'Non (Déjà propriétaire)'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'تخصيص المسكن' : 'Usage du logement'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, isPrincipalResidence: true }))}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                          profile.isPrincipalResidence === true
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'سكن رئيسي' : 'Résidence principale'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, isPrincipalResidence: false }))}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                          profile.isPrincipalResidence === false
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'سكن ثانوي / كراء' : 'Secondaire / Locatif'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. HOME CONSTRUCTION */}
            {selectedJourney === 'home_construction' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'نوع الأشغال المزمع إنجازها' : 'Type de travaux prévus'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'construction' as ConstructionType, fr: 'Construction complète', ar: 'بناء جديد كلياً' },
                      { id: 'extension' as ConstructionType, fr: 'Extension / Surélévation', ar: 'توسعة أو تعلية' },
                      { id: 'renovation' as ConstructionType, fr: 'Rénovation / Finitions', ar: 'تهيئة وتشطيب' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, constructionType: item.id }))}
                        className={`min-h-[44px] p-3 rounded-xl border text-xs font-semibold text-center ${
                          profile.constructionType === item.id
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item[language]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الوضعية العقارية للأرض' : 'Titre foncier et propriété du terrain'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, hasLandOwnershipTitle: true }))}
                      className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                        profile.hasLandOwnershipTitle === true
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {language === 'ar' ? 'أرض مسجلة (شهادة ملكية)' : 'Titre foncier individuel disponible'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, hasLandOwnershipTitle: false }))}
                      className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                        profile.hasLandOwnershipTitle === false
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {language === 'ar' ? 'في طور التسجيل / بدون رسم' : 'En cours / Sans titre individuel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* C. CAR FINANCING */}
            {selectedJourney === 'car' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'صفة طالب التمويل' : 'Qualité du demandeur'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, vehicleBuyerType: 'individual', legalStructure: 'individual' }))}
                      className={`min-h-[44px] p-3 rounded-xl border text-xs font-semibold text-center ${
                        profile.vehicleBuyerType === 'individual'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'ar' ? 'فرد / شخص طبيعي (أجير أو مهني)' : 'Particulier / Salarié'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, vehicleBuyerType: 'business', legalStructure: 'sarl' }))}
                      className={`min-h-[44px] p-3 rounded-xl border text-xs font-semibold text-center ${
                        profile.vehicleBuyerType === 'business'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'ar' ? 'شركة / تاجر / فلاح (باتيندة)' : 'Entreprise / Professionnel / RNE'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'حالة العربة' : 'État du véhicule'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, vehicleCondition: 'new' }))}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                          profile.vehicleCondition === 'new'
                            ? 'bg-amber-100 border-amber-600 text-amber-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'جديدة (0 كم)' : 'Neuf (Concessionnaire)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, vehicleCondition: 'used' }))}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold ${
                          profile.vehicleCondition === 'used'
                            ? 'bg-amber-100 border-amber-600 text-amber-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'مستعملة' : 'Occasion récente'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'استعمال العربة' : 'Usage principal'}
                    </label>
                    <select
                      value={profile.vehicleUsage || ''}
                      onChange={(e) => setProfile(p => ({ ...p, vehicleUsage: e.target.value as VehicleUsage || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- اختر نوع الاستعمال --' : '-- Sélectionner l’usage --'}</option>
                      <option value="personal">{language === 'ar' ? 'استعمال شخصي وعائلي' : 'Personnel / Quotidien'}</option>
                      <option value="professional">{language === 'ar' ? 'استعمال مهني وتجاري' : 'Professionnel / Utilitaire / Société'}</option>
                    </select>
                  </div>
                </div>

                {/* Business specific fields if vehicleBuyerType is business */}
                {profile.vehicleBuyerType === 'business' && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <span className="text-xs font-bold text-amber-950 block uppercase">
                      {language === 'ar' ? 'معطيات النشاط المهني للمؤسسة' : 'Informations de l’entreprise acheteuse'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'ar' ? 'قطاع النشاط' : 'Secteur d’activité'}
                        </label>
                        <select
                          value={profile.sector || ''}
                          onChange={(e) => setProfile(p => ({ ...p, sector: e.target.value as BusinessSector || undefined }))}
                          className="w-full min-h-[40px] px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="">{language === 'ar' ? '-- اختر القطاع --' : '-- Sélectionner le secteur --'}</option>
                          {businessSectors.map(s => (
                            <option key={s.id} value={s.id}>{s.label[language]}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'ar' ? 'أقدمية المؤسسة' : 'Ancienneté d’activité'}
                        </label>
                        <select
                          value={profile.businessAgeYears || ''}
                          onChange={(e) => setProfile(p => ({ ...p, businessAgeYears: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-full min-h-[40px] px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="">{language === 'ar' ? '-- حدد الأقدمية --' : '-- Préciser l’ancienneté --'}</option>
                          <option value={1}>Moins de 2 ans</option>
                          <option value={3}>3 à 5 ans</option>
                          <option value={6}>Plus de 5 ans</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* D. STARTUP JOURNEY */}
            {selectedJourney === 'startup' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'مرحلة تقدم المشروع' : 'Stade d’avancement de la création'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'idea' as StartupProjectStage, fr: 'Idée ou étude en cours (Non créée)', ar: 'فكرة أو دراسة (غير مسجلة بعد)' },
                      { id: 'study_prep' as StartupProjectStage, fr: 'Business plan finalisé / Dépôt statuts', ar: 'مخطط أعمال جاهز / إيداع القانون الأساسي' },
                      { id: 'incorporated' as StartupProjectStage, fr: 'Société immatriculée au RNE (Récente)', ar: 'مسجلة بالسجل الوطني للمؤسسات حديثاً' },
                      { id: 'launch_underway' as StartupProjectStage, fr: 'Démarrage & premiers investissements', ar: 'انطلاق النشاط والتجهيز' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setProfile(p => ({ 
                          ...p, 
                          startupProjectStage: st.id,
                          businessStage: st.id === 'idea' || st.id === 'study_prep' ? 'idea_project' : 'creation_underway'
                        }))}
                        className={`min-h-[44px] p-3 rounded-xl border text-xs text-left rtl:text-right font-semibold ${
                          profile.startupProjectStage === st.id
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {st[language]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'قطاع النشاط' : 'Secteur d’activité'}
                    </label>
                    <select
                      value={profile.sector || ''}
                      onChange={(e) => setProfile(p => ({ ...p, sector: e.target.value as BusinessSector || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- اختر القطاع --' : '-- Sélectionner le secteur --'}</option>
                      {businessSectors.map(s => (
                        <option key={s.id} value={s.id}>{s.label[language]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'الشكل القانوني المعتمد أو المستهدف' : 'Forme juridique visée'}
                    </label>
                    <select
                      value={profile.legalStructure || ''}
                      onChange={(e) => setProfile(p => ({ ...p, legalStructure: e.target.value as LegalStructure || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- حدد الصيغة القانونية --' : '-- Préciser la forme juridique --'}</option>
                      {legalForms.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'شهادة تعليم عالٍ؟' : 'Diplôme de l’enseignement supérieur ?'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, hasHigherEducationDegree: true }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.hasHigherEducationDegree === true
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'نعم، صاحب شهادة' : 'Oui, diplômé'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, hasHigherEducationDegree: false }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.hasHigherEducationDegree === false
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'لا / تكوين مهني' : 'Non / Autre profil'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'علامة Startup Act ؟' : 'Label Startup Act ?'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, hasStartupActLabel: true }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.hasStartupActLabel === true
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'نعم، حاصل على العلامة' : 'Oui, labellisé'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, hasStartupActLabel: false }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.hasStartupActLabel === false
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'لا / قيد التفكير' : 'Non / Standard'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* E. BUSINESS EXPANSION */}
            {selectedJourney === 'business_expansion' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'أقدمية المؤسسة في النشاط' : 'Ancienneté d’activité'}
                    </label>
                    <select
                      value={profile.businessAgeYears || ''}
                      onChange={(e) => setProfile(p => ({ ...p, businessAgeYears: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- حدد الأقدمية --' : '-- Sélectionner l’ancienneté --'}</option>
                      <option value={2}>2 ans</option>
                      <option value={4}>3 à 5 ans</option>
                      <option value={7}>6 à 10 ans</option>
                      <option value={12}>Plus de 10 ans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'رقم المعاملات السنوي التقريبي' : 'Chiffre d’affaires annuel (TND)'}
                    </label>
                    <select
                      value={profile.annualTurnoverRange || ''}
                      onChange={(e) => setProfile(p => ({ ...p, annualTurnoverRange: e.target.value as AnnualTurnoverRange || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- حدد رقم المعاملات --' : '-- Sélectionner le CA --'}</option>
                      <option value="under_100k">Moins de 100 000 DT</option>
                      <option value="100k_500k">100 000 – 500 000 DT</option>
                      <option value="500k_2m">500 000 – 2 000 000 DT</option>
                      <option value="2m_5m">2 000 000 – 5 000 000 DT</option>
                      <option value="over_5m">Plus de 5 000 000 DT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'قطاع النشاط' : 'Secteur d’activité'}
                    </label>
                    <select
                      value={profile.sector || ''}
                      onChange={(e) => setProfile(p => ({ ...p, sector: e.target.value as BusinessSector || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- اختر القطاع --' : '-- Sélectionner le secteur --'}</option>
                      {businessSectors.map(s => (
                        <option key={s.id} value={s.id}>{s.label[language]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'موضوع التوسعة' : 'Objet de l’extension'}
                    </label>
                    <select
                      value={profile.expansionPurpose || ''}
                      onChange={(e) => setProfile(p => ({ ...p, expansionPurpose: e.target.value as ExpansionPurpose || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- حدد هدف التوسعة --' : '-- Sélectionner l’objet --'}</option>
                      <option value="expansion">{language === 'ar' ? 'زيادة طاقة الإنتاج والتوسع' : 'Augmentation des capacités de production'}</option>
                      <option value="equipment">{language === 'ar' ? 'تحديث وتجديد الآلات' : 'Modernisation / Renouvellement machines'}</option>
                      <option value="working_capital">{language === 'ar' ? 'تمويل السيولة ورأس المال العامل' : 'Fonds de roulement d’exploitation'}</option>
                      <option value="premises">{language === 'ar' ? 'توسعة أو اقتناء مقر/مصنع' : 'Extension de locaux / usine'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* F. EQUIPMENT JOURNEY */}
            {selectedJourney === 'equipment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'صنف المعدات المزمع شراؤها' : 'Catégorie d’équipements'}
                  </label>
                  <select
                    value={profile.equipmentCategory || ''}
                    onChange={(e) => setProfile(p => ({ ...p, equipmentCategory: e.target.value as EquipmentCategory || undefined }))}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="">{language === 'ar' ? '-- اختر صنف المعدات --' : '-- Sélectionner la catégorie --'}</option>
                    <option value="manufacturing">{language === 'ar' ? 'آلات صناعية وتحويلية' : 'Machines de production & industrie'}</option>
                    <option value="commercial">{language === 'ar' ? 'معدات تجارية ومطاعم' : 'Équipements commerciaux & CHR'}</option>
                    <option value="tech_it">{language === 'ar' ? 'تجهيزات إعلامية وبرمجيات' : 'Matériel informatique & serveurs'}</option>
                    <option value="medical">{language === 'ar' ? 'معدات طبية وشبه طبية' : 'Matériel médical & laboratoire'}</option>
                    <option value="agriculture">{language === 'ar' ? 'جرارات ومعدات فلاحية' : 'Tracteurs & matériel agricole'}</option>
                    <option value="construction">{language === 'ar' ? 'معدات أشغال عامة وبناء' : 'Engins de BTP & outillage lourd'}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'فواتير تقديرية متوفرة؟' : 'Devis / Proforma disponibles ?'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, hasProformaInvoice: true }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.hasProformaInvoice === true
                            ? 'bg-purple-50 border-purple-600 text-purple-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'نعم (Devis جاهز)' : 'Oui, devis prêts'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, hasProformaInvoice: false }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.hasProformaInvoice === false
                            ? 'bg-purple-50 border-purple-600 text-purple-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'لا / في طور الجمع' : 'Non / En prospection'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'حالة التجهيزات' : 'État des équipements'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, equipmentCondition: 'new' }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.equipmentCondition === 'new'
                            ? 'bg-purple-50 border-purple-600 text-purple-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'جديدة' : 'Matériel Neuf'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, equipmentCondition: 'used' }))}
                        className={`min-h-[40px] p-2 rounded-xl border text-xs font-semibold ${
                          profile.equipmentCondition === 'used'
                            ? 'bg-purple-50 border-purple-600 text-purple-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? 'مستعملة ومجددة' : 'Occasion / Rénové'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* G. AGRICULTURE JOURNEY */}
            {selectedJourney === 'agriculture' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'النشاط الفلاحي المستهدف' : 'Branche de l’activité agricole'}
                  </label>
                  <select
                    value={profile.agriculturalActivityType || ''}
                    onChange={(e) => setProfile(p => ({ ...p, agriculturalActivityType: e.target.value as AgriculturalActivityType || undefined }))}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">{language === 'ar' ? '-- اختر النشاط الفلاحي --' : '-- Sélectionner la branche --'}</option>
                    <option value="crops">{language === 'ar' ? 'أشجار مثمرة وزراعات كبرى' : 'Arboriculture & grandes cultures'}</option>
                    <option value="livestock">{language === 'ar' ? 'تربية ماشية ودواجن' : 'Élevage bovin / ovin / aviculture'}</option>
                    <option value="irrigation_equipment">{language === 'ar' ? 'تجهيزات ري ومعدات وطاقة شمسية' : 'Irrigation, puits & énergie solaire'}</option>
                    <option value="mixed">{language === 'ar' ? 'نشاط فلاحي مندمج ومتنوع' : 'Exploitation mixte intégrée'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الوضعية العقارية للأرض' : 'Statut foncier de l’exploitation'}
                  </label>
                  <select
                    value={profile.agriculturalLandStatus || ''}
                    onChange={(e) => setProfile(p => ({ ...p, agriculturalLandStatus: e.target.value as AgriculturalLandStatus || undefined }))}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">{language === 'ar' ? '-- حدد الوضعية العقارية --' : '-- Statut de la terre --'}</option>
                    <option value="owned">{language === 'ar' ? 'أرض ملكية خاصة مسجلة' : 'Terre en pleine propriété titrée'}</option>
                    <option value="leased">{language === 'ar' ? 'أرض مسوغة بعقد مسجل' : 'Contrat de location enregistré'}</option>
                    <option value="family_land">{language === 'ar' ? 'أرض على الشياع عائلية' : 'Exploitation familiale / indivision'}</option>
                    <option value="state_domain">{language === 'ar' ? 'أرض دولية فلاحية مسوغة (SMVDA)' : 'Domaine de l’État loué (SMVDA)'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* H. OTHER PROFESSIONAL */}
            {selectedJourney === 'other_professional' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    {language === 'ar'
                      ? 'نظراً لتنوع متطلبات التمويل المهني العام، سيقدم ميزان تحليلاً أولياً للآليات العامة وصناديق الضمان المفتوحة.'
                      : 'Pour les financements professionnels non catégorisés, Mizen applique une grille d’analyse générale des dispositifs bancaires et fonds de garantie.'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'قطاع النشاط' : 'Secteur d’activité'}
                    </label>
                    <select
                      value={profile.sector || ''}
                      onChange={(e) => setProfile(p => ({ ...p, sector: e.target.value as BusinessSector || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- اختر القطاع --' : '-- Sélectionner le secteur --'}</option>
                      {businessSectors.map(s => (
                        <option key={s.id} value={s.id}>{s.label[language]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'الشكل القانوني' : 'Forme juridique'}
                    </label>
                    <select
                      value={profile.legalStructure || ''}
                      onChange={(e) => setProfile(p => ({ ...p, legalStructure: e.target.value as LegalStructure || undefined }))}
                      className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">{language === 'ar' ? '-- حدد الصيغة القانونية --' : '-- Forme juridique --'}</option>
                      {legalForms.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINANCIAL FIGURES & CAPACITY */}
        {/* ========================================================================= */}
        {currentStep === 3 && selectedJourney && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                {language === 'ar' ? 'المعطيات المالية والموقع' : 'Montants financiers et localisation'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'حدد الميزانية بدقة لحساب نسبة التمويل الذاتي ومطابقة الصناديق' : 'Mizen applique la règle stricte : Financement demandé = Coût total − Apport personnel'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {selectedJourney === 'car'
                    ? (language === 'ar' ? 'ثمن السيارة / العربة (د.ت)' : 'Prix d’achat du véhicule (TND)')
                    : (selectedJourney === 'home_purchase' || selectedJourney === 'home_construction')
                    ? (language === 'ar' ? 'كلفة العقار أو الأشغال (د.ت)' : 'Coût global du bien / travaux (TND)')
                    : (language === 'ar' ? 'الكلفة الجملية للمشروع (د.ت)' : 'Coût total du projet (TND)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={profile.totalProjectCost !== undefined ? profile.totalProjectCost : ''}
                  onChange={(e) => handleCostChange(e.target.value ? Number(e.target.value) : undefined, profile.userContribution)}
                  placeholder="Ex: 100 000"
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {language === 'ar' ? 'المساهمة الذاتية / التمويل الذاتي (د.ت)' : 'Apport personnel disponible (TND)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={profile.userContribution !== undefined ? profile.userContribution : ''}
                  onChange={(e) => handleCostChange(profile.totalProjectCost, e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 20 000"
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Live Financial Breakdown Card */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">{language === 'ar' ? 'التمويل المطلوب' : 'Besoin de financement'}</span>
                <strong className="text-sm sm:text-base font-bold text-blue-800">
                  {profile.financingRequested !== undefined ? `${profile.financingRequested.toLocaleString('fr-FR')} DT` : 'Non précisé'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'ar' ? 'نسبة التمويل الذاتي' : 'Taux d’autofinancement'}</span>
                <strong className={`text-sm sm:text-base font-bold ${
                  contributionPercent === undefined ? 'text-slate-500' : contributionPercent >= 20 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {contributionPercent !== undefined ? `${contributionPercent}%` : 'Non calculé'}
                </strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block">{language === 'ar' ? 'الولاية' : 'Gouvernorat'}</span>
                <strong className="text-sm font-bold text-slate-800 truncate block">
                  {profile.location || 'Non précisé'}
                </strong>
              </div>
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                {language === 'ar' ? 'مقر المشروع أو مكان السكن / العقار' : 'Gouvernorat d’implantation / résidence'}
              </label>
              <select
                value={profile.location || ''}
                onChange={(e) => setProfile(p => ({ ...p, location: e.target.value || undefined }))}
                className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="">{language === 'ar' ? '-- اختر الولاية --' : '-- Sélectionner le gouvernorat --'}</option>
                {TUNISIAN_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>
                    {gov} {REGIONAL_DEVELOPMENT_ZONES.includes(gov) ? '(Zone de Développement Régional)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Income & Employment (for individual / personal journeys or when relevant) */}
            {Boolean(selectedJourney) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الدخل الشهري الصافي للأسرة / الفرد' : 'Revenu net mensuel (Ménage)'}
                  </label>
                  <select
                    value={profile.monthlyIncomeRange || ''}
                    onChange={(e) => setProfile(p => ({ ...p, monthlyIncomeRange: e.target.value as MonthlyIncomeRange || undefined }))}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">{language === 'ar' ? '-- حدد شريحة الدخل --' : '-- Sélectionner la tranche de revenu --'}</option>
                    {incomeRanges.map(inc => (
                      <option key={inc.id} value={inc.id}>{inc.label[language]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الدخل الصافي الشهري (اختياري)' : 'Revenu net mensuel (optionnel)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={profile.monthlyNetIncome ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, monthlyNetIncome: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) }))}
                    placeholder={language === 'ar' ? 'مثال: 2500 د' : 'Ex. 2500 DT'}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'أقساط القروض الحالية شهرياً (اختياري)' : 'Mensualités de dettes existantes (optionnel)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={profile.monthlyDebtPayments ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, monthlyDebtPayments: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) }))}
                    placeholder={language === 'ar' ? 'مثال: 600 د' : 'Ex. 600 DT'}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الوضعية المهنية' : 'Statut professionnel'}
                  </label>
                  <select
                    value={profile.employmentStatus || ''}
                    onChange={(e) => setProfile(p => ({ ...p, employmentStatus: e.target.value as EmploymentStatus || undefined }))}
                    className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">{language === 'ar' ? '-- حدد الوضعية المهنية --' : '-- Sélectionner le statut --'}</option>
                    {employmentStatuses.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.label[language]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PREFERENCES & VERIFICATION CONFIRMATION */}
        {/* ========================================================================= */}
        {currentStep === 4 && selectedJourney && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                {language === 'ar' ? 'تفضيلات الصيغ والضمانات' : 'Préférences & Précisions'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'تخصيص الفلاتر لتوجيه التحليل نحو الآليات الأكثر ملاءمة' : 'Affinez l’analyse selon vos préférences contractuelles et vos garanties disponibles.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'صيغة التمويل المفضلة' : 'Formule de financement souhaitée'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'any', fr: 'Toutes formules confondues', ar: 'كافة الصيغ المتاحة' },
                  { id: 'standard', fr: 'Bancaire conventionnel', ar: 'تمويل بنكي تقليدي' },
                  { id: 'islamic', fr: 'Finance Islamique (Mourabaha)', ar: 'معاملات إسلامية (مرابحة)' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, structurePreference: item.id as any }))}
                    className={`min-h-[44px] p-3 rounded-xl border text-xs font-semibold text-center ${
                      (profile.structurePreference || 'any') === item.id
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item[language]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'الضمانات العينية المتاحة' : 'Garanties réelles ou hypothèques'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'available', fr: 'Garanties disponibles (Titre/Gage)', ar: 'ضمانات متوفرة (رهن/أصل)' },
                  { id: 'limited', fr: 'Garanties limitées (SOTUGAR utile)', ar: 'ضمانات محدودة (طلب كفالة)' },
                  { id: 'none', fr: 'Sans garanties réelles lourdes', ar: 'دون ضمانات عينية' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, collateralPreference: item.id as any }))}
                    className={`min-h-[44px] p-3 rounded-xl border text-xs font-semibold text-center ${
                      profile.collateralPreference === item.id
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item[language]}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/70 text-amber-950 text-xs flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">
                  {language === 'ar' ? 'مبدأ الشفافية في ميزان' : 'Engagement de rigueur Mizen'}
                </strong>
                <p className="leading-relaxed">
                  {language === 'ar'
                    ? 'يقوم ميزان بمطابقة الشروط العامة المنشورة رسمياً ولا يمنح موافقات ائتمانية نيابة عن البنوك. كافة الشروط التعاقدية تخضع لدراسة المؤسسة المالية.'
                    : 'Mizen évalue l’adéquation technique avec les critères publics déclarés et ne constitue pas un accord de crédit bancaire.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTION CONTROLS (Min 44px Touch Targets) */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{language === 'ar' ? 'السابق' : 'Précédent'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-medium transition-colors"
            >
              {language === 'ar' ? 'إلغاء والعودة للرئيسية' : 'Annuler'}
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              disabled={currentStep === 1 && !selectedJourney}
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all ml-auto rtl:ml-0 rtl:mr-auto"
            >
              <span>{language === 'ar' ? 'متابعة' : 'Continuer'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <button
              id="submit-questionnaire-btn"
              type="button"
              onClick={() => onComplete(profile)}
              className="min-h-[44px] px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all ml-auto rtl:ml-0 rtl:mr-auto"
            >
              <span>{language === 'ar' ? 'عرض البرامج المتطابقة' : 'Lancer l’analyse technique'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
