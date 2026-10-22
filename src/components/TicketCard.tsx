import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../types/ticket';
import { Language, translations } from '../translations';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  CircleDot, 
  Trash2, 
  ChevronDown, 
  Loader2,
  Calendar
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  language: Language;
  onStatusChange: (id: number, newStatus: TicketStatus) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  language,
  onStatusChange,
  onDelete,
}) => {
  const t = translations[language];
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusSelect = async (newStatus: TicketStatus) => {
    if (newStatus === ticket.status || isUpdating) return;
    setIsUpdating(true);
    await onStatusChange(ticket.id, newStatus);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(ticket.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  // Priority Styles
  const priorityConfig: Record<TicketPriority, { label: string; badgeClass: string; dotClass: string }> = {
    high: {
      label: t.priorityHigh,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dotClass: 'bg-rose-500',
    },
    medium: {
      label: t.priorityMedium,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dotClass: 'bg-amber-500',
    },
    low: {
      label: t.priorityLow,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotClass: 'bg-emerald-500',
    },
  };

  // Status Styles
  const statusConfig: Record<TicketStatus, { label: string; textClass: string; bgClass: string; icon: React.ReactNode }> = {
    open: {
      label: t.open,
      textClass: 'text-sky-700',
      bgClass: 'bg-sky-50 border-sky-200 hover:bg-sky-100/70',
      icon: <CircleDot className="w-3.5 h-3.5 text-sky-600" />,
    },
    doing: {
      label: t.doing,
      textClass: 'text-amber-700',
      bgClass: 'bg-amber-50 border-amber-200 hover:bg-amber-100/70',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    done: {
      label: t.done,
      textClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
  };

  const currPriority = priorityConfig[ticket.priority] || priorityConfig.medium;
  const currStatus = statusConfig[ticket.status] || statusConfig.open;

  // Format relative or date time
  const formatTime = (iso?: string) => {
    if (!iso) return t.justNow;
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between gap-4 ${
        ticket.status === 'done'
          ? 'border-slate-200/70 bg-slate-50/40 shadow-xs'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Header: ID, Priority, Delete Action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Ticket ID */}
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
            #{ticket.id}
          </span>

          {/* Priority Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currPriority.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currPriority.dotClass}`} />
            <span>{currPriority.label}</span>
          </span>
        </div>

        {/* Delete Confirmation or Trigger */}
        <div className="relative">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-0.5 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-all shadow-xs"
              >
                {isDeleting ? '...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="opacity-0 group-hover:opacity-100 sm:opacity-40 hover:!opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title={t.deleteTicket}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Title */}
      <div className="flex-1">
        <h3
          className={`text-sm sm:text-base font-semibold leading-snug break-words ${
            ticket.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900'
          }`}
        >
          {ticket.title}
        </h3>
      </div>

      {/* Footer: Date & Status Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{formatTime(ticket.createdAt)}</span>
        </div>

        {/* Status Control (Change Status) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider hidden xs:inline">
            {t.changeStatus}:
          </span>
          <div className="relative inline-block">
            <select
              value={ticket.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusSelect(e.target.value as TicketStatus)}
              className={`appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60 ${currStatus.bgClass} ${currStatus.textClass}`}
            >
              <option value="open">⚪ {t.open}</option>
              <option value="doing">🟡 {t.doing}</option>
              <option value="done">🟢 {t.done}</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
