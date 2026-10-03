import { Language } from '../types/financing';

export interface Translations {
  appName: string;
  appTagline: string;
  navHome: string;
  navExplore: string;
  navCompare: string;
  navDossier: string;
  navDocScan: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroStartBtn: string;
  heroExploreBtn: string;
  heroAiIntakeTitle: string;
  heroAiIntakePlaceholder: string;
  heroAiIntakeSubmit: string;
  heroAiIntakeHint: string;

  // Demo Scenarios
  demoScenariosTitle: string;
  demoScenariosSub: string;
  demoBadge: string;
  loadDemoScenario: string;
  activeDemoNotice: string;
  clearDemoBtn: string;

  // Trust labels
  trustUserProvided: string;
  trustVerifiedFact: string;
  trustCalculated: string;
  trustAiInterpretation: string;

  // Questionnaire
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Labels
  totalCostLabel: string;
  userContributionLabel: string;
  financingRequestedLabel: string;
  purposeLabel: string;
  sectorLabel: string;
  locationLabel: string;
  stageLabel: string;
  legalFormLabel: string;
  incomeLabel: string;
  employmentLabel: string;
  propertyTypeLabel: string;
  firstHomeLabel: string;
  degreeLabel: string;
  degreeHelp: string;
  startupLabel: string;
  startupHelp: string;
  zdrLabel: string;
  zdrHelp: string;
  shariaLabel: string;
  collateralLabel: string;

  // Results & Intelligence Report
  resultsTitle: string;
  resultsSub: string;
  executiveSummaryTitle: string;
  executiveSummaryLead: string;
  whyThisResultTitle: string;
  matchedBecauseTitle: string;
  potentialIssuesTitle: string;
  needsVerificationTitle: string;
  whatIsMissingTitle: string;
  whatMizenDoesNotDetermineTitle: string;
  whatMizenDoesNotDetermineText: string;
  alignmentStrong: string;
  alignmentPartial: string;
  alignmentBlockers: string;
  viewDetailBtn: string;
  compareBtn: string;
  addToCompare: string;
  removeFromCompare: string;
  prepareDossierBtn: string;
  officialSourceBtn: string;
  lenderHandoffBtn: string;

  // Financial
  estMonthlyPayment: string;
  totalRepayment: string;
  financingCost: string;
  gracePeriod: string;
  durationLabel: string;
  cannotCalculateReliably: string;
  illustrativeEstimateNotice: string;

  // Verification badges
  verifiedBadge: string;
  partiallyVerifiedBadge: string;
  outdatedBadge: string;
  unverifiedBadge: string;
  lastCheckedLabel: string;

  // Compare & Readiness
  compareTitle: string;
  compareEmpty: string;
  readinessTitle: string;
  readinessSub: string;
  readinessScoreLabel: string;
  docChecklistTitle: string;
  interviewQuestionsTitle: string;
  officialPortal: string;
  disclaimerText: string;
  persistentDisclaimer: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  fr: {
    appName: 'Mizen',
    appTagline: 'Intelligence de financement pour la Tunisie',
    navHome: 'Accueil',
    navExplore: 'Tous les financements',
    navCompare: 'Comparateur',
    navDossier: 'Mon Dossier',
    navDocScan: 'Vérification Documentaire',
    heroHeadline: 'Comprenez vos options de financement avant d’entamer l’instruction bancaire.',
    heroSubheadline: 'BFPME, BTS Bank, BH Bank, SOTUGAR, FOPRODI, Microfinance, Startup Act. Mizen analyse l’adéquation de votre situation avec les critères publics officiels et met en évidence ce qui reste à vérifier.',
    heroStartBtn: 'Faire le diagnostic',
    heroExploreBtn: 'Consulter l’annuaire officiel',
    heroAiIntakeTitle: 'Ou décrivez votre besoin en langage naturel :',
    heroAiIntakePlaceholder: 'Ex: Je veux créer une unité industrielle à Zaghouan. Le projet coûte 300 000 DT, j’ai 60 000 DT d’apport et je cherche 240 000 DT...',
    heroAiIntakeSubmit: 'Analyser avec Mizen AI',
    heroAiIntakeHint: 'Mizen sépare rigoureusement le coût total, votre apport et le montant demandé sans inventer de données.',

    demoScenariosTitle: 'Cas de démonstration pilotes (Données synthétiques)',
    demoScenariosSub: 'Sélectionnez un scénario réaliste pour visualiser instantanément le rapport d’intelligence Mizen :',
    demoBadge: 'Cas Démo Synthétique',
    loadDemoScenario: 'Charger ce cas démo',
    activeDemoNotice: 'Vous visualisez actuellement un cas de démonstration synthétique. Les données sont purement illustratives et n’impliquent aucun accord préalable d’une banque.',
    clearDemoBtn: 'Réinitialiser / Nouveau diagnostic',

    trustUserProvided: 'Déclaré par l’utilisateur',
    trustVerifiedFact: 'Fait vérifié — Source officielle',
    trustCalculated: 'Estimation calculée (Formule vérifiée)',
    trustAiInterpretation: 'Extraction assistée par IA',

    step1Title: 'Projet & Besoin financier',
    step1Desc: 'Distinguez le coût global, votre apport personnel et le montant du financement sollicité.',
    step2Title: 'Activité, Revenu & Localisation',
    step2Desc: 'Le secteur, la tranche de revenu et le gouvernorat déterminent l’éligibilité aux dispositifs et bonifications.',
    step3Title: 'Stade d’avancement & Forme juridique',
    step3Desc: 'Les conditions diffèrent entre création, nouveau promoteur, PME établie et projet résidentiel.',
    step4Title: 'Critères qualifiants & Préférences',
    step4Desc: 'Diplôme de l’enseignement supérieur, labellisation Startup Act ou préférence éthique.',

    totalCostLabel: 'Coût global du projet ou du bien (TND)',
    userContributionLabel: 'Votre apport personnel déclaré (TND)',
    financingRequestedLabel: 'Financement bancaire / aide sollicité (TND)',
    purposeLabel: 'Objet du financement',
    sectorLabel: 'Secteur d’activité',
    locationLabel: 'Gouvernorat d’implantation / bien',
    stageLabel: 'Stade de l’entreprise / avancement',
    legalFormLabel: 'Forme juridique (ou envisagée)',
    incomeLabel: 'Tranche de revenu net mensuel du foyer',
    employmentLabel: 'Statut professionnel / Situation',
    propertyTypeLabel: 'Type de bien immobilier (Habitat)',
    firstHomeLabel: 'Premier achat immobilier (Primo-accédant non propriétaire)',
    degreeLabel: 'Titulaire d’un diplôme d’enseignement supérieur',
    degreeHelp: 'Ouvre les plafonds BTS jusqu’à 150 000 DT et bonifications ANETI.',
    startupLabel: 'Labellisé Startup Act (ou projet hautement innovant)',
    startupHelp: 'Éligibilité aux bourses de subsistance et fonds ANAVA.',
    zdrLabel: 'Implantation en Zone de Développement Régional (ZDR)',
    zdrHelp: 'Garantie SOTUGAR majorée à 75% et dotations / primes FOPRODI en région.',
    shariaLabel: 'Préférence pour la finance islamique (Mourabaha sans intérêts)',
    collateralLabel: 'Disponibilité de garanties réelles / hypothèques',

    resultsTitle: 'Rapport d’Intelligence Financière',
    resultsSub: 'Analyse transparente d’adéquation technique basée sur les critères publics officiels déclarés.',
    executiveSummaryTitle: 'Synthèse Exécutive Mizen',
    executiveSummaryLead: 'Sur la base des informations déclarées, Mizen a identifié les mécanismes de financement potentiellement pertinents suivants :',
    whyThisResultTitle: 'Pourquoi ce résultat ? (Grille de transparence)',
    matchedBecauseTitle: 'Critères déclarés en adéquation :',
    potentialIssuesTitle: 'Points d’attention ou écarts identifiés :',
    needsVerificationTitle: 'Éléments devant être confirmés avec le chargé d’affaires :',
    whatIsMissingTitle: 'Ce qui manque pour formaliser le dossier :',
    whatMizenDoesNotDetermineTitle: 'Ce que Mizen ne détermine PAS (Limites de l’outil)',
    whatMizenDoesNotDetermineText: 'Mizen est un outil d’orientation et d’aide à la décision. Il ne détermine pas l’octroi du crédit, l’accord d’éligibilité finale, la solvabilité sous les règles prudentielles du prêteur, la décision du comité d’engagement, la tarification définitive ou l’émission formelle d’une garantie.',
    alignmentStrong: 'Forte adéquation avec les critères publics',
    alignmentPartial: 'Adéquation partielle — points à valider',
    alignmentBlockers: 'Critères potentiellement bloquants',
    viewDetailBtn: 'Détails & Provenance',
    compareBtn: 'Comparer',
    addToCompare: 'Ajouter au comparateur',
    removeFromCompare: 'Retirer',
    prepareDossierBtn: 'Préparer mon dossier',
    officialSourceBtn: 'Consulter la source officielle',
    lenderHandoffBtn: 'Transmettre au prêteur (Simulation Pilote)',

    estMonthlyPayment: 'Échéance mensuelle indicative',
    totalRepayment: 'Remboursement total estimé',
    financingCost: 'Coût brut du crédit',
    gracePeriod: 'Période de grâce (différé)',
    durationLabel: 'Durée de remboursement',
    cannotCalculateReliably: 'Simulation chiffrée indisponible : le taux ou la marge commerciale doivent être arrêtés avec votre agence.',
    illustrativeEstimateNotice: 'Estimation purement illustrative basée sur les hypothèses réglementaires vérifiées. Ne constitue en aucun cas une offre commerciale ou un engagement contractuel d’un établissement de crédit.',

    verifiedBadge: 'Vérifié officiel',
    partiallyVerifiedBadge: 'Partiellement vérifié',
    outdatedBadge: 'À actualiser avant dépôt',
    unverifiedBadge: 'À confirmer en agence',
    lastCheckedLabel: 'Dernier audit de conformité',

    compareTitle: 'Comparateur de Dispositifs',
    compareEmpty: 'Sélectionnez au moins 2 mécanismes de financement pour comparer les conditions, garanties et traçabilité.',
    readinessTitle: 'Préparation du Dossier & Checklist Bancaire',
    readinessSub: 'Distinguez les informations actuellement renseignées des justificatifs et pièces que le prêteur exigera lors de l’instruction.',
    readinessScoreLabel: 'Niveau d’exhaustivité préliminaire',
    docChecklistTitle: 'Pièces requises selon les fiches officielles',
    interviewQuestionsTitle: 'Questions clés à poser à votre chargé d’affaires',
    officialPortal: 'Portail officiel de l’institution',
    disclaimerText: 'Mizen évalue l’adéquation technique avec les critères publics déclarés et ne constitue pas un accord de crédit, une promesse de financement ou une décision de comité.',
    persistentDisclaimer: 'Mizen fournit une analyse d’intelligence financière à titre informatif sur la base des critères et sources publics disponibles. Il n’approuve aucun financement, ne garantit aucune éligibilité et ne remplace pas l’instruction prudentielle des établissements bancaires et prêteurs.'
  },
  ar: {
    appName: 'ميزان',
    appTagline: 'استخبارات التمويل في تونس',
    navHome: 'الرئيسية',
    navExplore: 'جميع آليات التمويل',
    navCompare: 'المقارنة',
    navDossier: 'ملفي',
    navDocScan: 'فحص الوثائق',
    heroHeadline: 'افهم خيارات التمويل المتاحة لمشروعك قبل دخول مرحلة الدراسة البنكية.',
    heroSubheadline: 'بنك تمويل PME، بنك التضامن، بنك الإسكان، سوتوغار، فبرودي، التمويل الأصغر، ستارت آب آكت. يحلل ميزان مدى ملاءمة وضعيتكم مع المعايير الرسمية ويوضح ما يتطلب التأكيد.',
    heroStartBtn: 'بدء التشخيص المالي',
    heroExploreBtn: 'تصفح الدليل الرسمي',
    heroAiIntakeTitle: 'أو صِف مشروعك باللغة الطبيعية :',
    heroAiIntakePlaceholder: 'مثال: أريد إحداث وحدة صناعية بزغوان. كلفة المشروع 300 ألف دينار، التمويل الذاتي 60 ألف د وأطلب 240 ألف د تمويل...',
    heroAiIntakeSubmit: 'تحليل عبر ذكاء ميزان',
    heroAiIntakeHint: 'يفصل ميزان بدقة بين الكلفة الإجمالية والتمويل الذاتي والمبلغ المطلوب دون اختلاق أي معطيات.',

    demoScenariosTitle: 'حالات تجريبية نموذجية للشركاء والبنوك (معطيات اصطناعية)',
    demoScenariosSub: 'اختر حالة واقعية للاطلاع الفوري على تقرير استخبارات التمويل لميزان :',
    demoBadge: 'حالة تجريبية نموذجية',
    loadDemoScenario: 'تحميل هذه الحالة التجريبية',
    activeDemoNotice: 'أنتم تتصفحون حالياً معطيات حالة تجريبية نموذجية. البيانات لأغراض العرض والتوضيح ولا تعني أي موافقة مسبقة من أي بنك.',
    clearDemoBtn: 'إعادة ضبط / تشخيص جديد',

    trustUserProvided: 'معلومة مصرّح بها من الباعث',
    trustVerifiedFact: 'معطى موثّق — مصدر رسمي',
    trustCalculated: 'تقدير مالي محسوب وفق صيغة موثقة',
    trustAiInterpretation: 'استخراج ذكي للمعطيات',

    step1Title: 'المشروع والاحتياج المالي',
    step1Desc: 'الفصل الصارم بين كلفة المشروع، تمويلك الذاتي، ومبلغ التمويل المطلوب.',
    step2Title: 'النشاط والدخل والموقع الجغرافي',
    step2Desc: 'القطاع وشريحة الدخل والولاية تحدد الأهلية والحوافز الجهوية.',
    step3Title: 'مرحلة التقدم والصيغة القانونية',
    step3Desc: 'الشروط تختلف بين الإحداث الجديد، الباعث الشاب، المؤسسة القائمة، والمشاريع السكنية.',
    step4Title: 'الشروط التفاضلية الخاصة والأولويات',
    step4Desc: 'شهادة التعليم العالي، علامة ستارت آب آكت، أو المعاملات المتوافقة مع الشريعة.',

    totalCostLabel: 'الكلفة الجملية للمشروع أو العقار (د.ت)',
    userContributionLabel: 'تمويلك الذاتي / المساهمة الشخصية (د.ت)',
    financingRequestedLabel: 'مبلغ التمويل البنكي المطلوب (د.ت)',
    purposeLabel: 'موضوع التمويل',
    sectorLabel: 'قطاع النشاط',
    locationLabel: 'ولاية الانتصاب / العقار',
    stageLabel: 'مرحلة تقدم المشروع',
    legalFormLabel: 'الصيغة القانونية (الحالية أو المستهدفة)',
    incomeLabel: 'شريحة الدخل الشهري الصافي للأسرة',
    employmentLabel: 'الوضعية المهنية للمترشح',
    propertyTypeLabel: 'نوع العقار المستهدف (التمويل السكني)',
    firstHomeLabel: 'اقتناء مسكن لأول مرة (غير مالك لمسكن سابق)',
    degreeLabel: 'حامل لشهادة من التعليم العالي',
    degreeHelp: 'تفتح سقف قروض بنك التضامن حتى 150 ألف دينار ومرافقة مكاتب التشغيل.',
    startupLabel: 'متحصل على علامة مؤسسة ناشئة (Startup Act)',
    startupHelp: 'التمتع بمنحة شهرية وتدخل صناديق الاستثمار التكنولوجية.',
    zdrLabel: 'الانتصاب بمنطقة تشجيع التنمية الجهوية (ZDR)',
    zdrHelp: 'رفع نسبة ضمان سوتوغار إلى 75% والتمتع بمنح صندوق فبرودي.',
    shariaLabel: 'أفضلية التمويل الإسلامي (صيغة المرابحة)',
    collateralLabel: 'توفر رهون وضمانات عينية',

    resultsTitle: 'تقرير استخبارات التمويل',
    resultsSub: 'تحليل دقيق وشفاف للأهلية الفنية استناداً إلى المعايير العامة المنشورة رسمياً.',
    executiveSummaryTitle: 'الملخص التنفيذي لميزان',
    executiveSummaryLead: 'بناءً على المعطيات المصرح بها، حدد ميزان آليات التمويل التالية التي قد تتلاءم مع وضعيتكم :',
    whyThisResultTitle: 'لماذا هذه النتيجة ؟ (شبكة الشفافية والتعليل)',
    matchedBecauseTitle: 'المعايير المتطابقة مع ملفكم :',
    potentialIssuesTitle: 'نقاط الانتباه أو الفوارق الفنية المحددة :',
    needsVerificationTitle: 'معطيات تستوجب التأكيد المباشر مع مسؤول التمويل بالفرع :',
    whatIsMissingTitle: 'المعطيات الناقصة لاستكمال الملف :',
    whatMizenDoesNotDetermineTitle: 'ما لا يحدده ميزان (حدود نطاق المنصة)',
    whatMizenDoesNotDetermineText: 'ميزان منصة استخباراتية لمساندة القرار. لا يقرر ميزان منح القرض، أو الموافقة النهائية على الأهلية، أو الملاءة المالية وفق القواعد الاحترازية للبنك، أو قرار لجنة التمويل، أو التسعير النهائي، أو إصدار شهادة الضمان.',
    alignmentStrong: 'تطابق قوي مع المعايير العامة',
    alignmentPartial: 'تطابق جزئي — نقاط تتطلب التثبت',
    alignmentBlockers: 'معايير قد تعيق القبول الفني',
    viewDetailBtn: 'التفاصيل والتوثيق',
    compareBtn: 'مقارنة',
    addToCompare: 'إضافة للمقارنة',
    removeFromCompare: 'إلغاء',
    prepareDossierBtn: 'تجهيز ملف التمويل',
    officialSourceBtn: 'زيارة المصدر الرسمي',
    lenderHandoffBtn: 'إحالة الملف للمؤسسة المالية (محاكاة نموذجية)',

    estMonthlyPayment: 'القسط الشهري التقديري',
    totalRepayment: 'إجمالي الخلاص التقديري',
    financingCost: 'كلفة التمويل الإجمالية',
    gracePeriod: 'مدة الإمهال (فترة السماح)',
    durationLabel: 'مدة السداد',
    cannotCalculateReliably: 'المحاكاة الرقمية معلقة : يجب تأكيد النسبة أو الهامش التجاري لدى فرع البنك.',
    illustrativeEstimateNotice: 'تقدير استئناسي محض مبني على المعطيات القانونية الموثقة. لا يشكل بأي حال عرضاً بنكياً ملزماً أو التزاماً تعاقدياً من أي مؤسسة مالية.',

    verifiedBadge: 'موثّق رسمياً',
    partiallyVerifiedBadge: 'موثّق جزئياً',
    outdatedBadge: 'يستوجب التحيين قبل التقديم',
    unverifiedBadge: 'يخضع للتأكيد بالفرع',
    lastCheckedLabel: 'تاريخ آخر تدقيق رسمي',

    compareTitle: 'مقارنة آليات التمويل',
    compareEmpty: 'اختر على الأقل آليتين لمقارنة المبالغ، نسب الفائدة، والضمانات المطلوبة.',
    readinessTitle: 'جاهزية الملف والقائمة التدقيقية للبنك',
    readinessSub: 'فصل واضح بين المعطيات المتوفرة حالياً والوثائق الرسمية التي ستطلبها المؤسسة المالية أثناء دراسة الملف.',
    readinessScoreLabel: 'نسبة اكتمال الملف الأولية',
    docChecklistTitle: 'الوثائق الرسمية المطلوبة حسب الدليل',
    interviewQuestionsTitle: 'أسئلة رئيسية لموعدكم مع مسؤول الفرع',
    officialPortal: 'رابط البوابة الرسمية للمؤسسة',
    disclaimerText: 'يحلل ميزان الملاءمة الفنية مع المعايير الرسمية ولا يشكل موافقة بنكية أو ضماناً لمنح التمويل.',
    persistentDisclaimer: 'يقدم ميزان تحليلاً استخباراتياً للتمويل لأغراض إعلامية استناداً للمعايير والمصادر الرسمية المتاحة. ولا يوافق على التمويل أو يضمن الأهلية أو يعوض الدراسة الائتمانية للمؤسسات البنكية.'
  }
};
