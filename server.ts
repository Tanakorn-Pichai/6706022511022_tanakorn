import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Ticket {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'doing' | 'done';
  createdAt?: string;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'tickets.json');

const INITIAL_TICKETS: Ticket[] = [
  { id: 1, title: 'Printer offline on 3rd floor office', priority: 'high', status: 'open', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 2, title: 'VPN connection dropping for remote staff', priority: 'medium', status: 'doing', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 3, title: 'Request HDMI cable for conference room B', priority: 'low', status: 'done', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 4, title: 'Software license renewal for Adobe Creative Cloud', priority: 'medium', status: 'open', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 5, title: 'Email spam filter misclassifying client emails', priority: 'high', status: 'doing', createdAt: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 6, title: 'New monitor setup for marketing workstation', priority: 'low', status: 'done', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() }
];

function loadTickets(): Ticket[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_TICKETS, null, 2), 'utf-8');
      return [...INITIAL_TICKETS];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [...INITIAL_TICKETS];
  } catch (err) {
    console.error('Error loading tickets from file:', err);
    return [...INITIAL_TICKETS];
  }
}

function saveTickets(tickets: Ticket[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving tickets to file:', err);
  }
}

async function bootstrap() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // In-memory cache synced with disk
  let tickets: Ticket[] = loadTickets();

  // API Routes
  const router = express.Router();

  // Health check
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', ticketCount: tickets.length, timestamp: new Date().toISOString() });
  });

  // GET /api/tickets - List all tickets, optional ?status=all|open|doing|done
  router.get('/tickets', (req: Request, res: Response) => {
    const { status } = req.query;
    if (status && typeof status === 'string' && status !== 'all') {
      const filtered = tickets.filter(t => t.status === status);
      return res.json(filtered);
    }
    res.json(tickets);
  });

  // POST /api/tickets - Create a new ticket
  router.post('/tickets', (req: Request, res: Response) => {
    const { title, priority } = req.body;

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 80) {
      return res.status(400).json({ error: 'Title cannot exceed 80 characters' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    // Generate unique ID
    const maxId = tickets.reduce((max, t) => Math.max(max, t.id), 0);
    const newTicket: Ticket = {
      id: maxId + 1,
      title: trimmedTitle,
      priority,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    tickets.unshift(newTicket);
    saveTickets(tickets);

    res.status(201).json(newTicket);
  });

  // PATCH /api/tickets/:id - Update ticket status or other fields
  const handleUpdate = (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { status, title, priority } = req.body;

    if (status !== undefined) {
      const validStatuses = ['open', 'doing', 'done'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status must be open, doing, or done' });
      }
      tickets[ticketIndex].status = status;
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 80) {
        return res.status(400).json({ error: 'Title must be 1 to 80 characters' });
      }
      tickets[ticketIndex].title = title.trim();
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Priority must be low, medium, or high' });
      }
      tickets[ticketIndex].priority = priority;
    }

    saveTickets(tickets);
    res.json(tickets[ticketIndex]);
  };

  router.patch('/tickets/:id', handleUpdate);
  router.put('/tickets/:id', handleUpdate);

  // DELETE /api/tickets/:id
  router.delete('/tickets/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const removed = tickets.splice(ticketIndex, 1)[0];
    saveTickets(tickets);
    res.json({ success: true, message: 'Ticket deleted', deletedTicket: removed });
  });

  // POST /api/tickets/reset - Reset to default seed
  router.post('/tickets/reset', (_req: Request, res: Response) => {
    tickets = [...INITIAL_TICKETS];
    saveTickets(tickets);
    res.json({ success: true, tickets });
  });

  app.use('/api', router);

  // Serve Frontend
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
