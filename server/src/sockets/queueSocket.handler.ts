import { Server } from 'socket.io';
import { getTodayState } from '../services/queueState.service.js';
import { PrismaClient } from '@prisma/client';

export function setupSocketHandlers(io: Server, prisma: PrismaClient) {
  io.on('connection', async (socket) => {
    console.log(`[Socket.io LAN] Client connecté : ${socket.id}`);

    try {
      const state = await getTodayState(prisma);
      socket.emit('init_state', state);
    } catch (e) {
      console.error('Socket init error:', e);
    }

    socket.on('trigger_reload', () => {
      // Sécurité : rejet des ordres de rechargement anonymes via WebSocket
      console.warn(`[Socket.io LAN] Événement trigger_reload anonyme ignoré (socket ${socket.id})`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io LAN] Client déconnecté : ${socket.id}`);
    });
  });
}
