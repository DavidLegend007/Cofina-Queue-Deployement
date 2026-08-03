import React, { useState, useEffect } from 'react';
import { 
  User, 
  Megaphone, 
  RotateCw, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Layers, 
  FileDown, 
  Edit3, 
  X, 
  Check, 
  Users, 
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { 
  INITIAL_AGENTS,
  getStoredAgentProfiles, 
  saveAgentProfile,
  COFINA_SERVICES, 
  recallTicket, 
  processNextTicket,
  updateTicketStatus,
  exportAgencyDataCSV 
} from '../services/queueStore';
import { translations } from '../services/translations';
import ProfilePage from './ProfilePage';

export default function AgentModule({ agencyName, tickets, lang = 'fr' }) {
  const t = translations[lang] || translations.fr;
  // Agent profiles list from stored state
  const [agentsList, setAgentsList] = useState(() => getStoredAgentProfiles());
  const [selectedAgentId, setSelectedAgentId] = useState(agentsList[0]?.id || 'AGT-01');
  const [counterNumber, setCounterNumber] = useState(1);
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('SERVED'); // 'SERVED' or 'WAITING'
  const [serviceDurationSec, setServiceDurationSec] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horloge temps réel avec secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Profile Full Page State
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const selectedAgent = agentsList.find(a => a.id === selectedAgentId) || agentsList[0];

  // Sync current agent default counter when changing agent
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    const ag = agentsList.find(a => a.id === agentId);
    if (ag) {
      setCounterNumber(ag.defaultCounter || 1);
    }
  };

  // Sync active ticket for this agent & counter
  useEffect(() => {
    const activeForMe = tickets.find(
      t => (t.agentId === selectedAgent.id || t.counterNumber === counterNumber) && 
           (t.status === 'CALLED' || t.status === 'IN_PROGRESS')
    );
    setCurrentTicket(activeForMe || null);
  }, [tickets, selectedAgent, counterNumber]);

  // Service timer for current ticket
  useEffect(() => {
    let interval = null;
    if (currentTicket) {
      interval = setInterval(() => {
        setServiceDurationSec(prev => prev + 1);
      }, 1000);
    } else {
      setServiceDurationSec(0);
    }
    return () => clearInterval(interval);
  }, [currentTicket]);

  // Filtered ticket lists
  const waitingTickets = tickets.filter(t => {
    if (t.status !== 'WAITING') return false;
    if (serviceFilter !== 'ALL' && t.serviceCode !== serviceFilter) return false;
    return true;
  });

  const servedTicketsToday = tickets.filter(t => 
    t.status === 'COMPLETED' && (t.agentId === selectedAgent.id || t.counterNumber === counterNumber)
  ).sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

  // ACTION: Suivant
  const handleSuivant = () => {
    const nextTicket = processNextTicket(
      selectedAgent.id,
      selectedAgent.name,
      counterNumber,
      serviceFilter,
      currentTicket?.id || null,
      lang
    );
    setCurrentTicket(nextTicket);
  };

  // ACTION: Rappeler
  const handleRappeler = () => {
    if (currentTicket) {
      recallTicket(currentTicket.id, lang);
    }
  };

  // ACTION: Marquer Absent (No Show)
  const handleNoShow = () => {
    if (currentTicket) {
      updateTicketStatus(currentTicket.id, 'NO_SHOW');
      setCurrentTicket(null);
    }
  };

  // Open profile page
  const openProfileModal = () => {
    setIsProfilePageOpen(true);
  };

  // Refresh agent list after profile save
  const handleProfileClose = () => {
    setIsProfilePageOpen(false);
    setAgentsList(getStoredAgentProfiles());
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTimeStr = currentTime.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  return (
    <div className="agent-container">
      {/* Top Header Bar with Realtime Clock */}
      <header className="cashier-topbar glass-card">
        <div className="agent-identity">
          <div className="agent-avatar-circle">
            {selectedAgent.photoUrl ? (
              <img src={selectedAgent.photoUrl} alt={selectedAgent.name} className="agent-avatar-img-top" />
            ) : (
              <span>{selectedAgent.avatar || '👨🏽‍💼'}</span>
            )}
          </div>
          <div className="agent-details">
            <div className="agent-switcher">
              <select 
                value={selectedAgentId}
                onChange={(e) => handleSelectAgent(e.target.value)}
                className="agent-switcher-select"
              >
                {agentsList.map(a => (
                  <option key={a.id} value={a.id}>{a.name} — ({a.title || `Guichet ${a.defaultCounter}`})</option>
                ))}
              </select>
            </div>
            <span className="agency-location-tag">📍 {agencyName}</span>
          </div>
        </div>

        {/* Counter Selection */}
        <div className="counter-picker">
          <span className="picker-label">Guichet Affecté :</span>
          <div className="counter-pills">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                className={`counter-pill ${counterNumber === num ? 'active' : ''}`}
                onClick={() => setCounterNumber(num)}
              >
                Caisse {num}
              </button>
            ))}
          </div>
        </div>

        {/* Clock with Seconds & Profile Button */}
        <div className="topbar-actions">
          <div className="agent-clock-badge">
            <Clock size={15} />
            <span className="agent-clock-time">{formattedTimeStr}</span>
          </div>

          <button 
            type="button"
            className="btn-profile-edit"
            onClick={openProfileModal}
          >
            <Edit3 size={16} /> Mon Profil
          </button>

          <button 
            type="button"
            className="btn-export-csv"
            onClick={() => exportAgencyDataCSV(tickets, agencyName)}
            title="Exporter l'historique de la journée au format CSV"
          >
            <FileDown size={16} /> Export CSV
          </button>
        </div>
      </header>

      {/* Main Workstation Grid */}
      <div className="cashier-grid">
        {/* Left Column: Streamlined Active Ticket Workspace */}
        <main className="active-client-panel glass-card">
          {currentTicket ? (
            <div className="current-client-card">
              <div className="client-card-header">
                <div className="live-status-pill">
                  <span className="pulse-dot"></span>
                  CLIENT EN CAISSE
                </div>
                <div className="guichet-badge">
                  GUICHET {counterNumber}
                </div>
              </div>

              <div className="client-hero">
                <span className="service-name-tag">{currentTicket.serviceName}</span>
                <h1 className="active-number">{currentTicket.ticketNumber}</h1>

                <div className="timer-badge">
                  <Clock size={16} />
                  <span>Durée : <strong>{formatTimer(serviceDurationSec)}</strong></span>
                </div>
              </div>

              {/* Simplified Action Buttons Row */}
              <div className="simplified-actions-bar">
                <button
                  type="button"
                  className="btn-action btn-recall"
                  onClick={handleRappeler}
                >
                  <RotateCw size={22} />
                  <span>Rappeler</span>
                </button>

                <button
                  type="button"
                  className="btn-action btn-next-primary"
                  onClick={handleSuivant}
                >
                  <span>Suivant</span>
                  <ArrowRight size={26} />
                </button>
              </div>

              {/* Minimal secondary action */}
              <div className="secondary-options">
                <button 
                  type="button" 
                  className="btn-no-show"
                  onClick={handleNoShow}
                >
                  Client Absent (No Show)
                </button>
              </div>
            </div>
          ) : (
            <div className="idle-workspace">
              <div className="idle-hero-icon">
                <Sparkles size={48} className="cofina-red-icn" />
              </div>
              <h2>Guichet {counterNumber} Disponible</h2>
              <p>
                {waitingTickets.length > 0
                  ? `Il y a ${waitingTickets.length} client(s) en attente.`
                  : "Aucun client en attente pour le moment."}
              </p>

              <button
                type="button"
                className="btn-call-first-big"
                onClick={handleSuivant}
                disabled={waitingTickets.length === 0}
              >
                <span>Appeler Client Suivant</span>
                <ArrowRight size={24} />
              </button>
            </div>
          )}
        </main>

        {/* Right Column: Queue Sidebar */}
        <aside className="queue-sidebar-panel glass-card">
          <div className="filter-services-bar">
            <span className="sidebar-title">
              <Filter size={16} /> Filtrer par Service :
            </span>
            <div className="filter-chips">
              <button
                type="button"
                className={`filter-chip ${serviceFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setServiceFilter('ALL')}
              >
                Tous
              </button>
              {COFINA_SERVICES.map(svc => (
                <button
                  key={svc.code}
                  type="button"
                  className={`filter-chip ${serviceFilter === svc.code ? 'active' : ''}`}
                  onClick={() => setServiceFilter(svc.code)}
                >
                  {svc.code}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation (Served Today vs Waiting) */}
          <div className="sidebar-tabs-nav">
            <button
              type="button"
              className={`sidebar-tab ${activeTab === 'SERVED' ? 'active' : ''}`}
              onClick={() => setActiveTab('SERVED')}
            >
              <span>Servis Aujourd'hui</span>
              <span className="tab-count-badge">{servedTicketsToday.length}</span>
            </button>

            <button
              type="button"
              className={`sidebar-tab ${activeTab === 'WAITING' ? 'active' : ''}`}
              onClick={() => setActiveTab('WAITING')}
            >
              <span>En Attente</span>
              <span className="tab-count-badge badge-amber">{waitingTickets.length}</span>
            </button>
          </div>

          {/* List Content */}
          <div className="tickets-scroll-container">
            {activeTab === 'SERVED' ? (
              <div className="tickets-list">
                {servedTicketsToday.map(ticket => (
                  <div key={ticket.id} className="ticket-item-row completed-row">
                    <div className="row-left">
                      <span className="ticket-code-chip">{ticket.ticketNumber}</span>
                      <div className="row-details">
                        <span className="row-service-name">{ticket.serviceName}</span>
                        <span className="row-time-stamp">
                          Clôturé à {new Date(ticket.completedAt || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className="status-done-tag">
                      <CheckCircle2 size={14} /> Servis
                    </span>
                  </div>
                ))}
                {servedTicketsToday.length === 0 && (
                  <div className="empty-state">
                    <CheckCircle2 size={32} />
                    <p>Aucun ticket encore clôturé aujourd'hui</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="tickets-list">
                {waitingTickets.map(ticket => (
                  <div key={ticket.id} className="ticket-item-row waiting-row">
                    <div className="row-left">
                      <span className="ticket-code-chip waiting-chip">{ticket.ticketNumber}</span>
                      <div className="row-details">
                        <span className="row-service-name">{ticket.serviceName}</span>
                        <span className="row-time-stamp">
                          Reçu à {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className="status-wait-tag">En attente</span>
                  </div>
                ))}
                {waitingTickets.length === 0 && (
                  <div className="empty-state">
                    <Clock size={32} />
                    <p>Aucun ticket en attente</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Full Profile Page (slide-in panel) */}
      {isProfilePageOpen && (
        <ProfilePage
          agentId={selectedAgent.id}
          agencyName={agencyName}
          tickets={tickets}
          onClose={handleProfileClose}
        />
      )}

      {/* Styled CSS */}
      <style>{`
        .agent-container {
          max-width: 1400px;
          margin: 1.5rem auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        .cashier-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-radius: var(--radius-lg);
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
        }

        .agent-identity {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .agent-avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #FFF5F5;
          border: 2px solid #D3122A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          overflow: hidden;
        }

        .agent-avatar-img-top {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .agent-details {
          display: flex;
          flex-direction: column;
        }

        .agent-switcher-select {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          border: none;
          background: transparent;
          cursor: pointer;
          outline: none;
        }

        .agency-location-tag {
          font-size: 0.78rem;
          color: #64748B;
          font-weight: 600;
        }

        .counter-picker {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .picker-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748B;
        }

        .counter-pills {
          display: flex;
          gap: 0.4rem;
        }

        .counter-pill {
          padding: 0.45rem 0.9rem;
          border-radius: 99px;
          border: 1px solid #CBD5E1;
          background: #F8FAFC;
          color: #475569;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .counter-pill.active {
          background: #0F172A;
          color: #FFFFFF;
          border-color: #0F172A;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .agent-clock-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          padding: 0.45rem 0.85rem;
          border-radius: 12px;
          color: #D3122A;
        }

        .agent-clock-time {
          font-family: monospace;
          font-weight: 900;
          font-size: 0.95rem;
          color: #0F172A;
        }

        .btn-profile-edit {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #FFF5F5;
          color: #D3122A;
          border: 1px solid #FECACA;
          font-weight: 800;
          font-size: 0.82rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-profile-edit:hover {
          background: #D3122A;
          color: #FFFFFF;
        }

        .btn-export-csv {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #F8FAFC;
          color: #475569;
          border: 1px solid #CBD5E1;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
        }

        .cashier-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 1.5rem;
        }

        .glass-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          padding: 1.75rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .active-client-panel {
          min-height: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .current-client-card {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .client-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #DEF7EC;
          color: #03543F;
          font-weight: 800;
          font-size: 0.78rem;
          padding: 0.4rem 0.85rem;
          border-radius: 99px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
        }

        .guichet-badge {
          background: #0F172A;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.82rem;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
        }

        .client-hero {
          text-align: center;
          padding: 1rem 0;
        }

        .service-name-tag {
          font-size: 1.1rem;
          font-weight: 700;
          color: #64748B;
        }

        .active-number {
          font-size: 5.5rem;
          font-weight: 900;
          color: #D3122A;
          line-height: 1;
          margin: 0.5rem 0;
          letter-spacing: -0.03em;
        }

        .timer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #F1F5F9;
          padding: 0.45rem 1rem;
          border-radius: 99px;
          font-size: 0.9rem;
          color: #334155;
        }

        .simplified-actions-bar {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
        }

        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.1rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-recall {
          background: #F1F5F9;
          color: #334155;
        }

        .btn-recall:hover {
          background: #E2E8F0;
        }

        .btn-next-primary {
          background: linear-gradient(135deg, #D3122A, #B90E23);
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(211, 18, 42, 0.35);
        }

        .btn-next-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(211, 18, 42, 0.45);
        }

        .secondary-options {
          text-align: center;
        }

        .btn-no-show {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .btn-no-show:hover { color: #DC2626; }

        .idle-workspace {
          text-align: center;
          padding: 3rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .idle-hero-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #FFF5F5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-call-first-big {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #D3122A, #B90E23);
          color: #FFFFFF;
          border: none;
          border-radius: 14px;
          padding: 1.1rem 2rem;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(211, 18, 42, 0.35);
        }

        .btn-call-first-big:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .queue-sidebar-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .filter-services-bar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .filter-chips {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          font-size: 0.78rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }

        .filter-chip.active {
          background: #0F172A;
          color: #FFFFFF;
          border-color: #0F172A;
        }

        .sidebar-tabs-nav {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: #F1F5F9;
          padding: 0.3rem;
          border-radius: 12px;
        }

        .sidebar-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          border-radius: 9px;
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 0.82rem;
          color: #64748B;
          cursor: pointer;
        }

        .sidebar-tab.active {
          background: #FFFFFF;
          color: #0F172A;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .tab-count-badge {
          background: #E2E8F0;
          color: #334155;
          font-size: 0.72rem;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          font-weight: 800;
        }

        .badge-amber {
          background: #FEF3C7;
          color: #92400E;
        }

        .tickets-scroll-container {
          max-height: 380px;
          overflow-y: auto;
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .ticket-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.9rem;
          border-radius: 12px;
          border: 1px solid #F1F5F9;
          background: #F8FAFC;
        }

        .row-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ticket-code-chip {
          font-family: monospace;
          font-weight: 900;
          font-size: 0.95rem;
          color: #0F172A;
          background: #E2E8F0;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .waiting-chip {
          background: #FEF3C7;
          color: #92400E;
        }

        .row-details {
          display: flex;
          flex-direction: column;
        }

        .row-service-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1E293B;
        }

        .row-time-stamp {
          font-size: 0.7rem;
          color: #94A3B8;
        }

        .status-done-tag {
          font-size: 0.72rem;
          color: #10B981;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .status-wait-tag {
          font-size: 0.72rem;
          color: #D97706;
          font-weight: 700;
        }

        .empty-state {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #CBD5E1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state p {
          font-size: 0.82rem;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
}

