import React from 'react';
import { Language, translations } from '../translations';
import { Loader2, AlertCircle, Inbox, RefreshCw, Sparkles, Plus } from 'lucide-react';

interface LoadingStateProps {
  language: Language;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ language }) => {
  const t = translations[language];
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{t.loadingTickets}</h3>
      <p className="text-xs text-slate-500 max-w-sm">Fetching latest tasks from REST API (/api/tickets)...</p>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  language: Language;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, language, onRetry }) => {
  const t = translations[language];
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 sm:p-8 text-center my-4">
      <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1">{t.errorLoading}</h3>
      <p className="text-xs text-rose-700/90 mb-5 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{t.retry}</span>
      </button>
    </div>
  );
};

interface EmptyStateProps {
  language: Language;
  hasFilterActive: boolean;
  onClearFilter: () => void;
  onResetDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  language,
  hasFilterActive,
  onClearFilter,
  onResetDemo,
}) => {
  const t = translations[language];

  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center my-4">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-7 h-7" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
        {hasFilterActive ? t.emptyTitle : t.emptyAllTitle}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
        {hasFilterActive ? t.emptyDesc : t.emptyAllDesc}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {hasFilterActive ? (
          <button
            onClick={onClearFilter}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
          >
            {t.clearFilter}
          </button>
        ) : (
          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.resetDemo}</span>
          </button>
        )}
      </div>
    </div>
  );
};
