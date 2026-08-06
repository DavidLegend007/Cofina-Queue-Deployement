import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Smartphone, 
  UserCheck, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  Building2,
  BellRing,
  Clock,
  ChevronDown,
  ShieldCheck,
  Languages,
  Layers
} from 'lucide-react';
import { COFINA_AGENCIES, playCallChime, speakTicketCall } from '../services/queueStore';
import { translations } from '../services/translations';

export default function Navbar({ 
  activeModule, 
  setActiveModule, 
  currentAgencyId, 
  setAgencyId, 
  soundEnabled, 
  setSoundEnabled,
  lang = 'fr',
  setLang = () => {},
  showFloatingWidget = true,
  setShowFloatingWidget = () => {}
}) {
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const t = translations[lang] || translations.fr;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentAgency = COFINA_AGENCIES.find(a => a.id === currentAgencyId) || COFINA_AGENCIES[0];

  const handleTestSound = () => {
    playCallChime();
    speakTicketCall('A-001', 1, lang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
  };

  const navItems = [
    { id: 'kiosk', label: t.navKiosk, icon: Smartphone, badge: t.badgeClient },
    { id: 'display', label: t.navDisplay, icon: Monitor, badge: t.badgeAccueil },
    { id: 'agent', label: t.navAgent, icon: UserCheck, badge: t.badgeGuichet },
    { id: 'admin', label: t.navAdmin, icon: BarChart3, badge: t.badgeEdge }
  ];

  const formattedTime = currentTime.toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const formattedDate = currentTime.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  return (
    <header className="nav-container">
      {/* Cofina Red Gradient Bar */}
      <div className="nav-top-accent"></div>

      <div className="nav-wrapper">
        
        {/* BRAND IDENTITY */}
        <div className="nav-brand">
          <div className="nav-logo-box">
            <img src="/cofina.jpeg" alt="Logo Cofina" className="nav-logo-img" />
          </div>
          <div className="nav-brand-info">
            <div className="nav-brand-name">
              COFINA <span className="nav-brand-highlight">QUEUE</span>
            </div>
            <span className="nav-brand-sub">{t.brandSub}</span>
          </div>
        </div>

        {/* AGENCY SELECTOR */}
        <div className="agency-picker-container">
          <button 
            className="agency-picker-btn"
            onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
          >
            <div className="agency-picker-icon">
              <Building2 size={16} />
            </div>
            <div className="agency-picker-text">
              <span className="picker-label">{t.demoAgencyLabel}</span>
              <span className="picker-value">{currentAgency.name}</span>
            </div>
            <ChevronDown size={14} className={`picker-arrow ${showAgencyDropdown ? 'open' : ''}`} />
          </button>

          {showAgencyDropdown && (
            <div className="agency-menu-dropdown animate-fadeIn">
              <div className="menu-hdr">{lang === 'en' ? 'Select Cofina Branch:' : 'Choisir une agence Cofina :'}</div>
              {COFINA_AGENCIES.map(agency => (
                <button
                  key={agency.id}
                  className={`menu-item ${agency.id === currentAgencyId ? 'item-selected' : ''}`}
                  onClick={() => {
                    setAgencyId(agency.id);
                    setShowAgencyDropdown(false);
                  }}
                >
                  <span className="item-id">{agency.id}</span>
                  <div className="item-details">
                    <span className="item-name">{agency.name}</span>
                    <span className="item-city">{agency.city}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* NAVIGATION MODULE SWITCHER */}
        <nav className="nav-tabs-wrapper">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab-btn ${isActive ? 'tab-active' : ''}`}
                onClick={() => setActiveModule(item.id)}
              >
                <Icon size={16} className="tab-icon" />
                <span className="tab-text">{item.label}</span>
                <span className="tab-badge">{item.badge}</span>
              </button>
            );
          })}
        </nav>

        {/* CONTROLS & REAL-TIME CLOCK WITH SECONDS */}
        <div className="nav-right-controls">
          
          {/* BILINGUAL FR / EN SWITCHER BUTTON */}
          <button 
            className="lang-switch-btn"
            onClick={toggleLanguage}
            title={lang === 'fr' ? 'Switch to English 🇬🇧' : 'Passer en Français 🇫🇷'}
          >
            <Languages size={15} />
            <span className="lang-code">{lang.toUpperCase()}</span>
            <span className="lang-flag">{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
          </button>

          {/* TELLER FLOATING WIDGET TOGGLE */}
          <button 
            className={`widget-toggle-btn ${showFloatingWidget ? 'active' : ''}`}
            onClick={() => setShowFloatingWidget(!showFloatingWidget)}
            title={showFloatingWidget ? "Masquer le Widget Flottant Caissier" : "Afficher le Widget Flottant Caissier"}
          >
            <Layers size={15} />
            <span>{t.navWidget}</span>
          </button>

          {/* LIVE CLOCK WITH SECONDS */}
          <div className="nav-clock-box">
            <Clock size={15} className="clock-icon" />
            <div className="clock-text-wrap">
              <span className="clock-time">{formattedTime}</span>
              <span className="clock-date">{formattedDate}</span>
            </div>
          </div>

          {/* AUDIO TEST & TOGGLE */}
          <div className="nav-audio-group">
            <button 
              className={`audio-btn ${soundEnabled ? 'audio-on' : 'audio-off'}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t.soundActive : t.soundMuted}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button 
              className="test-sound-btn"
              onClick={handleTestSound}
              title="Tester le carillon et l'annonce vocale"
            >
              <BellRing size={14} />
              <span>{t.testAudio}</span>
            </button>
          </div>

          {/* HORS LIGNE / EDGE STATUS */}
          <div className="edge-status-badge">
            <span className="edge-pulse"></span>
            <ShieldCheck size={14} />
            <span>{t.edgeStatus}</span>
          </div>

        </div>

      </div>

      {/* ── STYLES ULTRA-PREMIUM DEMO COFINA ── */}
      <style>{`
        .nav-container {
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        .nav-top-accent {
          height: 4px;
          background: linear-gradient(90deg, #D3122A 0%, #E31B23 40%, #0F172A 100%);
        }

        .nav-wrapper {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0.6rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.85rem;
        }

        /* BRAND */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-logo-box {
          background: #FFF5F5;
          padding: 0.3rem 0.6rem;
          border-radius: 10px;
          border: 1px solid #FEE2E2;
        }

        .nav-logo-img {
          height: 38px;
          object-fit: contain;
        }

        .nav-brand-info {
          display: flex;
          flex-direction: column;
        }

        .nav-brand-name {
          font-weight: 900;
          font-size: 1.05rem;
          color: #0F172A;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .nav-brand-highlight {
          color: #D3122A;
        }

        .nav-brand-sub {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* AGENCY SELECTOR */
        .agency-picker-container {
          position: relative;
        }

        .agency-picker-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .agency-picker-btn:hover {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(211, 18, 42, 0.08);
        }

        .agency-picker-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #FFF5F5;
          color: #D3122A;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .agency-picker-text {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .picker-label {
          font-size: 0.62rem;
          font-weight: 800;
          color: #94A3B8;
          letter-spacing: 0.05em;
        }

        .picker-value {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0F172A;
        }

        .picker-arrow {
          color: #64748B;
          transition: transform 0.2s ease;
        }

        .picker-arrow.open {
          transform: rotate(180deg);
        }

        .agency-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 300px;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          padding: 0.5rem;
          z-index: 100;
        }

        .menu-hdr {
          padding: 0.5rem 0.75rem;
          font-size: 0.72rem;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .menu-item:hover {
          background: #F8FAFC;
        }

        .menu-item.item-selected {
          background: #FFF5F5;
          border-left: 3px solid #D3122A;
        }

        .item-id {
          background: #0F172A;
          color: #FFFFFF;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.2rem 0.45rem;
          border-radius: 6px;
        }

        .item-details {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-weight: 800;
          font-size: 0.82rem;
          color: #0F172A;
        }

        .item-city {
          font-size: 0.72rem;
          color: #64748B;
        }

        /* TABS MODULE SWITCHER */
        .nav-tabs-wrapper {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #F1F5F9;
          padding: 0.3rem;
          border-radius: 14px;
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.85rem;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.82rem;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-tab-btn:hover {
          color: #0F172A;
          background: rgba(255, 255, 255, 0.6);
        }

        .nav-tab-btn.tab-active {
          background: #0F172A;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .tab-icon {
          flex-shrink: 0;
        }

        .tab-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.45rem;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.2);
          font-weight: 800;
        }

        .nav-tab-btn:not(.tab-active) .tab-badge {
          background: #E2E8F0;
          color: #475569;
        }

        /* RIGHT CONTROLS */
        .nav-right-controls {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        /* BILINGUAL BUTTON */
        .lang-switch-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          background: #F8FAFC;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 800;
          font-size: 0.78rem;
          color: #0F172A;
          transition: all 0.15s ease;
        }

        .lang-switch-btn:hover {
          border-color: #D3122A;
          background: #FFF5F5;
        }

        .lang-code {
          color: #D3122A;
        }

        /* WIDGET TOGGLE BUTTON */
        .widget-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          background: #F1F5F9;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 800;
          font-size: 0.78rem;
          color: #334155;
          transition: all 0.15s ease;
        }

        .widget-toggle-btn.active {
          background: #0F172A;
          color: #FFFFFF;
          border-color: #0F172A;
        }

        .widget-toggle-btn:hover {
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        /* CLOCK WITH SECONDS */
        .nav-clock-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          padding: 0.35rem 0.8rem;
          border-radius: 12px;
        }

        .clock-icon {
          color: #D3122A;
        }

        .clock-text-wrap {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .clock-time {
          font-family: monospace;
          font-size: 0.92rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .clock-date {
          font-size: 0.65rem;
          color: #64748B;
          font-weight: 600;
          text-transform: capitalize;
        }

        /* AUDIO BUTTONS */
        .nav-audio-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .audio-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .audio-btn.audio-on {
          color: #D3122A;
          border-color: #FECACA;
          background: #FFF5F5;
        }

        .audio-btn.audio-off {
          color: #94A3B8;
        }

        .test-sound-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.75rem;
          border: 1.5px solid #E2E8F0;
          background: #FFFFFF;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .test-sound-btn:hover {
          border-color: #0F172A;
          background: #F8FAFC;
        }

        /* STATUS BADGE */
        .edge-status-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #166534;
          padding: 0.38rem 0.75rem;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .edge-pulse {
          width: 7px;
          height: 7px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
          animation: statusPulse 1.5s infinite;
        }

        @keyframes statusPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @media (max-width: 1024px) {
          .nav-wrapper { flex-wrap: wrap; }
          .tab-text { display: none; }
        }
      `}</style>
    </header>
  );
}
