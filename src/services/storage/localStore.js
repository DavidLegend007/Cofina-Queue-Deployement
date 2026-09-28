import { STORAGE_KEY, INITIAL_AGENTS, AGENT_PROFILES_KEY } from '../config/constants';

// BroadcastChannel instance
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('cofina_queue_sync_v1_togo');
}

export const getStoredAgentProfiles = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(AGENT_PROFILES_KEY) : null;
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
      if (typeof window !== 'undefined') localStorage.setItem(AGENT_PROFILES_KEY, JSON.stringify(merged));
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
    if (typeof window !== 'undefined') localStorage.setItem(AGENT_PROFILES_KEY, JSON.stringify(newProfiles));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'PROFILES_UPDATED', payload: newProfiles });
    }
    return newProfiles;
  } catch (e) {
    console.error('Failed to save agent profile:', e);
    return getStoredAgentProfiles();
  }
};

const getInitialState = () => {
  return {
    currentAgencyId: 'AGC-01',
    agencyName: 'Agence Siège Kodjoviakopé',
    dailyCounter: { D: 0, R: 0, O: 0, E: 0, C: 0, M: 0, S: 0, H: 0 },
    onlineCounters: [1],
    lastCalledTicket: null,
    tickets: []
  };
};

export const getWeekCycleStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day + 6) % 7;
  const mon = new Date(now);
  mon.setDate(now.getDate() - diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon.toISOString().slice(0, 10);
};

export const getWeekSaturdayStart = getWeekCycleStart;

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

let stateSubscribers = [];

export const subscribeStateChange = (callback) => {
  stateSubscribers.push(callback);
  return () => {
    stateSubscribers = stateSubscribers.filter(cb => cb !== callback);
  };
};

export const notifySubscribers = (state) => {
  stateSubscribers.forEach(cb => {
    try { cb(state); } catch (e) {}
  });
};

export const saveStoredState = (state, notify = true) => {
  try {
    const safeTickets = Array.isArray(state.tickets) ? state.tickets : (currentMemoryState?.tickets || []);
    currentMemoryState = {
      ...currentMemoryState,
      ...state,
      tickets: safeTickets
    };

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

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentAgencyId: state.currentAgencyId,
      agencyName: state.agencyName,
      lastWeekStart: state.lastWeekStart,
      onlineCounters,
      archivedWeeks: state.archivedWeeks || []
    }));
  }

  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'COUNTER_STATUS_CHANGED',
      payload: { onlineCounters }
    });
  }

  notifySubscribers({ _partialUpdate: true, onlineCounters });
};
