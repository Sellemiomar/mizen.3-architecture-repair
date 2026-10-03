import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { VerificationRecord, Language } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';
import { getFieldLabel } from '../utils/verificationLabels';

interface VerificationBadgeProps {
  verification: VerificationRecord;
  language: Language;
  showSourceLink?: boolean;
  showFieldBreakdown?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verification,
  language,
  showSourceLink = true,
  showFieldBreakdown = false
}) => {
  const t = TRANSLATIONS[language];
  const [isExpanded, setIsExpanded] = useState(false);

  const hasUnverified = verification.unverifiedFields && verification.unverifiedFields.length > 0;
  // Trust Model: A program is ONLY fully certified if unverifiedFields is empty and status is VERIFIED
  const isFullyVerified = verification.status === 'VERIFIED' && !hasUnverified;

  const getStatusConfig = () => {
    if (isFullyVerified) {
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
        label: language === 'ar' ? 'معايير معتمدة رسمياً' : 'Données certifiées par décret/circulaire',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }

    if (verification.status === 'OUTDATED') {
      return {
        icon: <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />,
        label: t.outdatedBadge,
        bg: 'bg-orange-50 text-orange-800 border-orange-200'
      };
    }

    if (hasUnverified || verification.status === 'PARTIALLY_VERIFIED') {
      const verifiedCount = verification.verifiedFields?.length || 0;
      const unverifiedCount = verification.unverifiedFields?.length || 0;
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
        label: language === 'ar'
          ? `موثق جزئياً (${verifiedCount} معتمد • ${unverifiedCount} للتأكيد)`
          : `Partiellement vérifié (${verifiedCount} certifiés • ${unverifiedCount} à vérifier)`,
        bg: 'bg-amber-50 text-amber-900 border-amber-200'
      };
    }

    return {
      icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
      label: t.unverifiedBadge,
      bg: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  };

  const config = getStatusConfig();

  return (
    <div className="inline-flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          id={`verification-badge-${verification.status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-pointer transition-colors hover:opacity-90 ${config.bg}`}
          title={language === 'ar' ? 'اضغط لعرض تفاصيل التحقق الميداني' : 'Cliquer pour afficher le détail des champs vérifiés'}
        >
          {config.icon}
          <span>{config.label}</span>
          <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <span className="text-[11px] text-slate-600">
          {t.lastCheckedLabel} : {verification.dateChecked}
        </span>

        {showSourceLink && verification.sourceUrl && (
          <a
            href={verification.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 hover:underline font-medium"
            title={verification.sourceTitle}
          >
            <span>Source officielle</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        )}
      </div>

      {/* Expandable Field Breakdown */}
      {(isExpanded || showFieldBreakdown) && (
        <div className="mt-1 p-2.5 rounded-lg border border-slate-200 bg-white shadow-xs text-xs space-y-2 text-left rtl:text-right max-w-md">
          <div className="text-[11px] text-slate-500 font-medium pb-1 border-b border-slate-100 flex items-center justify-between">
            <span>{verification.sourceTitle}</span>
            <span className="font-semibold text-slate-600">{verification.dateChecked}</span>
          </div>

          {/* Verified Fields */}
          {verification.verifiedFields && verification.verifiedFields.length > 0 && (
            <div>
              <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px] mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{language === 'ar' ? 'المعايير المعتمدة رسمياً :' : 'Vérifié par la source officielle :'}</span>
              </span>
              <div className="flex flex-wrap gap-1 pl-4 rtl:pr-4">
                {verification.verifiedFields.map((f, i) => (
                  <span key={i} className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-medium">
                    ✓ {getFieldLabel(f, language)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unverified Fields */}
          {verification.unverifiedFields && verification.unverifiedFields.length > 0 && (
            <div>
              <span className="font-bold text-amber-800 flex items-center gap-1 text-[11px] mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{language === 'ar' ? 'شروط تتطلب التأكيد من الفرع :' : 'À vérifier auprès du conseiller / comité :'}</span>
              </span>
              <div className="flex flex-wrap gap-1 pl-4 rtl:pr-4">
                {verification.unverifiedFields.map((f, i) => (
                  <span key={i} className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-medium">
                    ⚠ {getFieldLabel(f, language)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {verification.notes && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
              {verification.notes[language]}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default VerificationBadge;
