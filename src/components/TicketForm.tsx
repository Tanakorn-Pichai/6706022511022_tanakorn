import React, { useState } from 'react';
import { TicketPriority, CreateTicketPayload } from '../types/ticket';
import { Language, translations } from '../translations';
import { PlusCircle, Loader2, AlertCircle, Sparkles, ShieldAlert, Check } from 'lucide-react';

interface TicketFormProps {
  language: Language;
  onSubmit: (payload: CreateTicketPayload) => Promise<boolean>;
  isSubmitting: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  language,
  onSubmit,
  isSubmitting,
}) => {
  const t = translations[language];
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [clientError, setClientError] = useState<string | null>(null);

  const charCount = title.length;
  const isTooLong = charCount > 80;
  const isNearLimit = charCount >= 70 && charCount <= 80;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setClientError(t.titleRequired);
      return;
    }

    if (trimmed.length > 80) {
      setClientError(t.titleTooLong);
      return;
    }

    setClientError(null);
    const success = await onSubmit({
      title: trimmed,
      priority,
    });

    if (success) {
      setTitle('');
      setPriority('medium');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (clientError) {
      setClientError(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {t.newTicket}
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          {t.charLimit}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="ticket-title" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              {t.titleLabel} <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs font-medium tabular-nums ${
                isTooLong
                  ? 'text-rose-600 font-bold'
                  : isNearLimit
                  ? 'text-amber-600'
                  : 'text-slate-400'
              }`}
            >
              {charCount} / 80
            </span>
          </div>

          <div className="relative">
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              maxLength={80}
              placeholder={t.ticketTitlePlaceholder}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                clientError || isTooLong
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
              } disabled:bg-slate-50 disabled:text-slate-500`}
            />
          </div>

          {clientError && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{clientError}</span>
            </div>
          )}
        </div>

        {/* Priority Selector & Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          {/* Priority Radios */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              {t.priorityLabel}
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-md">
              {/* Low */}
              <label
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  priority === 'low'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={priority === 'low'}
                  onChange={() => setPriority('low')}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t.priorityLow}</span>
              </label>

              {/* Medium */}
              <label
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="medium"
                  checked={priority === 'medium'}
                  onChange={() => setPriority('medium')}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{t.priorityMedium}</span>
              </label>

              {/* High */}
              <label
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  priority === 'high'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{t.priorityHigh}</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none sm:self-end"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.submitting}</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>{t.submitTicket}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
