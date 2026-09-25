import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import os from 'os';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { apiRateLimiter, authRateLimiter, ticketCreationLimiter } from './middlewares/rateLimiter.js';
import { validate } from './middlewares/validate.js';
import { createTicketSchema, callNextSchema, updateStatusSchema, loginSchema } from './schemas/ticket.schema.js';
import { ALL_SERVICE_CODES } from './constants/services.js';
import {
  authenticateToken,
  requireRole,
  generateToken,
  ADMIN_PASSWORD,
  AGENT_PASSWORD,
  comparePassword,
  hashPassword
} from './auth.js';
import {
  enqueueSyncEvent,
  getSyncStatus,
  processOutboxSync,
  startSyncWorker
} from './syncWorker.js';
import {
  createDatabaseBackup,
  listBackups,
  getBackupFilePath,
  startBackupScheduler
} from './backupService.js';

const PORT = process.env.PORT || 4000;

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permet les requêtes locales sans header origin (outils internes, curl)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqué par la politique CORS Cofina'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const io = new Server(httpServer, {
  cors: corsOptions
});

// Protection des headers HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors(corsOptions));
app.use(express.json());

// Application du rate limiting général
app.use('/api/', apiRateLimiter);

// Démarrage des workers en tâche de fond (Résilience Edge & Sauvegardes)
startSyncWorker(prisma);
startBackupScheduler();


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

// Helper: Get active weekly state (tickets & counters from Monday 00h00 to Saturday 14h00)
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

  const counts = await prisma.ticket.groupBy({
    by: ['serviceCode'],
    where: {
      createdAt: {
        gte: startOfWeek
      }
    },
    _count: {
      id: true
    }
  });

  const dailyCounters: Record<string, number> = {};
  ALL_SERVICE_CODES.forEach(code => {
    dailyCounters[code] = 0;
  });
  counts.forEach(c => {
    dailyCounters[c.serviceCode] = c._count.id;
  });

  return { tickets, dailyCounters, weekStartDate: startOfWeek.toISOString() };
}

// Legacy alias for compatibility
const getTodayState = getCurrentWeekState;


// Health Check Endpoint for Supervision & Uptime Kuma
app.get('/health', async (req, res) => {
  try {
    // Vérification active de la base SQLite
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'UP',
      agency: process.env.AGENCY_NAME || 'Agence Siège Kodjoviakopé (Lomé, Togo)',
      agencyCode: process.env.AGENCY_CODE || 'AGC-01',
      dbEngine: 'SQLite (cofina_edge.db)',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
    });
  } catch (e: any) {
    res.status(503).json({
      status: 'DOWN',
      database: 'DISCONNECTED',
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
});

// REST API Routes
app.get('/api/network-info', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    localIp,
    port: PORT,
    frontendPort: 3000,
    lanUrl: `http://${localIp}:3000`
  });
});

app.get('/api/tickets', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string) || 25));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const whereClause: any = {};
    if (status) whereClause.status = status;

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where: whereClause }),
      prisma.ticket.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    res.json({
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Public Endpoint (Kiosk ticket creation) with Prisma Transaction to prevent Race Conditions
app.post('/api/tickets/create', ticketCreationLimiter, validate(createTicketSchema), async (req, res) => {
  try {
    const { ticketNumber: inputTicketNumber, serviceCode, serviceName, isPriority, customerPhone, customerEmail } = req.body;
    
    const newTicket = await prisma.$transaction(async (tx) => {
      let agency = await tx.agency.findFirst({ where: { code: 'AGC-01' } });
      if (!agency) {
        agency = await tx.agency.create({
          data: {
            code: 'AGC-01',
            name: 'Agence Siège Kodjoviakopé (Lomé)',
            city: 'Lomé',
            address: 'Rue de la Paix, Kodjoviakopé'
          }
        });
      }

      let ticketNumber = inputTicketNumber;
      if (!ticketNumber) {
        const startOfWeek = getWeekStartDate();
        
        // P3.1 : Optimisation de la génération de séquence (O(1) au lieu de O(N))
        const lastTicket = await tx.ticket.findFirst({
          where: {
            serviceCode,
            createdAt: { gte: startOfWeek }
          },
          orderBy: { createdAt: 'desc' },
          select: { ticketNumber: true }
        });

        let nextSeq = 1;
        if (lastTicket && lastTicket.ticketNumber) {
          const match = lastTicket.ticketNumber.match(/-(\d+)$/);
          if (match) {
            nextSeq = parseInt(match[1], 10) + 1;
          }
        }
        ticketNumber = `${serviceCode}-${String(nextSeq).padStart(3, '0')}`;
      }

      return await tx.ticket.create({
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
    });

    const updatedState = await getTodayState();

    // Enqueue pour la synchronisation différée Cloud Edge
    enqueueSyncEvent(prisma, 'TICKET_CREATED', newTicket);

    // Broadcast realtime event via Socket.io across LAN
    io.emit('ticket_created', { 
      ticket: newTicket,
      serviceCode: newTicket.serviceCode,
      newCounterValue: updatedState.dailyCounters[newTicket.serviceCode]
    });

    res.status(201).json(newTicket);
  } catch (e: any) {
    console.error('Error creating ticket:', e);
    res.status(500).json({ error: e.message });
  }
});

// Protected Agent Endpoint: Call Next Ticket
app.post('/api/tickets/call-next', authenticateToken, validate(callNextSchema), async (req, res) => {
  try {
    const { agentId, agentName, counterNumber, serviceFilter } = req.body;

    const startOfWeek = getWeekStartDate();

    const waiting = await prisma.ticket.findMany({
      where: {
        status: 'WAITING',
        createdAt: { gte: startOfWeek },
        ...(serviceFilter && serviceFilter !== 'ALL'
          ? (serviceFilter.includes(',')
              ? { serviceCode: { in: serviceFilter.split(',').map((s: string) => s.trim()) } }
              : { serviceCode: serviceFilter })
          : {})
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

    let validAgentId: string | null = null;
    if (agentId) {
      const existingAgent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (existingAgent) {
        validAgentId = existingAgent.id;
      }
    }

    // Clôturer automatiquement tout ancien ticket actif sur ce guichet
    await prisma.ticket.updateMany({
      where: {
        counterNumber: counterNumber || 1,
        status: { in: ['CALLED', 'IN_PROGRESS'] },
        id: { not: ticketToCall.id }
      },
      data: {
        status: 'COMPLETED',
        completedAt: now
      }
    });

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketToCall.id },
      data: {
        status: 'CALLED',
        counterNumber: counterNumber || 1,
        agentId: validAgentId,
        agentName: agentName || 'Caissier',
        calledAt: now
      }
    });

    const updatedState = await getTodayState();

    // Enqueue pour la synchronisation différée Cloud Edge
    enqueueSyncEvent(prisma, 'TICKET_CALLED', updatedTicket);

    // Broadcast realtime event via Socket.io across LAN
    io.emit('ticket_called', { ticket: updatedTicket, tickets: updatedState.tickets });

    res.json(updatedTicket);
  } catch (e: any) {
    console.error('Error calling ticket:', e);
    res.status(500).json({ error: e.message });
  }
});

// Protected Agent Endpoint: Update Ticket Status
app.post('/api/tickets/update-status', authenticateToken, validate(updateStatusSchema), async (req, res) => {
  try {
    const { ticketId, status, extra } = req.body;
    const now = new Date();

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(status === 'IN_PROGRESS' ? { startedAt: now } : {}),
        ...(status === 'COMPLETED' ? { completedAt: now } : {}),
        ...(extra || {})
      }
    });

    const updatedState = await getTodayState();

    // Enqueue pour la synchronisation différée Cloud Edge
    enqueueSyncEvent(prisma, 'TICKET_UPDATED', updated);

    io.emit('ticket_updated', { ticket: updated, tickets: updatedState.tickets });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Protected Agent Endpoint: Recall Ticket
app.post('/api/tickets/recall', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.body;
    const now = new Date();

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { calledAt: now }
    });

    const updatedState = await getTodayState();

    // Enqueue pour la synchronisation différée Cloud Edge
    enqueueSyncEvent(prisma, 'TICKET_CALLED', updated);

    io.emit('ticket_recalled', { ticket: updated, tickets: updatedState.tickets });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Protected Admin Endpoint: Weekly Archiving (ADMIN ONLY)
app.post('/api/tickets/weekly-archive', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { tickets } = await getTodayState();
    const totalTickets = tickets.length;
    const completedTickets = tickets.filter(t => t.status === 'COMPLETED').length;
    const noShowTickets = tickets.filter(t => t.status === 'NO_SHOW').length;
    
    let avgWaitMin = 0;
    const withWait = tickets.filter(t => t.calledAt && t.createdAt);
    if (withWait.length > 0) {
      const totalTime = withWait.reduce((acc, t) => acc + (new Date(t.calledAt as Date).getTime() - new Date(t.createdAt).getTime()) / 1000, 0);
      avgWaitMin = Math.round((totalTime / withWait.length) / 60);
    }

    const archive = await prisma.weeklyArchive.create({
      data: {
        weekLabel: `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
        startDate: getWeekStartDate(),
        endDate: new Date(),
        totalTickets,
        completedTickets,
        noShowTickets,
        avgWaitMin,
        ticketsJson: JSON.stringify(tickets || [])
      }
    });

    const archivesList = await prisma.weeklyArchive.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Enqueue événement d'archivage hebdomadaire
    enqueueSyncEvent(prisma, 'WEEKLY_ARCHIVE', archive);

    io.emit('weekly_archived', { archive, archivesList });
    res.status(201).json({ message: 'Semaine archivée avec succès en base de données SQLite', archive });
  } catch (e: any) {
    console.error('Error creating weekly archive:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/reload-clients', (req, res) => {
  io.emit('reload_page');
  res.json({ message: 'Ordre de rafraîchissement envoyé à tous les écrans en direct' });
});

// Protected Admin Endpoint: Reset All Tickets (ADMIN ONLY)
app.post('/api/tickets/reset-all', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    await prisma.ticket.deleteMany({});
    
    const initialCounters: Record<string, number> = {};
    ALL_SERVICE_CODES.forEach(code => {
      initialCounters[code] = 0;
    });
    
    const cleanState = { tickets: [], dailyCounters: initialCounters, lastCalledTicket: null };

    // Enqueue pour synchronisation
    enqueueSyncEvent(prisma, 'RESET_ALL', { resetAt: new Date() });

    io.emit('init_state', cleanState);
    res.json({ message: 'Tous les tickets ont été réinitialisés avec succès.' });
  } catch (e: any) {
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

// ── ENDPOINTS DE SAUVEGARDE SQLITE (ADMIN ONLY) ──
app.get('/api/backup/list', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/backup/create', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const backup = await createDatabaseBackup();
    res.status(201).json({ message: 'Sauvegarde SQLite créée avec succès', backup });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/backup/download/:filename', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const filePath = getBackupFilePath(req.params.filename);
    if (!filePath) {
      return res.status(404).json({ error: 'Fichier de sauvegarde introuvable ou invalide' });
    }
    res.download(filePath, req.params.filename);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── ENDPOINTS DE SYNCHRONISATION CLOUD SYNCOUTBOX ──
app.get('/api/sync/status', async (req, res) => {
  try {
    const status = await getSyncStatus(prisma);
    res.json(status);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/sync/trigger', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await processOutboxSync(prisma);
    const status = await getSyncStatus(prisma);
    res.json({ message: 'Tentative de synchronisation exécutée', result, status });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// JWT Auth Login Endpoint avec support Rôles RBAC (ADMIN & AGENT)
app.post('/api/auth/login', authRateLimiter, validate(loginSchema), async (req, res) => {
  const { username, password, role } = req.body;

  // 1. Authentification Administrateur
  if (role === 'ADMIN' || username === 'admin') {
    if (password === ADMIN_PASSWORD) {
      const token = generateToken({ username: username || 'admin', role: 'ADMIN', agency: 'KODJOVIAKOPE' });
      return res.json({ token, username: username || 'admin', role: 'ADMIN' });
    }
    return res.status(401).json({ message: 'Mot de passe Administrateur incorrect' });
  }

  // 2. Authentification Caissier / Agent
  if (password === AGENT_PASSWORD) {
    const token = generateToken({ username: username || 'agent', role: 'AGENT', agency: 'KODJOVIAKOPE' });
    return res.json({ token, username: username || 'agent', role: 'AGENT' });
  }

  // 3. Authentification par code PIN ou mot de passe individuel en base
  if (username) {
    try {
      const agent = await prisma.agent.findFirst({ where: { name: username } });
      if (agent && agent.passwordHash && await comparePassword(password, agent.passwordHash)) {
        const token = generateToken({ id: agent.id, username: agent.name, role: (agent.role as any) || 'AGENT', agency: 'KODJOVIAKOPE' });
        return res.json({ token, username: agent.name, role: agent.role || 'AGENT' });
      }
    } catch (err) {
      console.warn('Erreur vérification agent individuel :', err);
    }
  }

  res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });
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

  // REMOVED: socket.on('sync_state') to prevent split-brain architecture.
  // The server SQLite DB is now the single source of truth.

  socket.on('trigger_reload', () => {
    io.emit('reload_page');
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io LAN] Client déconnecté : ${socket.id}`);
  });
    // Serve Frontend statically in production
    if (process.env.NODE_ENV === 'production') {
      // Because server.ts is inside /src (dist/server.js is inside /dist), the frontend is in ../../dist relative to src (or ../dist relative to dist)
      const clientDist = path.resolve(__dirname, '../../dist');
      app.use(express.static(clientDist));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
      });
    }
});

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`====================================================`);
  console.log(`🚀 SERVEUR EDGE COFINA TOGO — PERSISTANCE SQLITE ACTIVE`);
  console.log(`📍 Agence : Kodjoviakopé, Lomé`);
  console.log(`🌐 Serveur Local (Host) : http://localhost:${PORT}`);
  console.log(`🌐 Serveur Réseau (LAN)  : http://${localIp}:${PORT}`);
  console.log(`----------------------------------------------------`);
  console.log(`📲 ADRESSES POUR LES AUTRES MACHINES DU RÉSEAU LOCAL :`);
  console.log(`   👉 Borne Tactile   : http://${localIp}:3000/?kiosk`);
  console.log(`   👉 Écran TV        : http://${localIp}:3000/?display`);
  console.log(`   👉 Espace Caissier : http://${localIp}:3000/?agent`);
  console.log(`   👉 Admin / Config  : http://${localIp}:3000/?admin`);
  console.log(`====================================================`);
});

