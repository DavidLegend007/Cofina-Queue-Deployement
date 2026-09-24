import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  Sparkles,
  Smartphone,
  Building2,
  RefreshCw,
  Star,
  BellRing
} from 'lucide-react';
import { COFINA_SERVICES, playCallChime } from '../services/queueStore';

export default function MobileTicketView({ 
  ticketNumber, 
  tickets = [], 
  agencyName = 'COFINA Togo — Agence Siège Kodjoviakopé',
  lang = 'fr',
  onBackToKiosk = null
}) {
  const [currentLang, setCurrentLang] = useState(lang);
  const [localTickets, setLocalTickets] = useState(tickets);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [satisfaction, setSatisfaction] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const prevStatusRef = useRef(null);

  // Sync tickets prop
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      setLocalTickets(tickets);
    }
  }, [tickets]);

  // Periodic polling fallback to guarantee real-time updates on mobile
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.tickets)) {
            setLocalTickets(data.tickets);
          }
        }
      } catch (e) {}
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3000);
    return () => clearInterval(interval);
  }, []);

  // Find target ticket
  const currentTicket = localTickets.find(t => t.ticketNumber === ticketNumber) || null;

  // Find service config
  const serviceInfo = currentTicket 
    ? (COFINA_SERVICES.find(s => s.code === currentTicket.serviceCode) || {
        name: currentTicket.serviceName || 'Opération Caisse',
        color: '#D3122A',
        badge: 'Service'
      })
    : { name: 'Opération Caisse', color: '#D3122A', badge: 'Service' };

  // Calculate waiting count ahead in the queue
  const waitingTickets = localTickets.filter(t => t.status === 'WAITING');
  let positionAhead = 0;
  if (currentTicket && currentTicket.status === 'WAITING') {
    const myCreatedAt = new Date(currentTicket.createdAt).getTime();
    positionAhead = waitingTickets.filter(t => {
      if (t.id === currentTicket.id) return false;
      const tTime = new Date(t.createdAt).getTime();
      // Priorité d'abord
      if (t.priority && !currentTicket.priority) return true;
      if (!t.priority && currentTicket.priority) return false;
      return tTime < myCreatedAt;
    }).length;
  }

  const estimatedMinutes = Math.max(2, positionAhead * 4);

  // Handle status transition to CALLED -> Trigger notification & sound & vibration
  useEffect(() => {
    if (currentTicket) {
      const currentStatus = currentTicket.status;
      if (prevStatusRef.current && prevStatusRef.current !== 'CALLED' && currentStatus === 'CALLED') {
        if (soundEnabled) {
          playCallChime();
        }
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([400, 200, 400, 200, 600]); } catch (e) {}
        }
      }
      prevStatusRef.current = currentStatus;
    }
  }, [currentTicket, soundEnabled]);

  const isEn = currentLang === 'en';

  return (
    <div className="mobile-ticket-container">
      {/* ── MOBILE APP BAR ── */}
      <header className="mobile-appbar">
        <div className="appbar-brand">
          <img src="/cofina.jpeg" alt="COFINA Logo" className="appbar-logo" />
          <div className="appbar-text">
            <span className="appbar-title">COFINA TOGO</span>
            <span className="appbar-agency">{agencyName}</span>
          </div>
        </div>

        <div className="appbar-actions">
          <button 
            type="button" 
            className="lang-pill"
            onClick={() => setCurrentLang(prev => prev === 'fr' ? 'en' : 'fr')}
          >
            {currentLang.toUpperCase()}
          </button>
          <button 
            type="button" 
            className={`sound-pill ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(prev => !prev)}
            title={soundEnabled ? 'Son activé' : 'Son coupé'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* ── LIVE CONNECTION STATUS PILL ── */}
      <div className="live-status-bar">
        <div className="pulse-indicator">
          <span className="ping-dot"></span>
          <span className="static-dot"></span>
        </div>
        <span className="live-status-text">
          {isEn ? 'LIVE QUEUE SYNCHRONIZED' : 'SUIVI DE FILE EN DIRECT'}
        </span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="mobile-main">
        {!currentTicket ? (
          <div className="mobile-empty-card">
            <AlertCircle size={48} color="#D3122A" style={{ marginBottom: '1rem' }} />
            <h2>{isEn ? 'Ticket not found' : 'Ticket introuvable'}</h2>
            <p>
              {isEn 
                ? `The ticket "${ticketNumber}" could not be found or has expired.` 
                : `Le ticket "${ticketNumber}" n'a pas été trouvé ou a expiré.`}
            </p>
            {onBackToKiosk && (
              <button type="button" className="btn-return" onClick={onBackToKiosk}>
                <ArrowLeft size={18} />
                <span>{isEn ? 'Back to Kiosk' : 'Retour à la Borne'}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── HERO TICKET PASS ── */}
            <div className={`ticket-pass-card status-${currentTicket.status.toLowerCase()}`}>
              <div className="ticket-pass-header">
                <span 
                  className="service-pill"
                  style={{ 
                    backgroundColor: `${serviceInfo.color || '#D3122A'}15`,
                    color: serviceInfo.color || '#D3122A',
                    borderColor: `${serviceInfo.color || '#D3122A'}30`
                  }}
                >
                  {serviceInfo.name}
                </span>

                {currentTicket.priority && (
                  <span className="priority-pill">
                    ★ {isEn ? 'PRIORITY' : 'PRIORITAIRE'}
                  </span>
                )}
              </div>

              <div className="ticket-hero-number">
                <span className="ticket-hero-label">
                  {isEn ? 'YOUR TICKET' : 'VOTRE TICKET'}
                </span>
                <h1 className="ticket-hero-code">{currentTicket.ticketNumber}</h1>
              </div>

              <div className="ticket-pass-divider">
                <div className="cutout-left" />
                <div className="dashed-line" />
                <div className="cutout-right" />
              </div>

              <div className="ticket-pass-footer">
                <div className="pass-meta-item">
                  <Clock size={14} />
                  <span>
                    {isEn ? 'Issued at:' : 'Émis à :'} {new Date(currentTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="pass-meta-item">
                  <Smartphone size={14} />
                  <span>E-Ticket Mobile</span>
                </div>
              </div>
            </div>

            {/* ── STATE-SPECIFIC ACTION BANNER ── */}

            {/* 1. CAS: APPELÉ AU GUICHET (CALLED) */}
            {currentTicket.status === 'CALLED' && (
              <section className="state-card card-called animate-bounce-subtle">
                <div className="called-hero-icon">
                  <BellRing size={36} className="ringing-bell" />
                </div>
                <h2 className="called-title">
                  {isEn ? "IT'S YOUR TURN!" : "C'EST VOTRE TOUR !"}
                </h2>
                <p className="called-subtitle">
                  {isEn 
                    ? 'Please proceed immediately to the counter:' 
                    : 'Veuillez vous présenter immédiatement au :'}
                </p>

                <div className="counter-destination-box">
                  <span className="destination-label">{isEn ? 'COUNTER' : 'GUICHET'}</span>
                  <span className="destination-number">{currentTicket.counterNumber || 1}</span>
                </div>

                {currentTicket.agentName && (
                  <div className="agent-signature">
                    <span>{isEn ? 'Teller:' : 'Caissier :'} <strong>{currentTicket.agentName}</strong></span>
                  </div>
                )}
              </section>
            )}

            {/* 2. CAS: EN ATTENTE (WAITING) */}
            {currentTicket.status === 'WAITING' && (
              <section className="state-card card-waiting">
                <div className="queue-radar">
                  <div className="radar-circle">
                    <span className="radar-count">{positionAhead}</span>
                    <span className="radar-unit">
                      {positionAhead <= 1 
                        ? (isEn ? 'person ahead' : 'personne devant') 
                        : (isEn ? 'people ahead' : 'personnes devant')}
                    </span>
                  </div>
                </div>

                <div className="waiting-info-grid">
                  <div className="info-box">
                    <Clock size={20} className="info-icon" />
                    <div>
                      <span className="info-title">{isEn ? 'Estimated wait' : 'Temps estimé'}</span>
                      <strong className="info-val">~{estimatedMinutes} min</strong>
                    </div>
                  </div>
                  <div className="info-box">
                    <Users size={20} className="info-icon" />
                    <div>
                      <span className="info-title">{isEn ? 'Total in line' : 'Dans la file'}</span>
                      <strong className="info-val">{waitingTickets.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="waiting-advice">
                  <p>
                    {isEn 
                      ? 'You can comfortably take a seat in the lounge. Your phone will alert you automatically when called.' 
                      : 'Vous pouvez vous asseoir en salle d\'attente. Cette page sonnera et vibrera dès que votre numéro sera appelé.'}
                  </p>
                </div>
              </section>
            )}

            {/* 3. CAS: EN TRAITEMENT (IN_PROGRESS) */}
            {currentTicket.status === 'IN_PROGRESS' && (
              <section className="state-card card-in-progress">
                <div className="progress-badge">
                  <Sparkles size={24} />
                  <h3>{isEn ? 'Service in Progress' : 'Traitement en cours'}</h3>
                </div>
                <p>
                  {isEn 
                    ? `You are currently being attended at Counter ${currentTicket.counterNumber || 1}.` 
                    : `Vous êtes actuellement pris en charge au Guichet ${currentTicket.counterNumber || 1}.`}
                </p>
              </section>
            )}

            {/* 4. CAS: TERMINÉ (COMPLETED) */}
            {currentTicket.status === 'COMPLETED' && (
              <section className="state-card card-completed">
                <div className="completed-check">
                  <CheckCircle2 size={44} color="#10B981" />
                </div>
                <h2>{isEn ? 'Service Completed!' : 'Opération Terminée !'}</h2>
                <p>
                  {isEn 
                    ? 'Thank you for choosing COFINA Togo for your financial operations.' 
                    : 'Merci de votre confiance et bonne journée avec COFINA Togo !'}
                </p>

                {/* Rating Widget */}
                <div className="satisfaction-box">
                  <span className="sat-title">
                    {isEn ? 'How was your experience today?' : 'Votre avis sur notre accueil :'}
                  </span>
                  <div className="stars-row">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button" 
                        className={`star-btn ${satisfaction >= star ? 'selected' : ''}`}
                        onClick={() => {
                          setSatisfaction(star);
                          setFeedbackSent(true);
                        }}
                      >
                        <Star size={28} fill={satisfaction >= star ? '#F59E0B' : 'none'} color="#F59E0B" />
                      </button>
                    ))}
                  </div>
                  {feedbackSent && (
                    <span className="feedback-thank">
                      ✓ {isEn ? 'Thank you for your rating!' : 'Merci pour votre note !'}
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* 5. CAS: ABSENT (NO_SHOW) */}
            {currentTicket.status === 'NO_SHOW' && (
              <section className="state-card card-no-show">
                <AlertCircle size={36} color="#DC2626" />
                <h3>{isEn ? 'Ticket Missed' : 'Ticket Marqué Absent'}</h3>
                <p>
                  {isEn 
                    ? 'Your ticket was called but no response was received. Please contact the reception desk.' 
                    : 'Votre numéro a été appelé au guichet sans réponse. Veuillez vous rapprocher de l\'agent d\'accueil.'}
                </p>
              </section>
            )}

            {/* ── FOOTER ACTIONS ── */}
            <div className="mobile-footer-tips">
              <Building2 size={16} />
              <span>{agencyName}</span>
            </div>
          </>
        )}
      </main>

      {/* ── EMBEDDED STYLES ── */}
      <style>{`
        .mobile-ticket-container {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          max-width: 480px;
          margin: 0 auto;
          box-shadow: 0 0 40px rgba(0,0,0,0.06);
          position: relative;
        }

        .mobile-appbar {
          background: #ffffff;
          padding: 0.9rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .appbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .appbar-logo {
          height: 38px;
          width: auto;
          border-radius: 6px;
        }

        .appbar-text {
          display: flex;
          flex-direction: column;
        }

        .appbar-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #D3122A;
          letter-spacing: 0.5px;
        }

        .appbar-agency {
          font-size: 0.72rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .appbar-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lang-pill, .sound-pill {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          padding: 0.35rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .sound-pill.active {
          background: #fee2e2;
          border-color: #fecaca;
          color: #D3122A;
        }

        .live-status-bar {
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.4rem 1rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .pulse-indicator {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ping-dot {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #22c55e;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.75;
        }

        .static-dot {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        .mobile-main {
          flex: 1;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* TICKET PASS CARD */
        .ticket-pass-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          transition: transform 0.2s;
        }

        .ticket-pass-header {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .service-pill {
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid transparent;
        }

        .priority-pill {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
        }

        .ticket-hero-number {
          text-align: center;
          padding: 0.75rem 1rem 1.25rem 1rem;
        }

        .ticket-hero-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #94a3b8;
        }

        .ticket-hero-code {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -1px;
          margin: 0.2rem 0 0 0;
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .ticket-pass-divider {
          display: flex;
          align-items: center;
          position: relative;
          height: 20px;
        }

        .cutout-left, .cutout-right {
          width: 14px;
          height: 24px;
          background: #f8fafc;
          position: absolute;
          z-index: 2;
        }

        .cutout-left {
          left: 0;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
          border: 1px solid #e2e8f0;
          border-left: none;
        }

        .cutout-right {
          right: 0;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
          border: 1px solid #e2e8f0;
          border-right: none;
        }

        .dashed-line {
          width: 100%;
          border-top: 2px dashed #e2e8f0;
          margin: 0 16px;
        }

        .ticket-pass-footer {
          padding: 0.9rem 1.25rem;
          background: #fafafc;
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #64748b;
        }

        .pass-meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* STATE CARDS */
        .state-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem 1.25rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          text-align: center;
        }

        /* 1. CALLED STATE */
        .card-called {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.4);
        }

        .called-hero-icon {
          width: 68px;
          height: 68px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem auto;
        }

        .ringing-bell {
          animation: ring 1s infinite alternate;
        }

        @keyframes ring {
          0% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }

        .called-title {
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0 0 0.25rem 0;
          letter-spacing: 0.5px;
        }

        .called-subtitle {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.9);
          margin: 0 0 1.2rem 0;
        }

        .counter-destination-box {
          background: #ffffff;
          color: #065f46;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }

        .destination-label {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #059669;
        }

        .destination-number {
          font-size: 3.2rem;
          font-weight: 900;
          line-height: 1;
        }

        .agent-signature {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.9);
        }

        /* 2. WAITING STATE */
        .card-waiting {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .queue-radar {
          margin: 0.5rem 0 1.25rem 0;
        }

        .radar-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: #eff6ff;
          border: 4px solid #bfdbfe;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 8px #f0fdf4;
        }

        .radar-count {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1d4ed8;
          line-height: 1;
        }

        .radar-unit {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 0.25rem;
        }

        .waiting-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
          margin-bottom: 1rem;
        }

        .info-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-align: left;
        }

        .info-icon {
          color: #D3122A;
        }

        .info-title {
          display: block;
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 600;
        }

        .info-val {
          font-size: 0.95rem;
          color: #0f172a;
          font-weight: 800;
        }

        .waiting-advice {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.78rem;
          color: #92400e;
          line-height: 1.4;
        }

        /* 3. IN PROGRESS */
        .card-in-progress {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }

        .progress-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #2563eb;
        }

        /* 4. COMPLETED */
        .card-completed {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .completed-check {
          margin-bottom: 0.5rem;
        }

        .satisfaction-box {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px dashed #a7f3d0;
        }

        .sat-title {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
        }

        .stars-row {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.2rem;
          transition: transform 0.15s;
        }

        .star-btn:hover {
          transform: scale(1.15);
        }

        .feedback-thank {
          display: block;
          margin-top: 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #059669;
        }

        /* FOOTER TIPS */
        .mobile-footer-tips {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: #94a3b8;
          padding: 1rem 0;
        }

        .mobile-empty-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem 1.5rem;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .btn-return {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
