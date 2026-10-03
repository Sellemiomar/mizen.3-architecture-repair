import React from 'react';
import { Sparkles, ArrowRight, Building2, Home, Factory, TrendingUp, Wrench, CheckCircle2, Shield, Car } from 'lucide-react';
import { DemoScenario, Language, ApplicantProfile } from '../types/financing';
import { DEMO_SCENARIOS } from '../data/financingData';
import { TRANSLATIONS } from '../i18n/translations';

interface DemoScenarioDeckProps {
  language: Language;
  onSelectScenario: (scenario: DemoScenario) => void;
  activeScenarioId?: string;
  compact?: boolean;
}

export const DemoScenarioDeck: React.FC<DemoScenarioDeckProps> = ({
  language,
  onSelectScenario,
  activeScenarioId,
  compact = false
}) => {
  const t = TRANSLATIONS[language];

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'demo_first_home':
        return <Home className="w-5 h-5 text-blue-600" />;
      case 'demo_home_construction':
        return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'demo_manufacturing':
        return <Factory className="w-5 h-5 text-amber-600" />;
      case 'demo_sme_expansion':
        return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      case 'demo_equipment':
        return <Wrench className="w-5 h-5 text-purple-600" />;
      case 'demo_car_financing':
        return <Car className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  if (compact) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              {t.demoBadge}
            </span>
            <h3 className="text-sm font-bold text-white">
              {language === 'ar' ? 'اختبار الحالات النموذجية الـ 6' : 'Tester les 6 scénarios pilotes'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {language === 'ar' ? 'بيانات اصطناعية للعرض والتوضيح' : 'Données synthétiques de démonstration'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onSelectScenario(sc)}
                className={`min-h-[44px] p-3 rounded-xl text-left rtl:text-right text-xs transition-all flex items-center justify-between gap-2 border ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-xs font-semibold'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{getScenarioIcon(sc.id)}</span>
                  <span className="truncate">{sc.title[language]}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70 rtl:rotate-180" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
              {t.demoBadge}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'ar' ? 'عرض مخصص للشركاء والمؤسسات المالية' : 'Mode Démonstration Institutionnelle'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {t.demoScenariosTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {t.demoScenariosSub}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shrink-0">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{language === 'ar' ? 'معطيات اصطناعية 100%' : 'Données synthétiques non nominatives'}</span>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_SCENARIOS.map((scenario) => {
          const isActive = activeScenarioId === scenario.id;
          return (
            <div
              key={scenario.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/60 shrink-0">
                    {getScenarioIcon(scenario.id)}
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {scenario.badge[language]}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {scenario.title[language]}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                  {scenario.subtitle[language]}
                </p>

                {/* Key Numbers / Tags */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      {language === 'ar' ? 'الكلفة الإجمالية' : 'Coût global'}
                    </span>
                    <strong className="text-slate-800 font-bold">
                      {scenario.profile.totalProjectCost?.toLocaleString('fr-FR')} DT
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      {language === 'ar' ? 'التمويل المطلوب' : 'Financement'}
                    </span>
                    <strong className="text-blue-700 font-bold">
                      {scenario.profile.financingRequested?.toLocaleString('fr-FR')} DT
                    </strong>
                  </div>
                </div>

                {/* Target Institutions */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {language === 'ar' ? 'المؤسسات المستهدفة :' : 'Dispositifs ciblés :'}
                  </span>
                  {scenario.targetInstitutions.map((inst: string) => (
                    <span key={inst} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-medium">
                      {inst}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button (>= 44px tap target) */}
              <button
                type="button"
                onClick={() => onSelectScenario(scenario)}
                className={`mt-4 min-h-[44px] w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all focus:outline-hidden ${
                  isActive
                    ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>{language === 'ar' ? 'عرض التقرير الاستخباراتي' : 'Visualiser l’analyse Mizen'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
