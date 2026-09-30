import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Megaphone, RotateCw, ArrowRight, CheckCircle2, Clock, Filter, Layers, 
  FileDown, Edit3, X, Check, Users, Sparkles, Award, ChevronRight, Play, UserX,
  Lock, Unlock, Key, Volume2, AlertTriangle, LogOut, ShieldCheck
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
  toggleCounterStatus,
  loginAsAgent,
  logoutAgent,
  // playCallChime et speakTicketCall supprimés – le son est géré exclusivement par DisplayModule (TV)
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

  // --- AUTOMATISATION DU RAPPEL ET GESTION DES ABSENCES (RÈGLE MÉTIER CAISSIER) ---
  // autoStage: 'IDLE' | 'WAITING_VOICE_CALL' | 'COUNTDOWN_RECALL' | 'WAITING_VOICE_RECALL' | 'COUNTDOWN_ABSENT'
  const [autoStage, setAutoStage] = useState('IDLE');
  const [autoCountdownSec, setAutoCountdownSec] = useState(15);

  const autoRecallTimeoutRef = useRef(null);
  const autoAbsentTimeoutRef = useRef(null);
  const autoCountdownIntervalRef = useRef(null);
  const autoRecallDoneTicketIdRef = useRef(null);
  const activeTicketIdRef = useRef(null);

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

  // Authentification & Session Sécurisée Guichet
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAgentUnlocked, setIsAgentUnlocked] = useState(() => {
    return typeof window !== 'undefined' && 
      !!localStorage.getItem('cofina_jwt_token') && 
      !!localStorage.getItem('cofina_agent_username');
  });

  // Synchronisation stricte de l'agent et de son guichet attitré selon la session active
  useEffect(() => {
    if (isAgentUnlocked) {
      const storedUser = localStorage.getItem('cofina_agent_username');
      const ag = agentsList.find(a => a.name === storedUser) || selectedAgent;
      if (ag) {
        setSelectedAgentId(ag.id);
        const def = ag.defaultCounter || 1;
        setCounterNumber(def);
        const targetPoste = POSTES_CONFIG.find(p => p.number === def) || POSTES_CONFIG[0];
        setServiceFilter(targetPoste.services.join(','));
      }
    }
  }, [isAgentUnlocked]);

  const handleAgentLogin = async (e) => {
    e?.preventDefault();
    setPinError('');
    setIsLoggingIn(true);
    try {
      await loginAsAgent(pinInput.trim(), selectedAgent.name);
      const defCounter = selectedAgent.defaultCounter || 1;
      setCounterNumber(defCounter);
      const targetPoste = POSTES_CONFIG.find(p => p.number === defCounter) || POSTES_CONFIG[0];
      setServiceFilter(targetPoste.services.join(','));

      if (typeof window !== 'undefined') {
        localStorage.setItem('cofina_agent_counter', String(defCounter));
        localStorage.setItem('cofina_agent_username', selectedAgent.name);
        window.dispatchEvent(new Event('cofina_auth_changed'));
      }

      // Auto-ouverture du guichet lors de la connexion réussie
      if (!onlineCounters.includes(defCounter)) {
        toggleCounterStatus(defCounter, true);
      }

      setIsAgentUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
    } catch (err) {
      setPinError(err.message || 'Code PIN ou mot de passe incorrect');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAgentLogout = () => {
    clearAllAutoTimers();
    // Fermeture automatique du guichet à la déconnexion
    if (onlineCounters.includes(counterNumber)) {
      toggleCounterStatus(counterNumber, false);
    }
    logoutAgent();
    setIsAgentUnlocked(false);
    setPinInput('');
    setPinError('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cofina_auth_changed'));
    }
  };

  const isOnline = onlineCounters.includes(counterNumber);

  const handleToggleOnline = () => {
    toggleCounterStatus(counterNumber, !isOnline);
  };

  // --- MOTEUR D'AUTOMATISATION RAPPEL & ABSENCE (15s + 15s) ---

  const clearAllAutoTimers = () => {
    if (autoRecallTimeoutRef.current) {
      clearTimeout(autoRecallTimeoutRef.current);
      autoRecallTimeoutRef.current = null;
    }
    if (autoAbsentTimeoutRef.current) {
      clearTimeout(autoAbsentTimeoutRef.current);
      autoAbsentTimeoutRef.current = null;
    }
    if (autoCountdownIntervalRef.current) {
      clearInterval(autoCountdownIntervalRef.current);
      autoCountdownIntervalRef.current = null;
    }
    setAutoStage('IDLE');
    setAutoCountdownSec(15);
  };

  const startRecallCountdown = (ticket) => {
    if (activeTicketIdRef.current !== ticket.id) return;
    if (autoCountdownIntervalRef.current) clearInterval(autoCountdownIntervalRef.current);
    if (autoRecallTimeoutRef.current) clearTimeout(autoRecallTimeoutRef.current);

    setAutoStage('COUNTDOWN_RECALL');
    setAutoCountdownSec(15);

    let remaining = 15;
    autoCountdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setAutoCountdownSec(Math.max(0, remaining));
      if (remaining <= 0 && autoCountdownIntervalRef.current) {
        clearInterval(autoCountdownIntervalRef.current);
        autoCountdownIntervalRef.current = null;
      }
    }, 1000);

    autoRecallTimeoutRef.current = setTimeout(async () => {
      if (activeTicketIdRef.current === ticket.id && autoRecallDoneTicketIdRef.current !== ticket.id) {
        await executeAutoRecall(ticket);
      }
    }, 15000);
  };

  const executeAutoRecall = async (ticket) => {
    autoRecallDoneTicketIdRef.current = ticket.id;
    if (autoCountdownIntervalRef.current) {
      clearInterval(autoCountdownIntervalRef.current);
      autoCountdownIntervalRef.current = null;
    }

    setAutoStage('WAITING_VOICE_RECALL');
    await recallTicket(ticket.id, lang);
    // Le son est déclenché par DisplayModule via l'événement socket ticket_recalled → ticket_called_audio

    // Attendre que la télé ait le temps de parler (~4s) avant de démarrer le compte à rebours d'absence
    setTimeout(() => {
      if (activeTicketIdRef.current === ticket.id) {
        startAbsentCountdown(ticket);
      }
    }, 4000);
  };

  const startAbsentCountdown = (ticket) => {
    if (activeTicketIdRef.current !== ticket.id) return;
    if (autoCountdownIntervalRef.current) clearInterval(autoCountdownIntervalRef.current);
    if (autoAbsentTimeoutRef.current) clearTimeout(autoAbsentTimeoutRef.current);

    setAutoStage('COUNTDOWN_ABSENT');
    setAutoCountdownSec(15);

    let remaining = 15;
    autoCountdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setAutoCountdownSec(Math.max(0, remaining));
      if (remaining <= 0 && autoCountdownIntervalRef.current) {
        clearInterval(autoCountdownIntervalRef.current);
        autoCountdownIntervalRef.current = null;
      }
    }, 1000);

    autoAbsentTimeoutRef.current = setTimeout(async () => {
      if (activeTicketIdRef.current === ticket.id) {
        await executeAutoAbsent(ticket);
      }
    }, 15000);
  };

  const executeAutoAbsent = async (ticket) => {
    clearAllAutoTimers();
    activeTicketIdRef.current = null;

    // 1. Le ticket actuel est marqué comme "Absent"
    await updateTicketStatus(ticket.id, 'NO_SHOW');
    setCurrentTicket(null);

    // 2. Le prochain client de la file est appelé automatiquement
    const nextTicket = await processNextTicket(
      selectedAgent.id,
      selectedAgent.name,
      counterNumber,
      serviceFilter,
      null,
      lang
    );
    if (nextTicket) {
      setCurrentTicket(nextTicket);
      startTicketCallCycle(nextTicket);
    }
  };

  const startTicketCallCycle = (ticket) => {
    if (!ticket || ticket.status !== 'CALLED') return;
    clearAllAutoTimers();
    activeTicketIdRef.current = ticket.id;
    setAutoStage('WAITING_VOICE_CALL');
    // Le son est déclenché par DisplayModule via l'événement socket ticket_called → ticket_called_audio

    // Attendre que la télé ait le temps d'annoncer (~4s) avant de lancer le compte à rebours de rappel
    setTimeout(() => {
      if (activeTicketIdRef.current === ticket.id) {
        startRecallCountdown(ticket);
      }
    }, 4000);
  };

  // Sync agent default counter & auto-configure services when changing agent profile
  const handleSelectAgent = (agentId) => {
    if (isAgentUnlocked) return; // Session verrouillée
    clearAllAutoTimers();
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
    if (isAgentUnlocked) return; // Session verrouillée
    clearAllAutoTimers();
    setCounterNumber(counterNum);
    const targetPoste = POSTES_CONFIG.find(p => p.number === counterNum);
    if (targetPoste) {
      setServiceFilter(targetPoste.services.join(','));
    }
  };

  // Sync active ticket for this agent & counter
  useEffect(() => {
    const activeCandidates = tickets.filter(
      t => (t.counterNumber === counterNumber) && 
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


  // Surveillance et synchronisation du ticket actif CALLED
  useEffect(() => {
    if (!currentTicket || currentTicket.status !== 'CALLED') {
      clearAllAutoTimers();
      activeTicketIdRef.current = currentTicket?.id || null;
      return;
    }

    if (activeTicketIdRef.current !== currentTicket.id) {
      activeTicketIdRef.current = currentTicket.id;
      startTicketCallCycle(currentTicket);
    }
  }, [currentTicket?.id, currentTicket?.status, counterNumber]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      clearAllAutoTimers();
    };
  }, []);

  // ACTION: Suivant
  const handleSuivant = async () => {
    if (!isAgentUnlocked) {
      setShowPinModal(true);
      return;
    }
    clearAllAutoTimers();
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
      startTicketCallCycle(nextTicket);
    } else {
      setCurrentTicket(null);
    }
  };

  // ACTION: Rappeler
  const handleRappeler = async () => {
    if (!isAgentUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (currentTicket) {
      clearAllAutoTimers();
      autoRecallDoneTicketIdRef.current = currentTicket.id;
      setAutoStage('WAITING_VOICE_RECALL');
      await recallTicket(currentTicket.id, lang);
      // Le son est déclenché par DisplayModule via l'événement socket ticket_recalled → ticket_called_audio
      setTimeout(() => {
        if (activeTicketIdRef.current === currentTicket.id) {
          startAbsentCountdown(currentTicket);
        }
      }, 4000);
    }
  };

  // ACTION: Marquer Absent (No Show) et passer directement au ticket suivant
  const handleNoShow = async () => {
    if (!isAgentUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (currentTicket) {
      clearAllAutoTimers();
      activeTicketIdRef.current = null;
      await updateTicketStatus(currentTicket.id, 'NO_SHOW');
      setCurrentTicket(null);
      const nextTicket = await processNextTicket(
        selectedAgent.id,
        selectedAgent.name,
        counterNumber,
        serviceFilter,
        null,
        lang
      );
      if (nextTicket) {
        setCurrentTicket(nextTicket);
        startTicketCallCycle(nextTicket);
      }
    }
  };

  // ACTION: Démarrer le traitement
  const handleEnTraitement = async () => {
    if (!isAgentUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (currentTicket) {
      // 1. Arrêt immédiat de tout automatisme de rappel ou absence
      clearAllAutoTimers();

      // 2. Dès que le caissier clique sur "Démarrer le traitement", le statut du client passe à "En cours de service"
      await updateTicketStatus(currentTicket.id, 'IN_PROGRESS');
      setCurrentTicket(prev => prev ? { ...prev, status: 'IN_PROGRESS' } : null);
    }
  };

  // ACTION: Terminer le service
  const handleTerminer = async () => {
    if (!isAgentUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (currentTicket) {
      // 1. Arrêt immédiat de tous les minuteurs
      clearAllAutoTimers();
      activeTicketIdRef.current = null;

      // 2. Lorsque le caissier clique sur "Terminer le service", le client actuel est validé et le système se met en attente du prochain appel de ticket
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

  // Portail d'authentification obligatoire ou Interface Caisse active
  return (
    <>
      {!isAgentUnlocked ? (
        <div className="cashier-login-portal-wrapper animate-fade-in">
          <div className="cashier-login-card glass-card">
            <div className="cashier-login-header">
              <div className="cashier-brand-badge">
                <span className="cashier-brand-logo">🏦</span>
                <div className="cashier-brand-text">
                  <h2>GROUPE COFINA TOGO</h2>
                  <span>Système de Gestion de File d'Attente</span>
                </div>
              </div>
              <div className="cashier-agency-pill">
                📍 {agencyName || 'Agence Siège Kodjoviakopé'}
              </div>
            </div>

            <div className="cashier-login-title-box">
              <div className="cashier-lock-icon-circle">
                <Lock size={26} />
              </div>
              <div>
                <h3>Portail Caissier & Guichetier</h3>
                <p>Authentification obligatoire pour ouvrir la caisse</p>
              </div>
            </div>

            <form onSubmit={handleAgentLogin} className="cashier-login-form">
              <div className="login-field-group">
                <label className="login-field-label">
                  <User size={15} style={{ color: '#D3122A', display: 'inline', marginRight: '6px' }} />
                  Sélectionnez votre profil Collaborateur :
                </label>
                <div className="login-select-wrapper">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => handleSelectAgent(e.target.value)}
                    className="login-agent-select"
                  >
                    {agentsList.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} — ({a.title || `Guichet ${a.defaultCounter}`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="login-workstation-preview">
                <div className="preview-header">
                  <ShieldCheck size={16} style={{ color: '#16A34A' }} />
                  <span>Poste physique assigné :</span>
                </div>
                <div className="preview-body">
                  <span className="preview-icon">{currentPoste.icon}</span>
                  <div className="preview-info">
                    <strong>Guichet {currentPoste.number} — {currentPoste.name}</strong>
                    <span>{currentPoste.description}</span>
                  </div>
                  <span className="preview-locked-pill">🔒 Assigné d'office</span>
                </div>
              </div>

              <div className="login-field-group">
                <label className="login-field-label">
                  <Key size={15} style={{ color: '#D3122A', display: 'inline', marginRight: '6px' }} />
                  Mot de passe :
                </label>
                <input
                  type="password"
                  maxLength={30}
                  placeholder="cofina2026  (ou PIN : 1234)"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  autoFocus
                  className="login-pin-input"
                  required
                />
                <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Mot de passe agence : <strong>cofina2026</strong> &nbsp;|&nbsp; PIN court : <strong>1234</strong>
                </small>
              </div>

              {pinError && (
                <div className="login-error-alert animate-shake">
                  <AlertTriangle size={16} />
                  <span>{pinError}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={isLoggingIn}
              >
                <Unlock size={18} />
                <span>{isLoggingIn ? 'Vérification en cours...' : 'Ouvrir ma Caisse & Démarrer le Service'}</span>
              </button>

              <div className="login-security-notice">
                🔒 <strong>Sécurité & Traçabilité Bancaire :</strong> Dès votre connexion, votre session sera strictement verrouillée sur le <strong>Guichet {currentPoste.number} ({currentPoste.name})</strong>. Vous ne pourrez pas naviguer vers un autre guichet sans déconnexion préalable.
              </div>
            </form>
          </div>
        </div>
      ) : (
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
            <div className="agent-locked-identity">
              <span className="agent-name-display">{selectedAgent.name}</span>
            </div>
            <span className="agency-location-tag">📍 {agencyName}</span>
          </div>
        </div>

        {/* Workstation Display: VERROUILLÉ EN LECTURE SEULE */}
        <div className="workstation-station-box workstation-locked">
          <div className="station-meta-info">
            <span className="station-pole-pill">{currentPoste.pole}</span>
            <div className="station-locked-wrapper" title="Poste strictement assigné et verrouillé pour cette session caissier. Déconnectez-vous pour changer de poste.">
              <span className="station-icon-chip">{currentPoste.icon}</span>
              <span className="station-locked-name">Guichet {currentPoste.number} — {currentPoste.name}</span>
              <span className="station-locked-badge">🔒 Fixe</span>
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

        {/* Clock with Seconds & Actions */}
        <div className="topbar-actions">
          <button 
            type="button" 
            className="btn-profile-edit btn-logout-session" 
            onClick={handleAgentLogout}
            style={{ background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', fontWeight: 800 }}
            title="Fermer la session caissier et verrouiller l'accès"
          >
            <LogOut size={14} style={{ color: '#BE123C' }} /> Déconnexion
          </button>

          <div className="agent-clock-badge">
            <Clock size={15} />
            <span className="agent-clock-time">{formattedTimeStr}</span>
          </div>

          <button 
            type="button" 
            className="btn-profile-edit" 
            onClick={openProfileModal}
            title="Consulter ma fiche collaborateur"
          >
            <User size={14} /> Profil
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
                  {currentTicket.status === 'IN_PROGRESS' ? 'EN COURS DE SERVICE' : 'TICKET APPELÉ'}
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

                {/* Bannière interactive de suivi automatique */}
                {currentTicket.status === 'CALLED' && autoStage === 'WAITING_VOICE_CALL' && (
                  <div className="cashier-automation-banner voice-active">
                    <Volume2 size={18} className="pulse-alert" />
                    <span>Annonce vocale en cours d'appel... En attente d'arrivée du client</span>
                  </div>
                )}

                {currentTicket.status === 'CALLED' && autoStage === 'COUNTDOWN_RECALL' && (
                  <div className="cashier-automation-banner recall-countdown">
                    <Clock size={18} className="pulse-alert" />
                    <span>Rappel automatique dans <strong>{autoCountdownSec}s</strong> si non démarré</span>
                  </div>
                )}

                {currentTicket.status === 'CALLED' && autoStage === 'WAITING_VOICE_RECALL' && (
                  <div className="cashier-automation-banner voice-active">
                    <Volume2 size={18} className="pulse-alert" />
                    <span>Rappel vocal automatique en cours...</span>
                  </div>
                )}

                {currentTicket.status === 'CALLED' && autoStage === 'COUNTDOWN_ABSENT' && (
                  <div className="cashier-automation-banner absent-countdown">
                    <AlertTriangle size={18} className="pulse-alert" />
                    <span>Absence automatique & appel suivant dans <strong>{autoCountdownSec}s</strong></span>
                  </div>
                )}

                {currentTicket.status === 'IN_PROGRESS' && (
                  <div className="cashier-automation-banner in-progress-active">
                    <CheckCircle2 size={18} />
                    <span>En cours de service • Traitement actif au guichet</span>
                  </div>
                )}
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
                <span>Démarrer le traitement</span>
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
                <span>Terminer le service</span>
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
                    <p>Aucun ticket pour vos services</p>
                    {tickets.filter(t => t.status === 'WAITING').length > 0 && (
                      <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                        {tickets.filter(t => t.status === 'WAITING').length} ticket(s) en attente dans l'agence<br/>
                        pour d'autres guichets
                      </small>
                    )}
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

      {/* ── MODAL PIN CAISSIER / AGENT ── */}
      {showPinModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal glass-card animate-scale-up" style={{ maxWidth: '420px', width: '100%', padding: '2rem', background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(211, 18, 42, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D3122A', fontSize: '1.25rem' }}>
                  🔐
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Session Guichetier</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{selectedAgent.name} (Poste {counterNumber})</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPinModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgentLogin}>
              <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
                Veuillez saisir votre code PIN pour sécuriser vos opérations de caisse (Code PIN par défaut : <strong>1234</strong>).
              </p>

              {pinError && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {pinError}
                </div>
              )}

              <input 
                type="password"
                maxLength={20}
                placeholder="Code PIN (ex: 1234)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '1.2rem',
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: '2px solid #E2E8F0',
                  outline: 'none',
                  marginBottom: '1.25rem',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#D3122A',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(211, 18, 42, 0.3)'
                  }}
                >
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
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

        .cashier-automation-banner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 1rem;
          padding: 0.6rem 1.4rem;
          border-radius: 99px;
          font-size: 0.92rem;
          font-weight: 700;
          transition: all 0.3s ease;
          animation: fadeInBanner 0.3s ease-in-out;
        }

        .cashier-automation-banner.voice-active {
          background: rgba(37, 99, 235, 0.1);
          color: #2563EB;
          border: 1px solid rgba(37, 99, 235, 0.3);
        }

        .cashier-automation-banner.recall-countdown {
          background: rgba(245, 158, 11, 0.12);
          color: #D97706;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .cashier-automation-banner.absent-countdown {
          background: rgba(239, 68, 68, 0.12);
          color: #DC2626;
          border: 1px solid rgba(239, 68, 68, 0.35);
          animation: pulseBorder 1.5s infinite;
        }

        .cashier-automation-banner.in-progress-active {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        @keyframes fadeInBanner {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pulse-alert {
          animation: pulseAnim 1s infinite alternate;
        }

        @keyframes pulseAnim {
          from { opacity: 0.6; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1.05); }
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

        /* ── PORTAIL DE CONNEXION CAISSIER OBLIGATOIRE ── */
        .cashier-login-portal-wrapper {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        .cashier-login-card {
          max-width: 480px;
          width: 100%;
          background: #FFFFFF;
          border-radius: 28px;
          padding: 2.5rem 2rem;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8);
          position: relative;
          overflow: hidden;
        }

        .cashier-login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #D3122A 0%, #B91C1C 50%, #F59E0B 100%);
        }

        .cashier-login-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #F1F5F9;
          margin-bottom: 1.5rem;
        }

        .cashier-brand-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cashier-brand-logo {
          font-size: 2.2rem;
        }

        .cashier-brand-text h2 {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 900;
          color: #D3122A;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .cashier-brand-text span {
          font-size: 0.72rem;
          color: #64748B;
          font-weight: 600;
        }

        .cashier-agency-pill {
          font-size: 0.75rem;
          font-weight: 800;
          background: #FEF2F2;
          color: #991B1B;
          border: 1px solid #FECACA;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          white-space: nowrap;
        }

        .cashier-login-title-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .cashier-lock-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(211, 18, 42, 0.1);
          color: #D3122A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cashier-login-title-box h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #0F172A;
        }

        .cashier-login-title-box p {
          margin: 0.15rem 0 0 0;
          font-size: 0.8rem;
          color: #64748B;
        }

        .login-field-group {
          margin-bottom: 1.25rem;
        }

        .login-field-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.45rem;
        }

        .login-select-wrapper {
          position: relative;
        }

        .login-agent-select {
          width: 100%;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0F172A;
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .login-agent-select:focus {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(211, 18, 42, 0.1);
        }

        .login-workstation-preview {
          background: #EFF6FF;
          border: 1.5px solid #BFDBFE;
          border-radius: 14px;
          padding: 0.85rem 1rem;
          margin-bottom: 1.25rem;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: #1D4ED8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.4rem;
        }

        .preview-body {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .preview-icon {
          font-size: 1.5rem;
        }

        .preview-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .preview-info strong {
          font-size: 0.92rem;
          color: #0F172A;
          font-weight: 800;
        }

        .preview-info span {
          font-size: 0.75rem;
          color: #475569;
        }

        .preview-locked-pill {
          font-size: 0.72rem;
          font-weight: 800;
          background: #DBEAFE;
          color: #1E40AF;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          border: 1px solid #BFDBFE;
        }

        .login-pin-input {
          width: 100%;
          padding: 0.85rem 1rem;
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-align: center;
          color: #0F172A;
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .login-pin-input:focus {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(211, 18, 42, 0.1);
        }

        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FEE2E2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.7rem 0.9rem;
          border-radius: 12px;
          margin-bottom: 1.25rem;
        }

        .login-submit-btn {
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, #D3122A 0%, #991B1B 100%);
          color: #FFFFFF;
          font-size: 0.98rem;
          font-weight: 800;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          box-shadow: 0 4px 15px rgba(211, 18, 42, 0.3);
          transition: all 0.2s ease;
        }

        .login-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(211, 18, 42, 0.4);
        }

        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-security-notice {
          margin-top: 1.25rem;
          padding: 0.75rem;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 10px;
          font-size: 0.74rem;
          color: #92400E;
          line-height: 1.45;
        }

        /* ── VERROUILLAGE TOPBAR CAISSIER CONNECTÉ ── */
        .agent-locked-identity {
          display: flex;
          align-items: center;
        }

        .agent-name-display {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
        }

        .workstation-locked {
          background: #F8FAFC !important;
          border-color: #E2E8F0 !important;
        }

        .station-locked-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .station-locked-name {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 800;
          color: #0F172A;
        }

        .station-locked-badge {
          font-size: 0.68rem;
          font-weight: 800;
          background: #FEF2F2;
          color: #D3122A;
          border: 1px solid #FECACA;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
        }

        .btn-logout-session {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout-session:hover {
          background: #FEE2E2 !important;
          border-color: #FDA4AF !important;
        }
      `}</style>
    </>
  );
}
