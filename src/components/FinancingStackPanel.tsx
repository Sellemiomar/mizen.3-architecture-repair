import React from 'react';
import { ShieldCheck, AlertTriangle, WalletCards } from 'lucide-react';
import { FinancingStackResult, StackFundingRole } from '../types/financingStack';
import { Language } from '../types/financing';

interface FinancingStackPanelProps {
  result: FinancingStackResult;
  language: Language;
}

function roleLabel(role: StackFundingRole, isArabic: boolean): string {
  const labels: Record<StackFundingRole, { fr: string; ar: string }> = {
    DEBT: { fr: 'Dette / crédit', ar: 'دين / قرض' },
    EQUITY: { fr: 'Fonds propres', ar: 'رأس مال' },
    QUASI_EQUITY: { fr: 'Quasi-fonds propres', ar: 'شبه رأس مال' },
    GRANT: { fr: 'Subvention / prime', ar: 'منحة / دعم' },
    GUARANTEE: { fr: 'Garantie', ar: 'ضمان' },
    PROMOTER_CONTRIBUTION: { fr: 'Apport du promoteur', ar: 'مساهمة صاحب المشروع' },
    SUBSIDY: { fr: 'Subvention', ar: 'دعم' }
  };
  return isArabic ? labels[role].ar : labels[role].fr;
}

export const FinancingStackPanel: React.FC<FinancingStackPanelProps> = ({ result, language }) => {
  const candidate = result.candidates[0];
  if (!candidate) return null;

  const isArabic = language === 'ar';
  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <WalletCards className="w-4 h-4 text-blue-700" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">{isArabic ? 'تركيبة التمويل' : 'Structure de financement'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isArabic ? 'مزيج تمويل قابل للدفاع عنه' : 'Combinaison de financement défendable'}</h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${candidate.overallStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              {candidate.overallStatus === 'VERIFIED' ? (isArabic ? 'موثق' : 'Vérifié') : (isArabic ? 'مشروط' : 'Conditionnel')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 sm:p-6 bg-slate-50">
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5">
            <span className="text-[11px] text-slate-500 block">{isArabic ? 'التمويل المطلوب' : 'Besoin total'}</span>
            <strong className="text-base text-slate-900">{result.requiredFunding.toLocaleString('fr-FR')} DT</strong>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5">
            <span className="text-[11px] text-slate-500 block">{isArabic ? 'تمويل نقدي مغطى' : 'Couverture cash'}</span>
            <strong className="text-base text-blue-800">{candidate.fundingGap.cashCovered.toLocaleString('fr-FR')} DT</strong>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5">
            <span className="text-[11px] text-slate-500 block">{isArabic ? 'الفجوة المتبقية' : 'Besoin restant'}</span>
            <strong className="text-base text-amber-800">{candidate.fundingGap.remainingGap.toLocaleString('fr-FR')} DT</strong>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          {candidate.components.map(component => (
            <div key={component.sourceId} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200">
              <div className="min-w-0">
                <strong className="text-xs sm:text-sm text-slate-900 block truncate">{component.label ? (isArabic ? component.label.ar : component.label.fr) : roleLabel(component.role, isArabic)}</strong>
                <span className="text-[11px] text-slate-500">{roleLabel(component.role, isArabic)}{component.role === 'GUARANTEE' ? (isArabic ? ' — دعم للمخاطر، وليس تمويلاً نقدياً' : ' — soutien au risque, pas du cash') : ''}</span>
              </div>
              {component.role === 'GUARANTEE' ? (
                <span className="shrink-0 text-xs font-bold text-slate-600">{component.supportCoverage !== undefined ? `${component.supportCoverage}%` : '—'}</span>
              ) : (
                <span className="shrink-0 text-xs font-bold text-slate-900">{component.cashAmount?.toLocaleString('fr-FR') ?? '—'} DT</span>
              )}
            </div>
          ))}

          {candidate.fundingGap.unresolvedCashSources.length > 0 && (
            <div className="flex gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
              <div>
                <strong>{isArabic ? 'قدرة تمويل غير محسومة' : 'Capacité de financement non résolue'}</strong>
                <p className="mt-1 leading-relaxed">{isArabic ? 'لا يتم اعتبار هذه القيمة تمويلاً نقدياً حتى تتوفر أدلة صريحة على السقف.' : 'Aucune valeur numérique n’est comptée tant qu’une capacité vérifiée n’est pas explicitement établie.'}</p>
              </div>
            </div>
          )}

          {candidate.unresolvedAssumptions.length > 0 && (
            <div className="flex gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
              <div>
                <strong>{isArabic ? 'نقاط تتطلب التأكيد' : 'Points à confirmer'}</strong>
                <ul className="mt-1 space-y-1 list-disc pl-4">{candidate.unresolvedAssumptions.map((item, index) => <li key={index}>{item}</li>)}</ul>
              </div>
            </div>
          )}

          {candidate.overallStatus === 'VERIFIED' && candidate.fundingGap.remainingGap === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              {isArabic ? 'التغطية النقدية مكتملة وفق المعطيات والأدلة الحالية.' : 'La couverture cash est complète selon les données et preuves actuelles.'}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 leading-relaxed">{isArabic ? 'هذه ليست موافقة ائتمانية. الضمانات لا تُحتسب كتمويل نقدي، وأي نقطة غير موثقة تبقى مشروطة.' : 'Ce résultat ne constitue pas une approbation de crédit. Les garanties ne sont pas comptées comme financement cash et les éléments non vérifiés restent conditionnels.'}</p>
          )}
        </div>
      </div>
    </section>
  );
};