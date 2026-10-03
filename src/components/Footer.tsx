import React from 'react';
import { Scale, ShieldAlert, ExternalLink } from 'lucide-react';
import { Language } from '../types/financing';
import { TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-900">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white font-display">Mizen</span>
              <span className="text-sm font-bold text-amber-500 font-['Cairo']">ميزان</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              {language === 'ar'
                ? 'منصة استخبارات التمويل في تونس. نساعد أصحاب المشاريع والشركات على استكشاف آليات التمويل الرسمية ومقارنتها وتجهيز ملفاتهم بكل شفافية.'
                : 'Plateforme d’intelligence et de matching de financement pour les PME et créateurs d’entreprise en Tunisie. Traçabilité, critères officiels vérifiés et clarté financière.'}
            </p>
          </div>

          {/* Official Institutions Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              {language === 'ar' ? 'البوابات الرسمية الشريكة' : 'Institutions officielles'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="http://www.bfpme.com.tn" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>BFPME Bank</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="https://www.bts.com.tn" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Banque Tunisienne de Solidarité (BTS)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="http://www.sotugar.com.tn" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>SOTUGAR (Société Tunisienne de Garantie)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="https://startup.gov.tn" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Startup Act Tunisia (Smart Capital)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              {language === 'ar' ? 'ميثاق الشفافية' : 'Charte d’intégrité'}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'ar' ? 'مصادر رسمية موثقة وقانونية' : 'Sources officielles vérifiées'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>{language === 'ar' ? 'احتساب مالي واضح دون فوائد مخفية' : 'Calculs financiers sans frais cachés'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{language === 'ar' ? 'لا نقدم وعوداً وهمية بالموافقة' : 'Aucune promesse d’approbation fictive'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 text-[11px] leading-relaxed flex items-start gap-3 mb-6">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>{t.disclaimerText}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div>
            {language === 'ar'
              ? `© ${new Date().getFullYear()} ميزان تونس. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Mizen Tunisia. Tous droits réservés.`}
          </div>
          <div className="flex items-center gap-3">
            <span>{language === 'ar' ? 'مخصص للباعثين وأصحاب المشاريع في تونس 🇹🇳' : 'Conçu pour les entrepreneurs tunisiens 🇹🇳'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
