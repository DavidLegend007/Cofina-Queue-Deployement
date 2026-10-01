import { Router } from 'express';
import { authenticateToken, requireRole } from '../auth.js';
import { getSyncStatus, processOutboxSync } from '../syncWorker.js';
export function createSyncRouter(prisma) {
    const router = Router();
    router.get('/status', async (req, res) => {
        try {
            const status = await getSyncStatus(prisma);
            res.json(status);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/trigger', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
        try {
            const result = await processOutboxSync(prisma);
            const status = await getSyncStatus(prisma);
            res.json({ message: 'Tentative de synchronisation exécutée', result, status });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    return router;
}
