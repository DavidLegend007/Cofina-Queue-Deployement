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
        [ https://cofina.tg/q/${ticket.ticketNumber} ]
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
  
  const headers = ["ID Ticket", "Numéro", "Code Service", "Nom Service", "Prioritaire", "Statut", "Caisse", "Caissier", "Créé Le", "Appelé Le", "Terminé Le"];
  const rows = tickets.map(t => [
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
    t.completedAt || "-"
  ]);

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cofina_togo_export_${agencyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 4 Services SIMPLIFIÉS et pertinents pour la Microfinance à Lomé
export const COFINA_SERVICES = [
  {
    code: 'A',
    name: 'Dépôt & Retrait d\'Espèces',
    description: 'Versements urgents, retraits caisse, dépôts de marché',
    color: '#D3122A',
    avgTimeMin: 3,
    icon: 'Banknote',
    badge: 'Service N°1'
  },
  {
    code: 'B',
    name: 'Épargne & Tontine / Compte',
    description: 'Versements tontine, ouvertures de compte, livrets',
    color: '#2563EB',
    avgTimeMin: 8,
    icon: 'UserPlus',
    badge: 'Épargne'
  },
  {
    code: 'C',
    name: 'Crédit & Microcrédit',
    description: 'Demandes de prêts commerçants, remboursements dossiers',
    color: '#D97706',
    avgTimeMin: 10,
    icon: 'Briefcase',
    badge: 'Financement'
  },
  {
    code: 'V',
    name: 'Service Client & Prioritaire',
    description: 'Mamans commerçantes, VIP, renseignements & réclamations',
    color: '#059669',
    isPriority: true,
    avgTimeMin: 4,
    icon: 'Crown',
    badge: 'Prioritaire'
  }
];

// 4 CAISSES / CAISSIERS
export const INITIAL_AGENTS = [
  { id: 'AGT-01', name: 'Mensah Koffi', defaultCounter: 1, avatar: '👨🏽‍💼', title: 'Caissier 1' },
  { id: 'AGT-02', name: 'Amégadjie Afiwa', defaultCounter: 2, avatar: '👩🏽‍💼', title: 'Caissière 2' },
  { id: 'AGT-03', name: 'Lawani Komlan', defaultCounter: 3, avatar: '👨🏿‍💼', title: 'Caissier 3' },
  { id: 'AGT-04', name: 'Adzoh Kodjo', defaultCounter: 4, avatar: '👨🏽‍💼', title: 'Caissier 4' }
];

export const AGENT_PROFILES_KEY = 'cofina_agent_profiles_v1_togo';

export const getStoredAgentProfiles = () => {
  try {
    const raw = localStorage.getItem(AGENT_PROFILES_KEY);
    if (!raw) return INITIAL_AGENTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_AGENTS;
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

    socket.on('ticket_created', ({ ticket, dailyCounters, tickets }) => {
      const local = getStoredState();
      const newTickets = tickets || [ticket, ...local.tickets.filter(t => t.id !== ticket.id)];
      const newState = {
        ...local,
        dailyCounter: dailyCounters || local.dailyCounter,
        tickets: newTickets
      };
      saveStoredState(newState, false);
      notifySubscribers(newState);
    });

    socket.on('ticket_called', ({ ticket, tickets }) => {
      const local = getStoredState();
      const newTickets = tickets || local.tickets.map(t => t.id === ticket.id ? ticket : t);
      const newState = {
        ...local,
        lastCalledTicket: ticket,
        tickets: newTickets
      };
      saveStoredState(newState, false);
      notifySubscribers(newState);
    });

    socket.on('ticket_updated', ({ ticket, tickets }) => {
      const local = getStoredState();
      const newTickets = tickets || local.tickets.map(t => t.id === ticket.id ? ticket : t);
      const newState = {
        ...local,
        tickets: newTickets
      };
      saveStoredState(newState, false);
      notifySubscribers(newState);
    });

    socket.on('ticket_recalled', ({ ticket, tickets }) => {
      const local = getStoredState();
      const newTickets = tickets || local.tickets.map(t => t.id === ticket.id ? ticket : t);
      const newState = {
        ...local,
        lastCalledTicket: ticket,
        tickets: newTickets
      };
      saveStoredState(newState, false);
      notifySubscribers(newState);
    });

  } catch (e) {
    console.warn('Socket.io connection initialization skipped:', e);
  }
}



// Initial sample seed if storage is empty
const getInitialState = () => {
  const now = new Date();
  const makeTime = (minutesAgo) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

  return {
    currentAgencyId: 'AGC-01',
    agencyName: 'Agence Siège Kodjoviakopé (Lomé)',
    dailyCounter: { A: 8, B: 3, C: 4, V: 2 },
    lastCalledTicket: {
      id: 'seed-called-1',
      ticketNumber: 'A-008',
      serviceCode: 'A',
      serviceName: 'Dépôt & Retrait d\'Espèces',
      counterNumber: 1,
      agentName: 'Mensah Koffi',
      calledAt: makeTime(1),
      status: 'CALLED'
    },
    tickets: [
      {
        id: 'seed-waiting-1',
        ticketNumber: 'V-002',
        serviceCode: 'V',
        serviceName: 'Service Client & Prioritaire',
        priority: true,
        customerPhone: null,
        status: 'WAITING',
        createdAt: makeTime(12),
        calledAt: null,
        completedAt: null
      },
      {
        id: 'seed-waiting-2',
        ticketNumber: 'A-009',
        serviceCode: 'A',
        serviceName: 'Dépôt & Retrait d\'Espèces',
        priority: false,
        customerPhone: null,
        status: 'WAITING',
        createdAt: makeTime(8),
        calledAt: null,
        completedAt: null
      },
      {
        id: 'seed-waiting-3',
        ticketNumber: 'B-004',
        serviceCode: 'B',
        serviceName: 'Épargne & Tontine / Compte',
        priority: false,
        customerPhone: null,
        status: 'WAITING',
        createdAt: makeTime(5),
        calledAt: null,
        completedAt: null
      },
      {
        id: 'seed-called-1',
        ticketNumber: 'A-008',
        serviceCode: 'A',
        serviceName: 'Dépôt & Retrait d\'Espèces',
        counterNumber: 1,
        agentId: 'AGT-01',
        agentName: 'Mensah Koffi',
        status: 'CALLED',
        createdAt: makeTime(15),
        calledAt: makeTime(1),
        completedAt: null
      },
      {
        id: 'seed-inprog-1',
        ticketNumber: 'A-007',
        serviceCode: 'A',
        serviceName: 'Dépôt & Retrait d\'Espèces',
        counterNumber: 2,
        agentId: 'AGT-02',
        agentName: 'Amégadjie Afiwa',
        status: 'IN_PROGRESS',
        createdAt: makeTime(22),
        calledAt: makeTime(8),
        completedAt: null
      }
    ]
  };
};

export const getStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const todayStr = new Date().toISOString().slice(0, 10);
    
    if (!raw) {
      const init = { ...getInitialState(), lastDate: todayStr };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }

    const state = JSON.parse(raw);
    if (!state || !state.tickets || state.tickets.length === 0 || (state.lastDate && state.lastDate !== todayStr)) {
      const init = { ...getInitialState(), lastDate: todayStr };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    return state;
  } catch (e) {
    console.error('Failed to read queue storage:', e);
    return getInitialState();
  }
};

export const saveStoredState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'STATE_UPDATED', payload: state });
    }
  } catch (e) {
    console.error('Failed to save queue storage:', e);
  }
};

// Create a new ticket (From Kiosk - No phone/email required)
export const createTicket = (serviceCode, customerPhone = null, customerEmail = null, lang = 'fr') => {
  const state = getStoredState();
  const service = COFINA_SERVICES.find(s => s.code === serviceCode) || COFINA_SERVICES[0];

  const currentCount = (state.dailyCounter[serviceCode] || 0) + 1;
  const ticketNumber = `${serviceCode}-${String(currentCount).padStart(3, '0')}`;

  const newTicket = {
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    ticketNumber,
    serviceCode,
    serviceName: service.name,
    priority: service.isPriority || false,
    customerPhone: customerPhone ? customerPhone.trim() : null,
    customerEmail: customerEmail ? customerEmail.trim() : null,
    status: 'WAITING',
    counterNumber: null,
    agentId: null,
    agentName: null,
    createdAt: new Date().toISOString(),
    calledAt: null,
    completedAt: null
  };

  const updatedState = {
    ...state,
    dailyCounter: {
      ...state.dailyCounter,
      [serviceCode]: currentCount
    },
    tickets: [newTicket, ...state.tickets]
  };

  saveStoredState(updatedState);
  
  // (Note: Voice synthesis on kiosk creation removed per requirement - voice remains active on teller call)

  return newTicket;
};

// Call Next Ticket (From Teller Workstation - Caisse 1-4)
export const callNextTicket = (agentId, agentName, counterNumber, serviceFilter = 'ALL', lang = 'fr') => {
  const state = getStoredState();
  const waitingTickets = state.tickets.filter(t => t.status === 'WAITING');

  if (waitingTickets.length === 0) {
    return null;
  }

  let eligible = [...waitingTickets];
  if (serviceFilter !== 'ALL') {
    eligible = eligible.filter(t => t.serviceCode === serviceFilter);
  }

  if (eligible.length === 0) {
    return null;
  }

  eligible.sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const ticketToCall = eligible[0];
  const now = new Date().toISOString();

  const updatedTickets = state.tickets.map(t => {
    if (t.id === ticketToCall.id) {
      return {
        ...t,
        status: 'CALLED',
        counterNumber,
        agentId,
        agentName,
        calledAt: now
      };
    }
    return t;
  });

  const calledTicketObj = {
    ...ticketToCall,
    status: 'CALLED',
    counterNumber,
    agentId,
    agentName,
    calledAt: now
  };

  const updatedState = {
    ...state,
    lastCalledTicket: calledTicketObj,
    tickets: updatedTickets
  };

  saveStoredState(updatedState);
  
  // Audio TEMPS 2: Carillon Gong + Annonce vocale "Ticket A-008 à la Caisse 1"
  playCallChime();
  speakTicketCall(calledTicketObj.ticketNumber, counterNumber, lang);

  return calledTicketObj;
};

// Process current ticket if active, then call next ticket
export const processNextTicket = (agentId, agentName, counterNumber, serviceFilter = 'ALL', activeTicketId = null, lang = 'fr') => {
  const state = getStoredState();
  const now = new Date().toISOString();

  let updatedTickets = [...state.tickets];

  // Complete active ticket if exists
  if (activeTicketId) {
    updatedTickets = updatedTickets.map(t => {
      if (t.id === activeTicketId && (t.status === 'CALLED' || t.status === 'IN_PROGRESS')) {
        return {
          ...t,
          status: 'COMPLETED',
          completedAt: now
        };
      }
      return t;
    });
  }

  // Find waiting tickets
  const waitingTickets = updatedTickets.filter(t => t.status === 'WAITING');
  let eligible = [...waitingTickets];
  if (serviceFilter !== 'ALL') {
    eligible = eligible.filter(t => t.serviceCode === serviceFilter);
  }

  if (eligible.length === 0) {
    // Save updated state even if no waiting tickets left
    const updatedState = {
      ...state,
      tickets: updatedTickets
    };
    saveStoredState(updatedState);
    return null;
  }

  eligible.sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const ticketToCall = eligible[0];

  updatedTickets = updatedTickets.map(t => {
    if (t.id === ticketToCall.id) {
      return {
        ...t,
        status: 'CALLED',
        counterNumber,
        agentId,
        agentName,
        calledAt: now
      };
    }
    return t;
  });

  const calledTicketObj = {
    ...ticketToCall,
    status: 'CALLED',
    counterNumber,
    agentId,
    agentName,
    calledAt: now
  };

  const updatedState = {
    ...state,
    lastCalledTicket: calledTicketObj,
    tickets: updatedTickets
  };

  saveStoredState(updatedState);

  playCallChime();
  speakTicketCall(calledTicketObj.ticketNumber, counterNumber, lang);

  return calledTicketObj;
};

// Recall current ticket
export const recallTicket = (ticketId, lang = 'fr') => {
  const state = getStoredState();
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  const updatedState = {
    ...state,
    lastCalledTicket: { ...ticket, calledAt: new Date().toISOString() }
  };
  saveStoredState(updatedState);

  playCallChime();
  speakTicketCall(ticket.ticketNumber, ticket.counterNumber, lang);
};

// Update Ticket Status (IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED)
export const updateTicketStatus = (ticketId, newStatus, extra = {}) => {
  const state = getStoredState();
  const now = new Date().toISOString();

  const updatedTickets = state.tickets.map(t => {
    if (t.id === ticketId) {
      return {
        ...t,
        status: newStatus,
        ...(newStatus === 'COMPLETED' ? { completedAt: now } : {}),
        ...extra
      };
    }
    return t;
  });

  const updatedState = {
    ...state,
    tickets: updatedTickets
  };

  saveStoredState(updatedState);
};

// Reset queue for agency (Admin tool)
export const resetAgencyQueue = () => {
  const state = getStoredState();
  const newState = {
    ...state,
    dailyCounter: { A: 0, B: 0, C: 0, V: 0 },
    lastCalledTicket: null,
    tickets: []
  };
  saveStoredState(newState);
};

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

  } catch (e) {
    console.warn('Audio chime playback omitted:', e);
  }
};

/**
 * AUDIO TEMPS 1: Annonce vocale immédiate lors de la prise du ticket à la borne
 */
export const speakTicketGenerated = (ticketNumber, lang = 'fr') => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const formattedTicket = ticketNumber.replace('-', ' ');
    const isEn = lang === 'en';
    const text = isEn 
      ? `Welcome to Cofina Togo. Your ticket ${formattedTicket} has been created. Please take a seat in the waiting room.`
      : `Bienvenue chez Cofina Togo. Votre ticket ${formattedTicket} est créé. Vous pouvez prendre place dans la salle d'attente.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const targetLang = isEn ? 'en' : 'fr';
    const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(targetLang));
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
    const formattedTicket = ticketNumber.replace('-', ' ');
    const isEn = lang === 'en';
    const text = isEn 
      ? `Ticket ${formattedTicket}, please proceed to Counter ${counterNumber}.`
      : `Ticket ${formattedTicket}, veuillez passer à la Caisse ${counterNumber}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const targetLang = isEn ? 'en' : 'fr';
    const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(targetLang));
    if (matchedVoice) utterance.voice = matchedVoice;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 450);
  } catch (e) {
    console.warn('Speech synthesis TEMPS 2 error:', e);
  }
};
