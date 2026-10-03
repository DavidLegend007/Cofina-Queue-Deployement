import { io } from 'socket.io-client';
import { SERVER_URL } from '../config/constants';
import { getStoredState, saveStoredState, notifySubscribers } from '../storage/localStore';

let socket = null;

if (typeof window !== 'undefined') {
  try {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'], // WebSocket prioritaire (latence < 5ms)
      upgrade: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 500,
      timeout: 5000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ Connecté au Serveur Edge Local COFINA (WebSocket Ultra-Rapide):', SERVER_URL);
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
        : [ticket, ...existingTickets.filter(t => t && t.id !== ticket.id)];
      const newState = {
        ...local,
        lastCalledTicket: ticket,
        tickets: newTickets
      };
      saveStoredState(newState, true);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ticket_called_audio', { detail: { ticket } }));
      }
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
        : [ticket, ...existingTickets.filter(t => t && t.id !== ticket.id)];
      const newState = {
        ...local,
        lastCalledTicket: ticket,
        tickets: newTickets
      };
      saveStoredState(newState, true);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ticket_called_audio', { detail: { ticket } }));
      }
    });

    socket.on('ticket_scanned', ({ ticketNumber, id }) => {
      console.log('📱 Ticket scanné sur mobile :', ticketNumber);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ticket_scanned', { detail: { ticketNumber, id } }));
      }
    });

    socket.on('tunnel_url_updated', ({ publicUrl }) => {
      console.log('🌐 Passerelle 4G/5G Cloudflare active :', publicUrl);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tunnel_url_updated', { detail: { publicUrl } }));
      }
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

export { socket };
