import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';

// Lazy loading heavy modules
const KioskModule = lazy(() => import('./components/KioskModule'));
const DisplayModule = lazy(() => import('./components/DisplayModule'));
const AgentModule = lazy(() => import('./components/AgentModule'));
const AdminModule = lazy(() => import('./components/AdminModule'));
const FloatingTellerWidget = lazy(() => import('./components/FloatingTellerWidget'));
const MobileTicketView = lazy(() => import('./components/MobileTicketView'));
import { 
  getStoredState, 
  saveStoredState, 
  STORAGE_KEY, 
  CHANNEL_NAME, 
  COFINA_AGENCIES,
  subscribeStateChange
} from './services/queueStore';

export default function App() {
  // Parse URL search parameters for dedicated hardware boot (Borne, Écran TV, Agent, etc.)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const isWidgetOnly = urlParams.has('widgetOnly') || urlParams.get('mode') === 'widget';
  const isKioskOnly = urlParams.has('kioskOnly') || urlParams.has('kiosk') || urlParams.get('mode') === 'kiosk';
  const isDisplayOnly = urlParams.has('displayOnly') || urlParams.has('display') || urlParams.get('mode') === 'display';
  const isAgentOnly = urlParams.has('agentOnly') || urlParams.has('agent') || urlParams.get('mode') === 'agent';
  const isAdminOnly = urlParams.has('adminOnly') || urlParams.has('admin') || urlParams.get('mode') === 'admin';

  // Hide Navbar & Footer for clean hardware screens (Kiosk will now keep the Navbar as requested)
  const hideNav = urlParams.has('hideNav') || urlParams.has('clean') || isDisplayOnly;

  const [activeModule, setActiveModule] = useState(() => {
    if (isDisplayOnly) return 'display';
    if (isAgentOnly) return 'agent';
    if (isAdminOnly) return 'admin';
    if (isKioskOnly) return 'kiosk';
    return 'kiosk';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);

  
  // Persisted language state ('fr' | 'en')
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('cofina_lang_v1') || 'fr';
    } catch (e) {
      return 'fr';
    }
  });

  const handleSetLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('cofina_lang_v1', newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const [storeState, setStoreState] = useState(() => getStoredState());

  const agencyId = storeState.currentAgencyId || 'AGC-01';
  const currentAgency = COFINA_AGENCIES.find(a => a.id === agencyId) || COFINA_AGENCIES[0];

  const updateLocalState = () => {
    const latest = getStoredState();
    setStoreState(latest);
  };

  // Synchronize across multi-tabs and LAN Socket.io in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        updateLocalState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Subscribe to real-time Socket.io state changes
    const unsubscribeSocket = subscribeStateChange((newState) => {
      setStoreState(prev => {
        // If this is a partial metadata update (e.g. counter status toggle),
        // merge into existing state to preserve tickets from Socket.io.
        if (newState._partialUpdate) {
          return { ...prev, ...newState, _partialUpdate: undefined };
        }
        // Full state update: preserve lastCalledTicket across reconnects.
        const lastCalled = newState.lastCalledTicket
          || (newState.tickets || []).find(t => t.status === 'CALLED')
          || prev.lastCalledTicket
          || null;
        // Also preserve tickets if the new state has none (metadata-only path)
        const tickets = (newState.tickets && newState.tickets.length > 0)
          ? newState.tickets
          : (prev.tickets || []);
        return { ...newState, tickets, lastCalledTicket: lastCalled };
      });
    });

    // BroadcastChannel listener
    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATED') {
          setStoreState(event.data.payload);
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeSocket();
      if (channel) channel.close();
    };
  }, []);

  // ── STANDALONE POP-OUT WIDGET VIEW (INDEPENDENT WINDOW FOR TELLERS) ──
  if (isWidgetOnly) {
    return (
      <div className="cofina-standalone-widget-root">
        <Suspense fallback={<div style={{ color: 'white' }}>Chargement du widget...</div>}>
          <FloatingTellerWidget 
            lang={lang}
            tickets={storeState.tickets || []}
            onlineCounters={storeState.onlineCounters || []}
            agencyName={currentAgency.name}
            onStateChange={() => updateLocalState()}
            isStandalone={true}
          />
        </Suspense>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #090d16 !important;
            overflow: auto !important;
            height: 100%;
          }
          .cofina-standalone-widget-root {
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 0.5rem;
            box-sizing: border-box;
            background: #090d16;
          }
          .cofina-standalone-widget-root .cofina-floating-widget {
            position: relative !important;
            bottom: auto !important;
            right: auto !important;
            width: 100% !important;
            max-width: 440px !important;
            box-shadow: none !important;
            margin: 0 auto;
          }
        `}</style>
      </div>
    );
  }

  // ── MOBILE DIGITAL TICKET VIEW (WHEN CLIENT SCANS QR CODE) ──
  const ticketParam = urlParams.get('ticket') 
    || urlParams.get('q') 
    || (typeof window !== 'undefined' && window.location.pathname.startsWith('/q/') 
        ? window.location.pathname.replace('/q/', '').trim() 
        : null);

  if (ticketParam) {
    return (
      <Suspense fallback={<div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Chargement du ticket...</div>}>
        <MobileTicketView 
          ticketNumber={ticketParam}
          tickets={storeState.tickets || []}
          agencyName={currentAgency.name}
          lang={lang}
          onBackToKiosk={() => {
            if (typeof window !== 'undefined') window.location.href = '/?kiosk';
          }}
        />
      </Suspense>
    );
  }

  const handleSetAgencyId = (id) => {
    const latest = getStoredState();
    const updated = { ...latest, currentAgencyId: id };
    saveStoredState(updated);
    setStoreState(updated);
  };

  return (
    <div className="cofina-app-root">
      {!hideNav && (
        <Navbar 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          currentAgencyId={agencyId}
          setAgencyId={handleSetAgencyId}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          lang={lang}
          setLang={handleSetLang}
          showFloatingWidget={showFloatingWidget}
          setShowFloatingWidget={setShowFloatingWidget}
        />
      )}

      <main className="main-content-area" style={{ paddingBottom: hideNav ? '0' : '2rem' }}>
        <Suspense fallback={<div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Chargement du module...</div>}>
          {activeModule === 'kiosk' && (
            <KioskModule 
              agencyName={currentAgency.name}
              onTicketGenerated={() => updateLocalState()}
              lang={lang}
            />
          )}

          {activeModule === 'display' && (
            <DisplayModule 
              agencyName={currentAgency.name}
              tickets={storeState.tickets || []}
              lastCalledTicket={storeState.lastCalledTicket}
              lang={lang}
            />
          )}

          {activeModule === 'agent' && (
            <AgentModule 
              agencyName={currentAgency.name}
              tickets={storeState.tickets || []}
              onlineCounters={storeState.onlineCounters || []}
              lang={lang}
            />
          )}

          {activeModule === 'admin' && (
            <AdminModule 
              agencyName={currentAgency.name}
              tickets={storeState.tickets || []}
              onRefresh={() => updateLocalState()}
              lang={lang}
            />
          )}
        </Suspense>
      </main>

      {/* GLOBAL FLOATING TELLER WIDGET (ONLY ON AGENT PAGE OR EXPLICITLY SHOWN) */}
      {showFloatingWidget && activeModule === 'agent' && (
        <Suspense fallback={null}>
          <FloatingTellerWidget 
            lang={lang}
            tickets={storeState.tickets || []}
            onlineCounters={storeState.onlineCounters || []}
            agencyName={currentAgency.name}
            onStateChange={() => updateLocalState()}
          />
        </Suspense>
      )}

      {!hideNav && (
        <footer className="cofina-global-footer">
          <div className="footer-content">
            <div className="footer-left">
              <img src="/cofina.jpeg" alt="Cofina Logo" className="footer-logo" />
              <span>© 2026 Groupe Cofina — Compagnie Financière Africaine. Tous droits réservés.</span>
            </div>
            <div className="footer-right">
              <span className="footer-tag">SOCLE V1 OPERATIONAL — EDGE LOCAL NETWORK</span>
            </div>
          </div>
        </footer>
      )}

      <style>{`
        .cofina-app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content-area {
          flex: 1;
          padding-bottom: 2rem;
        }

        .cofina-global-footer {
          background: #1a1c1d;
          color: rgba(255, 255, 255, 0.7);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem 0;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .footer-logo {
          height: 24px;
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }

        .footer-tag {
          background: rgba(214, 0, 50, 0.2);
          color: #ff6b81;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
