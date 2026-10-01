import { Router } from 'express';
import { ALL_SERVICE_CODES } from '../constants/services.js';
import { authenticateToken, requireRole } from '../auth.js';
import { validate } from '../middlewares/validate.js';
import { ticketCreationLimiter } from '../middlewares/rateLimiter.js';
import { createTicketSchema, callNextSchema, updateStatusSchema } from '../schemas/ticket.schema.js';
import { getTodayStartDate, getWeekStartDate, getTodayState, getCurrentWeekState } from '../services/queueState.service.js';
import { enqueueSyncEvent } from '../syncWorker.js';
export function createTicketRouter(prisma, io) {
    const router = Router();
    // ── GET /api/tickets/today-state — Polling TV (DisplayModule, sans auth) ──
    // Utilisé par la TV Zeus toutes les 5s pour garder la file d'attente à jour
    // même si le WebSocket est instable sur ce navigateur.
    router.get('/today-state', async (_req, res) => {
        try {
            const state = await getTodayState(prisma);
            res.setHeader('Cache-Control', 'no-store, no-cache');
            res.json(state);
        }
        catch (e) {
            res.status(500).json({ error: 'Erreur récupération état file', details: e.message });
        }
    });
    // ── GET /api/tickets/track/:ticketNumber — Suivi Mobile E-Ticket (QR Code) ──
    router.get('/track/:ticketNumber', async (req, res) => {
        try {
            const rawNumber = decodeURIComponent(req.params.ticketNumber).trim();
            const startOfDay = getTodayStartDate();
            // Normalisation pour tolérer "PMR 001", "PMR-001", "pmr-001", "pmr 001"
            const normalizedSearch = rawNumber.replace(/[\s\-_]/g, '').toUpperCase();
            const allToday = await prisma.ticket.findMany({
                where: { createdAt: { gte: startOfDay } },
                orderBy: { createdAt: 'asc' }
            });
            const ticket = allToday.find(t => t.ticketNumber === rawNumber ||
                t.ticketNumber.replace(/[\s\-_]/g, '').toUpperCase() === normalizedSearch);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket introuvable pour aujourd\'hui' });
            }
            // Notifier la borne Kiosk en direct que le client a scanné le QR Code
            io.emit('ticket_scanned', {
                ticketNumber: ticket.ticketNumber,
                id: ticket.id
            });
            // Calcul dynamique de la position en file d'attente
            const waitingList = allToday.filter(t => t.status === 'WAITING');
            let ahead = 0;
            if (ticket.status === 'WAITING') {
                ahead = waitingList.filter(w => {
                    if (w.id === ticket.id)
                        return false;
                    if (w.priority && !ticket.priority)
                        return true;
                    if (!w.priority && ticket.priority)
                        return false;
                    return new Date(w.createdAt).getTime() < new Date(ticket.createdAt).getTime();
                }).length;
            }
            res.setHeader('Cache-Control', 'no-store, no-cache');
            res.json({
                ticket,
                positionAhead: ahead,
                totalWaiting: waitingList.length,
                estimatedWaitMinutes: Math.max(2, ahead * 4),
                allTodayTickets: allToday
            });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.get('/', async (req, res) => {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(100, Math.max(10, parseInt(req.query.limit) || 25));
            const skip = (page - 1) * limit;
            const status = req.query.status;
            const whereClause = {};
            if (status)
                whereClause.status = status;
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
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/create', ticketCreationLimiter, validate(createTicketSchema), async (req, res) => {
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
                    const startOfDay = getTodayStartDate();
                    const lastTicket = await tx.ticket.findFirst({
                        where: {
                            serviceCode,
                            createdAt: { gte: startOfDay }
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
            const updatedState = await getTodayState(prisma);
            enqueueSyncEvent(prisma, 'TICKET_CREATED', newTicket);
            io.emit('ticket_created', {
                ticket: newTicket,
                serviceCode: newTicket.serviceCode,
                newCounterValue: updatedState.dailyCounters[newTicket.serviceCode]
            });
            res.status(201).json(newTicket);
        }
        catch (e) {
            console.error('Error creating ticket:', e);
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/call-next', authenticateToken, validate(callNextSchema), async (req, res) => {
        try {
            const { agentId, agentName, counterNumber, serviceFilter } = req.body;
            const startOfDay = getTodayStartDate();
            let waiting = await prisma.ticket.findMany({
                where: {
                    status: 'WAITING',
                    createdAt: { gte: startOfDay },
                    ...(serviceFilter && serviceFilter !== 'ALL'
                        ? (serviceFilter.includes(',')
                            ? { serviceCode: { in: serviceFilter.split(',').map((s) => s.trim()) } }
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
            let validAgentId = null;
            if (agentId) {
                const existingAgent = await prisma.agent.findUnique({ where: { id: agentId } });
                if (existingAgent) {
                    validAgentId = existingAgent.id;
                }
            }
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
            const updatedState = await getTodayState(prisma);
            enqueueSyncEvent(prisma, 'TICKET_CALLED', updatedTicket);
            io.emit('ticket_called', { ticket: updatedTicket, tickets: updatedState.tickets });
            res.json(updatedTicket);
        }
        catch (e) {
            console.error('Error calling ticket:', e);
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/update-status', authenticateToken, validate(updateStatusSchema), async (req, res) => {
        try {
            const { ticketId, status, extra } = req.body;
            const now = new Date();
            // Assainissement défensif des champs optionnels autorisés sur le modèle Ticket
            const allowedKeys = ['satisfactionScore', 'customerName', 'customerPhone', 'customerEmail', 'counterNumber', 'agentName'];
            const safeExtra = {};
            if (extra && typeof extra === 'object') {
                for (const key of allowedKeys) {
                    if (extra[key] !== undefined) {
                        safeExtra[key] = extra[key];
                    }
                }
            }
            const updated = await prisma.ticket.update({
                where: { id: ticketId },
                data: {
                    status,
                    ...(status === 'IN_PROGRESS' ? { startedAt: now } : {}),
                    ...(status === 'COMPLETED' ? { completedAt: now } : {}),
                    ...safeExtra
                }
            });
            const updatedState = await getTodayState(prisma);
            enqueueSyncEvent(prisma, 'TICKET_UPDATED', updated);
            io.emit('ticket_updated', { ticket: updated, tickets: updatedState.tickets });
            res.json(updated);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/recall', authenticateToken, async (req, res) => {
        try {
            const { ticketId } = req.body;
            const now = new Date();
            const updated = await prisma.ticket.update({
                where: { id: ticketId },
                data: { calledAt: now }
            });
            const updatedState = await getTodayState(prisma);
            enqueueSyncEvent(prisma, 'TICKET_CALLED', updated);
            io.emit('ticket_recalled', { ticket: updated, tickets: updatedState.tickets });
            res.json(updated);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/weekly-archive', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
        try {
            const { tickets } = await getCurrentWeekState(prisma);
            const totalTickets = tickets.length;
            const completedTickets = tickets.filter(t => t.status === 'COMPLETED').length;
            const noShowTickets = tickets.filter(t => t.status === 'NO_SHOW').length;
            let avgWaitMin = 0;
            const withWait = tickets.filter(t => t.calledAt && t.createdAt);
            if (withWait.length > 0) {
                const totalTime = withWait.reduce((acc, t) => acc + (new Date(t.calledAt).getTime() - new Date(t.createdAt).getTime()) / 1000, 0);
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
            enqueueSyncEvent(prisma, 'WEEKLY_ARCHIVE', archive);
            io.emit('weekly_archived', { archive, archivesList });
            res.status(201).json({ message: 'Semaine archivée avec succès en base de données SQLite', archive });
        }
        catch (e) {
            console.error('Error creating weekly archive:', e);
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/reset-all', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
        try {
            await prisma.ticket.deleteMany({});
            const initialCounters = {};
            ALL_SERVICE_CODES.forEach(code => {
                initialCounters[code] = 0;
            });
            const cleanState = { tickets: [], dailyCounters: initialCounters, lastCalledTicket: null };
            enqueueSyncEvent(prisma, 'RESET_ALL', { resetAt: new Date() });
            io.emit('init_state', cleanState);
            res.json({ message: 'Tous les tickets ont été réinitialisés avec succès.' });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.get('/weekly-archives', async (req, res) => {
        try {
            const archives = await prisma.weeklyArchive.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(archives);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    return router;
}
