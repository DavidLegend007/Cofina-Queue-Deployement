import { Router } from 'express';
import { authenticateToken, requireRole } from '../auth.js';
import { createDatabaseBackup, listBackups, getBackupFilePath } from '../backupService.js';
export function createBackupRouter() {
    const router = Router();
    router.get('/list', authenticateToken, requireRole(['ADMIN']), (req, res) => {
        try {
            const backups = listBackups();
            res.json(backups);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.post('/create', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
        try {
            const backup = await createDatabaseBackup();
            res.status(201).json({ message: 'Sauvegarde SQLite créée avec succès', backup });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    router.get('/download/:filename', authenticateToken, requireRole(['ADMIN']), (req, res) => {
        try {
            const filePath = getBackupFilePath(req.params.filename);
            if (!filePath) {
                return res.status(404).json({ error: 'Fichier de sauvegarde introuvable ou invalide' });
            }
            res.download(filePath, req.params.filename);
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    return router;
}
