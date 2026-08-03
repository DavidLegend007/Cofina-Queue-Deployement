import React from 'react';
import { 
  Volume2, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Tv, 
  CheckCircle2, 
  Users
} from 'lucide-react';
import { translations } from '../services/translations';

export default function DisplayModule({ agencyName, tickets, lastCalledTicket, lang = 'fr' }) {
  const t = translations[lang] || translations.fr;
  const activeTickets = tickets.filter(t => t.status === 'CALLED' || t.status === 'IN_PROGRESS');
  const waitingTickets = tickets.filter(t => t.status === 'WAITING');

  const waitingByService = COFINA_SERVICES.map(svc => {
    const count = waitingTickets.filter(t => t.serviceCode === svc.code).length;
    return { ...svc, count };
  });

  return (
    <div className="disp-root">
      {/* ── TOP HEADER ── */}
      <header className="disp-header">
        <div className="disp-hdr-left">
          <div className="disp-logo-box">
            <img src="/COFINA.png" alt="Cofina Logo" className="disp-logo-img" />
          </div>
          <div className="disp-hdr-title">
            <h1 className="disp-agency">{agencyName}</h1>
            <span className="disp-sub">{t.displayTitle}</span>
          </div>
        </div>

        <div className="disp-hdr-right">
          <div className="disp-badge disp-badge-audio">
            <Volume2 size={16} className="audio-icon-pulse" />
            <span>{t.soundActive}</span>
          </div>
          <div className="disp-clock">
            {new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* ── MAIN SPOTLIGHT BANNER (LAST CALLED) ── */}
      {lastCalledTicket ? (
        <section className="disp-hero-call animate-pop">
          <div className="disp-call-left">
            <span className="disp-call-badge">
              <Sparkles size={18} /> {t.displayNowCalling}
            </span>
            <div className="disp-call-ticket">{lastCalledTicket.ticketNumber}</div>
            <div className="disp-call-service">{lastCalledTicket.serviceName}</div>
          </div>

          <div className="disp-call-arrow">
            <ArrowRight size={54} />
          </div>

          <div className="disp-call-right">
            <span className="disp-call-dest-lbl">{t.displayGoToCounter}</span>
            <div className="disp-call-counter">{t.displayCounter} {lastCalledTicket.counterNumber}</div>
            <div className="disp-call-agent">Teller : {lastCalledTicket.agentName || 'Cofina Agent'}</div>
          </div>
        </section>
      ) : (
        <section className="disp-hero-empty">
          <div className="disp-empty-icon"><Tv size={42} /></div>
          <div className="disp-empty-txt">
            <h2>EN ATTENTE D'UN NOUVEL APPEL</h2>
            <p>Veuillez consulter les numéros ci-dessous et vous tenir prêt</p>
          </div>
        </section>
      )}

      {/* ── 2 COLUMNS GRID ── */}
      <main className="disp-grid">

        {/* LEFT: 4 CAISSES EN DIRECT */}
        <section className="disp-col-main">
          <div className="disp-sec-bar">
            <div className="disp-sec-title">
              <h2>CAISSES EN SERVICE</h2>
              <span className="disp-pulse-green">● EN DIRECT</span>
            </div>
            <span className="disp-sec-sub">Postes 1 à 4</span>
          </div>

          <div className="disp-counters-grid">
            {[1, 2, 3, 4].map(num => {
              const cur = activeTickets.find(t => t.counterNumber === num);
              return (
                <div key={num} className={`disp-caisse-card ${cur ? 'active-caisse' : 'idle-caisse'}`}>
                  <div className="caisse-top">
                    <span className="caisse-num-badge">CAISSE {num}</span>
                    {cur && <span className="caisse-status-dot">En traitement</span>}
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

        {/* RIGHT: FILE D'ATTENTE */}
        <aside className="disp-col-side">
          <div className="disp-sec-bar">
            <div className="disp-sec-title">
              <h2>FILE D'ATTENTE</h2>
            </div>
            <span className="disp-count-chip">
              <Users size={14} /> {waitingTickets.length} en attente
            </span>
          </div>

          <div className="disp-services-list">
            {waitingByService.map(svc => (
              <div key={svc.code} className="disp-svc-row">
                <div className="disp-svc-info">
                  <span className="disp-svc-badge" style={{ background: svc.color }}>
                    {svc.code}
                  </span>
                  <div className="disp-svc-names">
                    <span className="disp-svc-name">{svc.name}</span>
                    <span className="disp-svc-time"><Clock size={12} /> ~{svc.avgTimeMin} min</span>
                  </div>
                </div>

                <div className={`disp-svc-cnt ${svc.count > 0 ? 'cnt-has' : 'cnt-empty'}`}>
                  {svc.count}
                </div>
              </div>
            ))}
          </div>

          {/* RÉCEMMENT TRAITÉS */}
          <div className="disp-completed-box">
            <div className="disp-comp-hdr">Derniers tickets servis</div>
            <div className="disp-comp-chips">
              {tickets.filter(t => t.status === 'COMPLETED').slice(0, 4).map(t => (
                <span key={t.id} className="disp-chip-done">
                  <CheckCircle2 size={13} /> {t.ticketNumber}
                </span>
              ))}
              {tickets.filter(t => t.status === 'COMPLETED').length === 0 && (
                <span className="disp-chip-none">Aucun ticket traité aujourd'hui</span>
              )}
            </div>
          </div>
        </aside>

      </main>

      {/* ── FOOTER TICKER ── */}
      <footer className="disp-footer">
        <div className="disp-foot-tag">INFORMATION</div>
        <div className="disp-foot-marquee">
          <marquee scrollamount="5">
            Bienvenue chez COFINA Togo • Pour vos dépôts, retraits et ouvertures de compte, nos équipes vous accueillent • Pensez à préparer votre pièce d'identité • Merci de patienter en salle d'attente
          </marquee>
        </div>
      </footer>

      {/* ── LIGHT STYLES ── */}
      <style>{`
        .disp-root {
          min-height: 100vh;
          background: #F4F6F9;
          color: #0F172A;
          padding: 1.25rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          box-sizing: border-box;
        }

        /* HEADER */
        .disp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          padding: 1rem 1.75rem;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .disp-hdr-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .disp-logo-box {
          background: #FFF5F5;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          border: 1px solid #FEE2E2;
        }

        .disp-logo-img {
          height: 42px;
          object-fit: contain;
        }

        .disp-hdr-title {
          display: flex;
          flex-direction: column;
        }

        .disp-agency {
          font-size: 1.3rem;
          font-weight: 900;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .disp-sub {
          font-size: 0.75rem;
          font-weight: 700;
          color: #D3122A;
          letter-spacing: 0.05em;
        }

        .disp-hdr-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .disp-badge-audio {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #D3122A;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.45rem 0.9rem;
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
          font-size: 1.8rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        /* HERO SPOTLIGHT BANNER */
        .disp-hero-call {
          background: linear-gradient(135deg, #D3122A 0%, #B90E23 100%);
          border-radius: 20px;
          padding: 1.75rem 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
          box-shadow: 0 12px 30px rgba(211, 18, 42, 0.35);
          animation: popBanner 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes popBanner {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .disp-call-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0, 0, 0, 0.25);
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          margin-bottom: 0.4rem;
          letter-spacing: 0.05em;
        }

        .disp-call-ticket {
          font-size: 5rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .disp-call-service {
          font-size: 1.2rem;
          font-weight: 600;
          opacity: 0.92;
          margin-top: 0.2rem;
        }

        .disp-call-arrow {
          animation: slideArrow 1s infinite alternate ease-in-out;
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
          font-size: 0.82rem;
          font-weight: 800;
          opacity: 0.9;
          letter-spacing: 0.05em;
        }

        .disp-call-counter {
          font-size: 3.8rem;
          font-weight: 900;
          line-height: 1;
          margin-top: 0.1rem;
        }

        .disp-call-agent {
          font-size: 0.95rem;
          opacity: 0.9;
          margin-top: 0.3rem;
        }

        .disp-hero-empty {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .disp-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #FFF5F5;
          color: #D3122A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .disp-empty-txt h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.2rem;
        }

        .disp-empty-txt p {
          font-size: 0.88rem;
          color: #64748B;
          margin: 0;
        }

        /* GRID LAYOUT */
        .disp-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          flex: 1;
        }

        .disp-sec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #E2E8F0;
        }

        .disp-sec-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .disp-sec-title h2 {
          font-size: 1rem;
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
          font-size: 0.8rem;
          color: #94A3B8;
          font-weight: 600;
        }

        /* CAISSES GRID */
        .disp-counters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .disp-caisse-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 150px;
          transition: all 0.2s ease;
        }

        .disp-caisse-card.active-caisse {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 8px 24px rgba(211, 18, 42, 0.12);
        }

        .caisse-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .caisse-num-badge {
          font-size: 0.85rem;
          font-weight: 900;
          color: #D3122A;
          letter-spacing: 0.05em;
        }

        .caisse-status-dot {
          font-size: 0.72rem;
          font-weight: 700;
          background: #DEF7EC;
          color: #03543F;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
        }

        .caisse-ticket {
          font-size: 3rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1;
          margin: 0.4rem 0 0.2rem;
          letter-spacing: -0.02em;
        }

        .caisse-service {
          font-size: 0.85rem;
          color: #64748B;
          font-weight: 600;
        }

        .caisse-idle-body {
          margin-top: 1.5rem;
          color: #CBD5E1;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          padding: 1rem 0;
          background: #F8FAFC;
          border-radius: 10px;
          border: 1px dashed #E2E8F0;
        }

        /* SIDEBAR FILE D'ATTENTE */
        .disp-col-side {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .disp-count-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #EFF6FF;
          color: #1D4ED8;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 99px;
        }

        .disp-services-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .disp-svc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #F1F5F9;
        }

        .disp-svc-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .disp-svc-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .disp-svc-names {
          display: flex;
          flex-direction: column;
        }

        .disp-svc-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0F172A;
        }

        .disp-svc-time {
          font-size: 0.72rem;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .disp-svc-cnt {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-weight: 800;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cnt-has {
          background: #D3122A;
          color: #FFFFFF;
        }

        .cnt-empty {
          background: #E2E8F0;
          color: #64748B;
        }

        /* RECENTLY COMPLETED */
        .disp-completed-box {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #F1F5F9;
        }

        .disp-comp-hdr {
          font-size: 0.75rem;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }

        .disp-comp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .disp-chip-done {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #DEF7EC;
          color: #03543F;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.3rem 0.65rem;
          border-radius: 8px;
        }

        .disp-chip-none {
          font-size: 0.78rem;
          color: #CBD5E1;
        }

        /* FOOTER TICKER */
        .disp-footer {
          display: flex;
          align-items: center;
          background: #0F172A;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .disp-foot-tag {
          background: #D3122A;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.8rem;
          padding: 0.75rem 1.25rem;
          white-space: nowrap;
        }

        .disp-foot-marquee {
          flex: 1;
          color: #F8FAFC;
          font-size: 0.88rem;
          font-weight: 600;
          padding-right: 1rem;
        }

        @media (max-width: 900px) {
          .disp-grid { grid-template-columns: 1fr; }
          .disp-counters-grid { grid-template-columns: 1fr; }
          .disp-root { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}

