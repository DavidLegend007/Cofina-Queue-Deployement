import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Services & Configs ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// --- Auth & RBAC ---
import { authenticateToken, requireRole } from './auth.js';

// --- Middlewares ---
import { apiRateLimiter } from './middlewares/rateLimiter.js';

// --- Routes ---
import { createHealthRouter } from './routes/health.routes.js';
import { createNetworkRouter, getLocalIpAddress } from './routes/network.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createTicketRouter } from './routes/ticket.routes.js';
import { createBackupRouter } from './routes/backup.routes.js';
import { createSyncRouter } from './routes/sync.routes.js';

// --- Sockets ---
import { setupSocketHandlers } from './sockets/queueSocket.handler.js';

// --- Background Workers ---
import { startSyncWorker } from './syncWorker.js';
import { startBackupScheduler } from './backupService.js';

// ----------------------------------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------------------------------
const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Validation stricte des origines privées RFC 1918 (192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost)
const LAN_IP_REGEX = /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|127\.0\.0\.1|localhost)(:\d+)?$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const pubUrl = process.env.PUBLIC_URL;
    if (!origin || allowedOrigins.includes(origin) || LAN_IP_REGEX.test(origin) || origin.endsWith('.trycloudflare.com') || (pubUrl && origin === pubUrl)) {
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

// Protection des headers HTTP adaptée au réseau local (LAN Edge HTTP sans HTTPS)
app.use(helmet({
  contentSecurityPolicy: false,
  strictTransportSecurity: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
  originAgentCluster: false
}));

app.use(cors(corsOptions));
app.use(express.json());

// Application du rate limiting général
app.use('/api/', apiRateLimiter);

// ----------------------------------------------------------------------------
// ROUTES MOUNTING
// ----------------------------------------------------------------------------
app.use('/', createHealthRouter(prisma));
app.use('/api', createNetworkRouter(PORT));
app.use('/api/auth', createAuthRouter(prisma));
app.use('/api/tickets', createTicketRouter(prisma, io));
app.use('/api/backup', createBackupRouter());
app.use('/api/sync', createSyncRouter(prisma));

app.get('/api/reload-clients', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  io.emit('reload_page');
  res.json({ message: 'Ordre de rafraîchissement envoyé à tous les écrans en direct' });
});

// ----------------------------------------------------------------------------
// SOCKETS & WORKERS
// ----------------------------------------------------------------------------
setupSocketHandlers(io, prisma);

startSyncWorker(prisma);
startBackupScheduler();

// Serve Frontend statically in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ----------------------------------------------------------------------------
// START SERVER
// ----------------------------------------------------------------------------
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`====================================================`);
  console.log(`🚀 SERVEUR EDGE COFINA TOGO — PERSISTANCE SQLITE ACTIVE`);
  console.log(`📍 Agence : Kodjoviakopé, Lomé`);
  console.log(`🌐 Local  : http://localhost:${PORT}`);
  console.log(`🌐 Réseau : http://${localIp}:${PORT}`);
  console.log(`----------------------------------------------------`);
  console.log(`📲 ADRESSES POUR LES MACHINES DU RÉSEAU LOCAL :`);
  console.log(`   👉 Borne Tactile   : http://${localIp}:${PORT}/?kiosk`);
  console.log(`   👉 Écran TV        : http://${localIp}:${PORT}/?display`);
  console.log(`   👉 Espace Caissier : http://${localIp}:${PORT}/?agent`);
  console.log(`   👉 Admin / Config  : http://${localIp}:${PORT}/?admin`);
  console.log(`====================================================`);
});
