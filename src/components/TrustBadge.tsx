import React from 'react';
import { ShieldCheck, User, Calculator, Sparkles } from 'lucide-react';
import { Language } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';

interface TrustBadgeProps {
  type: 'user_provided' | 'verified_fact' | 'calculated' | 'ai_interpretation';
  language: Language;
  className?: string;
  subtle?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ type, language, className = '', subtle = false }) => {
  const t = TRANSLATIONS[language];

  switch (type) {
    case 'verified_fact':
      return (
        <span
          id={`badge-verified-fact-${type}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
            subtle
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-emerald-600 text-white shadow-xs'
          } ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{t.trustVerifiedFact}</span>
        </span>
      );

    case 'calculated':
      return (
        <span
          id={`badge-calculated-${type}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
            subtle
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-blue-600 text-white shadow-xs'
          } ${className}`}
        >
          <Calculator className="w-3.5 h-3.5 shrink-0" />
          <span>{t.trustCalculated}</span>
        </span>
      );

    case 'ai_interpretation':
      return (
        <span
          id={`badge-ai-${type}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
            subtle
              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              : 'bg-indigo-600 text-white shadow-xs'
          } ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{t.trustAiInterpretation}</span>
        </span>
      );

    case 'user_provided':
    default:
      return (
        <span
          id={`badge-user-${type}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
            subtle
              ? 'bg-slate-100 text-slate-700 border border-slate-200'
              : 'bg-slate-700 text-white shadow-xs'
          } ${className}`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>{t.trustUserProvided}</span>
        </span>
      );
  }
};
