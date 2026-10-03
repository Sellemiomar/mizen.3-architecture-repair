import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { FinancingProgram, Provider, MatchResult, Language, ApplicantProfile } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { VerificationBadge } from './VerificationBadge';
import { TrustBadge } from './TrustBadge';
import { getFieldLabel } from '../utils/verificationLabels';

interface ComparisonViewProps {
  programs: FinancingProgram[];
  providers: Map<string, Provider>;
  resultsMap: Map<string, MatchResult>;
  applicantProfile: ApplicantProfile;
  language: Language;
  onRemoveProgram: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onPrepareDossier: (id: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  programs,
  providers,
  resultsMap,
  applicantProfile,
  language,
  onRemoveProgram,
  onOpenDetail,
  onPrepareDossier
}) => {
  const t = TRANSLATIONS[language];

  if (programs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-display">
          {t.compareTitle}
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          {t.compareEmpty}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            {t.compareTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {programs.length} {language === 'ar' ? 'عروض قيد المقارنة المباشرة' : 'mécanismes en comparaison active'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge type="verified_fact" language={language} subtle />
          <TrustBadge type="calculated" language={language} subtle />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
        <table className="w-full text-left rtl:text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 w-48 font-bold text-slate-700 uppercase tracking-wider shrink-0 bg-slate-100/50">
                Critère d'analyse
              </th>
              {programs.map((program) => {
                const provider = providers.get(program.providerId);
                return (
                  <th key={program.id} className="p-4 min-w-[260px] max-w-[320px] align-top relative">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-800 text-[11px] font-bold">
                        {provider?.acronym}
                      </span>
                      <button
                        onClick={() => onRemoveProgram(program.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        title={t.removeFromCompare}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-bold text-sm text-slate-900 line-clamp-2">
                      {program.name[language]}
                    </div>
                    <div className="mt-2">
                      <VerificationBadge verification={program.verification} language={language} showSourceLink={false} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* 0. Traceability & Field Verification Breakdown */}
            <tr className="bg-slate-50/80">
              <td className="p-4 font-bold text-slate-800 bg-slate-100/70 text-xs">
                {language === 'ar' ? 'توثيق الحقول والمصدر' : 'Traçabilité & Vérification'}
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4 text-xs space-y-2">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold">{language === 'ar' ? 'المصدر :' : 'Source :'}</span> {p.verification.sourceTitle}
                  </div>
                  <div className="space-y-1.5">
                    {p.verification.verifiedFields.length > 0 && (
                      <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px]">
                        <strong className="block font-bold mb-0.5">{language === 'ar' ? 'مؤكد رسمياً :' : 'Vérifié officiel :'}</strong>
                        <div className="flex flex-wrap gap-1">
                          {p.verification.verifiedFields.map(f => (
                            <span key={f} className="px-1 rounded bg-white text-emerald-800 border border-emerald-200">
                              ✓ {getFieldLabel(f, language)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {p.verification.unverifiedFields.length > 0 && (
                      <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px]">
                        <strong className="block font-bold mb-0.5">{language === 'ar' ? 'يخضع لتأكيد الفرع :' : 'À vérifier en agence :'}</strong>
                        <div className="flex flex-wrap gap-1">
                          {p.verification.unverifiedFields.map(f => (
                            <span key={f} className="px-1 rounded bg-white text-amber-800 border border-amber-200">
                              ⚠ {getFieldLabel(f, language)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* 1. Category */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Catégorie de financement
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4 text-slate-800 font-medium">
                  {p.category.replace('_', ' ').toUpperCase()}
                </td>
              ))}
            </tr>

            {/* 2. Plafond Amount */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Plafond d'intervention
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4 text-slate-900 font-bold">
                  {p.minAmount.toLocaleString('fr-FR')} - {p.maxAmount.toLocaleString('fr-FR')} DT
                </td>
              ))}
            </tr>

            {/* 3. Rate Structure & Benchmark */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Taux d'intérêt & Origine
              </td>
              {programs.map((p) => {
                const match = resultsMap.get(p.id);
                const est = match?.costEstimate;
                return (
                  <td key={p.id} className="p-4 text-slate-800">
                    <span className="font-semibold block">{p.rateDescription[language]}</span>
                    {est?.rateOriginLabel && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {est.rateOriginLabel[language]}
                      </span>
                    )}
                    {est?.rateBenchmarkSource && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Ref: {est.rateBenchmarkSource}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 3b. Mensualité Estimée */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Mensualité indicative
              </td>
              {programs.map((p) => {
                const match = resultsMap.get(p.id);
                const est = match?.costEstimate;
                return (
                  <td key={p.id} className="p-4 text-slate-800">
                    {est?.canCalculateReliably && est?.monthlyPayment ? (
                      <div>
                        <span className="font-extrabold text-blue-900 text-sm">
                          ~{est.monthlyPayment.toLocaleString('fr-FR')} DT/mois
                        </span>
                        <div className="text-[10px] text-emerald-700 font-semibold">Taux bonifié réglementé</div>
                      </div>
                    ) : est?.monthlyPayment ? (
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          ~{est.monthlyPayment.toLocaleString('fr-FR')} DT/mois
                        </span>
                        <div className="text-[10px] text-amber-700 font-medium">Simulation indicative (marge variable)</div>
                      </div>
                    ) : (
                      <div className="text-amber-800 text-[11px] font-medium">
                        Non calculable sans offre personnalisée
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 4. Durée & Franchise */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Durée & Différé d'amortissement
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4 text-slate-800">
                  <div>Max {Math.round(p.durationMonthsMax / 12)} ans ({p.durationMonthsMax} mois)</div>
                  <div className="text-slate-500 text-[11px]">Différé : {p.gracePeriodMonthsMin} à {p.gracePeriodMonthsMax} mois</div>
                </td>
              ))}
            </tr>

            {/* 5. Apport personnel */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Apport personnel minimum
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4 text-slate-800 font-medium">
                  Min. {p.minContributionPercent}% du projet
                </td>
              ))}
            </tr>

            {/* 6. Garanties exigées */}
            <tr>
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">
                Garanties requises
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4 text-slate-700 text-[11px] leading-relaxed">
                  {p.guaranteeRequirements[language]}
                </td>
              ))}
            </tr>

            {/* 7. Correspondance (Matched Because) */}
            <tr>
              <td className="p-4 font-bold text-emerald-800 bg-emerald-50/30">
                Points de correspondance
              </td>
              {programs.map((p) => {
                const match = resultsMap.get(p.id);
                return (
                  <td key={p.id} className="p-4">
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {match?.reasons.matchedBecause.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{r[language]}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>

            {/* 8. Points de vigilance */}
            <tr>
              <td className="p-4 font-bold text-amber-800 bg-amber-50/30">
                Points d'attention / Risques
              </td>
              {programs.map((p) => {
                const match = resultsMap.get(p.id);
                return (
                  <td key={p.id} className="p-4">
                    <ul className="space-y-1 text-[11px] text-amber-900">
                      {match?.reasons.potentialIssues.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span>{r[language]}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>

            {/* 9. Points à vérifier / Données non publiées */}
            <tr>
              <td className="p-4 font-bold text-blue-800 bg-blue-50/30">
                À vérifier auprès de l'organisme
              </td>
              {programs.map((p) => {
                const match = resultsMap.get(p.id);
                return (
                  <td key={p.id} className="p-4">
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {match?.reasons.needsVerification.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{r[language]}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>

            {/* Actions row */}
            <tr className="bg-slate-50">
              <td className="p-4 font-bold text-slate-700">
                Actions
              </td>
              {programs.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onOpenDetail(p.id)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-center hover:bg-slate-800 transition-colors"
                    >
                      {t.viewDetailBtn}
                    </button>
                    <button
                      onClick={() => onPrepareDossier(p.id)}
                      className="w-full px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-center hover:bg-emerald-100 transition-colors"
                    >
                      {t.prepareDossierBtn}
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
