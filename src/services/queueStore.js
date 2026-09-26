import { io } from 'socket.io-client';

/**
 * GROUPE COFINA TOGO — QUEUE MANAGEMENT REALTIME ENGINE (V1 LOCAL EDGE STORE)
 * Siège : Agence Kodjoviakopé (Lomé, Togo)
 * Synchronise les tickets entre la Borne Tactile, l'Écran TV Public, et les 4 Caisses.
 */

export const STORAGE_KEY = 'cofina_queue_v1_store_togo';
export const CHANNEL_NAME = 'cofina_queue_sync_v1_togo';

export const COFINA_AGENCIES = [
  { id: 'AGC-01', name: 'Agence Siège Cofina Togo (Lomé)', city: 'Lomé', address: 'Rue de la Paix, Kodjoviakopé' },
  { id: 'AGC-02', name: 'Agence COFINA Agoè Assiyéyé', city: 'Lomé', address: 'Carrefour Agoè Assiyéyé' },
  { id: 'AGC-03', name: 'Agence COFINA Adidogomé', city: 'Lomé', address: 'Route d\'Kpalimé, Adidogomé' },
  { id: 'AGC-04', name: 'Agence COFINA Akodessewa', city: 'Lomé', address: 'Zone Portuaire, Akodessewa' }
];

/**
 * Générateur de payload d'impression thermique ESC/POS (Imprimantes 80mm/58mm)
 */
export const generateESCPOSPayload = (ticket, agencyName = 'COFINA TOGO - KODJOVIAKOPÉ', lang = 'fr') => {
  const dateStr = new Date(ticket.createdAt || Date.now()).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
  const isEn = lang === 'en';
  return `
========================================
             COFINA TOGO                
    ${agencyName.toUpperCase()}
========================================
Date: ${dateStr}

      ${isEn ? 'YOUR QUEUE NUMBER:' : 'VOTRE NUMÉRO DE PASSAGE:'}

       ----------------------
            ${ticket.ticketNumber}
       ----------------------

Service : ${ticket.serviceName}
${ticket.priority ? (isEn ? '★ PRIORITY ACCESS ★\n' : '★ ACCÈS PRIORITAIRE ★\n') : ''}
----------------------------------------
       [ ${isEn ? 'SCAN YOUR QR CODE' : 'SCANNER VOTRE QR CODE'} ]
        [ ${typeof window !== 'undefined' ? `${window.location.origin}/?ticket=${ticket.ticketNumber}` : `/?ticket=${ticket.ticketNumber}`} ]
----------------------------------------
${isEn ? 'Welcome! Please take a seat in the waiting room.\nYour number will be called on the TV screen.' : 'Bienvenue ! Prenez place en salle d\'attente.\nVotre numéro sera annoncé à l\'écran TV.'}
========================================
\x1DV\x41\x00`; // Cut paper ESC/POS command
};

/**
 * Export CSV des statistiques de la journée
 */
export const exportAgencyDataCSV = (tickets, agencyName) => {
  if (!tickets || tickets.length === 0) return;
  
  const headers = ["ID Ticket", "Numéro", "Code Service", "Nom Service", "Prioritaire", "Statut", "Caisse", "Caissier", "Créé Le", "Appelé Le", "Début Traitement", "Terminé Le", "Attente (min)", "Traitement (min)"];
  const rows = tickets.map(t => {
    const waitMin = (t.calledAt && t.createdAt) 
      ? Math.round(((new Date(t.calledAt) - new Date(t.createdAt)) / 1000) / 60) 
      : "-";
    const startRef = t.startedAt || t.calledAt;
    const serviceMin = (t.completedAt && startRef) 
      ? Math.round(((new Date(t.completedAt) - new Date(startRef)) / 1000) / 60) 
      : "-";

    return [
      t.id,
      t.ticketNumber,
      t.serviceCode,
      `"${t.serviceName}"`,
      t.priority ? "Oui" : "Non",
      t.status,
      t.counterNumber || "-",
      `"${t.agentName || "-"}"`,
      t.createdAt || "-",
      t.calledAt || "-",
      t.startedAt || "-",
      t.completedAt || "-",
      waitMin,
      serviceMin
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cofina_togo_export_${agencyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const COFINA_SERVICES = [
  { code: 'D', name: 'Dépôt', description: 'Versements', color: '#D3122A', avgTimeMin: 3, icon: 'Banknote', badge: 'Dépôt' },
  { code: 'R', name: 'Retrait', description: 'Retraits caisse', color: '#F97316', avgTimeMin: 3, icon: 'Wallet', badge: 'Retrait' },
  { code: 'TN', name: 'Transfert national', description: 'Envoi/Réception', color: '#2563EB', avgTimeMin: 5, icon: 'Send', badge: 'Transfert' },
  { code: 'TI', name: 'Transfert international', description: 'Envoi/Réception', color: '#06B6D4', avgTimeMin: 8, icon: 'Globe', badge: 'Transfert' },
  { code: 'O', name: 'Ouverture de compte', description: 'Nouveaux comptes', color: '#10B981', avgTimeMin: 15, icon: 'UserPlus', badge: 'Compte' },
  { code: 'RC', name: 'Remise de chèque', description: 'Dépôt chèque', color: '#D97706', avgTimeMin: 4, icon: 'FileCheck', badge: 'Chèque' },
  { code: 'V', name: 'Virement', description: 'Virement bancaire', color: '#8B5CF6', avgTimeMin: 5, icon: 'ArrowRightLeft', badge: 'Virement' },
  { code: 'DR', name: 'Demande de Relevé', description: 'Relevé de compte', color: '#EC4899', avgTimeMin: 3, icon: 'FileText', badge: 'Relevé' },
  { code: 'CM', name: 'COFINA Mobile+', description: 'Assistance mobile', color: '#D3122A', avgTimeMin: 5, icon: 'Smartphone', badge: 'Digital' },
  { code: 'C', name: 'Crédit', description: 'Demande de prêt', color: '#F59E0B', avgTimeMin: 20, icon: 'CreditCard', badge: 'Crédit' },
  { code: 'PC', name: 'Parler à un conseiller', description: 'Assistance client', color: '#3B82F6', avgTimeMin: 15, icon: 'Headphones', badge: 'Conseil' },
  { code: 'PMR', name: 'Mobilité Réduite', description: 'Accès prioritaire', color: '#10B981', avgTimeMin: 5, icon: 'Accessibility', badge: 'Priorité', isPriority: true }
];

// 6 POSTES PHYSIQUES COFINA : 3 Caisses, 2 Opérateurs, 1 Accueil
export const INITIAL_AGENTS = [
  { id: 'AGT-01', name: 'Mensah Koffi', defaultCounter: 1, avatar: '👨🏽‍💼', title: 'Caissier 1 (Espèces)' },
  { id: 'AGT-02', name: 'Amégadjie Afiwa', defaultCounter: 2, avatar: '👩🏽‍💼', title: 'Caissière 2 (Espèces)' },
  { id: 'AGT-03', name: 'Lawani Komlan', defaultCounter: 3, avatar: '👨🏿‍💼', title: 'Caissier 3 (Chèques & Opérations)' },
  { id: 'AGT-04', name: 'Adzoh Kodjo', defaultCounter: 4, avatar: '👨🏽‍💼', title: 'Opérateur 1 (Comptes & Crédits)' },
  { id: 'AGT-05', name: 'Kouassi Mawunyo', defaultCounter: 5, avatar: '👩🏽‍💼', title: 'Opératrice 2 (Conseil & Microfinance)' },
  { id: 'AGT-06', name: 'Abalo Essivi', defaultCounter: 6, avatar: '👩🏽‍💼', title: 'Accueil & Orientation' }
];

export const AGENT_PROFILES_KEY = 'cofina_agent_profiles_v1_togo';

export const getStoredAgentProfiles = () => {
  try {
    const raw = localStorage.getItem(AGENT_PROFILES_KEY);
    if (!raw) return INITIAL_AGENTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_AGENTS;
    
    // Auto-fusion : Si l'historique local contenait moins de 6 agents, compléter avec les nouveaux postes
    if (parsed.length < INITIAL_AGENTS.length) {
      const merged = [...parsed];
      INITIAL_AGENTS.forEach(defAgent => {
        if (!merged.some(a => a.id === defAgent.id)) {
          merged.push(defAgent);
        }
      });
      localStorage.setItem(AGENT_PROFILES_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    return INITIAL_AGENTS;
  }
};

export const saveAgentProfile = (updatedAgent) => {
  try {
    const profiles = getStoredAgentProfiles();
    const newProfiles = profiles.map(ag => ag.id === updatedAgent.id ? { ...ag, ...updatedAgent } : ag);
    localStorage.setItem(AGENT_PROFILES_KEY, JSON.stringify(newProfiles));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'PROFILES_UPDATED', payload: newProfiles });
    }
    return newProfiles;
  } catch (e) {
    console.error('Failed to save agent profile:', e);
    return getStoredAgentProfiles();
  }
};

// BroadcastChannel instance
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
}

// Socket.io Client for Local LAN Synchronization
const SERVER_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : 'http://localhost:4000';

let socket = null;
let stateSubscribers = [];

export const subscribeStateChange = (callback) => {
  stateSubscribers.push(callback);
  return () => {
    stateSubscribers = stateSubscribers.filter(cb => cb !== callback);
  };
};

const notifySubscribers = (state) => {
  stateSubscribers.forEach(cb => {
    try { cb(state); } catch (e) {}
  });
};

if (typeof window !== 'undefined') {
  try {
    socket = io(SERVER_URL, {
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 3000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('✅ Connecté au Serveur Edge Local COFINA (Socket.io LAN):', SERVER_URL);
    });

    socket.on('init_state', ({ tickets, dailyCounters }) => {
      if (tickets && Array.isArray(tickets)) {
        const local = getStoredState();
        const lastCalled = tickets.find(t => t.status === 'CALLED') || local.lastCalledTicket;
        const newState = {
          ...local,
          dailyCounter: dailyCounters || local.dailyCounter,
          tickets: tickets,
          lastCalledTicket: lastCalled
        };
        saveStoredState(newState, false);
        notifySubscribers(newState);
      }
    });

    socket.on('ticket_created', ({ ticket, serviceCode, newCounterValue }) => {
      const local = getStoredState();
      const existingTickets = Array.isArray(local.tickets) ? local.tickets : [];
      const newTickets = [ticket, ...existingTickets.filter(t => t && t.id !== ticket.id)];
      const newCounters = { ...(local.dailyCounter || {}) };
      if (serviceCode !== undefined && newCounterValue !== undefined) {
        newCounters[serviceCode] = newCounterValue;
      }

      const newState = {
        ...local,
        dailyCounter: newCounters,
        tickets: newTickets
      };
      saveStoredState(newState, true);
    });

    socket.on('ticket_called', ({ ticket, tickets }) => {
      const local = getStoredState();
      const existingTickets = Array.isArray(local.tickets) ? local.tickets : [];
      const newTickets = Array.isArray(tickets) 
        ? tickets 
        : existingTickets.map(t => (t && t.id === ticket.id ? ticket : t));
      const newState = {
        ...local,
        lastCalledTicket: ticket,
        tickets: newTickets
      };
      saveStoredState(newState, true);
    });

    socket.on('ticket_updated', ({ ticket, tickets }) => {
      const local = getStoredState();
      const existingTickets = Array.isArray(local.tickets) ? local.tickets : [];
      const newTickets = Array.isArray(tickets) 
        ? tickets 
        : existingTickets.map(t => (t && t.id === ticket.id ? ticket : t));
      const newState = {
        ...local,
        tickets: newTickets
      };
      saveStoredState(newState, true);
    });

    socket.on('ticket_recalled', ({ ticket, tickets }) => {
      const local = getStoredState();
      const existingTickets = Array.isArray(local.tickets) ? local.tickets : [];
      const newTickets = Array.isArray(tickets) 
        ? tickets 
        : existingTickets.map(t => (t && t.id === ticket.id ? ticket : t));
      const newState = {
        ...local,
        lastCalledTicket: ticket,
        tickets: newTickets
      };
      saveStoredState(newState, true);
    });

    socket.on('reload_page', () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });

  } catch (e) {
    console.warn('Socket.io connection initialization skipped:', e);
  }
}



// Initial state (clean empty state for live production)
const getInitialState = () => {
  return {
    currentAgencyId: 'AGC-01',
    agencyName: 'Agence Siège Kodjoviakopé (Lomé)',
    dailyCounter: { D: 0, R: 0, O: 0, E: 0, C: 0, M: 0, S: 0, H: 0 },
    onlineCounters: [1],
    lastCalledTicket: null,
    tickets: []
  };
};

// Helper: Get start of current week (Monday 00:00:00)
export const getWeekCycleStart = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const diffToMon = (day + 6) % 7;
  const mon = new Date(now);
  mon.setDate(now.getDate() - diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon.toISOString().slice(0, 10);
};

export const getWeekSaturdayStart = getWeekCycleStart;

// Cache en mémoire pour préserver les tickets reçus par Socket.io / SQLite
let currentMemoryState = {
  ...getInitialState(),
  lastWeekStart: getWeekCycleStart()
};

export const getStoredState = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const currentWeekStart = getWeekCycleStart();
    
    if (!raw) {
      const init = { ...getInitialState(), lastWeekStart: currentWeekStart, archivedWeeks: [] };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      }
      currentMemoryState = { ...init, tickets: currentMemoryState?.tickets || [] };
      return currentMemoryState;
    }

    const state = JSON.parse(raw) || {};
    
    // Conserver les tickets actifs en mémoire (Socket.io/Serveur) même si localStorage n'a que les métadonnées
    const existingTickets = (Array.isArray(state.tickets) && state.tickets.length > 0)
      ? state.tickets
      : (Array.isArray(currentMemoryState?.tickets) ? currentMemoryState.tickets : []);

    currentMemoryState = {
      ...getInitialState(),
      ...state,
      tickets: existingTickets,
      dailyCounter: state.dailyCounter || currentMemoryState?.dailyCounter || getInitialState().dailyCounter,
      lastCalledTicket: state.lastCalledTicket || currentMemoryState?.lastCalledTicket || null,
      lastWeekStart: currentWeekStart
    };

    return currentMemoryState;
  } catch (e) {
    console.error('Failed to read queue storage:', e);
    return currentMemoryState || getInitialState();
  }
};

// Auth helpers for JWT protected endpoints (anti-spam et cooldown en cas de 429)
let isLoggingIn = false;
let loginCooldownUntil = 0;

export const getAuthToken = async (forceRefresh = false) => {
  if (typeof window === 'undefined') return null;
  let token = (!forceRefresh) ? localStorage.getItem('cofina_jwt_token') : null;
  if (!token) {
    const now = Date.now();
    if (now < loginCooldownUntil || isLoggingIn) {
      return null;
    }
    isLoggingIn = true;
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'agent', password: 'cofina2026' })
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token;
        if (token) {
          localStorage.setItem('cofina_jwt_token', token);
        }
      } else if (res.status === 429) {
        loginCooldownUntil = Date.now() + 15000;
      }
    } catch (e) {
      console.error('Auto login agent failed:', e);
    } finally {
      isLoggingIn = false;
    }
  }
  return token;
};

export const getAuthHeaders = async (forceRefresh = false) => {
  const token = await getAuthToken(forceRefresh);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ── AUTH ADMIN (RBAC) ──
export const getAdminToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('cofina_admin_jwt_token') : null;
};

export const loginAsAdmin = async (password) => {
  try {
    const res = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password, role: 'ADMIN' })
    });
    if (!res.ok) {
      throw new Error('Mot de passe administrateur invalide');
    }
    const data = await res.json();
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('cofina_admin_jwt_token', data.token);
    }
    return data;
  } catch (err) {
    console.error('Échec authentification admin :', err);
    throw err;
  }
};

export const logoutAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cofina_admin_jwt_token');
  }
};

export const getAdminAuthHeaders = async () => {
  let token = getAdminToken();
  if (!token) {
    throw new Error('Session administrateur expirée ou non authentifiée');
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ── FONCTIONS DE SAUVEGARDE SQLITE ──
export const fetchBackupList = async () => {
  const headers = await getAdminAuthHeaders();
  const res = await fetch(`${SERVER_URL}/api/backup/list`, { headers });
  if (!res.ok) throw new Error('Impossible de charger la liste des sauvegardes');
  return await res.json();
};

export const createDatabaseBackupAction = async () => {
  const headers = await getAdminAuthHeaders();
  const res = await fetch(`${SERVER_URL}/api/backup/create`, {
    method: 'POST',
    headers
  });
  if (!res.ok) throw new Error('Échec de création de la sauvegarde');
  return await res.json();
};

export const getBackupDownloadUrl = (filename) => {
  return `${SERVER_URL}/api/backup/download/${encodeURIComponent(filename)}`;
};

// ── FONCTIONS DE SYNCHRONISATION SYNCOUTBOX ──
export const fetchSyncStatus = async () => {
  const res = await fetch(`${SERVER_URL}/api/sync/status`);
  if (!res.ok) throw new Error('Impossible de récupérer l\'état de synchronisation');
  return await res.json();
};

export const triggerCloudSyncAction = async () => {
  const headers = await getAdminAuthHeaders();
  const res = await fetch(`${SERVER_URL}/api/sync/trigger`, {
    method: 'POST',
    headers
  });
  if (!res.ok) throw new Error('Échec du déclenchement de la synchronisation');
  return await res.json();
};

export const saveStoredState = (state, notify = true) => {
  try {
    const safeTickets = Array.isArray(state.tickets) ? state.tickets : (currentMemoryState?.tickets || []);
    currentMemoryState = {
      ...currentMemoryState,
      ...state,
      tickets: safeTickets
    };

    // Métadonnées uniquement dans localStorage (les tickets complets vivent dans SQLite/Socket.io et le cache mémoire)
    const metaOnly = {
      currentAgencyId: currentMemoryState.currentAgencyId,
      agencyName: currentMemoryState.agencyName,
      lastWeekStart: currentMemoryState.lastWeekStart,
      onlineCounters: currentMemoryState.onlineCounters || [],
      archivedWeeks: currentMemoryState.archivedWeeks || []
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metaOnly));
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'STATE_UPDATED', payload: currentMemoryState });
    }
    if (notify) {
      notifySubscribers(currentMemoryState);
    }
  } catch (e) {
    console.error('Failed to save queue storage:', e);
  }
};

// Manually trigger Saturday weekly reset with Database archiving
// BUG FIX (Bug 3): Archive now fetches tickets from the SERVER (SQLite),
// not from localStorage (which is empty since migration to server-side state).
export const resetWeeklyAgencyQueue = async () => {
  try {
    const headers = await getAdminAuthHeaders();

    // The backend now computes the archive natively using the database state
    // so we don't need to manually fetch and compute it here.

    const response = await fetch(`${SERVER_URL}/api/tickets/weekly-archive`, {
      method: 'POST',
      headers
    });
    
    const data = await response.json();
    const archiveRecord = data.archive;

    // 3. Delete all tickets from SQLite (reset-all) with Auth Headers
    await fetch(`${SERVER_URL}/api/tickets/reset-all`, {
      method: 'POST',
      headers
    });

    // 4. Update local week marker
    const currentWeekStart = getWeekSaturdayStart();
    const local = getStoredState();
    const updatedMeta = { ...local, lastWeekStart: currentWeekStart, tickets: [] };
    saveStoredState(updatedMeta);

    return archiveRecord;
  } catch (err) {
    console.error('resetWeeklyAgencyQueue failed:', err);
    throw err;
  }
};

// Alias pour rétrocompatibilité
export const resetAgencyQueue = resetWeeklyAgencyQueue;


// BUG FIX (Bug 3 + Bug A): toggleCounterStatus persists counter metadata to localStorage
// and notifies subscribers with ONLY the onlineCounters delta so App.jsx can merge it
// into the existing state without wiping the tickets that come from Socket.io/SQLite.
export const toggleCounterStatus = (counterNumber, isOnline) => {
  const state = getStoredState();
  let onlineCounters = state.onlineCounters || [];

  if (isOnline) {
    if (!onlineCounters.includes(counterNumber)) {
      onlineCounters = [...onlineCounters, counterNumber].sort();
    }
  } else {
    onlineCounters = onlineCounters.filter(c => c !== counterNumber);
  }

  // Save only metadata to localStorage (tickets live in SQLite)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    currentAgencyId: state.currentAgencyId,
    agencyName: state.agencyName,
    lastWeekStart: state.lastWeekStart,
    onlineCounters,
    archivedWeeks: state.archivedWeeks || []
  }));

  // Broadcast via BroadcastChannel so other browser tabs update
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'COUNTER_STATUS_CHANGED',
      payload: { onlineCounters }
    });
  }

  // Notify local React subscribers with only the counter change
  // App.jsx subscriber merges this with existing state (preserving tickets)
  notifySubscribers({ _partialUpdate: true, onlineCounters });
};

// Create a new ticket (From Kiosk)
export const createTicket = async (serviceCode, customerPhone = null, customerEmail = null, lang = 'fr') => {
  const service = COFINA_SERVICES.find(s => s.code === serviceCode) || COFINA_SERVICES[0];

  try {
    const res = await fetch(`${SERVER_URL}/api/tickets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNumber: null, // the server generates the correct sequence number
        serviceCode,
        serviceName: service.name,
        isPriority: service.isPriority || false,
        customerPhone,
        customerEmail
      })
    });
    if (!res.ok) throw new Error('API request failed');
    const newTicket = await res.json();
    return newTicket;
  } catch (err) {
    console.error('Backend ticket creation failed:', err);
    throw err;
  }
};

// Generate 4-5 test tickets for quick Teller Simulation
export const generateSimulationTickets = async () => {
  await createTicket('PMR'); // Priorité PMR / Femmes Enceintes
  await createTicket('D'); // Dépôt Espèces
  await createTicket('O'); // Ouverture de Compte
  await createTicket('C'); // Crédit & Prêt
  await createTicket('R'); // Retrait Espèces
};

// Call Next Ticket (From Teller Workstation - Caisse 1-4)
export const callNextTicket = async (agentId, agentName, counterNumber, serviceFilter = 'ALL', lang = 'fr') => {
  try {
    let headers = await getAuthHeaders();
    let res = await fetch(`${SERVER_URL}/api/tickets/call-next`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        agentId, agentName, counterNumber, serviceFilter
      })
    });
    
    // Auto-refresh token if expired (401 / 403)
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') localStorage.removeItem('cofina_jwt_token');
      headers = await getAuthHeaders(true);
      res = await fetch(`${SERVER_URL}/api/tickets/call-next`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          agentId, agentName, counterNumber, serviceFilter
        })
      });
    }

    if (!res.ok) {
      if (res.status === 404) return null; // Aucun ticket en attente
      throw new Error(`API request failed: ${res.status}`);
    }
    
    const calledTicketObj = await res.json();

    // Audio TEMPS 2: Carillon Gong + Annonce vocale "Ticket A-008 à la Caisse 1"
    playCallChime();
    speakTicketCall(calledTicketObj.ticketNumber, counterNumber, lang);

    return calledTicketObj;
  } catch (err) {
    console.error('callNextTicket failed:', err);
    return null;
  }
};

// Process current ticket if active, then call next ticket
export const processNextTicket = async (agentId, agentName, counterNumber, serviceFilter = 'ALL', activeTicketId = null, lang = 'fr') => {
  if (activeTicketId) {
    await updateTicketStatus(activeTicketId, 'COMPLETED');
  }
  return await callNextTicket(agentId, agentName, counterNumber, serviceFilter, lang);
};

// Recall current ticket
export const recallTicket = async (ticketId, lang = 'fr') => {
  try {
    let headers = await getAuthHeaders();
    let res = await fetch(`${SERVER_URL}/api/tickets/recall`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ticketId })
    });
    
    // Auto-refresh token if expired (401 / 403)
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') localStorage.removeItem('cofina_jwt_token');
      headers = await getAuthHeaders(true);
      res = await fetch(`${SERVER_URL}/api/tickets/recall`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ticketId })
      });
    }

    if (!res.ok) throw new Error('API request failed');
    
    const ticket = await res.json();
    playCallChime();
    speakTicketCall(ticket.ticketNumber, ticket.counterNumber, lang);
    return ticket;
  } catch (err) {
    console.error('recallTicket failed:', err);
    return null;
  }
};

// Update Ticket Status (IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED)
export const updateTicketStatus = async (ticketId, newStatus, extra = {}) => {
  try {
    let headers = await getAuthHeaders();
    let res = await fetch(`${SERVER_URL}/api/tickets/update-status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ticketId, status: newStatus, extra })
    });
    // Auto-refresh token if expired (401 / 403)
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') localStorage.removeItem('cofina_jwt_token');
      headers = await getAuthHeaders(true);
      await fetch(`${SERVER_URL}/api/tickets/update-status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ticketId, status: newStatus, extra })
      });
    }
  } catch (err) {
    console.error('updateTicketStatus failed:', err);
  }
};

// Note: resetAgencyQueue is defined above as resetWeeklyAgencyQueue

// Audio: Web Audio API Gong Chime
export const playCallChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Tone 1: High chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Tone 2: Warm resolve chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 1.2);

    // Clean up Web Audio Context after playback to prevent memory leaks
    setTimeout(() => {
      try { ctx.close(); } catch (_) {}
    }, 1400);

  } catch (e) {
    console.warn('Audio chime playback omitted:', e);
  }
};

/**
 * Helper: Détection de voix française africaine / chaleureuse la plus naturelle
 */
export const getAfricanOrBestVoice = (targetLang = 'fr') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isFr = targetLang.startsWith('fr');

  if (isFr) {
    // 1. Chercher des voix francophones africaines spécifiques si installées sur le système (fr-TG Togo, fr-BJ Bénin, fr-CI, fr-SN, fr-CM, etc.)
    const africanVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.includes('fr-tg') || l.includes('fr-bj') || l.includes('fr-ci') || 
        l.includes('fr-sn') || l.includes('fr-cm') || l.includes('fr-bf') ||
        l.includes('fr-mg') || l.includes('fr-ma') || l.includes('fr-tn') ||
        n.includes('togo') || n.includes('africa') || n.includes('ivoire') || n.includes('senegal')
      );
    });
    if (africanVoice) return africanVoice;

    // 2. Chercher une voix féminine francophone naturelle et chaleureuse (ex: Google français, Natural, Hortense, Julie)
    const preferredWarmVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.startsWith('fr') && (
        n.includes('google') || n.includes('natural') || n.includes('hortense') || 
        n.includes('julie') || n.includes('celine') || n.includes('online')
      );
    });
    if (preferredWarmVoice) return preferredWarmVoice;

    // 3. Fallback sur n'importe quelle voix française
    const anyFrVoice = voices.find(v => v.lang.toLowerCase().startsWith('fr'));
    if (anyFrVoice) return anyFrVoice;
  }

  return voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) || null;
};

/**
 * AUDIO TEMPS 1: Annonce vocale immédiate lors de la prise du ticket à la borne
 */
export const speakTicketGenerated = (ticketNumber, lang = 'fr') => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    // Format D-001 -> "D 0 0 1" pour une élocution claire et humaine
    const formattedTicket = ticketNumber.split('-').map((part, i) => i === 1 ? part.split('').join(' ') : part).join(' ');
    const isEn = lang === 'en';
    const text = isEn 
      ? `Welcome to Cofina Togo. Your ticket ${formattedTicket} has been created. Please take a seat in the waiting room.`
      : `Bienvenue à l'agence Cofina Togo ! Votre ticket numéro ${formattedTicket} est bien créé. Merci de prendre place en salle d'attente.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.88; // Rythme posé pour acoustique de hall
    utterance.pitch = 1.05; // Tonalité chaleureuse

    const matchedVoice = getAfricanOrBestVoice(isEn ? 'en' : 'fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 200);
  } catch (e) {
    console.warn('Speech synthesis TEMPS 1 error:', e);
  }
};

/**
 * AUDIO TEMPS 2: Annonce vocale lors de l'appel par le caissier
 */
export const speakTicketCall = (ticketNumber, counterNumber, lang = 'fr') => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    // Format D-001 -> "D 0 0 1" pour une élocution naturelle de haut-parleur
    const formattedTicket = ticketNumber.split('-').map((part, i) => i === 1 ? part.split('').join(' ') : part).join(' ');
    const isEn = lang === 'en';
    const text = isEn 
      ? `Ticket ${formattedTicket}, please proceed to Counter ${counterNumber}.`
      : `Ticket ${formattedTicket}... Veuillez vous présenter au Guichet ${counterNumber}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.88; // Rythme calme et solennel
    utterance.pitch = 1.05;

    const matchedVoice = getAfricanOrBestVoice(isEn ? 'en' : 'fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 450);
  } catch (e) {
    console.warn('Speech synthesis TEMPS 2 error:', e);
  }
};
