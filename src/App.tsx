/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Ticket, TicketStatus, FilterStatus, CreateTicketPayload } from './types/ticket';
import { Language, translations } from './translations';
import { api, ApiError } from './services/api';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TicketForm } from './components/TicketForm';
import { TicketFilter } from './components/TicketFilter';
import { TicketCard } from './components/TicketCard';
import { LoadingState, ErrorState, EmptyState } from './components/FeedbackState';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  // Ticket data & API states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Fetch tickets from real backend API
  const loadTickets = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setApiError(null);

    try {
      const data = await api.getTickets();
      setTickets(data);
      setApiConnected(true);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Unable to connect to service desk API';
      setApiError(msg);
      setApiConnected(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Handle Create Ticket (A2)
  const handleCreateTicket = async (payload: CreateTicketPayload): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const newTicket = await api.createTicket(payload);
      // Prepend the new ticket
      setTickets((prev) => [newTicket, ...prev]);
      setApiConnected(true);
      addToast('success', t.ticketCreated);
      return true;
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit ticket';
      addToast('error', msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Status (A3) with optimistic UI update
  const handleStatusChange = async (id: number, newStatus: TicketStatus): Promise<boolean> => {
    // Save previous state for rollback if needed
    const prevTickets = [...tickets];

    // Optimistically update
    setTickets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const updated = await api.updateTicketStatus(id, newStatus);
      // Ensure state has the latest server response
      setTickets((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      setApiConnected(true);
      addToast('success', `${t.ticketId} #${id}: ${t.statusUpdated}`);
      return true;
    } catch (err: any) {
      // Rollback
      setTickets(prevTickets);
      const msg = err instanceof ApiError ? err.message : 'Failed to update ticket status';
      addToast('error', msg);
      return false;
    }
  };

  // Handle Delete Ticket
  const handleDeleteTicket = async (id: number): Promise<boolean> => {
    const prevTickets = [...tickets];
    setTickets((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.deleteTicket(id);
      addToast('success', `${t.ticketId} #${id}: ${t.ticketDeleted}`);
      return true;
    } catch (err: any) {
      setTickets(prevTickets);
      const msg = err instanceof ApiError ? err.message : 'Failed to delete ticket';
      addToast('error', msg);
      return false;
    }
  };

  // Handle Reset Demo Data
  const handleResetDemo = async () => {
    if (!window.confirm(t.confirmReset)) return;
    setIsRefreshing(true);
    try {
      const resetList = await api.resetDemoData();
      setTickets(resetList);
      setStatusFilter('all');
      setSearchTerm('');
      setPriorityFilter('all');
      addToast('success', 'Demo tickets restored successfully');
    } catch (err: any) {
      addToast('error', 'Failed to reset demo data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Compute counts
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      doing: tickets.filter((t) => t.status === 'doing').length,
      done: tickets.filter((t) => t.status === 'done').length,
    };
  }, [tickets]);

  // Priority numerical weights for sorting
  const priorityWeight: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filtered and sorted tickets
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        // Status filter
        if (statusFilter !== 'all' && ticket.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
          return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchesTitle = ticket.title.toLowerCase().includes(query);
          const matchesId = `#${ticket.id}`.includes(query) || ticket.id.toString() === query;
          if (!matchesTitle && !matchesId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        if (sortBy === 'oldest') {
          return a.id - b.id;
        }
        // Default: newest first (highest id)
        return b.id - a.id;
      });
  }, [tickets, statusFilter, priorityFilter, searchTerm, sortBy]);

  const hasFilterActive = statusFilter !== 'all' || priorityFilter !== 'all' || !!searchTerm.trim();

  const clearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        apiConnected={apiConnected}
        onRefresh={() => loadTickets(true)}
        onResetDemo={handleResetDemo}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI / Stats Bar */}
        <StatsBar
          tickets={tickets}
          language={language}
          selectedFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />

        {/* Create Ticket Form (Screen Definition: Form at the top) */}
        <section aria-labelledby="create-ticket-heading">
          <TicketForm
            language={language}
            onSubmit={handleCreateTicket}
            isSubmitting={isSubmitting}
          />
        </section>

        {/* Filter & Search Bar (Screen Definition: Filter control) */}
        <section aria-labelledby="filter-tickets-heading">
          <TicketFilter
            language={language}
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
            counts={counts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
        </section>

        {/* Ticket List / Grid or Feedback State */}
        <section aria-labelledby="ticket-list-heading" className="space-y-4">
          {isLoading ? (
            <LoadingState language={language} />
          ) : apiError ? (
            <ErrorState
              message={apiError}
              language={language}
              onRetry={() => loadTickets(false)}
            />
          ) : filteredTickets.length === 0 ? (
            <EmptyState
              language={language}
              hasFilterActive={hasFilterActive}
              onClearFilter={clearAllFilters}
              onResetDemo={handleResetDemo}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {statusFilter === 'all'
                    ? t.all
                    : statusFilter === 'open'
                    ? t.open
                    : statusFilter === 'doing'
                    ? t.doing
                    : t.done}{' '}
                  ({filteredTickets.length})
                </span>
                {hasFilterActive && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {t.clearFilter}
                  </button>
                )}
              </div>

              {/* Grid of Ticket Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    language={language}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTicket}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-4 mt-12 text-center text-xs text-slate-500">
        <p>Simple Service Desk &bull; Frontend Single-Page Application &bull; REST API Integration</p>
      </footer>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
