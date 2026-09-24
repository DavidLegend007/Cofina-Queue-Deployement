import React, { useState, useEffect } from 'react';
import { 
  User, Megaphone, RotateCw, ArrowRight, CheckCircle2, Clock, Filter, Layers, 
  FileDown, Edit3, X, Check, Users, Sparkles, Award, ChevronRight, Play, UserX 
} from 'lucide-react';
import { 
  INITIAL_AGENTS,
  getStoredAgentProfiles, 
  saveAgentProfile,
  COFINA_SERVICES, 
  recallTicket, 
  processNextTicket,
  updateTicketStatus,
  exportAgencyDataCSV,
  generateSimulationTickets,
  toggleCounterStatus
} from '../services/queueStore';
import { translations } from '../services/translations';
import ProfilePage from './ProfilePage';

// Configuration officielle des 6 Postes de l'Agence Siège (3 Caisses, 2 Opérateurs, 1 Accueil)
export const POSTES_CONFIG = [
  { 
    number: 1, 
    name: 'Caisse 1', 
    pole: 'Pôle Caisses', 
    roleTag: 'Caisse',
    type: 'CASHIER',
    color: '#D3122A',
    icon: '💵',
    description: 'Dépôts & Retraits Espèces',
    services: ['D', 'R', 'TN', 'TI', 'RC', 'V'] 
  },
  { 
    number: 2, 
    name: 'Caisse 2', 
    pole: 'Pôle Caisses', 
    roleTag: 'Caisse',
    type: 'CASHIER',
    color: '#D3122A',
    icon: '👛',
    description: 'Dépôts & Retraits Espèces',
    services: ['D', 'R', 'TN', 'TI', 'RC', 'V'] 
  },
  { 
    number: 3, 
    name: 'Caisse 3', 
    pole: 'Pôle Caisses', 
    roleTag: 'Caisse',
    type: 'CASHIER',
    color: '#D3122A',
    icon: '📑',
    description: 'Remises de Chèques & Transferts',
    services: ['RC', 'V', 'D', 'R', 'TN', 'TI'] 
  },
  { 
    number: 4, 
    name: 'Opérateur 1', 
    pole: 'Pôle Opérateurs', 
    roleTag: 'Conseiller',
    type: 'OPERATOR',
    color: '#2563EB',
    icon: '👤',
    description: 'Ouvertures de Compte & Crédits',
    services: ['O', 'C', 'PC', 'CM', 'DR'] 
  },
  { 
    number: 5, 
    name: 'Opérateur 2', 
    pole: 'Pôle Opérateurs', 
    roleTag: 'Conseiller',
    type: 'OPERATOR',
    color: '#2563EB',
    icon: '🎧',
    description: 'Conseil & Microfinance',
    services: ['C', 'PC', 'O', 'CM', 'DR'] 
  },
  { 
    number: 6, 
    name: 'Accueil', 
    pole: 'Pôle Accueil', 
    roleTag: 'Accueil & PMR',
    type: 'RECEPTION',
    color: '#10B981',
    icon: 'ℹ️',
    description: 'Information, Orientation & PMR',
    services: ['PMR', 'DR', 'CM', 'O'] 
  },
];

export default function AgentModule({ agencyName, tickets, onlineCounters = [], lang = 'fr' }) {
  const t = translations[lang] || translations.fr;
  // Agent profiles list from stored state (6 agents)
  const [agentsList, setAgentsList] = useState(() => getStoredAgentProfiles());
  const [selectedAgentId, setSelectedAgentId] = useState(agentsList[0]?.id || 'AGT-01');
  const selectedAgent = agentsList.find(a => a.id === selectedAgentId) || agentsList[0];

  // Le collaborateur travaille sur un seul poste assigné à la fois
  const [counterNumber, setCounterNumber] = useState(selectedAgent?.defaultCounter || 1);
  const currentPoste = POSTES_CONFIG.find(p => p.number === counterNumber) || POSTES_CONFIG[0];

  // Le filtre de services s'initialise automatiquement selon les compétences du poste assigné
  const [serviceFilter, setServiceFilter] = useState(() => currentPoste.services.join(','));
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

  const isOnline = onlineCounters.includes(counterNumber);

  const handleToggleOnline = () => {
    toggleCounterStatus(counterNumber, !isOnline);
  };

  // Sync agent default counter & auto-configure services when changing agent profile
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    const ag = agentsList.find(a => a.id === agentId);
    if (ag) {
      const def = ag.defaultCounter || 1;
      setCounterNumber(def);
      const targetPoste = POSTES_CONFIG.find(p => p.number === def);
      if (targetPoste) {
        setServiceFilter(targetPoste.services.join(','));
      }
    }
  };

  // Switch physical workstation and auto-configure services for that workstation
  const handleSelectCounter = (counterNum) => {
    setCounterNumber(counterNum);
    const targetPoste = POSTES_CONFIG.find(p => p.number === counterNum);
    if (targetPoste) {
      setServiceFilter(targetPoste.services.join(','));
    }
  };

  // Sync active ticket for this agent & counter
  useEffect(() => {
    const activeCandidates = tickets.filter(
      t => (t.agentId === selectedAgent.id || t.counterNumber === counterNumber) && 
           (t.status === 'CALLED' || t.status === 'IN_PROGRESS')
    );
    activeCandidates.sort((a, b) => {
      const timeA = new Date(a.calledAt || a.startedAt || a.createdAt).getTime();
      const timeB = new Date(b.calledAt || b.startedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
    setCurrentTicket(activeCandidates[0] || null);
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

  // Filtered ticket lists (supporte les filtres unitaires, multi-services et 'ALL')
  const waitingTickets = tickets.filter(t => {
    if (t.status !== 'WAITING') return false;
    if (serviceFilter !== 'ALL') {
      if (serviceFilter.includes(',')) {
        const allowed = serviceFilter.split(',').map(s => s.trim());
        if (!allowed.includes(t.serviceCode)) return false;
      } else if (t.serviceCode !== serviceFilter) {
        return false;
      }
    }
    return true;
  });

  const servedTicketsToday = tickets.filter(t => 
    t.status === 'COMPLETED' && (t.agentId === selectedAgent.id || t.counterNumber === counterNumber)
  ).sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

  // ACTION: Suivant
  const handleSuivant = async () => {
    const nextTicket = await processNextTicket(
      selectedAgent.id,
      selectedAgent.name,
      counterNumber,
      serviceFilter,
      currentTicket?.id || null,
      lang
    );
    if (nextTicket) {
      setCurrentTicket(nextTicket);
    }
  };



  // ACTION: Rappeler
  const handleRappeler = async () => {
    if (currentTicket) {
      await recallTicket(currentTicket.id, lang);
    }
  };

  // ACTION: Marquer Absent (No Show) et passer directement au ticket suivant
  const handleNoShow = async () => {
    if (currentTicket) {
      await updateTicketStatus(currentTicket.id, 'NO_SHOW');
      setCurrentTicket(null);
      await processNextTicket(
        selectedAgent.id,
        selectedAgent.name,
        counterNumber,
        serviceFilter,
        null,
        lang
      );
    }
  };

  // ACTION: En traitement
  const handleEnTraitement = async () => {
    if (currentTicket) {
      await updateTicketStatus(currentTicket.id, 'IN_PROGRESS');
    }
  };

  // ACTION: Terminer
  const handleTerminer = async () => {
    if (currentTicket) {
      await updateTicketStatus(currentTicket.id, 'COMPLETED');
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

  if (isProfilePageOpen) {
    return (
      <ProfilePage
        agentId={selectedAgent.id}
        agencyName={agencyName}
        tickets={tickets}
        onClose={handleProfileClose}
        lang={lang}
      />
    );
  }

  return (
    <div className="agent-container animate-fade-in">
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

        {/* Workstation Display & Dedicated Switcher ("Un seul poste à la fois") */}
        <div className="workstation-station-box">
          <div className="station-meta-info">
            <span className="station-pole-pill">{currentPoste.pole}</span>
            <div className="station-selector-wrapper">
              <span className="station-icon-chip">{currentPoste.icon}</span>
              <select 
                value={counterNumber}
                onChange={(e) => handleSelectCounter(Number(e.target.value))}
                className="station-dropdown-select"
                title="Poste de travail physique assigné"
              >
                {POSTES_CONFIG.map(p => (
                  <option key={p.number} value={p.number}>
                    Guichet {p.number} — {p.name} ({p.roleTag})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="counter-status-toggle">
          <button 
            type="button" 
            className={`btn-toggle-status ${isOnline ? 'online' : 'offline'}`}
            onClick={handleToggleOnline}
            title={isOnline ? 'Cliquer pour fermer le poste' : 'Cliquer pour ouvrir le poste et recevoir des clients'}
          >
            <div className={`status-dot ${isOnline ? 'dot-online' : 'dot-offline'}`}></div>
            <span>
              {isOnline 
                ? (currentPoste.type === 'CASHIER' ? 'Caisse Ouverte' : `${currentPoste.name} Ouvert`)
                : (currentPoste.type === 'CASHIER' ? 'Caisse Fermée' : `${currentPoste.name} Fermé`)}
            </span>
          </button>
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
            <Edit3 size={15} /> Profil
          </button>

          <button 
            type="button"
            className="btn-export-csv"
            onClick={() => exportAgencyDataCSV(tickets, agencyName)}
            title="Exporter l'historique de la journée au format CSV"
          >
            <FileDown size={15} /> Export CSV
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
                <div 
                  className="live-status-pill"
                  style={{
                    background: currentTicket.status === 'IN_PROGRESS' ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)',
                    color: currentTicket.status === 'IN_PROGRESS' ? '#2563EB' : '#059669',
                    border: `1px solid ${currentTicket.status === 'IN_PROGRESS' ? 'rgba(37,99,235,0.25)' : 'rgba(16,185,129,0.25)'}`
                  }}
                >
                  <span 
                    className="pulse-dot"
                    style={{
                      background: currentTicket.status === 'IN_PROGRESS' ? '#2563EB' : '#10B981'
                    }}
                  ></span>
                  {currentTicket.status === 'IN_PROGRESS' ? 'CLIENT EN TRAITEMENT' : 'TICKET APPELÉ'}
                </div>
                <div className="guichet-badge">
                  GUICHET {counterNumber} — {currentPoste.name.toUpperCase()}
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

            </div>
          ) : (
            <div className="idle-workspace">
              <div className="idle-hero-icon">
                <Sparkles size={40} className="cofina-red-icn" />
              </div>
              <h2>{currentPoste.name} Disponible</h2>
              <span className="pole-subtitle">{currentPoste.pole} • {currentPoste.description}</span>
              <p>
                {waitingTickets.length > 0
                  ? `Il y a ${waitingTickets.length} client(s) éligible(s) en attente.`
                  : "Aucun client en attente pour votre configuration de services."}
              </p>
            </div>
          )}

          {/* Action Buttons Grid (Always Visible) */}
          <div className="agent-actions-grid" style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-action btn-next-primary"
              onClick={handleSuivant}
              title="Appeler le prochain ticket de la file"
            >
              <Play size={22} />
              <span>Suivant</span>
            </button>
            <button
              type="button"
              className="btn-action btn-recall"
              onClick={handleRappeler}
              disabled={!currentTicket}
              title="Rappeler vocalement le ticket à l'écran TV"
            >
              <RotateCw size={20} />
              <span>Rappeler</span>
            </button>
            <button
              type="button"
              className="btn-action btn-absent"
              onClick={handleNoShow}
              disabled={!currentTicket}
              title="Marquer le client comme absent"
            >
              <UserX size={20} />
              <span>Absent</span>
            </button>
            {currentTicket && currentTicket.status === 'CALLED' && (
              <button
                type="button"
                className="btn-action btn-processing"
                onClick={handleEnTraitement}
                style={{ gridColumn: 'span 2' }}
                title="Démarrer le traitement du client arrivé au guichet"
              >
                <Clock size={20} />
                <span>Démarrer le Traitement</span>
              </button>
            )}
            {currentTicket && currentTicket.status === 'IN_PROGRESS' && (
              <button
                type="button"
                className="btn-action btn-complete"
                onClick={handleTerminer}
                style={{ gridColumn: 'span 2' }}
                title="Clôturer le service du ticket actuel"
              >
                <CheckCircle2 size={20} />
                <span>Terminer le Service</span>
              </button>
            )}
          </div>
        </main>

        {/* Right Column: Queue Sidebar */}
        <aside className="queue-sidebar-panel glass-card">
          <div className="filter-services-bar">
            <div className="filter-header-line">
              <span className="sidebar-title">
                <Filter size={15} /> Routage des Services :
              </span>
              <span className="filter-mode-tag">
                {serviceFilter === 'ALL'
                  ? 'Polyvalent (Tous)'
                  : (serviceFilter === currentPoste.services.join(',')
                      ? `🎯 ${currentPoste.roleTag}`
                      : `Filtre (${serviceFilter})`)}
              </span>
            </div>

            {/* Presets rapides de configuration par poste */}
            <div className="service-presets-row">
              <button
                type="button"
                className={`btn-service-preset ${serviceFilter === currentPoste.services.join(',') ? 'active' : ''}`}
                onClick={() => setServiceFilter(currentPoste.services.join(','))}
                title={`Limiter aux services attribués au poste ${currentPoste.name}`}
              >
                🎯 Mes Services ({currentPoste.roleTag})
              </button>
              <button
                type="button"
                className={`btn-service-preset ${serviceFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setServiceFilter('ALL')}
                title="Mode polyvalent : appeler tous les services en attente dans l'agence"
              >
                🌐 Tous les Services
              </button>
            </div>

            <div className="filter-chips">
              {COFINA_SERVICES.map(svc => {
                const isAssigned = currentPoste.services.includes(svc.code);
                const isSelected = serviceFilter === svc.code;
                return (
                  <button
                    key={svc.code}
                    type="button"
                    className={`filter-chip ${isSelected ? 'active' : ''} ${isAssigned ? 'assigned-chip' : ''}`}
                    onClick={() => setServiceFilter(svc.code)}
                    title={`${svc.name} (${isAssigned ? 'Service assigné à votre poste' : 'Service hors pôle'})`}
                  >
                    <span>{svc.code}</span>
                    {isAssigned && <span className="assigned-dot" title="Service assigné à votre poste"></span>}
                  </button>
                );
              })}
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

      {/* Styled CSS 2026 */}
      <style>{`
        .agent-container {
          max-width: 1440px;
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
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04);
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
          box-shadow: 0 4px 10px rgba(211, 18, 42, 0.15);
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
          font-weight: 700;
        }

        .workstation-station-box {
          display: flex;
          align-items: center;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 0.35rem 0.75rem;
          transition: all 0.2s ease;
        }

        .workstation-station-box:hover {
          border-color: #CBD5E1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .station-meta-info {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .station-pole-pill {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
        }

        .station-selector-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .station-icon-chip {
          font-size: 1.1rem;
        }

        .station-dropdown-select {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 800;
          color: #0F172A;
          border: none;
          background: transparent;
          cursor: pointer;
          outline: none;
          padding-right: 0.5rem;
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

        .counter-status-toggle {
          display: flex;
          align-items: center;
          margin: 0 1rem;
        }

        .btn-toggle-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 99px;
          border: 1px solid transparent;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-toggle-status.online {
          background: #ECFDF5;
          color: #059669;
          border-color: #A7F3D0;
        }

        .btn-toggle-status.offline {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FECACA;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-online {
          background: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
        }

        .dot-offline {
          background: #EF4444;
        }

        .btn-simulate-quick {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFFFFF;
          border: none;
          padding: 0.5rem 0.9rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .btn-simulate-quick:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
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
          padding: 0.5rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
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
          font-weight: 800;
          font-size: 0.82rem;
          padding: 0.5rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-export-csv:hover {
          border-color: #0F172A;
          color: #0F172A;
        }

        .cashier-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 1.5rem;
        }

        .glass-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          padding: 1.75rem;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04);
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
          font-weight: 900;
          font-size: 0.78rem;
          padding: 0.4rem 0.85rem;
          border-radius: 99px;
          letter-spacing: 0.05em;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .guichet-badge {
          background: #0F172A;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.82rem;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          letter-spacing: 0.05em;
        }

        .client-hero {
          text-align: center;
          padding: 1rem 0;
        }

        .service-name-tag {
          font-size: 1.15rem;
          font-weight: 800;
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
          font-weight: 700;
        }

        .agent-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-next-primary {
          grid-column: span 2;
          background: linear-gradient(135deg, #D3122A, #B90E23);
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(211, 18, 42, 0.35);
        }

        .btn-next-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(211, 18, 42, 0.45);
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
        }

        .btn-absent {
          background: rgba(249, 115, 22, 0.12);
          color: #C2410C;
          border: 1px solid rgba(249, 115, 22, 0.3);
        }

        .btn-absent:hover:not(:disabled) {
          background: rgba(249, 115, 22, 0.22);
          color: #9A3412;
        }

        .btn-complete {
          background: linear-gradient(135deg, #10B981, #059669);
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        .btn-complete:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #047857);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
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
          transition: all 0.2s ease;
        }

        .btn-call-first-big.btn-sim-highlight {
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        }

        .btn-call-first-big.btn-sim-highlight:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.5);
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

        .filter-header-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .filter-mode-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: #D3122A;
          background: #FFF1F2;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          border: 1px solid #FECDD3;
        }

        .service-presets-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
          margin-bottom: 0.65rem;
        }

        .btn-service-preset {
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #475569;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-service-preset.active {
          background: #D3122A;
          color: #FFFFFF;
          border-color: #D3122A;
          box-shadow: 0 2px 6px rgba(211, 18, 42, 0.25);
        }

        .assigned-chip {
          border-color: #BFDBFE !important;
          background: #F0F9FF !important;
          color: #0369A1 !important;
          position: relative;
        }

        .assigned-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0284C7;
          margin-left: 0.3rem;
          vertical-align: middle;
        }

        .pole-subtitle {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748B;
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
          display: block;
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
          padding: 0.38rem 0.8rem;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          font-size: 0.78rem;
          font-weight: 800;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-chip.active {
          background: #0F172A !important;
          color: #FFFFFF !important;
          border-color: #0F172A !important;
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
          font-weight: 800;
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
          font-weight: 800;
          color: #1E293B;
        }

        .row-time-stamp {
          font-size: 0.7rem;
          color: #94A3B8;
        }

        .status-done-tag {
          font-size: 0.72rem;
          color: #10B981;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .status-wait-tag {
          font-size: 0.72rem;
          color: #D97706;
          font-weight: 800;
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
