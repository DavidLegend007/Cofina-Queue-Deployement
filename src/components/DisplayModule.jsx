import React from 'react';
import { 
  Volume2, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Tv, 
  CheckCircle2, 
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { translations } from '../services/translations';
import { COFINA_SERVICES } from '../services/queueStore';
import { playCallChime, speakTicketCall, unlockAudio } from '../services/utils/audioHelpers';

// URL du serveur (même origine que la page TV)
const SERVER_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : 'http://localhost:4000';

export default function DisplayModule({ agencyName, tickets: ticketsFromProps, lastCalledTicket: lastCalledFromProps, lang = 'fr' }) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [isAudioUnlocked, setIsAudioUnlocked] = React.useState(false);

  // ── État local indépendant du WebSocket (filet de sécurité pour Zeus) ──────
  // Le DisplayModule gère ses propres tickets en les récupérant directement
  // depuis l'API HTTP toutes les 5 secondes. Si le WebSocket fonctionne bien,
  // les props sont aussi utilisées (merge). Résultat : toujours à jour.
  const [localTickets, setLocalTickets] = React.useState(ticketsFromProps || []);
  const [localLastCalled, setLocalLastCalled] = React.useState(lastCalledFromProps || null);
  const [wsConnected, setWsConnected] = React.useState(true);
  const lastCalledIdRef = React.useRef(null);

  // Synchroniser depuis les props WebSocket quand elles changent
  React.useEffect(() => {
    if (ticketsFromProps && ticketsFromProps.length > 0) {
      setLocalTickets(ticketsFromProps);
      setWsConnected(true);
    }
  }, [ticketsFromProps]);

  React.useEffect(() => {
    if (lastCalledFromProps) {
      setLocalLastCalled(lastCalledFromProps);
    }
  }, [lastCalledFromProps]);

  // ── Polling HTTP direct toutes les 5s (filet de sécurité Zeus) ───────────
  // Indépendant du WebSocket : fetch l'état depuis le serveur directement.
  // Déclenche le son si un nouveau ticket est appelé pendant que WS était KO.
  React.useEffect(() => {
    let isMounted = true;
    let consecutiveFails = 0;

    const fetchState = async () => {
      try {
        const res = await fetch(`${SERVER_BASE}/api/tickets/today-state`, {
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;

        consecutiveFails = 0;
        setWsConnected(true);

        const freshTickets = Array.isArray(data.tickets) ? data.tickets : [];
        setLocalTickets(freshTickets);

        // Détecter un nouveau ticket appelé (mode secours si WebSocket déconnecté)
        const called = freshTickets.find(t => t.status === 'CALLED') || null;
        if (called) {
          if (!wsConnected && called.id !== lastCalledIdRef.current) {
            lastCalledIdRef.current = called.id;
            setLocalLastCalled(called);
            speakTicketCall(called.ticketNumber, called.counterNumber, lang);
          } else {
            lastCalledIdRef.current = called.id;
            setLocalLastCalled(called);
          }
        }
      } catch (e) {
        consecutiveFails++;
        if (consecutiveFails >= 2) setWsConnected(false);
      }
    };

    // Premier fetch immédiat
    fetchState();
    // Polling toutes les 5 secondes
    const interval = setInterval(fetchState, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [lang, wsConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const handleAudio = (e) => {
      const { ticket } = e.detail;
      if (ticket) {
        lastCalledIdRef.current = ticket.id;
        speakTicketCall(ticket.ticketNumber, ticket.counterNumber, lang);
      }
    };
    window.addEventListener('ticket_called_audio', handleAudio);
    return () => window.removeEventListener('ticket_called_audio', handleAudio);
  }, [lang]);

  // Déblocage universel dès la moindre interaction (clic, touche, pointer)
  const handleUnlock = React.useCallback(() => {
    unlockAudio();
    setIsAudioUnlocked(true);
  }, []);

  React.useEffect(() => {
    window.addEventListener('click', handleUnlock);
    window.addEventListener('pointerdown', handleUnlock);
    window.addEventListener('touchstart', handleUnlock);
    window.addEventListener('keydown', handleUnlock);
    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, [handleUnlock]);

  // ── Filtrage strict de la journée : ne jamais afficher les tickets d'hier ──
  const isTodayTicket = React.useCallback((t) => {
    if (!t) return false;
    if (!t.createdAt) return true;
    const d = new Date(t.createdAt);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  }, []);

  // Données finales : filtrées pour ne garder que la journée en cours
  const tickets = React.useMemo(() => {
    return (localTickets || []).filter(isTodayTicket);
  }, [localTickets, isTodayTicket]);

  const lastCalledTicket = React.useMemo(() => {
    return (localLastCalled && isTodayTicket(localLastCalled)) ? localLastCalled : null;
  }, [localLastCalled, isTodayTicket]);

  const t = translations[lang] || translations.fr;
  const activeTickets = tickets.filter(t => t.status === 'CALLED' || t.status === 'IN_PROGRESS');
  const waitingTickets = tickets.filter(t => t.status === 'WAITING')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


  return (
    <div className="disp-root animate-fade-in">
      {/* ── BANDEAU D'ACTIVATION AUDIO EN CAS DE RECHARGEMENT PUR DU NAVIGATEUR ── */}
      {!isAudioUnlocked && (
        <div 
          className="disp-audio-unlock-banner"
          onClick={() => {
            handleUnlock();
            speakTicketCall('A-01', '1', lang);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999999,
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)',
            letterSpacing: '0.5px'
          }}
          title="Cliquez pour autoriser le son et la synthèse vocale sur ce navigateur"
        >
          <Volume2 size={24} className="audio-icon-pulse" />
          <span>🔊 CLIQUEZ UNE FOIS SUR L'ÉCRAN POUR ACTIVER LE SON ET LA VOIX DE LA TV</span>
          <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.25)', padding: '4px 10px', borderRadius: '12px' }}>
            Requis après chaque rechargement
          </span>
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header className="disp-header">
        <div className="disp-hdr-left">
          <div className="disp-logo-box">
            <img src="/cofina.jpeg" alt="Cofina Logo" className="disp-logo-img" />
          </div>
          <div className="disp-hdr-title">
            <h1 className="disp-agency">{agencyName}</h1>
            <span className="disp-sub">{t.displayTitle}</span>
          </div>
        </div>

        <div className="disp-hdr-right">
          <div 
            className="disp-badge disp-badge-audio"
            onClick={() => {
              handleUnlock();
              speakTicketCall('A-01', '1', lang);
            }}
            style={{ 
              cursor: 'pointer',
              backgroundColor: isAudioUnlocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.2)',
              borderColor: isAudioUnlocked ? '#22c55e' : '#ef4444',
              color: isAudioUnlocked ? '#22c55e' : '#fca5a5'
            }}
            title="Cliquer pour tester le carillon et la voix sur la TV"
          >
            <Volume2 size={15} className="audio-icon-pulse" />
            <span>{isAudioUnlocked ? t.soundActive : "Activer le Son (Cliquer)"}</span>
          </div>
          <div className="disp-clock">
            {currentTime.toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      {/* ── MAIN SPOTLIGHT BANNER (LAST CALLED) ── */}
      {lastCalledTicket ? (
        <section className="disp-hero-call animate-scale-up">
          <div className="disp-call-left">
            <span className="disp-call-badge">
              <Sparkles size={14} /> {t.displayNowCalling}
            </span>
            <div className="disp-call-ticket">{lastCalledTicket.ticketNumber}</div>
            <div className="disp-call-service">{lastCalledTicket.serviceName}</div>
          </div>

          <div className="disp-call-arrow">
            <ArrowRight size={38} />
          </div>

          <div className="disp-call-right">
            <span className="disp-call-dest-lbl">{t.displayGoToCounter}</span>
            <div className="disp-call-counter">{t.displayCounter} {lastCalledTicket.counterNumber}</div>
            <div className="disp-call-agent">Caissier : {lastCalledTicket.agentName || 'Agent Cofina'}</div>
          </div>
        </section>
      ) : (
        <section className="disp-hero-empty">
          <div className="disp-empty-icon"><Tv size={26} /></div>
          <div className="disp-empty-txt">
            <h2>EN ATTENTE D'UN NOUVEL APPEL</h2>
            <p>Veuillez vous installer en salle d'attente. Votre numéro sera annoncé à l'écran.</p>
          </div>
        </section>
      )}

      {/* ── 2 COLUMNS GRID (TAKES EXACT REMAINING HEIGHT) ── */}
      <main className="disp-grid">

        {/* LEFT: 6 POSTES EN DIRECT (3 Caisses, 2 Opérateurs, 1 Accueil) */}
        <section className="disp-col-main">
          <div className="disp-sec-bar">
            <div className="disp-sec-title">
              <h2>POSTES EN SERVICE</h2>
              <span className="disp-pulse-green">● EN DIRECT</span>
            </div>
            <span className="disp-sec-sub">Guichets 1 à 6 (Caisses • Opérateurs • Accueil)</span>
          </div>

          <div className="disp-counters-grid">
            {[
              { num: 1, name: 'Caisse 1', pole: 'Espèces' },
              { num: 2, name: 'Caisse 2', pole: 'Espèces' },
              { num: 3, name: 'Caisse 3', pole: 'Chèques' },
              { num: 4, name: 'Opérateur 1', pole: 'Comptes' },
              { num: 5, name: 'Opérateur 2', pole: 'Crédit' },
              { num: 6, name: 'Accueil', pole: 'Orientation' },
            ].map(poste => {
              const cur = activeTickets.find(t => t.counterNumber === poste.num);
              return (
                <div key={poste.num} className={`disp-caisse-card ${cur ? 'active-caisse' : 'idle-caisse'}`}>
                  <div className="caisse-top">
                    <span className="caisse-num-badge">G{poste.num} • {poste.name.toUpperCase()}</span>
                    {cur ? (
                      <span className="caisse-status-dot">En traitement</span>
                    ) : (
                      <span className="caisse-pole-tag">{poste.pole}</span>
                    )}
                  </div>

                  {cur ? (
                    <div className="caisse-body">
                      <div className="caisse-ticket">{cur.ticketNumber}</div>
                      <div className="caisse-service">{cur.serviceName}</div>
                    </div>
                  ) : (
                    <div className="caisse-idle-body">
                      <span>Disponible</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: FILE D'ATTENTE AVEC BADGES TICKET HORIZONTAUX ÉLÉGANTS */}
        <aside className="disp-col-side">
          <div className="disp-sec-bar">
            <div className="disp-sec-title">
              <h2>FILE D'ATTENTE</h2>
            </div>
            <span className="disp-count-chip">
              <Users size={13} /> {waitingTickets.length} en attente
            </span>
          </div>

          <div className="disp-services-list">
            {waitingTickets.slice(0, 5).map((ticket, idx) => {
              const svcConfig = COFINA_SERVICES.find(s => s.code === ticket.serviceCode) || { color: '#0284C7' };
              return (
                <div key={ticket.id} className="disp-svc-row">
                  <div className="disp-svc-info">
                    {/* BADGE TICKET HORIZONTAL (SANS AUCUN RETOUR À LA LIGNE) */}
                    <div 
                      className="disp-svc-badge" 
                      style={{ 
                        backgroundColor: svcConfig.color,
                        boxShadow: `0 3px 10px ${svcConfig.color}40`
                      }}
                    >
                      {ticket.ticketNumber}
                    </div>

                    <div className="disp-svc-names">
                      <span className="disp-svc-name">{ticket.serviceName}</span>
                      <span className="disp-svc-time">
                        <Clock size={12} /> Reçu à {new Date(ticket.createdAt).toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <span className="disp-svc-status-pill">
                    {idx === 0 ? 'Prochain' : `${idx + 1}ᵉ`}
                  </span>
                </div>
              );
            })}

            {waitingTickets.length === 0 && (
              <div className="disp-svc-empty">
                Aucun ticket en attente
              </div>
            )}

            {waitingTickets.length > 5 && (
              <div className="disp-svc-more">
                + {waitingTickets.length - 5} autres ticket(s)
              </div>
            )}
          </div>

          {/* RÉCEMMENT TRAITÉS */}
          <div className="disp-completed-box">
            <div className="disp-comp-hdr">Derniers tickets servis</div>
            <div className="disp-comp-chips">
              {tickets.filter(t => t.status === 'COMPLETED').slice(0, 4).map(t => (
                <span key={t.id} className="disp-chip-done">
                  <CheckCircle2 size={12} /> {t.ticketNumber}
                </span>
              ))}
              {tickets.filter(t => t.status === 'COMPLETED').length === 0 && (
                <span className="disp-chip-none">Aucun ticket encore clôturé</span>
              )}
            </div>
          </div>
        </aside>

      </main>

      {/* ── FOOTER TICKER (TOUJOURS VISIBLE SANS SCROLLER) ── */}
      <footer className="disp-footer">
        <div className="disp-foot-tag">INFORMATION AGENT</div>
        <div className="disp-foot-marquee">
          <marquee scrollamount="5">
            Cher Client, N'attendez plus, créez votre alias PI-SPI Cofina ! Simple, rapide et sécurisé. Suivez les étapes: https://bit.ly/4baN7O 0. Assistance au 92686060. • Bienvenue chez COFINA Togo • Pour vos dépôts, retraits et ouvertures de compte, nos caisses vous accueillent • Pensez à préparer votre pièce d'identité
          </marquee>
        </div>
      </footer>

      {/* ── STYLES TV ZERO-SCROLL CALIBRÉS 100vh ── */}
      <style>{`
        .disp-root {
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background: #F8FAFC;
          color: #0F172A;
          padding: 0.75rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          box-sizing: border-box;
        }

        /* HEADER COMPACT */
        .disp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          padding: 0.45rem 1.25rem;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          flex-shrink: 0;
        }

        .disp-hdr-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .disp-logo-box {
          background: #FFF5F5;
          padding: 0.25rem 0.65rem;
          border-radius: 10px;
          border: 1px solid #FEE2E2;
          display: flex;
          align-items: center;
        }

        .disp-logo-img {
          height: 32px;
          width: auto;
          object-fit: contain;
        }

        .disp-hdr-title {
          display: flex;
          flex-direction: column;
        }

        .disp-agency {
          font-size: 1.15rem;
          font-weight: 900;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .disp-sub {
          font-size: 0.72rem;
          font-weight: 800;
          color: #D3122A;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .disp-hdr-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .disp-badge-audio {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #FFF5F5;
          border: 1px solid #FECACA;
          color: #D3122A;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
        }

        .audio-icon-pulse {
          animation: pulseRed 1.2s infinite alternate;
        }

        @keyframes pulseRed {
          from { opacity: 0.5; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1.1); }
        }

        .disp-clock {
          font-family: monospace;
          font-size: 1.55rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        /* HERO SPOTLIGHT BANNER COMPACT & IMPACTANT */
        .disp-hero-call {
          background: linear-gradient(135deg, #D3122A 0%, #B90E23 100%);
          border-radius: 16px;
          padding: 0.65rem 1.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
          box-shadow: 0 10px 24px rgba(211, 18, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        .disp-call-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          margin-bottom: 0.15rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .disp-call-ticket {
          font-size: 3.4rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
        }

        .disp-call-service {
          font-size: 1.05rem;
          font-weight: 700;
          opacity: 0.95;
          margin-top: 0.15rem;
        }

        .disp-call-arrow {
          animation: slideArrow 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255, 255, 255, 0.9);
        }

        @keyframes slideArrow {
          from { transform: translateX(-8px); }
          to { transform: translateX(8px); }
        }

        .disp-call-right {
          text-align: right;
        }

        .disp-call-dest-lbl {
          font-size: 0.75rem;
          font-weight: 800;
          opacity: 0.9;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .disp-call-counter {
          font-size: 2.8rem;
          font-weight: 900;
          line-height: 1;
          margin-top: 0.1rem;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
        }

        .disp-call-agent {
          font-size: 0.88rem;
          opacity: 0.92;
          margin-top: 0.2rem;
          font-weight: 600;
        }

        .disp-hero-empty {
          background: #FFFFFF;
          border: 1.5px dashed #CBD5E1;
          border-radius: 16px;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .disp-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #FFF5F5;
          color: #D3122A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .disp-empty-txt h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.15rem;
        }

        .disp-empty-txt p {
          font-size: 0.82rem;
          color: #64748B;
          margin: 0;
        }

        /* GRID LAYOUT ZERO OVERFLOW (FLEX 1) */
        .disp-grid {
          display: grid;
          grid-template-columns: 2.15fr 1fr;
          gap: 1rem;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .disp-sec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.45rem;
          padding-bottom: 0.35rem;
          border-bottom: 2px solid #E2E8F0;
          flex-shrink: 0;
        }

        .disp-sec-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .disp-sec-title h2 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .disp-pulse-green {
          font-size: 0.72rem;
          font-weight: 800;
          color: #10B981;
        }

        .disp-sec-sub {
          font-size: 0.75rem;
          color: #94A3B8;
          font-weight: 600;
        }

        /* CAISSES & POSTES GRID */
        .disp-col-main {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .disp-counters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 0.65rem;
          flex: 1;
          min-height: 0;
        }

        .disp-caisse-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 0.65rem 0.9rem;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 0;
          overflow: hidden;
        }

        .disp-caisse-card.active-caisse {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 6px 18px rgba(211, 18, 42, 0.12);
        }

        .caisse-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .caisse-num-badge {
          font-size: 0.78rem;
          font-weight: 900;
          color: #D3122A;
          letter-spacing: 0.04em;
        }

        .caisse-status-dot {
          font-size: 0.68rem;
          font-weight: 800;
          background: #DEF7EC;
          color: #03543F;
          border: 1px solid #A7F3D0;
          padding: 0.15rem 0.55rem;
          border-radius: 99px;
        }

        .caisse-pole-tag {
          font-size: 0.68rem;
          color: #94A3B8;
          font-weight: 700;
        }

        .caisse-body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          min-height: 0;
        }

        .caisse-ticket {
          font-size: 2.3rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1.1;
          margin: 0.2rem 0 0.1rem;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .caisse-service {
          font-size: 0.78rem;
          color: #64748B;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .caisse-idle-body {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #94A3B8;
          font-size: 0.88rem;
          font-weight: 700;
          background: #F8FAFC;
          border-radius: 10px;
          border: 1px dashed #CBD5E1;
          margin-top: 0.3rem;
        }

        /* SIDEBAR FILE D'ATTENTE AVEC BOUTONS/BADGES HORIZONTAUX ÉLÉGANTS */
        .disp-col-side {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 0.75rem 1rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .disp-count-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
        }

        .disp-services-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .disp-svc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.75rem;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }

        .disp-svc-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        /* BADGE TICKET HORIZONTAL (TI-004 EN UNE SEULE LIGNE) */
        .disp-svc-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 86px;
          height: 38px;
          padding: 0 0.65rem;
          border-radius: 9px;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 1.22rem;
          letter-spacing: 0.04em;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: monospace, var(--font-body, 'Inter', sans-serif);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
        }

        .disp-svc-names {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .disp-svc-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0F172A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .disp-svc-time {
          font-size: 0.72rem;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }

        .disp-svc-status-pill {
          font-size: 0.72rem;
          font-weight: 800;
          color: #1E293B;
          background: #E2E8F0;
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .disp-svc-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
          padding: 1.5rem 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .disp-svc-more {
          text-align: center;
          color: #94A3B8;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0;
        }

        /* RECENTLY COMPLETED */
        .disp-completed-box {
          margin-top: auto;
          padding-top: 0.45rem;
          border-top: 1px solid #E2E8F0;
          flex-shrink: 0;
        }

        .disp-comp-hdr {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
          letter-spacing: 0.05em;
        }

        .disp-comp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .disp-chip-done {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #DEF7EC;
          color: #03543F;
          border: 1px solid #A7F3D0;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.18rem 0.55rem;
          border-radius: 6px;
        }

        .disp-chip-none {
          font-size: 0.75rem;
          color: #CBD5E1;
        }

        /* FOOTER TICKER (TOUJOURS VISIBLE SANS SCROLL) */
        .disp-footer {
          display: flex;
          align-items: center;
          background: #0F172A;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          height: 36px;
          min-height: 36px;
          flex-shrink: 0;
        }

        .disp-foot-tag {
          background: #D3122A;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.75rem;
          padding: 0 1rem;
          height: 100%;
          display: flex;
          align-items: center;
          white-space: nowrap;
          letter-spacing: 0.05em;
        }

        .disp-foot-marquee {
          flex: 1;
          color: #F8FAFC;
          font-size: 0.85rem;
          font-weight: 600;
          padding-right: 1rem;
          display: flex;
          align-items: center;
        }

        @media (max-width: 900px) {
          .disp-grid { grid-template-columns: 1fr; }
          .disp-counters-grid { grid-template-columns: 1fr; }
          .disp-root { padding: 0.5rem; height: auto; max-height: none; overflow: auto; }
        }
      `}</style>
    </div>
  );
}
