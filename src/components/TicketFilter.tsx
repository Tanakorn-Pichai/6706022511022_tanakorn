import React from 'react';
import { FilterStatus, TicketPriority } from '../types/ticket';
import { Language, translations } from '../translations';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

interface TicketFilterProps {
  language: Language;
  currentFilter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  counts: {
    all: number;
    open: number;
    doing: number;
    done: number;
  };
  searchTerm: string;
  onSearchChange: (search: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sortBy: 'newest' | 'oldest' | 'priority';
  onSortByChange: (sort: 'newest' | 'oldest' | 'priority') => void;
}

export const TicketFilter: React.FC<TicketFilterProps> = ({
  language,
  currentFilter,
  onFilterChange,
  counts,
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
}) => {
  const t = translations[language];

  const filterTabs: { id: FilterStatus; label: string; count: number; colorClass: string }[] = [
    { id: 'all', label: t.all, count: counts.all, colorClass: 'text-slate-700 bg-slate-100' },
    { id: 'open', label: t.open, count: counts.open, colorClass: 'text-sky-700 bg-sky-100' },
    { id: 'doing', label: t.doing, count: counts.doing, colorClass: 'text-amber-700 bg-amber-100' },
    { id: 'done', label: t.done, count: counts.done, colorClass: 'text-emerald-700 bg-emerald-100' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
      {/* Search and Secondary Filters Bar */}
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9.5 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter & Sort Selector */}
        <div className="flex items-center gap-2">
          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-slate-50/80 border border-slate-200 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">{t.priority}: {t.all}</option>
              <option value="high">{t.priorityHigh}</option>
              <option value="medium">{t.priorityMedium}</option>
              <option value="low">{t.priorityLow}</option>
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-slate-50/80 border border-slate-200 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority">Sort: Priority</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs (PRD: Filter control buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 shrink-0 hidden sm:inline">
          {t.filterByStatus}:
        </span>
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : tab.colorClass
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
