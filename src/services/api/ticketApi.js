import { SERVER_URL, COFINA_SERVICES } from '../config/constants';
import { getAuthHeaders, getAdminAuthHeaders } from './authApi';
import { getWeekSaturdayStart, getStoredState, saveStoredState } from '../storage/localStore';

export const createTicket = async (serviceCode, customerPhone = null, customerEmail = null, lang = 'fr') => {
  const service = COFINA_SERVICES.find(s => s.code === serviceCode) || COFINA_SERVICES[0];

  try {
    const res = await fetch(`${SERVER_URL}/api/tickets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNumber: null,
        serviceCode,
        serviceName: service.name,
        isPriority: service.isPriority || false,
        customerPhone,
        customerEmail
      })
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.error('Backend ticket creation failed:', err);
    throw err;
  }
};

export const generateSimulationTickets = async () => {
  await createTicket('PMR');
  await createTicket('D');
  await createTicket('O');
  await createTicket('C');
  await createTicket('R');
};

export const callNextTicket = async (agentId, agentName, counterNumber, serviceFilter = 'ALL', lang = 'fr') => {
  try {
    let headers = await getAuthHeaders();
    let res = await fetch(`${SERVER_URL}/api/tickets/call-next`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ agentId, agentName, counterNumber, serviceFilter })
    });
    
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') localStorage.removeItem('cofina_jwt_token');
      headers = await getAuthHeaders(true);
      res = await fetch(`${SERVER_URL}/api/tickets/call-next`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ agentId, agentName, counterNumber, serviceFilter })
      });
    }

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`API request failed: ${res.status}`);
    }
    
    const calledTicketObj = await res.json();
    return calledTicketObj;
  } catch (err) {
    console.error('callNextTicket failed:', err);
    return null;
  }
};

export const processNextTicket = async (agentId, agentName, counterNumber, serviceFilter = 'ALL', activeTicketId = null, lang = 'fr') => {
  return await callNextTicket(agentId, agentName, counterNumber, serviceFilter, lang);
};

export const recallTicket = async (ticketId, lang = 'fr') => {
  try {
    let headers = await getAuthHeaders();
    let res = await fetch(`${SERVER_URL}/api/tickets/recall`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ticketId })
    });
    
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
    return ticket;
  } catch (err) {
    console.error('recallTicket failed:', err);
    return null;
  }
};

export const updateTicketStatus = async (ticketId, newStatus, extra = {}) => {
  try {
    let headers = await getAuthHeaders();
    let res = await fetch(`${SERVER_URL}/api/tickets/update-status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ticketId, status: newStatus, extra })
    });
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

export const resetWeeklyAgencyQueue = async () => {
  try {
    const headers = await getAdminAuthHeaders();
    const response = await fetch(`${SERVER_URL}/api/tickets/weekly-archive`, {
      method: 'POST',
      headers
    });
    const data = await response.json();
    const archiveRecord = data.archive;

    await fetch(`${SERVER_URL}/api/tickets/reset-all`, {
      method: 'POST',
      headers
    });

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

export const resetAgencyQueue = resetWeeklyAgencyQueue;
