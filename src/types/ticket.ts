export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'doing' | 'done';
export type FilterStatus = 'all' | 'open' | 'doing' | 'done';

export interface Ticket {
  id: number;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt?: string;
}

export interface CreateTicketPayload {
  title: string;
  priority: TicketPriority;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  title?: string;
  priority?: TicketPriority;
}
