import React, { useState } from 'react';
import { 
  BarChart2, 
  Clock, 
  Users, 
  CheckCircle2, 
  Database, 
  RefreshCw, 
  Zap,
  TrendingUp,
  Server,
  Activity,
  ShieldCheck,
  HardDrive,
  Lock,
  Sparkles,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  COFINA_SERVICES, 
  createTicket, 
  resetAgencyQueue 
} from '../services/queueStore';

import { translations } from '../services/translations';

export default function AdminModule({ agencyName, tickets, onRefresh, lang = 'fr' }) {
  const t = translations[lang] || translations.fr;
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const totalToday = tickets.length;
  const waitingCount = tickets.filter(t => t.status === 'WAITING').length;
  const inProgressCount = tickets.filter(t => t.status === 'CALLED' || t.status === 'IN_PROGRESS').length;
  const completedTickets = tickets.filter(t => t.status === 'COMPLETED');
  const completedCount = completedTickets.length;

  // Temps moyen d'attente basique
  let totalWaitSec = 0;
  const ticketsWithWait = tickets.filter(t => t.calledAt && t.createdAt);
  ticketsWithWait.forEach(t => {
    const diff = (new Date(t.calledAt) - new Date(t.createdAt)) / 1000;
    if (diff > 0) totalWaitSec += diff;
  });
  const avgWaitMin = ticketsWithWait.length > 0 ? Math.round((totalWaitSec / ticketsWithWait.length) / 60) : 0;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulateTraffic = () => {
    setIsSimulating(true);
    const services = ['A', 'A', 'B', 'C', 'V'];
    for (let i = 0; i < 4; i++) {
      const code = services[Math.floor(Math.random() * services.length)];
      createTicket(code, null, null, lang);
    }
    setTimeout(() => {
      setIsSimulating(false);
      showToast(lang === 'en' ? "4 test tickets added to queue!" : "4 tickets de test ajoutés à la file !");
    }, 400);
  };

  const handleResetQueue = () => {
    if (window.confirm(`Voulez-vous vraiment réinitialiser la file d'attente de l'${agencyName} ?\nToutes les données de la journée seront effacées.`)) {
      resetAgencyQueue();
      showToast("File d'attente réinitialisée pour la journée.");
    }
  };

  return (
    <div className="adm-root">
      
      {/* ── HEADER ── */}
      <header className="adm-header">
        <div className="adm-hdr-left">
          <div className="adm-server-badge">
            <Server size={16} />
            <span>EXPLOITATION AGENCE LOCAL</span>
          </div>
          <div>
            <h1 className="adm-title">Console de Gestion — {agencyName}</h1>
            <p className="adm-subtitle">Panneau réservé aux chefs d'agence &amp; agents Cofina • Serveur Edge Autonome</p>
          </div>
        </div>

        <div className="adm-hdr-actions">
          <button className="adm-btn adm-btn-sim" onClick={handleSimulateTraffic} disabled={isSimulating}>
            <Zap size={16} /> {isSimulating ? 'Ajout...' : 'Simuler Trafic (+4)'}
          </button>
          <button className="adm-btn adm-btn-danger" onClick={handleResetQueue}>
            <RefreshCw size={16} /> Réinitialiser la Journée
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="adm-toast">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* ── KPIS CARDS (OPERATIONAL ONLY) ── */}
      <section className="adm-kpis-grid">
        <div className="adm-kpi-card">
          <div className="adm-kpi-top">
            <span className="adm-kpi-lbl">TICKETS ÉMIS JOURNÉE</span>
            <div className="adm-kpi-ico ico-blue"><Users size={18} /></div>
          </div>
          <div className="adm-kpi-val">{totalToday}</div>
          <span className="adm-kpi-sub">Total borne aujourd'hui</span>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-top">
            <span className="adm-kpi-lbl">EN ATTENTE SALLE</span>
            <div className="adm-kpi-ico ico-amber"><Clock size={18} /></div>
          </div>
          <div className="adm-kpi-val val-amber">{waitingCount}</div>
          <span className="adm-kpi-sub">Clients en attente</span>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-top">
            <span className="adm-kpi-lbl">CLIENTS TRAITÉS</span>
            <div className="adm-kpi-ico ico-green"><CheckCircle2 size={18} /></div>
          </div>
          <div className="adm-kpi-val val-green">{completedCount}</div>
          <span className="adm-kpi-sub">Passés aux guichets</span>
        </div>

        <div className="adm-kpi-card">
          <div className="adm-kpi-top">
            <span className="adm-kpi-lbl">TEMPS MOYEN BRUT</span>
            <div className="adm-kpi-ico ico-red"><TrendingUp size={18} /></div>
          </div>
          <div className="adm-kpi-val val-red">{avgWaitMin} <span className="adm-unit">min</span></div>
          <span className="adm-kpi-sub">Estimation locale brute</span>
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="adm-grid-main">

        {/* LEFT COLUMN: BASIC SERVICE COUNTS */}
        <section className="adm-card">
          <div className="adm-card-hdr">
            <div className="adm-card-hdr-title">
              <BarChart2 size={18} className="adm-card-ico" />
              <h2>Volumes par Service</h2>
            </div>
            <span className="adm-tag-sub">Compteur instantané</span>
          </div>

          <div className="adm-services-list">
            {COFINA_SERVICES.map(svc => {
              const count = tickets.filter(t => t.serviceCode === svc.code).length;
              const pct = totalToday > 0 ? Math.round((count / totalToday) * 100) : 0;
              return (
                <div key={svc.code} className="adm-svc-item">
                  <div className="adm-svc-top">
                    <div className="adm-svc-info">
                      <span className="adm-svc-code" style={{ background: svc.color }}>{svc.code}</span>
                      <span className="adm-svc-name">{svc.name}</span>
                    </div>
                    <span className="adm-svc-stats">
                      <strong>{count}</strong> tickets ({pct}%)
                    </span>
                  </div>
                  <div className="adm-bar-track">
                    <div className="adm-bar-fill" style={{ width: `${pct}%`, background: svc.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* DIAGNOSTIC MATÉRIEL SIMPLIFIÉ */}
          <div className="adm-hardware-box">
            <div className="hw-title">
              <Server size={15} /> État Matériel Agence
            </div>
            <div className="hw-grid">
              <div className="hw-item"><span>Serveur Edge :</span> <strong className="txt-green">En ligne</strong></div>
              <div className="hw-item"><span>Borne Tactile :</span> <strong className="txt-green">Connectée</strong></div>
              <div className="hw-item"><span>Écran TV :</span> <strong className="txt-green">Connecté</strong></div>
              <div className="hw-item"><span>Imprimante :</span> <strong className="txt-green">Prête</strong></div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LOCKED DATA ANALYTICS MODULE (THE TEASER THAT MAKES THEM NEED YOU!) */}
        <section className="adm-card adm-analytics-teaser">
          <div className="adm-card-hdr">
            <div className="adm-card-hdr-title">
              <Sparkles size={18} className="adm-card-ico gold" />
              <h2>Intelligence Opérationnelle &amp; Data</h2>
            </div>
            <span className="adm-tag-locked"><Lock size={12} /> Service Expert</span>
          </div>

          {/* Locked Features Preview */}
          <div className="teaser-content">
            <div className="teaser-alert-banner">
              <AlertCircle size={20} className="teaser-alert-ico" />
              <div>
                <strong>Analyse Décisionnelle &amp; Consolidation Groupe</strong>
                <p>Les fonctionnalités d'analyse avancée et de reporting comparatif 4 agences nécessitent le traitement mensuel par votre Data Analyste dédié.</p>
              </div>
            </div>

            <div className="teaser-locked-features">
              <div className="locked-feature-card">
                <div className="lf-hdr">
                  <span className="lf-title">📊 Prédiction des Pics de Charge</span>
                  <Lock size={14} className="lf-lock" />
                </div>
                <p>Modélisation horaire par agence pour optimiser l'ouverture des guichets.</p>
              </div>

              <div className="locked-feature-card">
                <div className="lf-hdr">
                  <span className="lf-title">🏢 Comparatif Inter-Agences (Lomé)</span>
                  <Lock size={14} className="lf-lock" />
                </div>
                <p>Benchmarking des 4 agences (Kodjoviakopé, Grand Marché, Hédzranawoé, Bè).</p>
              </div>

              <div className="locked-feature-card">
                <div className="lf-hdr">
                  <span className="lf-title">📈 Audit de Performance Caissiers &amp; SLA</span>
                  <Lock size={14} className="lf-lock" />
                </div>
                <p>Rapports mensuels de productivité et ratios d'absentéisme clients.</p>
              </div>
            </div>

            {/* Call to action for Cofina Management */}
            <div className="teaser-footer-box">
              <div className="tf-badge">💼 Service Data Analytics</div>
              <p>Pour activer le rapport mensuel exécutif PDF et le tableau de bord de la Direction Générale, contactez votre Data Analyste référent.</p>
            </div>
          </div>
        </section>

      </div>

      {/* ── STYLES ── */}
      <style>{`
        .adm-root {
          max-width: 1350px;
          margin: 1.5rem auto;
          padding: 0 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        /* HEADER */
        .adm-header {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1.5rem 2rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .adm-hdr-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .adm-server-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #0F172A;
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.45rem 0.85rem;
          border-radius: 99px;
          letter-spacing: 0.05em;
        }

        .adm-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0F172A;
          margin: 0;
        }

        .adm-subtitle {
          font-size: 0.82rem;
          color: #64748B;
          margin: 0.15rem 0 0;
        }

        .adm-hdr-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .adm-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1.1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .adm-btn-sim {
          background: #EFF6FF;
          color: #1D4ED8;
          border-color: #BFDBFE;
        }

        .adm-btn-sim:hover { background: #DBEAFE; }

        .adm-btn-danger {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FECACA;
        }

        .adm-btn-danger:hover { background: #FEE2E2; }

        .adm-toast {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #0F172A;
          color: #FFFFFF;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          animation: fadeIn 0.2s ease;
        }

        /* KPIS GRID */
        .adm-kpis-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .adm-kpi-card {
          background: #FFFFFF;
          border-radius: 18px;
          padding: 1.35rem 1.25rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: transform 0.2s ease;
        }

        .adm-kpi-card:hover { transform: translateY(-2px); }

        .adm-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .adm-kpi-lbl {
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748B;
          letter-spacing: 0.05em;
        }

        .adm-kpi-ico {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ico-blue  { background: #EFF6FF; color: #2563EB; }
        .ico-amber { background: #FFFBEB; color: #D97706; }
        .ico-green { background: #F0FDF4; color: #10B981; }
        .ico-red   { background: #FFF5F5; color: #D3122A; }

        .adm-kpi-val {
          font-size: 2.4rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1;
          margin: 0.5rem 0 0.2rem;
        }

        .val-amber { color: #D97706; }
        .val-green { color: #10B981; }
        .val-red   { color: #D3122A; }

        .adm-unit { font-size: 1rem; color: #64748B; font-weight: 600; }

        .adm-kpi-sub {
          font-size: 0.72rem;
          color: #94A3B8;
        }

        /* GRID MAIN */
        .adm-grid-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .adm-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .adm-card-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #F1F5F9;
        }

        .adm-card-hdr-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .adm-card-hdr-title h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }

        .adm-card-ico { color: #D3122A; }
        .adm-card-ico.gold { color: #D97706; }

        .adm-tag-sub { font-size: 0.75rem; color: #94A3B8; font-weight: 600; }

        .adm-tag-locked {
          background: #FFFBEB;
          color: #B45309;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.25rem 0.65rem;
          border-radius: 99px;
          border: 1px solid #FDE68A;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* SERVICE BREAKDOWN */
        .adm-services-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .adm-svc-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .adm-svc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .adm-svc-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .adm-svc-code {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-svc-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: #1E293B;
        }

        .adm-svc-stats {
          font-size: 0.8rem;
          color: #64748B;
        }

        .adm-bar-track {
          height: 8px;
          background: #F1F5F9;
          border-radius: 99px;
          overflow: hidden;
        }

        .adm-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s ease;
        }

        /* HARDWARE BOX */
        .adm-hardware-box {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 0.9rem 1.1rem;
          border: 1px solid #F1F5F9;
          margin-top: 0.5rem;
        }

        .hw-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.5rem;
        }

        .hw-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.4rem;
          font-size: 0.78rem;
        }

        .hw-item { color: #64748B; }
        .txt-green { color: #10B981; }

        /* TEASER CONTENT (RIGHT PANEL) */
        .teaser-content {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .teaser-alert-banner {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .teaser-alert-ico {
          color: #D97706;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .teaser-alert-banner strong {
          font-size: 0.85rem;
          color: #78350F;
          display: block;
          margin-bottom: 0.2rem;
        }

        .teaser-alert-banner p {
          font-size: 0.78rem;
          color: #92400E;
          margin: 0;
          line-height: 1.4;
        }

        .teaser-locked-features {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .locked-feature-card {
          background: #FAFAFA;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          opacity: 0.85;
          transition: all 0.2s ease;
        }

        .locked-feature-card:hover {
          background: #FFFFFF;
          border-color: #D97706;
          opacity: 1;
        }

        .lf-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .lf-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #1E293B;
        }

        .lf-lock { color: #D97706; }

        .locked-feature-card p {
          font-size: 0.75rem;
          color: #64748B;
          margin: 0;
        }

        .teaser-footer-box {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          color: #FFFFFF;
          border-radius: 14px;
          padding: 1.1rem;
          text-align: center;
        }

        .tf-badge {
          display: inline-block;
          background: #D3122A;
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          margin-bottom: 0.5rem;
        }

        .teaser-footer-box p {
          font-size: 0.78rem;
          color: #E2E8F0;
          margin: 0;
          line-height: 1.45;
        }

        @media (max-width: 900px) {
          .adm-kpis-grid { grid-template-columns: repeat(2, 1fr); }
          .adm-grid-main { grid-template-columns: 1fr; }
          .adm-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

