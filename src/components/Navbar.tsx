import React from 'react';
import { Scale, Compass, CheckSquare, FileText, BarChart3, Home, Sparkles } from 'lucide-react';
import { Language } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  currentTab: 'home' | 'questionnaire' | 'results' | 'explore' | 'compare' | 'dossier' | 'docscan';
  setCurrentTab: (tab: 'home' | 'questionnaire' | 'results' | 'explore' | 'compare' | 'dossier' | 'docscan') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  compareCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  compareCount
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs overflow-x-clip">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Top Header Row (Logo, Desktop Nav & Actions) */}
        <div className="flex items-center justify-between min-h-[52px] sm:h-16 py-1.5 sm:py-0 gap-1.5 sm:gap-4">
          {/* Logo & Brand (min 44px touch target) */}
          <button
            id="brand-logo-btn"
            type="button"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-h-[44px] min-w-[44px] text-left rtl:text-right focus:outline-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-blue-600 shrink-0"
            aria-label="Mizen Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-amber-400 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 font-display leading-none">Mizen</span>
                <span className="text-xs sm:text-sm font-bold text-amber-700 font-['Cairo'] leading-none">ميزان</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-600 hidden md:inline-block leading-tight line-clamp-1 mt-0.5">
                {t.appTagline}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (md+ screens) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            <button
              id="nav-tab-home"
              type="button"
              onClick={() => setCurrentTab('home')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              {t.navHome}
            </button>

            <button
              id="nav-tab-explore"
              type="button"
              onClick={() => setCurrentTab('explore')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'explore'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-slate-500" />
              {t.navExplore}
            </button>

            <button
              id="nav-tab-compare"
              type="button"
              onClick={() => setCurrentTab('compare')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                currentTab === 'compare'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              {t.navCompare}
              {compareCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-600 text-white font-bold">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-dossier"
              type="button"
              onClick={() => setCurrentTab('dossier')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'dossier'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              {t.navDossier}
            </button>

            <button
              id="nav-tab-docscan"
              type="button"
              onClick={() => setCurrentTab('docscan')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'docscan'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              {t.navDocScan}
            </button>
          </nav>

          {/* Right Actions: Language Switcher & Diagnostic CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher with min 44x44px touch targets */}
            <div
              className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50/90 shadow-2xs shrink-0"
              role="group"
              aria-label="Langue / Language"
            >
              <button
                id="btn-lang-fr"
                type="button"
                onClick={() => setLanguage('fr')}
                className={`min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  language === 'fr'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                aria-pressed={language === 'fr'}
              >
                FR
              </button>
              <button
                id="btn-lang-ar"
                type="button"
                onClick={() => setLanguage('ar')}
                className={`min-h-[44px] min-w-[44px] px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center font-['Cairo'] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  language === 'ar'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                aria-pressed={language === 'ar'}
              >
                عربي
              </button>
            </div>

            {/* Quick Diagnostic CTA */}
            <button
              id="header-cta-start"
              type="button"
              onClick={() => setCurrentTab('questionnaire')}
              className="min-h-[44px] px-2.5 sm:px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow flex items-center justify-center gap-1.5 shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">
                {language === 'ar' ? 'تشخيص التمويل' : 'Faire le diagnostic'}
              </span>
              <span className="sm:hidden text-xs">
                {language === 'ar' ? 'تشخيص' : 'Diagnostic'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile-Friendly Tab Switcher Row (min 44px touch targets, no horizontal overflow, smooth scroll) */}
        <nav
          className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1.5 scrollbar-none w-full touch-pan-x"
          aria-label="Navigation mobile"
        >
          <button
            id="mobile-nav-tab-home"
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-all focus:outline-hidden active:scale-95 ${
              currentTab === 'home'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-700 bg-slate-50 border border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.navHome}</span>
          </button>

          <button
            id="mobile-nav-tab-explore"
            type="button"
            onClick={() => setCurrentTab('explore')}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-all focus:outline-hidden active:scale-95 ${
              currentTab === 'explore'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-700 bg-slate-50 border border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.navExplore}</span>
          </button>

          <button
            id="mobile-nav-tab-compare"
            type="button"
            onClick={() => setCurrentTab('compare')}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-all focus:outline-hidden active:scale-95 ${
              currentTab === 'compare'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-700 bg-slate-50 border border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.navCompare}</span>
            {compareCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentTab === 'compare' ? 'bg-amber-400 text-slate-900' : 'bg-blue-600 text-white'
              }`}>
                {compareCount}
              </span>
            )}
          </button>

          <button
            id="mobile-nav-tab-dossier"
            type="button"
            onClick={() => setCurrentTab('dossier')}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-all focus:outline-hidden active:scale-95 ${
              currentTab === 'dossier'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-700 bg-slate-50 border border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{t.navDossier}</span>
          </button>

          <button
            id="mobile-nav-tab-docscan"
            type="button"
            onClick={() => setCurrentTab('docscan')}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-all focus:outline-hidden active:scale-95 ${
              currentTab === 'docscan'
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-700 bg-slate-50 border border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.navDocScan}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
