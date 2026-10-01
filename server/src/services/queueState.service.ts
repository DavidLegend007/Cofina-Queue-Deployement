import { PrismaClient } from '@prisma/client';
import { ALL_SERVICE_CODES } from '../constants/services.js';

export async function getOrCreateDefaultAgency(prisma: PrismaClient) {
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

export function getTodayStartDate(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function getWeekStartDate(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const diffToMon = (day + 6) % 7; // Mon=0, Tue=1, ..., Sat=5, Sun=6
  const mon = new Date(now);
  mon.setDate(now.getDate() - diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

// ── État du Jour (Live Queue pour Borne, Caisses, Écran TV) ──
// Ne renvoie QUE les tickets créés AUJOURD'HUI.
// Clôture automatiquement les tickets non servis de la veille (NO_SHOW)
export async function getTodayState(prisma: PrismaClient) {
  const startOfDay = getTodayStartDate();

  // Clôturer les tickets restés en attente de la veille pour ne pas polluer aujourd'hui
  try {
    await prisma.ticket.updateMany({
      where: {
        status: { in: ['WAITING', 'CALLED', 'IN_PROGRESS'] },
        createdAt: { lt: startOfDay }
      },
      data: {
        status: 'NO_SHOW'
      }
    });
  } catch (e) {
    console.warn('[QueueState] Auto-clôture tickets anciens:', e);
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: startOfDay
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
        gte: startOfDay
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

  return { tickets, dailyCounters, todayDate: startOfDay.toISOString() };
}

// ── État de la Semaine (utilisé pour les archives hebdomadaires Admin) ──
export async function getCurrentWeekState(prisma: PrismaClient) {
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

