import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  BarChart3, 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  Calculator, 
  Database,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FinancingProgram, Provider, Language } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { VerificationBadge } from './VerificationBadge';
import { getAuthoritativeCatalogueProviders, getAuthoritativeCatalogueProducts, getAuthoritativeCatalogueMetadata } from '../knowledge/authoritativeCatalogueProjection';
const CANONICAL_PROVIDERS = getAuthoritativeCatalogueProviders();
const CANONICAL_PRODUCTS = getAuthoritativeCatalogueProducts();
const CANONICAL_METADATA = getAuthoritativeCatalogueMetadata();
import { getOfficialSimulator } from '../knowledge/catalogueAdapter';

interface ExploreProgramsViewProps {
  programs: FinancingProgram[];
  providers: Map<string, Provider>;
  language: Language;
  onSelectProgram: (id: string) => void;
  onToggleCompare: (id: string) => void;
  comparedProgramIds: string[];
}

export const ExploreProgramsView: React.FC<ExploreProgramsViewProps> = ({
  programs,
  providers,
  language,
  onSelectProgram,
  onToggleCompare,
  comparedProgramIds
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'programs' | 'providers' | 'health'>('programs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  const categories = [
    { id: 'all', label: { fr: 'Toutes les catégories', ar: 'جميع الفئات' } },
    { id: 'sme_loan', label: { fr: 'Prêt bancaire PME', ar: 'قروض المؤسسات الصغرى والمتوسطة' } },
    { id: 'microfinance', label: { fr: 'Microcrédit', ar: 'التمويل الأصغر' } },
    { id: 'guarantee', label: { fr: 'Garantie publique', ar: 'الضمان العمومي' } },
    { id: 'grant_subsidy', label: { fr: 'Prime & Subvention', ar: 'المنح والدعم' } },
    { id: 'quasi_equity', label: { fr: 'Fonds propres & Quasi-fonds', ar: 'التمويل التشاركي وشبه الذاتي' } },
    { id: 'islamic_finance', label: { fr: 'Finance Islamique (Mourabaha)', ar: 'الصيرفة الإسلامية' } }
  ];

  const filteredPrograms = programs.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesProvider = selectedProvider === 'all' || p.providerId === selectedProvider;
    const matchesSearch = 
      p.name.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline.ar.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesProvider && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'المرجع التونسي المعتمد للتمويل المؤسساتي' : 'Référentiel Tunisien Canonique & Traçable'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              {language === 'ar' ? 'دليل آليات التمويل والمؤسسات الشريكة' : 'Annuaire officiel des dispositifs & organismes'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {language === 'ar'
                ? 'تصفح كافة البرامج الرسمية المعتمدة من البنوك وصناديق التنمية مع التدقيق المستمر في مصادر وشروط الإسناد.'
                : 'Explorez l’ensemble des instruments publics, bancaires et de leasing répertoriés avec traçabilité intégrale vers les textes officiels.'}
            </p>
          </div>

          {/* Sub-navigation tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'programs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? `الآليات (${programs.length})` : `Dispositifs (${programs.length})`}
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'providers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? `المؤسسات (${CANONICAL_PROVIDERS.length})` : `Organismes (${CANONICAL_PROVIDERS.length})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مرصد المصادر' : 'Observatoire & Sources'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Programs Catalogue */}
      {activeTab === 'programs' && (
        <>
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث بالكلمات المفاتيح (BTS, SOTUGAR, معدات، شهادة)...' : 'Rechercher par mot-clé (ex: BTS, SOTUGAR, matériel, diplômé)...'}
                  className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white text-slate-800 outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label[language]}
                  </option>
                ))}
              </select>

              {/* Provider Filter */}
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white text-slate-800 outline-hidden"
              >
                <option value="all">{language === 'ar' ? 'جميع الهياكل والمؤسسات' : 'Tous les organismes'}</option>
                {Array.from(providers.values()).map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.acronym} - {prov.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Program Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrograms.map((program) => {
              const provider = providers.get(program.providerId);
              const isCompared = comparedProgramIds.includes(program.id);
              const officialSim = getOfficialSimulator(program.id);
              const isIslamic = program.category === 'islamic_finance';

              return (
                <div
                  key={program.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                          {provider?.acronym}
                        </span>
                        {isIslamic && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            {language === 'ar' ? 'مطابق للشريعة' : 'Mourabaha'}
                          </span>
                        )}
                        {program.category === 'guarantee' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            {language === 'ar' ? 'ضمان عمومي' : 'Garantie publique'}
                          </span>
                        )}
                      </div>
                      <VerificationBadge verification={program.verification} language={language} showSourceLink={false} />
                    </div>

                    <h3
                      onClick={() => onSelectProgram(program.id)}
                      className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {program.name[language]}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {program.tagline[language]}
                    </p>

                    <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">{language === 'ar' ? 'السقف المالي :' : 'Plafond :'}</span>
                        <span className="font-bold text-slate-900">
                          {program.maxAmount > 0
                            ? `${program.minAmount.toLocaleString('fr-TN')} - ${program.maxAmount.toLocaleString('fr-TN')} TND`
                            : (language === 'ar' ? 'السقف المالي غير مثبت' : 'Plafond financier non établi')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{language === 'ar' ? 'نسبة الفائدة / الهامش :' : 'Taux / Formule :'}</span>
                        <span className="font-bold text-slate-900 truncate block">
                          {program.rateDescription[language]}
                        </span>
                      </div>
                    </div>

                    {officialSim && (
                      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                          {language === 'ar' ? 'يتوفر محاكي رقمي رسمي' : 'Simulateur officiel vérifié'}
                        </span>
                        <a
                          href={officialSim.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-700 font-semibold hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>{language === 'ar' ? 'فتح' : 'Accéder'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleCompare(program.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                        isCompared
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{isCompared ? t.removeFromCompare : t.addToCompare}</span>
                    </button>

                    <button
                      onClick={() => onSelectProgram(program.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>{t.viewDetailBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tab 2: Providers Directory */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              {language === 'ar'
                ? 'دليل المؤسسات المالية والعمومية الشريكة المسجلة في منصة ميزان، الخاضعة لرقابة البنك المركزي التونسي أو الوزارات الوصية.'
                : 'Répertoire des établissements financiers et bailleurs publics référencés sur Mizen, agréés par la Banque Centrale de Tunisie (BCT) ou les ministères de tutelle.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANONICAL_PROVIDERS.map((prov) => {
              const associatedProducts = CANONICAL_PRODUCTS.filter(p => p.providerId === prov.id);
              const desc = prov.description ? (prov.description[language] || prov.description.fr) : '';

              return (
                <div key={prov.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                      {prov.acronym}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                      {prov.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {prov.name}
                    </h3>
                    {desc && (
                      <p className="text-xs text-slate-500 mt-1">
                        {desc}
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'ar' ? 'الآليات المدرجة :' : 'Dispositifs référencés :'}</span>
                      <span className="font-bold text-slate-900">{associatedProducts.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'ar' ? 'المصادر الموثقة :' : 'Sources & textes :'}</span>
                      <span className="font-bold text-slate-900">{prov.sources.length}</span>
                    </div>
                  </div>

                  {prov.website && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={prov.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                      >
                        <span>{language === 'ar' ? 'الموقع الرسمي' : 'Portail institutionnel'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Health & Sources Observatory */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Metadata KPI summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-bold text-blue-700">{CANONICAL_METADATA.productCount}</span>
              <span className="text-xs text-slate-500">{language === 'ar' ? 'منتج مالي موثق' : 'Produits Canoniques'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-bold text-emerald-700">{CANONICAL_METADATA.providerCount}</span>
              <span className="text-xs text-slate-500">{language === 'ar' ? 'هيكل تمويل معتمد' : 'Organismes Agréés'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-bold text-purple-700">{CANONICAL_METADATA.sourceCount}</span>
              <span className="text-xs text-slate-500">{language === 'ar' ? 'مصادر رسمية مفهرسة' : 'Sources Officielles'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-2xl font-bold text-slate-800">100%</span>
              <span className="text-xs text-slate-500">{language === 'ar' ? 'تغطية بالمصادر' : 'Traçabilité Source'}</span>
            </div>
          </div>

          {/* Official Simulators Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'دليل المحاكيات الرقمية الرسمية للبنوك التونسية' : 'Répertoire des simulateurs bancaires officiels vérifiés'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'روابط مباشرة لمحاكيات البنوك ومؤسسات الإيجار المالي المعتمدة للتحقق من جداول الاستهلاك الفعلية.'
                : 'Accès direct aux simulateurs officiels d’amortissement et de barème financier des banques et bailleurs.'}
            </p>

            <div className="divide-y divide-slate-100">
              {CANONICAL_PRODUCTS.filter(p => p.simulator).map(prod => (
                <div key={prod.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{prod.name[language]}</span>
                    <span className="block text-xs text-slate-500">
                      {prod.simulator?.simulatorType} — ID: {prod.simulator?.providerId}
                    </span>
                  </div>
                  <a
                    href={prod.simulator?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold self-start sm:self-auto transition-colors"
                  >
                    <span>{language === 'ar' ? 'فتح المحاكي' : 'Ouvrir le simulateur'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory & Institutional Sources Provenance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'السندات القانونية والمناشير المرجعية' : 'Textes juridiques, décrets & circulaires de référence'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'التشريعات والمناشير البنكية المسندة لكافة آليات الدعم والتمويل العمومي في الجمهورية التونسية.'
                : 'Textes fondateurs (JORT, Circulaires BCT, Décrets d’application) régissant les mécanismes répertoriés.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-900">FOPROLOS (Logement Social & Économique)</span>
                <p className="text-slate-600 text-[11px]">Loi n° 77-54 et Décret n° 2017-380 fixant les conditions d'octroi des crédits d'acquisition et construction.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-900">Premier Logement (BH Bank & Banques Agréées)</span>
                <p className="text-slate-600 text-[11px]">Décret gouvernemental n° 2017-161 et convention État-BCT pour la prise en charge de l'autofinancement.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-900">Startup Act (Bourse de Vie & Label)</span>
                <p className="text-slate-600 text-[11px]">Loi n° 2018-20 relative aux Startups et Décret n° 2018-840 fixant les conditions d'éligibilité au Label.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-900">SOTUGAR (Garanties sectorielles & PME)</span>
                <p className="text-slate-600 text-[11px]">Conventions-cadres de garantie des crédits d'investissement et d'exploitation pour PME en phase de création ou développement.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
