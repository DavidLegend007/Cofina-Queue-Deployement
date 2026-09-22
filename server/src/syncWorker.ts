import { PrismaClient } from '@prisma/client';

export interface SyncStatus {
  pendingCount: number;
  sentCount: number;
  failedCount: number;
  lastSyncAttempt: Date | null;
  centralUrl: string;
  isOnline: boolean;
}

let lastAttemptTimestamp: Date | null = null;
let syncIntervalTimer: any = null;

/**
 * Enregistre un événement métier dans la file d'attente sortante (SyncOutbox)
 * Prêt pour la synchronisation différée vers le Cloud du Siège COFINA.
 */
export async function enqueueSyncEvent(
  prisma: PrismaClient,
  eventType: 'TICKET_CREATED' | 'TICKET_CALLED' | 'TICKET_UPDATED' | 'WEEKLY_ARCHIVE' | 'RESET_ALL',
  payload: any
) {
  try {
    return await prisma.syncOutbox.create({
      data: {
        eventType,
        payload: JSON.stringify(payload),
        status: 'PENDING',
        attempts: 0
      }
    });
  } catch (err) {
    console.error('[SyncOutbox] Erreur lors de l\'enregistrement de l\'événement :', err);
    return null;
  }
}

/**
 * Tente de synchroniser les événements en attente vers le serveur central
 */
export async function processOutboxSync(prisma: PrismaClient): Promise<{ processed: number; success: boolean }> {
  lastAttemptTimestamp = new Date();
  const centralUrl = process.env.CENTRAL_CLOUD_URL;

  try {
    const pendingEvents = await prisma.syncOutbox.findMany({
      where: { status: 'PENDING' },
      take: 50,
      orderBy: { createdAt: 'asc' }
    });

    if (pendingEvents.length === 0) {
      return { processed: 0, success: true };
    }

    // Si aucune URL centrale configurée (mode 100% autonome ou dev), on simule la synchro locale
    if (!centralUrl) {
      console.log(`[SyncOutbox Worker] ${pendingEvents.length} événements en attente. Mode Edge Local autonome (pas d'URL centrale définie).`);
      return { processed: 0, success: false };
    }

    // Si URL configurée, on tente l'envoi HTTP
    try {
      const response = await fetch(`${centralUrl}/api/agency-sync/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agency-Code': 'AGC-01',
          'X-Sync-Token': process.env.SYNC_API_TOKEN || 'cofina_sync_token_default'
        },
        body: JSON.stringify({ events: pendingEvents }),
        signal: AbortSignal.timeout(5000) // Timeout 5s pour ne pas bloquer en cas de coupure internet
      });

      if (response.ok) {
        const ids = pendingEvents.map(e => e.id);
        await prisma.syncOutbox.updateMany({
          where: { id: { in: ids } },
          data: { status: 'SENT', sentAt: new Date() }
        });
        console.log(`[SyncOutbox Worker] ✅ ${pendingEvents.length} événements synchronisés avec succès vers le Siège Central.`);
        return { processed: pendingEvents.length, success: true };
      } else {
        throw new Error(`Réponse HTTP Siège: ${response.status}`);
      }
    } catch (netErr: any) {
      // Échec réseau / internet coupé -> incrémente les tentatives
      const ids = pendingEvents.map(e => e.id);
      await prisma.syncOutbox.updateMany({
        where: { id: { in: ids } },
        data: { attempts: { increment: 1 } }
      });
      console.warn(`[SyncOutbox Worker] ⚠️ Connexion Internet indisponible ou Siège injoignable (${netErr.message}). Les données restent stockées en local.`);
      return { processed: pendingEvents.length, success: false };
    }
  } catch (err: any) {
    console.error('[SyncOutbox Worker] Erreur globale de traitement outbox :', err.message);
    return { processed: 0, success: false };
  }
}

/**
 * Récupère l'état courant de la file de synchronisation
 */
export async function getSyncStatus(prisma: PrismaClient): Promise<SyncStatus> {
  const pendingCount = await prisma.syncOutbox.count({ where: { status: 'PENDING' } });
  const sentCount = await prisma.syncOutbox.count({ where: { status: 'SENT' } });
  const failedCount = await prisma.syncOutbox.count({ where: { status: 'FAILED' } });

  return {
    pendingCount,
    sentCount,
    failedCount,
    lastSyncAttempt: lastAttemptTimestamp,
    centralUrl: process.env.CENTRAL_CLOUD_URL || 'Non configurée (Edge Local Autonome)',
    isOnline: !!process.env.CENTRAL_CLOUD_URL
  };
}

/**
 * Démarre le worker de synchronisation en tâche de fond (toutes les 60 secondes)
 */
export function startSyncWorker(prisma: PrismaClient, intervalMs = 60000) {
  if (syncIntervalTimer) clearInterval(syncIntervalTimer);
  console.log(`[SyncOutbox Worker] Démarré (Intervalle : ${intervalMs / 1000}s)`);

  syncIntervalTimer = setInterval(() => {
    processOutboxSync(prisma).catch(e => console.error('[Sync Worker Exception]', e));
  }, intervalMs);
}
