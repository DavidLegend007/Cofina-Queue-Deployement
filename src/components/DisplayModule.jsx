import React from 'react';
import { 
  Volume2, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Tv, 
  CheckCircle2, 
  Users,
  ShieldCheck,
  Megaphone
} from 'lucide-react';
import { translations } from '../services/translations';
import { COFINA_SERVICES } from '../services/queueStore';

export default function DisplayModule({ agencyName, tickets, lastCalledTicket, lang = 'fr' }) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const t = translations[lang] || translations.fr;
  const activeTickets = tickets.filter(t => t.status === 'CALLED' || t.status === 'IN_PROGRESS');
  const waitingTickets = tickets.filter(t => t.status === 'WAITING');

  const waitingByService = COFINA_SERVICES.map(svc => {
    const count = waitingTickets.filter(t => t.serviceCode === svc.code).length;
    return { ...svc, count };
  });

  return (
    <div className="disp-root animate-fade-in">
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
          <div className="disp-badge disp-badge-audio">
            <Volume2 size={16} className="audio-icon-pulse" />
            <span>{t.soundActive}</span>
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
              <Sparkles size={16} /> {t.displayNowCalling}
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
            <div className="disp-call-agent">Caissier : {lastCalledTicket.agentName || 'Agent Cofina'}</div>
          </div>
        </section>
      ) : (
        <section className="disp-hero-empty">
          <div className="disp-empty-icon"><Tv size={36} /></div>
          <div className="disp-empty-txt">
            <h2>EN ATTENTE D'UN NOUVEL APPEL</h2>
            <p>Veuillez vous installer en salle d'attente. Votre numéro sera annoncé à l'écran.</p>
          </div>
        </section>
      )}

      {/* ── 2 COLUMNS GRID ── */}
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
                      <span className="caisse-pole-tag" style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>{poste.pole}</span>
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
                <span className="disp-chip-none">Aucun ticket encore clôturé aujourd'hui</span>
              )}
            </div>
          </div>
        </aside>

      </main>

      {/* ── FOOTER TICKER ── */}
      <footer className="disp-footer">
        <div className="disp-foot-tag">INFORMATION AGENT</div>
        <div className="disp-foot-marquee">
          <marquee scrollamount="5">
            Cher Client, N'attendez plus, créez votre alias PI-SPI Cofina ! Simple, rapide et sécurisé. Suivez les étapes: https://bit.ly/4baN7O 0. Assistance au 92686060. • Bienvenue chez COFINA Togo • Pour vos dépôts, retraits et ouvertures de compte, nos caisses vous accueillent • Pensez à préparer votre pièce d'identité
          </marquee>
        </div>
      </footer>

      {/* ── STYLES LUMINEUX HAUTE VISIBILITÉ (LIGHT MODE) ── */}
      <style>{`
        .disp-root {
          min-height: 100vh;
          background: #F8FAFC;
          color: #0F172A;
          padding: 1.5rem 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          box-sizing: border-box;
        }

        /* HEADER */
        .disp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          padding: 1.1rem 2rem;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04);
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
          font-size: 1.35rem;
          font-weight: 900;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .disp-sub {
          font-size: 0.78rem;
          font-weight: 800;
          color: #D3122A;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .disp-hdr-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .disp-badge-audio {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFF5F5;
          border: 1px solid #FECACA;
          color: #D3122A;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.45rem 1rem;
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
          font-size: 2rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.03em;
        }

        /* HERO SPOTLIGHT BANNER */
        .disp-hero-call {
          background: linear-gradient(135deg, #D3122A 0%, #B90E23 100%);
          border-radius: 24px;
          padding: 2rem 3.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
          box-shadow: 0 16px 36px rgba(211, 18, 42, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .disp-call-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          font-size: 0.82rem;
          font-weight: 800;
          padding: 0.4rem 1rem;
          border-radius: 99px;
          margin-bottom: 0.5rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .disp-call-ticket {
          font-size: 5.5rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.04em;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .disp-call-service {
          font-size: 1.3rem;
          font-weight: 700;
          opacity: 0.95;
          margin-top: 0.2rem;
        }

        .disp-call-arrow {
          animation: slideArrow 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255, 255, 255, 0.9);
        }

        @keyframes slideArrow {
          from { transform: translateX(-10px); }
          to { transform: translateX(10px); }
        }

        .disp-call-right {
          text-align: right;
        }

        .disp-call-dest-lbl {
          font-size: 0.85rem;
          font-weight: 800;
          opacity: 0.9;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .disp-call-counter {
          font-size: 4.2rem;
          font-weight: 900;
          line-height: 1;
          margin-top: 0.1rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .disp-call-agent {
          font-size: 1rem;
          opacity: 0.9;
          margin-top: 0.4rem;
          font-weight: 600;
        }

        .disp-hero-empty {
          background: #FFFFFF;
          border: 1.5px dashed #CBD5E1;
          border-radius: 24px;
          padding: 2.2rem;
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
          font-size: 1.3rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.25rem;
        }

        .disp-empty-txt p {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
        }

        /* GRID LAYOUT */
        .disp-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 1.75rem;
          flex: 1;
        }

        .disp-sec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.6rem;
          border-bottom: 2px solid #E2E8F0;
        }

        .disp-sec-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .disp-sec-title h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .disp-pulse-green {
          font-size: 0.75rem;
          font-weight: 800;
          color: #10B981;
        }

        .disp-sec-sub {
          font-size: 0.82rem;
          color: #94A3B8;
          font-weight: 600;
        }

        /* CAISSES & POSTES GRID */
        .disp-counters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .disp-caisse-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 1.25rem;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 150px;
          transition: all 0.2s ease;
        }

        .disp-caisse-card.active-caisse {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 12px 30px rgba(211, 18, 42, 0.12);
        }

        .caisse-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .caisse-num-badge {
          font-size: 0.88rem;
          font-weight: 900;
          color: #D3122A;
          letter-spacing: 0.06em;
        }

        .caisse-status-dot {
          font-size: 0.75rem;
          font-weight: 800;
          background: #DEF7EC;
          color: #03543F;
          border: 1px solid #A7F3D0;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
        }

        .caisse-ticket {
          font-size: 3.5rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1;
          margin: 0.5rem 0 0.2rem;
          letter-spacing: -0.03em;
        }

        .caisse-service {
          font-size: 0.9rem;
          color: #64748B;
          font-weight: 600;
        }

        .caisse-idle-body {
          margin-top: 1.5rem;
          color: #94A3B8;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          padding: 1.1rem 0;
          background: #F8FAFC;
          border-radius: 14px;
          border: 1px dashed #CBD5E1;
        }

        /* SIDEBAR FILE D'ATTENTE */
        .disp-col-side {
          background: #FFFFFF;
          border-radius: 22px;
          padding: 1.75rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }

        .disp-count-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
        }

        .disp-services-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .disp-svc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.1rem;
          background: #F8FAFC;
          border-radius: 14px;
          border: 1px solid #F1F5F9;
        }

        .disp-svc-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .disp-svc-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .disp-svc-names {
          display: flex;
          flex-direction: column;
        }

        .disp-svc-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0F172A;
        }

        .disp-svc-time {
          font-size: 0.75rem;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }

        .disp-svc-cnt {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          font-weight: 900;
          font-size: 0.92rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cnt-has {
          background: #D3122A;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(211, 18, 42, 0.3);
        }

        .cnt-empty {
          background: #E2E8F0;
          color: #64748B;
        }

        /* RECENTLY COMPLETED */
        .disp-completed-box {
          margin-top: auto;
          padding-top: 1.1rem;
          border-top: 1px solid #F1F5F9;
        }

        .disp-comp-hdr {
          font-size: 0.78rem;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          letter-spacing: 0.05em;
        }

        .disp-comp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .disp-chip-done {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #DEF7EC;
          color: #03543F;
          border: 1px solid #A7F3D0;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: 10px;
        }

        .disp-chip-none {
          font-size: 0.8rem;
          color: #CBD5E1;
        }

        /* FOOTER TICKER */
        .disp-footer {
          display: flex;
          align-items: center;
          background: #0F172A;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .disp-foot-tag {
          background: #D3122A;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.82rem;
          padding: 0.85rem 1.4rem;
          white-space: nowrap;
          letter-spacing: 0.05em;
        }

        .disp-foot-marquee {
          flex: 1;
          color: #F8FAFC;
          font-size: 0.92rem;
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
