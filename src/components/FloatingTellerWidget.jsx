import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Play, 
  Volume2, 
  UserX, 
  CheckCircle,
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Layers, 
  Clock, 
  Sparkles, 
  X, 
  Building2,
  RefreshCw,
  Check,
  Search,
  CreditCard,
  DollarSign,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { 
  processNextTicket,
  generateSimulationTickets,
  recallTicket, 
  updateTicketStatus, 
  getStoredAgentProfiles,
  toggleCounterStatus
} from '../services/queueStore';
import { translations } from '../services/translations';

export default function FloatingTellerWidget({ 
  lang = 'fr', 
  tickets = [], 
  onlineCounters = [],
  agencyName = 'Agence Siège Kodjoviakopé',
  onStateChange = () => {},
  isStandalone = false
}) {
  const t = translations[lang] || translations.fr;

  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSimulatedBanking, setShowSimulatedBanking] = useState(false);

  const handlePopoutWindow = () => {
    const popoutUrl = `${window.location.origin}${window.location.pathname}?widgetOnly=true`;
    const popup = window.open(
      popoutUrl,
      'CofinaTellerWidget',
      'width=360,height=420,resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no'
    );
    if (popup) {
      popup.focus();
    }
  };
  
  // Active teller and counter state
  const profiles = getStoredAgentProfiles();
  const [selectedAgentId, setSelectedAgentId] = useState(profiles[0]?.id || 'AGT-01');
  const [counterNumber, setCounterNumber] = useState(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [searchAccount, setSearchAccount] = useState('30004958201');

  const selectedAgent = profiles.find(p => p.id === selectedAgentId) || profiles[0];

  // Find active ticket currently CALLED or IN_PROGRESS for this counter
  const activeTicketCandidates = tickets.filter(
    tk => tk.counterNumber === counterNumber && (tk.status === 'CALLED' || tk.status === 'IN_PROGRESS')
  );
  activeTicketCandidates.sort((a, b) => {
    const timeA = new Date(a.calledAt || a.startedAt || a.createdAt).getTime();
    const timeB = new Date(b.calledAt || b.startedAt || b.createdAt).getTime();
    return timeB - timeA;
  });
  const activeTicket = activeTicketCandidates[0] || null;

  const waitingTickets = tickets.filter(tk => tk.status === 'WAITING');
  
  const isOnline = onlineCounters.includes(counterNumber);

  const handleToggleOnline = () => {
    toggleCounterStatus(counterNumber, !isOnline);
    onStateChange();
  };

  // Service timer
  useEffect(() => {
    let interval = null;
    if (activeTicket && (activeTicket.calledAt || activeTicket.createdAt)) {
      const startTime = new Date(activeTicket.calledAt || activeTicket.createdAt).getTime();
      interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setElapsedSec(diff);
      }, 1000);
    } else {
      setElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTicket]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCallNext = () => {
    processNextTicket(
      selectedAgent.id,
      selectedAgent.name,
      counterNumber,
      'ALL',
      activeTicket?.id || null,
      lang
    );
    onStateChange();
  };

  const handleRecall = () => {
    if (activeTicket) {
      recallTicket(activeTicket.id, lang);
    }
  };

  const handleNoShow = async () => {
    if (activeTicket) {
      await updateTicketStatus(activeTicket.id, 'NO_SHOW');
      onStateChange();
      await handleCallNext();
    }
  };

  const handleStartProcessing = () => {
    if (activeTicket) {
      updateTicketStatus(activeTicket.id, 'IN_PROGRESS');
      onStateChange();
    }
  };

  const handleComplete = () => {
    if (activeTicket) {
      updateTicketStatus(activeTicket.id, 'COMPLETED');
      onStateChange();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── SIMULATED BANKING CORE SOFTWARE OVERLAY BACKGROUND ── */}
      {showSimulatedBanking && (
        <div className="sim-banking-screen-overlay animate-fadeIn">
          <div className="sim-banking-header">
            <div className="sim-bank-brand">
              <Building2 size={20} className="sim-bank-icon" />
              <span>AMPLITUDE CORE BANKING V6.4 — COFINA TOGO EDGE</span>
            </div>
            <div className="sim-bank-user">
              <span>AGENCE : {agencyName.toUpperCase()}</span>
              <span className="sim-divider">|</span>
              <span>UTILISATEUR : {selectedAgent.name} (CAISSE {counterNumber})</span>
              <button 
                className="sim-close-btn"
                onClick={() => setShowSimulatedBanking(false)}
              >
                <X size={16} /> {t.widgetExitBankingApp}
              </button>
            </div>
          </div>

          <div className="sim-banking-body">
            <div className="sim-bank-sidebar">
              <div className="sim-side-item active"><CreditCard size={16} /> Operations Guichet</div>
              <div className="sim-side-item"><DollarSign size={16} /> Versement / Dépôt</div>
              <div className="sim-side-item"><Briefcase size={16} /> Consultation Compte</div>
              <div className="sim-side-item"><Clock size={16} /> Journal Caisse</div>
            </div>

            <div className="sim-bank-main">
              <div className="sim-card">
                <h3>{t.widgetBankingSoftwareTitle}</h3>
                <p className="sim-sub">{t.widgetBankingOverlayDesc}</p>

                <div className="sim-form-group">
                  <label>{t.widgetBankingAccountInput}</label>
                  <div className="sim-input-row">
                    <input 
                      type="text" 
                      value={searchAccount} 
                      onChange={(e) => setSearchAccount(e.target.value)}
                      className="sim-input"
                    />
                    <button className="sim-search-btn">
                      <Search size={16} /> {t.widgetBankingAccountSearch}
                    </button>
                  </div>
                </div>

                <div className="sim-account-details">
                  <div className="sim-stat-box">
                    <span>TITULAIRE</span>
                    <strong>KOFFI EKOUE Mensah</strong>
                  </div>
                  <div className="sim-stat-box">
                    <span>TYPE DE COMPTE</span>
                    <strong>Compte Épargne Tontine Pro</strong>
                  </div>
                  <div className="sim-stat-box">
                    <span>SOLDE DISPONIBLE</span>
                    <strong className="text-green">1 850 000 FCFA</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING OVERLAY WIDGET CONTAINER ── */}
      <div className={`cofina-floating-widget ${isMinimized ? 'widget-minimized' : ''} ${showSimulatedBanking ? 'widget-banking-overlay' : ''}`}>
        
        {/* WIDGET HEADER / DRAG BAR */}
        <div className="widget-header">
          <div className="widget-hdr-left">
            <div className="widget-icon-wrap">
              <Layers size={16} />
            </div>
            <div>
              <div className="widget-title-text">{t.widgetTitle}</div>
              <div className="widget-sub-text">
                Caisse {counterNumber} • {selectedAgent.name}
              </div>
            </div>
          </div>

          <div className="widget-hdr-controls">
            {!isStandalone && (
              <button 
                className="widget-control-btn popout-btn"
                onClick={handlePopoutWindow}
                title="Détacher en fenêtre Bureau indépendante (Toujours accessible même si la page est réduite)"
                style={{ background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.4)' }}
              >
                <ExternalLink size={14} />
              </button>
            )}

            <button 
              className="widget-sim-toggle-btn"
              onClick={() => setShowSimulatedBanking(!showSimulatedBanking)}
              title={t.widgetSimulateBankingApp}
            >
              <Monitor size={14} />
            </button>

            <button 
              className="widget-control-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Agrandir" : "Réduire"}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>

            <button 
              className="widget-control-btn close-btn"
              onClick={() => setIsOpen(false)}
              title="Masquer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* MINIMIZED COMPACT SUMMARY BAR */}
        {isMinimized ? (
          <div className="widget-compact-body" onClick={() => setIsMinimized(false)}>
            <div className="compact-ticket-badge">
              <span className="compact-lbl">{t.widgetActiveTicket} :</span>
              <strong className="compact-num">{activeTicket ? activeTicket.ticketNumber : '-'}</strong>
            </div>

            <div className="compact-wait-pill">
              <span className="wait-dot"></span>
              <span>{waitingTickets.length} {t.widgetWaitingBadge}</span>
            </div>

            <button 
              className="compact-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleCallNext();
              }}
            >
              <Play size={14} /> {t.widgetBtnNext}
            </button>
          </div>
        ) : (
          /* FULL EXPANDED WIDGET CARD */
          <div className="widget-content-body">
            
            {/* COUNTER & AGENT QUICK SELECTOR */}
            <div className="widget-config-row">
              <div className="widget-select-group">
                <label>Guichet :</label>
                <select 
                  value={counterNumber} 
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setCounterNumber(num);
                    const ag = profiles.find(p => p.defaultCounter === num) || profiles[0];
                    if (ag) setSelectedAgentId(ag.id);
                  }}
                  className="widget-select"
                >
                  <option value={1}>Caisse 1</option>
                  <option value={2}>Caisse 2</option>
                  <option value={3}>Caisse 3</option>
                  <option value={4}>Caisse 4</option>
                </select>
              </div>

              <button 
                type="button" 
                className={`widget-btn-toggle ${isOnline ? 'online' : 'offline'}`}
                onClick={handleToggleOnline}
                title="Basculer le statut de la Caisse (Ouverte / Fermée)"
              >
                <div className={`status-dot ${isOnline ? 'dot-online' : 'dot-offline'}`}></div>
                <span>{isOnline ? 'Ouverte' : 'Fermée'}</span>
              </button>

              <div className="widget-waiting-badge">
                <span className="pulse-indicator"></span>
                <span><strong>{waitingTickets.length}</strong> {t.agentWaitingCount}</span>
              </div>
            </div>

            {/* ACTIVE TICKET CARD */}
            <div className={`widget-ticket-card ${activeTicket ? 'card-has-ticket' : 'card-empty'}`}>
              {activeTicket ? (
                <>
                  <div className="widget-ticket-top">
                    <span className="ticket-status-pill">{activeTicket.status === 'CALLED' ? t.displayStatusCalled : t.displayStatusServing}</span>
                    {activeTicket.priority && (
                      <span className="priority-pill">★ {t.agentPriorityBadge}</span>
                    )}
                  </div>

                  <div className="widget-ticket-num">{activeTicket.ticketNumber}</div>
                  <div className="widget-ticket-service">{activeTicket.serviceName}</div>

                  <div className="widget-timer-row">
                    <Clock size={14} className="timer-icon" />
                    <span>{t.agentTimerLabel} :</span>
                    <strong className="timer-val">{formatTimer(elapsedSec)}</strong>
                  </div>
                </>
              ) : (
                <div className="widget-empty-msg">
                  <p><strong>{t.widgetNoTicket}</strong></p>
                  <span className="sub">{t.agentClickCallNext}</span>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS BUTTONS GRID */}
            <div className="widget-actions-grid">
              <button 
                className="widget-btn btn-call-next"
                onClick={handleCallNext}
              >
                <Play size={16} />
                <span>{t.widgetBtnNext}</span>
              </button>

              <button 
                className="widget-btn btn-recall"
                onClick={handleRecall}
                disabled={!activeTicket}
              >
                <Volume2 size={16} />
                <span>{t.widgetBtnRecall}</span>
              </button>

              <button 
                className="widget-btn btn-absent"
                onClick={handleNoShow}
                disabled={!activeTicket}
              >
                <UserX size={16} />
                <span>Absent</span>
              </button>

              {activeTicket && activeTicket.status === 'CALLED' && (
                <button 
                  className="widget-btn btn-processing"
                  onClick={handleStartProcessing}
                  style={{ gridColumn: 'span 2' }}
                >
                  <Clock size={16} />
                  <span>Démarrer le Traitement</span>
                </button>
              )}

              {activeTicket && activeTicket.status === 'IN_PROGRESS' && (
                <button 
                  className="widget-btn btn-complete"
                  onClick={handleComplete}
                  style={{ gridColumn: 'span 2' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Terminer le Service</span>
                </button>
              )}
            </div>

            {/* FOOTER METIER DEMO TIP */}
            <div className="widget-footer-hint">
              <Sparkles size={13} />
              <span>{t.agentWidgetNotice}</span>
            </div>

          </div>
        )}

      </div>

      {/* ── STYLES PREMUM WIDGET FLOTTANT ── */}
      <style>{`
        .cofina-floating-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 380px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08);
          z-index: 9999;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cofina-floating-widget.widget-minimized {
          width: 320px;
        }

        .cofina-floating-widget.widget-banking-overlay {
          box-shadow: 0 0 0 4px #D3122A, 0 30px 60px rgba(0, 0, 0, 0.35);
        }

        /* HEADER */
        .widget-header {
          background: #0F172A;
          color: #FFFFFF;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #D3122A;
        }

        .widget-hdr-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .widget-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #D3122A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .widget-title-text {
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #FFFFFF;
        }

        .widget-sub-text {
          font-size: 0.68rem;
          color: #94A3B8;
        }

        .widget-hdr-controls {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .widget-control-btn, .widget-sim-toggle-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .widget-sim-toggle-btn {
          background: #D3122A;
          color: #FFFFFF;
        }

        .widget-control-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }

        .widget-control-btn.close-btn:hover {
          background: #EF4444;
          color: #FFFFFF;
        }

        /* MINIMIZED BODY */
        .widget-compact-body {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          cursor: pointer;
          background: #F8FAFC;
        }

        .compact-ticket-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
        }

        .compact-num {
          color: #D3122A;
          font-size: 1.05rem;
          font-weight: 900;
        }

        .compact-wait-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 0.25rem 0.55rem;
          border-radius: 99px;
        }

        .wait-dot {
          width: 6px;
          height: 6px;
          background: #10B981;
          border-radius: 50%;
        }

        .compact-next-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: #0F172A;
          color: #FFFFFF;
          border: none;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }

        /* CONTENT BODY EXPANDED - ULTRA COMPACT & SLIM */
        .widget-content-body {
          padding: 0.65rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          background: #FFFFFF;
        }

        .widget-config-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .widget-select-group {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #475569;
          font-weight: 700;
        }

        .widget-select {
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
          border: 1.5px solid #CBD5E1;
          font-size: 0.75rem;
          font-weight: 800;
          color: #0F172A;
          outline: none;
        }

        .widget-btn-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.5rem;
          border-radius: 99px;
          border: 1px solid transparent;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .widget-btn-toggle.online {
          background: #ECFDF5;
          color: #059669;
          border-color: #A7F3D0;
        }

        .widget-btn-toggle.offline {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FECACA;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot-online {
          background: #10B981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .dot-offline {
          background: #EF4444;
        }

        .widget-waiting-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: #FFF5F5;
          color: #D3122A;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          border: 1px solid #FEE2E2;
        }

        .pulse-indicator {
          width: 5px;
          height: 5px;
          background: #D3122A;
          border-radius: 50%;
          animation: pulseFast 1s infinite;
        }

        @keyframes pulseFast {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        /* ACTIVE TICKET CARD */
        .widget-ticket-card {
          border-radius: 10px;
          padding: 0.5rem 0.65rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .widget-ticket-card.card-has-ticket {
          background: linear-gradient(135deg, #FFF5F5 0%, #FEF2F2 100%);
          border: 1.5px solid #FCA5A5;
        }

        .widget-ticket-card.card-empty {
          background: #F8FAFC;
          border: 1.5px dashed #CBD5E1;
          color: #64748B;
          padding: 0.4rem;
        }

        .widget-ticket-top {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 0.15rem;
        }

        .ticket-status-pill {
          background: #D3122A;
          color: #FFFFFF;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.1rem 0.4rem;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .priority-pill {
          background: #D97706;
          color: #FFFFFF;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.1rem 0.4rem;
          border-radius: 99px;
        }

        .widget-ticket-num {
          font-size: 1.6rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0.1rem 0;
        }

        .widget-ticket-service {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .widget-timer-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          margin-top: 0.25rem;
          font-size: 0.7rem;
          color: #64748B;
        }

        .timer-val {
          font-family: monospace;
          font-size: 0.85rem;
          color: #D3122A;
          font-weight: 900;
        }

        .widget-empty-msg p {
          margin: 0;
          font-size: 0.82rem;
          color: #334155;
        }

        .widget-empty-msg .sub {
          font-size: 0.68rem;
          color: #94A3B8;
        }

        /* ACTIONS GRID */
        .widget-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
        }

        .widget-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          padding: 0.45rem 0.4rem;
          border-radius: 8px;
          border: none;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-call-next {
          grid-column: span 2;
          background: #D3122A;
          color: #FFFFFF;
          font-size: 0.82rem;
          box-shadow: 0 3px 8px rgba(211, 18, 42, 0.2);
        }

        .btn-call-next:hover {
          background: #B91C1C;
        }

        .btn-processing {
          grid-column: span 2;
          background: #E0F2FE;
          color: #0284C7;
          border: 1px solid #BAE6FD;
        }

        .btn-processing:hover:not(:disabled) {
          background: #BAE6FD;
        }

        .btn-recall {
          background: #F1F5F9;
          color: #334155;
          border: 1px solid #CBD5E1;
        }

        .btn-recall:hover:not(:disabled) {
          background: #E2E8F0;
          color: #0F172A;
        }

        .btn-noshow {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FCA5A5;
        }

        .btn-noshow:hover:not(:disabled) {
          background: #FEE2E2;
        }

        .btn-complete {
          grid-column: span 2;
          background: #0F172A;
          color: #FFFFFF;
        }

        .btn-complete:hover:not(:disabled) {
          background: #1E293B;
        }

        .widget-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .widget-footer-hint {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #F8FAFC;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          font-size: 0.68rem;
          color: #64748B;
          line-height: 1.2;
        }

        /* ── SIMULATED BANKING CORE SOFTWARE OVERLAY SCREEN ── */
        .sim-banking-screen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #090D16;
          z-index: 9990;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          color: #E2E8F0;
        }

        .sim-banking-header {
          background: #0F172A;
          border-bottom: 1px solid #1E293B;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sim-bank-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 900;
          color: #38BDF8;
          font-size: 0.95rem;
        }

        .sim-bank-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #94A3B8;
        }

        .sim-divider {
          color: #334155;
        }

        .sim-close-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #D3122A;
          color: #FFFFFF;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }

        .sim-banking-body {
          flex: 1;
          display: flex;
        }

        .sim-bank-sidebar {
          width: 240px;
          background: #0F172A;
          border-right: 1px solid #1E293B;
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .sim-side-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          color: #94A3B8;
          cursor: pointer;
        }

        .sim-side-item.active {
          background: #0369A1;
          color: #FFFFFF;
          font-weight: 800;
        }

        .sim-bank-main {
          flex: 1;
          padding: 2rem;
          background: #0B1120;
        }

        .sim-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 16px;
          padding: 1.5rem;
          max-width: 800px;
        }

        .sim-card h3 {
          margin: 0 0 0.25rem 0;
          color: #F8FAFC;
          font-size: 1.1rem;
        }

        .sim-sub {
          margin: 0 0 1.5rem 0;
          font-size: 0.82rem;
          color: #64748B;
        }

        .sim-form-group label {
          display: block;
          font-size: 0.78rem;
          color: #94A3B8;
          margin-bottom: 0.4rem;
          font-weight: 700;
        }

        .sim-input-row {
          display: flex;
          gap: 0.5rem;
        }

        .sim-input {
          flex: 1;
          background: #020617;
          border: 1px solid #334155;
          color: #F8FAFC;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
        }

        .sim-search-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #0284C7;
          color: #FFFFFF;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
        }

        .sim-account-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #1E293B;
        }

        .sim-stat-box {
          background: #020617;
          padding: 0.85rem;
          border-radius: 10px;
          border: 1px solid #1E293B;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sim-stat-box span {
          font-size: 0.68rem;
          color: #64748B;
          font-weight: 800;
        }

        .sim-stat-box strong {
          font-size: 0.95rem;
          color: #F8FAFC;
        }

        .text-green {
          color: #10B981 !important;
        }
      `}</style>
    </>
  );
}
