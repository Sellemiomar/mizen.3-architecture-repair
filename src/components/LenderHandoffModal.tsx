import React, { useState } from 'react';
import { X, Send, Building2, CheckCircle2, AlertTriangle, ShieldCheck, FileText, ArrowRight, ExternalLink, Info } from 'lucide-react';
import { FinancingProgram, Provider, MatchResult, Language, ApplicantProfile } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { VerificationBadge } from './VerificationBadge';

interface LenderHandoffModalProps {
  program: FinancingProgram;
  provider: Provider;
  result: MatchResult;
  applicantProfile: ApplicantProfile;
  language: Language;
  onClose: () => void;
}

export const LenderHandoffModal: React.FC<LenderHandoffModalProps> = ({
  program,
  provider,
  result,
  applicantProfile,
  language,
  onClose
}) => {
  const t = TRANSLATIONS[language];
  const [isSimulatedSubmitted, setIsSimulatedSubmitted] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatedSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                {provider.acronym}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-200 text-xs font-semibold">
                {language === 'ar' ? 'نموذج الإحالة للبنك (محاكاة تجريبية)' : 'Transmission Prêteur (Simulation Pilote)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              {program.name[language]}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Institutional Pilot Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">
                {language === 'ar' ? 'تنبيه الشفافية للمرحلة التجريبية :' : 'Rappel sur la transmission pilote :'}
              </strong>
              <p className="leading-relaxed">
                {language === 'ar'
                  ? 'هذا الإجراء يمثل محاكاة نموذجية لتجهيز الملف قبل إحالته للمؤسسة المالية. في المرحلة الحالية، لا يتم إرسال أي بيانات شخصية حقيقية لأي طرف خارجي. القرار الائتماني والتقييم النهائي يظلان من اختصاص لجان التمويل لدى المؤسسة المقرضة حصراً.'
                  : 'Ce flux illustre la transmission d’un dossier préliminaire pré-qualifié vers l’établissement partenaire. Dans le cadre de ce pilote, aucune donnée réelle n’est transmise à des tiers. La décision finale d’octroi et l’instruction prudentielle appartiennent exclusivement à l’organisme de crédit.'}
              </p>
            </div>
          </div>

          {isSimulatedSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {language === 'ar' ? 'تم تجهيز ملخص الملف بنجاح (محاكاة)' : 'Dossier préliminaire synthétisé avec succès'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {language === 'ar'
                  ? `تم استخراج بطاقة الملاءمة الفنية الخاصة بـ ${provider.acronym}. يمكن للعميل أو المستشار طباعة هذا الملخص الموثق لاستخدامه خلال المقابلة البنكية.`
                  : `La fiche de synthèse d’adéquation technique pour ${provider.name} est prête. Ce récapitulatif permettra au porteur de projet d’aborder son entretien bancaire avec tous les critères clarifiés.`}
              </p>

              {/* Summary Card for Banker */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left rtl:text-right text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-semibold text-slate-900">
                  <span>Réf. Dossier : MZN-DEMO-{Math.floor(1000 + Math.random() * 9000)}</span>
                  <span>{provider.acronym}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Montant projet :</strong> {applicantProfile.totalProjectCost?.toLocaleString('fr-FR') || 'Non précisé'} DT</div>
                  <div><strong>Financement demandé :</strong> {applicantProfile.financingRequested?.toLocaleString('fr-FR') || 'Non précisé'} DT</div>
                  <div><strong>Apport personnel :</strong> {applicantProfile.userContribution?.toLocaleString('fr-FR') || 'Non précisé'} DT</div>
                  <div><strong>Gouvernorat :</strong> {applicantProfile.location || 'Non précisé'}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                {language === 'ar' ? 'إغلاق المحاكاة' : 'Fermer la simulation'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  {language === 'ar' ? 'بيانات الملف المستخلصة عبر ميزان :' : 'Éléments transmis dans la fiche préparatoire :'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">Établissement ciblé</span>
                    <strong className="font-semibold text-slate-900">{provider.name}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">Mécanisme</span>
                    <strong className="font-semibold text-slate-900">{program.name[language]}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">Besoin financier</span>
                    <strong className="font-semibold text-slate-900">
                      {applicantProfile.financingRequested?.toLocaleString('fr-FR') || '—'} DT
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">Apport personnel déclaré</span>
                    <strong className="font-semibold text-slate-900">
                      {applicantProfile.userContribution?.toLocaleString('fr-FR') || '—'} DT
                    </strong>
                  </div>
                </div>
              </div>

              {/* Notes for banker */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">
                  {language === 'ar' ? 'ملاحظات إضافية للمستشار البنكي (اختياري) :' : 'Notes ou précisions pour le conseiller bancaire (Optionnel) :'}
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: دراسة الجدوى جاهزة، تم إيداع التصريح لدى وكالة APII...'
                      : 'Ex: Le business plan est finalisé, devis fournisseurs disponibles, rendez-vous souhaité en agence régionale...'
                  }
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  id="consent-pilot"
                  type="checkbox"
                  required
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0"
                />
                <label htmlFor="consent-pilot" className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'أقر بأنني فهمت أن ميزان يقتصر على التقييم الاسترشادي وأن منح التمويل يخضع كلياً للدراسة الائتمانية للبنك.'
                    : 'Je confirme avoir compris que Mizen fournit une analyse d’orientation préalable et que la décision finale de crédit relève exclusivement du comité de l’établissement bancaire.'}
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{language === 'ar' ? 'توليد ملف الإحالة (محاكاة)' : 'Générer la transmission (Simulation)'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
