import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'cofina_edge_togo_secret_key_2026';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Helper: Ensure default agency exists in SQLite DB
async function getOrCreateDefaultAgency() {
  let agency = await prisma.agency.findFirst({ where: { code: 'AGC-01' } });
  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        code: 'AGC-01',
        name: 'Agence Siège Kodjoviakopé (Lomé)',
        city: 'Lomé',
        address: 'Rue de la Paix, Kodjoviakopé'
      }
    });
  }
  return agency;
}

// Helper: Compute start date of current weekly cycle (Monday 00:00:00 -> Saturday 14:00)
function getWeekStartDate() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const hour = now.getHours();

  const mon = new Date(now);
  if (day === 6 && hour >= 14) {
    // If Saturday after 14h: transition to next Monday
    const daysUntilMon = 2;
    mon.setDate(now.getDate() + daysUntilMon);
  } else {
    // Compute previous Monday 00:00:00
    const diffToMon = (day + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
    mon.setDate(now.getDate() - diffToMon);
  }
  mon.setHours(0, 0, 0, 0);
  return mon;
}

// Helper: Get active weekly state (tickets & counters starting from Saturday)
async function getCurrentWeekState() {
  const startOfWeek = getWeekStartDate();

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: startOfWeek
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const dailyCounters: Record<string, number> = { A: 0, B: 0, C: 0, V: 0 };
  tickets.forEach(t => {
    const code = t.serviceCode;
    const match = t.ticketNumber.match(/-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!dailyCounters[code] || num > dailyCounters[code]) {
        dailyCounters[code] = num;
      }
    }
  });

  return { tickets, dailyCounters, weekStartDate: startOfWeek.toISOString() };
}

// Legacy alias for compatibility
const getTodayState = getCurrentWeekState;


// Health Check Endpoint for Supervision & Uptime Kuma
app.get('/health', async (req, res) => {
  try {
    const { tickets } = await getTodayState();
    const activeCount = tickets.filter(t => t.status === 'WAITING' || t.status === 'CALLED').length;

    res.status(200).json({
      status: 'UP',
      agency: 'Agence Siège Kodjoviakopé (Lomé, Togo)',
      dbEngine: 'SQLite (cofina_edge.db)',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      activeTicketsCount: activeCount
    });
  } catch (e: any) {
    res.status(500).json({ status: 'ERROR', message: e.message });
  }
});

// REST API Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const state = await getTodayState();
    res.json(state);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets/create', async (req, res) => {
  try {
    const { serviceCode, serviceName, isPriority, customerPhone, customerEmail } = req.body;
    const agency = await getOrCreateDefaultAgency();

    const { dailyCounters } = await getTodayState();
    const currentCount = (dailyCounters[serviceCode] || 0) + 1;
    const ticketNumber = `${serviceCode}-${String(currentCount).padStart(3, '0')}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        serviceCode,
        serviceName: serviceName || 'Dépôt & Retrait d\'Espèces',
        priority: !!isPriority,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        status: 'WAITING',
        agencyId: agency.id
      }
    });

    const updatedState = await getTodayState();

    // Broadcast realtime event via Socket.io across LAN
    io.emit('ticket_created', { ticket: newTicket, dailyCounters: updatedState.dailyCounters, tickets: updatedState.tickets });

    res.status(201).json(newTicket);
  } catch (e: any) {
    console.error('Error creating ticket:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets/call-next', async (req, res) => {
  try {
    const { agentId, agentName, counterNumber, serviceFilter } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const waiting = await prisma.ticket.findMany({
      where: {
        status: 'WAITING',
        createdAt: { gte: startOfDay },
        ...(serviceFilter && serviceFilter !== 'ALL' ? { serviceCode: serviceFilter } : {})
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    if (waiting.length === 0) {
      return res.status(404).json({ message: 'Aucun ticket en attente' });
    }

    const ticketToCall = waiting[0];
    const now = new Date();

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketToCall.id },
      data: {
        status: 'CALLED',
        counterNumber: counterNumber || 1,
        agentId: agentId || null,
        agentName: agentName || 'Caissier',
        calledAt: now
      }
    });

    const updatedState = await getTodayState();

    // Broadcast realtime event via Socket.io across LAN
    io.emit('ticket_called', { ticket: updatedTicket, tickets: updatedState.tickets });

    res.json(updatedTicket);
  } catch (e: any) {
    console.error('Error calling ticket:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets/update-status', async (req, res) => {
  try {
    const { ticketId, status, extra } = req.body;
    const now = new Date();

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(status === 'COMPLETED' ? { completedAt: now } : {}),
        ...(extra || {})
      }
    });

    const updatedState = await getTodayState();
    io.emit('ticket_updated', { ticket: updated, tickets: updatedState.tickets });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets/recall', async (req, res) => {
  try {
    const { ticketId } = req.body;
    const now = new Date();

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { calledAt: now }
    });

    const updatedState = await getTodayState();
    io.emit('ticket_recalled', { ticket: updated, tickets: updatedState.tickets });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Weekly Archiving Endpoints (Saturday Reset & DB Backup)
app.post('/api/tickets/weekly-archive', async (req, res) => {
  try {
    const { weekLabel, startDate, endDate, totalTickets, completedTickets, noShowTickets, avgWaitMin, tickets } = req.body;

    const archive = await prisma.weeklyArchive.create({
      data: {
        weekLabel: weekLabel || `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        totalTickets: totalTickets || 0,
        completedTickets: completedTickets || 0,
        noShowTickets: noShowTickets || 0,
        avgWaitMin: avgWaitMin || 0,
        ticketsJson: JSON.stringify(tickets || [])
      }
    });

    const archivesList = await prisma.weeklyArchive.findMany({
      orderBy: { createdAt: 'desc' }
    });

    io.emit('weekly_archived', { archive, archivesList });
    res.status(201).json({ message: 'Semaine archivée avec succès en base de données SQLite', archive });
  } catch (e: any) {
    console.error('Error creating weekly archive:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/tickets/weekly-archives', async (req, res) => {
  try {
    const archives = await prisma.weeklyArchive.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(archives);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// JWT Auth Login Endpoint for Tellers/Agents
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (password === 'cofina2026') {
    const token = jwt.sign({ username, role: 'AGENT', agency: 'KODJOVIAKOPE' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, username });
  }
  res.status(401).json({ message: 'Mot de passe incorrect' });
});

// Realtime Socket.io Connection & Events
io.on('connection', async (socket) => {
  console.log(`[Socket.io LAN] Client connecté : ${socket.id}`);

  try {
    const state = await getTodayState();
    socket.emit('init_state', state);
  } catch (e) {
    console.error('Socket init error:', e);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket.io LAN] Client déconnecté : ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SERVEUR EDGE COFINA TOGO — PERSISTANCE SQLITE ACTIVE`);
  console.log(`📍 Agence : Kodjoviakopé, Lomé`);
  console.log(`🌐 REST & Socket.io Server : http://localhost:${PORT}`);
  console.log(`💚 Health Monitoring : http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});

