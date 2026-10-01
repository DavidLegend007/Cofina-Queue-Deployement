import { Router } from 'express';
export function createHealthRouter(prisma) {
    const router = Router();
    router.get('/health', async (_req, res) => {
        try {
            // Vérification active de la base SQLite
            await prisma.$queryRaw `SELECT 1`;
            res.status(200).json({
                status: 'UP',
                agency: process.env.AGENCY_NAME || 'Agence Siège Kodjoviakopé (Lomé, Togo)',
                agencyCode: process.env.AGENCY_CODE || 'AGC-01',
                dbEngine: 'SQLite (cofina_edge.db)',
                timestamp: new Date().toISOString(),
                uptimeSeconds: Math.floor(process.uptime()),
                memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
            });
        }
        catch (e) {
            res.status(503).json({
                status: 'DOWN',
                database: 'DISCONNECTED',
                error: e.message,
                timestamp: new Date().toISOString()
            });
        }
    });
    return router;
}
