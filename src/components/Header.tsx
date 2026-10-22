import React from 'react';
import { Headphones, RefreshCw, Globe, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Language, translations } from '../translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  apiConnected: boolean | null;
  onRefresh: () => void;
  onResetDemo: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  apiConnected,
  onRefresh,
  onResetDemo,
  isRefreshing,
}) => {
  const t = translations[language];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t.appTitle}
              </h1>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: API Status, Language Switcher, Demo Reset, Refresh */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          {/* API Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              apiConnected === true
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : apiConnected === false
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title={apiConnected ? 'Connected to /api/tickets' : 'Backend connection unavailable'}
          >
            {apiConnected === true ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden md:inline">{t.apiConnected}</span>
                <span className="md:hidden">API OK</span>
              </>
            ) : apiConnected === false ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden md:inline">{t.apiError}</span>
                <span className="md:hidden">API Error</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Checking API...</span>
              </>
            )}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('th')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'th'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="ภาษาไทย"
            >
              ไทย
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-xs disabled:opacity-60"
            title={t.refresh}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden md:inline">{t.refresh}</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 active:scale-95 transition-all shadow-xs"
            title={t.resetDemo}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.resetDemo}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
