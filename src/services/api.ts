import { Ticket, CreateTicketPayload, FilterStatus, TicketStatus } from '../types/ticket';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE_URL = '/api';

export const api = {
  /**
   * Fetch tickets from backend API. Optional status query: 'all', 'open', 'doing', 'done'
   */
  async getTickets(status?: FilterStatus): Promise<Ticket[]> {
    const url = status && status !== 'all' 
      ? `${BASE_URL}/tickets?status=${encodeURIComponent(status)}`
      : `${BASE_URL}/tickets`;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const body = await res.json();
        if (body.error) errorMsg = body.error;
      } catch {
        // use default errorMsg
      }
      throw new ApiError(errorMsg, res.status);
    }

    const data: Ticket[] = await res.json();
    return data;
  },

  /**
   * Create a new ticket via POST /api/tickets
   */
  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errorMsg = `Failed to create ticket (${res.status})`;
      try {
        const body = await res.json();
        if (body.error) errorMsg = body.error;
      } catch {
        // use default
      }
      throw new ApiError(errorMsg, res.status);
    }

    const newTicket: Ticket = await res.json();
    return newTicket;
  },

  /**
   * Update status of an existing ticket via PATCH /api/tickets/:id
   */
  async updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      let errorMsg = `Failed to update ticket status (${res.status})`;
      try {
        const body = await res.json();
        if (body.error) errorMsg = body.error;
      } catch {
        // use default
      }
      throw new ApiError(errorMsg, res.status);
    }

    const updated: Ticket = await res.json();
    return updated;
  },

  /**
   * Delete a ticket via DELETE /api/tickets/:id
   */
  async deleteTicket(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new ApiError(`Failed to delete ticket (${res.status})`, res.status);
    }
  },

  /**
   * Reset tickets to demo seed data
   */
  async resetDemoData(): Promise<Ticket[]> {
    const res = await fetch(`${BASE_URL}/tickets/reset`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new ApiError('Failed to reset demo data', res.status);
    }

    const body = await res.json();
    return body.tickets || [];
  },

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
};
