import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KioskModule from './components/KioskModule';
import DisplayModule from './components/DisplayModule';
import AgentModule from './components/AgentModule';
import AdminModule from './components/AdminModule';
import FloatingTellerWidget from './components/FloatingTellerWidget';
import { 
  getStoredState, 
  saveStoredState, 
  STORAGE_KEY, 
  CHANNEL_NAME, 
  COFINA_AGENCIES,
  subscribeStateChange
} from './services/queueStore';

export default function App() {
  const [activeModule, setActiveModule] = useState('kiosk');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);

  // Standalone popout window detection (?widgetOnly=true)
  const isWidgetOnly = typeof window !== 'undefined' && window.location.search.includes('widgetOnly=true');
  
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
      setStoreState(newState);
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
        <FloatingTellerWidget 
          lang={lang}
          tickets={storeState.tickets || []}
          onlineCounters={storeState.onlineCounters || []}
          agencyName={currentAgency.name}
          onStateChange={() => updateLocalState()}
          isStandalone={true}
        />
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

  const handleSetAgencyId = (id) => {
    const latest = getStoredState();
    const updated = { ...latest, currentAgencyId: id };
    saveStoredState(updated);
    setStoreState(updated);
  };

  return (
    <div className="cofina-app-root">
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

      <main className="main-content-area">
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
      </main>

      {/* GLOBAL FLOATING TELLER WIDGET (ONLY ON AGENT PAGE OR EXPLICITLY SHOWN) */}
      {showFloatingWidget && activeModule === 'agent' && (
        <FloatingTellerWidget 
          lang={lang}
          tickets={storeState.tickets || []}
          onlineCounters={storeState.onlineCounters || []}
          agencyName={currentAgency.name}
          onStateChange={() => updateLocalState()}
        />
      )}

      <footer className="cofina-global-footer">
        <div className="footer-content">
          <div className="footer-left">
            <img src="/COFINA.png" alt="Cofina Logo" className="footer-logo" />
            <span>© 2026 Groupe Cofina — Compagnie Financière Africaine. Tous droits réservés.</span>
          </div>
          <div className="footer-right">
            <span className="footer-tag">SOCLE V1 OPERATIONAL — EDGE LOCAL NETWORK</span>
          </div>
        </div>
      </footer>

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
