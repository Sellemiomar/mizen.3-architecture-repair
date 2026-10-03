import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QuestionnaireFlow } from './components/QuestionnaireFlow';
import { ResultsView } from './components/ResultsView';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { ComparisonView } from './components/ComparisonView';
import { DossierReadinessView } from './components/DossierReadinessView';
import { DocumentVerificationView } from './components/DocumentVerificationView';
import { ExploreProgramsView } from './components/ExploreProgramsView';
import { Footer } from './components/Footer';

import { ApplicantProfile, FinancingProgram, Language, FinancingPurpose, FinancingJourney, DemoScenario } from './types/financing';
import { PROVIDERS } from './data/financingData';
import { getAuthoritativeFinancingPrograms } from './knowledge/authoritativeProjection';
import { runMatchingEngine } from './engine/matchingEngine';
import { cleanProfileForJourney } from './engine/journeyEngine';

const FINANCING_PROGRAMS = getAuthoritativeFinancingPrograms();

const EMPTY_PROFILE: ApplicantProfile = {
  totalProjectCost: undefined,
  userContribution: undefined,
  financingRequested: undefined,
  purpose: undefined,
  sector: undefined,
  location: undefined,
  businessStage: undefined,
  legalStructure: undefined,
  hasHigherEducationDegree: undefined,
  hasStartupActLabel: undefined,
  isRegionalDevelopmentZone: false,
  structurePreference: 'any',
  collateralPreference: undefined
};

export default function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const [currentTab, setCurrentTab] = useState<'home' | 'questionnaire' | 'results' | 'explore' | 'compare' | 'dossier' | 'docscan'>('home');
  const [profile, setProfile] = useState<ApplicantProfile>(EMPTY_PROFILE);
  
  // Programs for side-by-side comparison (starts empty, user explicitly selects)
  const [comparedProgramIds, setComparedProgramIds] = useState<string[]>([]);
  
  // Selected Program for Detailed View
  const [detailProgramId, setDetailProgramId] = useState<string | null>(null);

  // Selected Program for Dossier preparation
  const [dossierProgramId, setDossierProgramId] = useState<string>(FINANCING_PROGRAMS[0]?.id || 'bfpme_creation');

  // Notification / Feedback banner when AI pre-fills profile
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Synchronize document dir attribute with language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Run the deterministic matching engine whenever profile changes
  const matchResults = useMemo(() => {
    return runMatchingEngine(profile);
  }, [profile]);

  const resultsMap = useMemo(() => {
    return new Map(matchResults.map(r => [r.program.id, r]));
  }, [matchResults]);

  const providersMap = useMemo(() => {
    return new Map(PROVIDERS.map(p => [p.id, p]));
  }, []);

  const programsMap = useMemo(() => {
    return new Map(FINANCING_PROGRAMS.map(p => [p.id, p]));
  }, []);

  const toggleCompare = (programId: string) => {
    setComparedProgramIds(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), programId];
      }
      return [...prev, programId];
    });
  };

  const handleSelectPurposeFromHero = (purpose: FinancingPurpose) => {
    setProfile(prev => ({ ...prev, purpose }));
    setCurrentTab('questionnaire');
  };

  const handleSelectJourneyFromHero = (journey: FinancingJourney) => {
    const cleaned = cleanProfileForJourney(profile, journey);
    setProfile(cleaned);
    setCurrentTab('questionnaire');
  };

  const handleAiParsedFromHero = (extracted: Partial<ApplicantProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...extracted,
      financingRequested: extracted.financingRequested ?? prev.financingRequested,
      totalProjectCost: extracted.totalProjectCost ?? prev.totalProjectCost,
      userContribution: extracted.userContribution ?? prev.userContribution
    }));
    setBannerNotice(
      language === 'ar'
        ? 'تم استخراج وتحديث معطيات المشروع بنجاح عبر ذكاء ميزان.'
        : 'Paramètres du projet extraits et intégrés avec succès par Mizen AI.'
    );
    setCurrentTab('results');
  };

  const handleSelectDemoScenario = (scenario: DemoScenario) => {
    setProfile({
      ...scenario.profile,
      isDemoCase: true,
      demoCaseId: scenario.id,
      demoCaseTitle: scenario.title
    });
    setBannerNotice(
      language === 'ar'
        ? `تم تحميل السيناريو النموذجي: ${scenario.title.ar}`
        : `Scénario pilote chargé : ${scenario.title.fr}`
    );
    setCurrentTab('results');
  };

  const selectedProgramForDetail = detailProgramId ? programsMap.get(detailProgramId) : null;
  const selectedProviderForDetail = selectedProgramForDetail ? providersMap.get(selectedProgramForDetail.providerId) : null;
  const selectedResultForDetail = detailProgramId ? resultsMap.get(detailProgramId) : null;

  const programsToCompare = comparedProgramIds
    .map(id => programsMap.get(id))
    .filter((p): p is FinancingProgram => Boolean(p));

  return (
    <div className={`min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans ${
      language === 'ar' ? "font-['Cairo']" : "font-['Plus_Jakarta_Sans']"
    }`}>
      {/* Sticky Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        compareCount={comparedProgramIds.length}
      />

      {/* Temporary Notice Banner (e.g. AI auto-extraction confirmation) */}
      {bannerNotice && (
        <div className="bg-indigo-700 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-3">
          <span>{bannerNotice}</span>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-white/80 hover:text-white text-xs underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HeroSection
            language={language}
            onSelectPurpose={handleSelectPurposeFromHero}
            onSelectJourney={handleSelectJourneyFromHero}
            onAiParsed={handleAiParsedFromHero}
            onSelectDemoScenario={handleSelectDemoScenario}
            onExploreAll={() => setCurrentTab('explore')}
            onStartFullDiagnostic={() => setCurrentTab('questionnaire')}
          />
        )}

        {currentTab === 'questionnaire' && (
          <QuestionnaireFlow
            initialProfile={profile}
            language={language}
            onComplete={(updatedProfile) => {
              setProfile(updatedProfile);
              setCurrentTab('results');
            }}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'results' && (
          <ResultsView
            results={matchResults}
            applicantProfile={profile}
            language={language}
            onSelectProgram={(id) => setDetailProgramId(id)}
            onToggleCompare={toggleCompare}
            comparedProgramIds={comparedProgramIds}
            onOpenDossier={(id) => {
              setDossierProgramId(id);
              setCurrentTab('dossier');
            }}
            onRestartDiagnostic={() => setCurrentTab('questionnaire')}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreProgramsView
            programs={FINANCING_PROGRAMS}
            providers={providersMap}
            language={language}
            onSelectProgram={(id) => setDetailProgramId(id)}
            onToggleCompare={toggleCompare}
            comparedProgramIds={comparedProgramIds}
          />
        )}

        {currentTab === 'compare' && (
          <ComparisonView
            programs={programsToCompare}
            providers={providersMap}
            resultsMap={resultsMap}
            applicantProfile={profile}
            language={language}
            onRemoveProgram={toggleCompare}
            onOpenDetail={(id) => setDetailProgramId(id)}
            onPrepareDossier={(id) => {
              setDossierProgramId(id);
              setCurrentTab('dossier');
            }}
          />
        )}

        {currentTab === 'dossier' && (
          <DossierReadinessView
            applicantProfile={profile}
            selectedProgram={programsMap.get(dossierProgramId)}
            provider={providersMap.get(programsMap.get(dossierProgramId)?.providerId || '')}
            allPrograms={FINANCING_PROGRAMS}
            language={language}
          />
        )}

        {currentTab === 'docscan' && (
          <DocumentVerificationView
            applicantProfile={profile}
            language={language}
            onNavigateToQuestionnaire={() => setCurrentTab('questionnaire')}
          />
        )}
      </main>

      {/* Program Detailed View Modal */}
      {selectedProgramForDetail && selectedProviderForDetail && (
        <ProgramDetailModal
          program={selectedProgramForDetail}
          provider={selectedProviderForDetail}
          reasons={selectedResultForDetail?.reasons}
          applicantProfile={profile}
          language={language}
          onClose={() => setDetailProgramId(null)}
          onPrepareDossier={(id) => {
            setDossierProgramId(id);
            setCurrentTab('dossier');
          }}
        />
      )}

      {/* Institutional Traceability Footer */}
      <Footer language={language} />
    </div>
  );
}
