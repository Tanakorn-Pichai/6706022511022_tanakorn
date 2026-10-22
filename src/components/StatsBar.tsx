import React from 'react';
import { Ticket } from '../types/ticket';
import { Language, translations } from '../translations';
import { Inbox, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatsBarProps {
  tickets: Ticket[];
  language: Language;
  selectedFilter: string;
  onSelectFilter: (filter: 'all' | 'open' | 'doing' | 'done') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  tickets,
  language,
  selectedFilter,
  onSelectFilter,
}) => {
  const t = translations[language];

  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open').length;
  const doingCount = tickets.filter(t => t.status === 'doing').length;
  const doneCount = tickets.filter(t => t.status === 'done').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'high' && t.status !== 'done').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Tickets */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          selectedFilter === 'all'
            ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium text-slate-600">{t.totalTickets}</span>
          <Inbox className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{total}</div>
      </button>

      {/* Open */}
      <button
        onClick={() => onSelectFilter('open')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          selectedFilter === 'open'
            ? 'bg-sky-50/80 border-sky-400 shadow-xs ring-2 ring-sky-500/20'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium text-sky-700">{t.openTickets}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
        </div>
        <div className="text-2xl font-bold text-sky-950 tracking-tight">{openCount}</div>
      </button>

      {/* Doing */}
      <button
        onClick={() => onSelectFilter('doing')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          selectedFilter === 'doing'
            ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-2 ring-amber-500/20'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium text-amber-700">{t.doingTickets}</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-amber-950 tracking-tight">{doingCount}</div>
      </button>

      {/* Done */}
      <button
        onClick={() => onSelectFilter('done')}
        className={`text-left p-3.5 rounded-xl border transition-all ${
          selectedFilter === 'done'
            ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-2 ring-emerald-500/20'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium text-emerald-700">{t.doneTickets}</span>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-emerald-950 tracking-tight">{doneCount}</div>
      </button>
    </div>
  );
};
