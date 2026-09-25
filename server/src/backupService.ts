import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin absolu vers la base SQLite locale
const DB_PATH = path.resolve(__dirname, '..', 'prisma', 'cofina_edge.db');
const BACKUPS_DIR = path.resolve(__dirname, '..', 'backups');

export interface BackupInfo {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
}

/**
 * Assure que le répertoire de sauvegarde existe
 */
function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Formate les octets en Ko / Mo lisibles
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Crée une copie instantanée de la base de données SQLite
 */
export async function createDatabaseBackup(): Promise<BackupInfo> {
  ensureBackupsDir();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Base de données introuvable à : ${DB_PATH}`);
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFileName = `cofina_edge_backup_${dateStr}.db`;
  const destinationPath = path.join(BACKUPS_DIR, backupFileName);

  // Sauvegarde SQLite atomique et sécurisée en mode WAL
  // VACUUM INTO vide les journaux WAL dans un fichier cible intègre et compacté
  try {
    const safePath = destinationPath.replace(/'/g, "''");
    await prisma.$executeRawUnsafe(`VACUUM INTO '${safePath}'`);
  } catch (vacuumError) {
    // Fallback si SQLite est en version antérieure : checkpoint WAL puis copie
    await prisma.$executeRawUnsafe(`PRAGMA wal_checkpoint(TRUNCATE)`);
    fs.copyFileSync(DB_PATH, destinationPath);
  }

  const stats = fs.statSync(destinationPath);

  // Nettoyage automatique des sauvegardes trop anciennes (rétention 14 jours)
  cleanOldBackups(14);

  return {
    filename: backupFileName,
    sizeBytes: stats.size,
    sizeFormatted: formatBytes(stats.size),
    createdAt: stats.mtime.toISOString()
  };
}

/**
 * Liste toutes les sauvegardes disponibles dans le dossier backups/
 */
export function listBackups(): BackupInfo[] {
  ensureBackupsDir();

  const files = fs.readdirSync(BACKUPS_DIR);
  const backups: BackupInfo[] = [];

  files.forEach(file => {
    if (file.endsWith('.db') && file.startsWith('cofina_edge_backup_')) {
      const fullPath = path.join(BACKUPS_DIR, file);
      const stats = fs.statSync(fullPath);
      backups.push({
        filename: file,
        sizeBytes: stats.size,
        sizeFormatted: formatBytes(stats.size),
        createdAt: stats.mtime.toISOString()
      });
    }
  });

  return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Récupère le chemin absolu d'un fichier de sauvegarde pour téléchargement sécurisé
 */
export function getBackupFilePath(filename: string): string | null {
  ensureBackupsDir();
  // Sécurité anti-path traversal
  const sanitized = path.basename(filename);
  const target = path.join(BACKUPS_DIR, sanitized);
  if (fs.existsSync(target) && sanitized.endsWith('.db')) {
    return target;
  }
  return null;
}

/**
 * Purge automatique des sauvegardes de plus de X jours
 */
export function cleanOldBackups(retentionDays = 14) {
  try {
    ensureBackupsDir();
    const files = fs.readdirSync(BACKUPS_DIR);
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      if (file.endsWith('.db') && file.startsWith('cofina_edge_backup_')) {
        const filePath = path.join(BACKUPS_DIR, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`[BackupService] Ancienne sauvegarde purgée : ${file}`);
        }
      }
    });
  } catch (err: any) {
    console.warn('[BackupService] Erreur lors du nettoyage des anciennes sauvegardes :', err.message);
  }
}

/**
 * Démarre le planificateur automatique quotidien (sauvegarde toutes les 24h)
 */
export function startBackupScheduler() {
  console.log('[BackupService] Planificateur de sauvegarde automatique initialisé.');
  // Exécute une première sauvegarde de sécurité au démarrage du serveur
  createDatabaseBackup()
    .then(b => console.log(`[BackupService] ✅ Sauvegarde initiale créée : ${b.filename} (${b.sizeFormatted})`))
    .catch(err => console.warn('[BackupService] ⚠️ Avertissement sauvegarde initiale :', err.message));

  // Toutes les 24 heures (86 400 000 ms)
  setInterval(() => {
    createDatabaseBackup()
      .then(b => console.log(`[BackupService] ✅ Sauvegarde quotidienne automatique créée : ${b.filename} (${b.sizeFormatted})`))
      .catch(err => console.error('[BackupService] Erreur sauvegarde quotidienne :', err.message));
  }, 24 * 60 * 60 * 1000);
}
