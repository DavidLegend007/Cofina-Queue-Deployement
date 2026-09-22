import React, { useState, useEffect } from 'react';
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
  Unlock,
  Sparkles,
  FileText,
  AlertCircle,
  Check,
  Download,
  Cloud,
  CloudOff,
  ShieldAlert,
  Key,
  UploadCloud
} from 'lucide-react';
import { 
  COFINA_SERVICES, 
  createTicket, 
  resetAgencyQueue,
  fetchBackupList,
  createDatabaseBackupAction,
  getBackupDownloadUrl,
  fetchSyncStatus,
  triggerCloudSyncAction,
  loginAsAdmin,
  logoutAdmin,
  getAdminToken
} from '../services/queueStore';

import { translations } from '../services/translations';

export default function AdminModule({ agencyName, tickets, onRefresh, lang = 'fr' }) {
  const t = translations[lang] || translations.fr;
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Authentification Admin & Sécurité RBAC
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => !!getAdminToken());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Sauvegardes SQLite
  const [backups, setBackups] = useState([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Synchronisation Cloud Outbox
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadBackups = async () => {
    try {
      const list = await fetchBackupList();
      setBackups(list);
    } catch (_) {}
  };

  const loadSyncStatus = async () => {
    try {
      const status = await fetchSyncStatus();
      setSyncStatus(status);
    } catch (_) {}
  };

  useEffect(() => {
    loadBackups();
    loadSyncStatus();
    const interval = setInterval(() => {
      loadSyncStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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

  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');
    try {
      await loginAsAdmin(adminPasswordInput);
      setIsAdminUnlocked(true);
      setShowPasswordModal(false);
      setAdminPasswordInput('');
      showToast("Session Administrateur déverrouillée avec succès !");
      loadBackups();
    } catch (err) {
      setAuthError('Mot de passe Administrateur incorrect');
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdminUnlocked(false);
    showToast("Session Administrateur verrouillée.");
  };

  const handleCreateBackup = async () => {
    if (!isAdminUnlocked) {
      setShowPasswordModal(true);
      return;
    }
    setIsBackingUp(true);
    try {
      const res = await createDatabaseBackupAction();
      showToast(`Sauvegarde créée : ${res.backup?.filename}`);
      await loadBackups();
    } catch (e) {
      showToast("Erreur lors de la création de la sauvegarde.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!isAdminUnlocked) {
      setShowPasswordModal(true);
      return;
    }
    setIsSyncing(true);
    try {
      const res = await triggerCloudSyncAction();
      showToast(`Synchronisation exécutée (${res.result?.processed || 0} événements traités)`);
      await loadSyncStatus();
    } catch (e) {
      showToast("Erreur lors de la synchronisation.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateTraffic = async () => {
    setIsSimulating(true);
    const services = ['D', 'D', 'R', 'O', 'S'];
    try {
      for (let i = 0; i < 4; i++) {
        const code = services[Math.floor(Math.random() * services.length)];
        await createTicket(code, null, null, lang);
      }
      showToast(lang === 'en' ? "4 test tickets added to queue!" : "4 tickets de test ajoutés à la file !");
    } catch (e) {
      showToast("Erreur lors de la simulation. Vérifiez que le serveur est démarré.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetQueue = async () => {
    if (!isAdminUnlocked) {
      setShowPasswordModal(true);
      return;
    }

    if (window.confirm(`Voulez-vous vraiment archiver la semaine (Lundi → Samedi 14h) en base de données et réinitialiser la file d'attente ?\n\nTous les tickets de la semaine seront automatiquement sauvegardés en base de données SQLite.`)) {
      try {
        await resetAgencyQueue();
        showToast("Semaine (Lundi - Samedi 14h) archivée en BDD SQLite & File d'attente réinitialisée !");
        if (onRefresh) onRefresh();
        loadBackups();
        loadSyncStatus();
      } catch (e) {
        showToast("Erreur lors de l'archivage. Vérifiez que le mot de passe admin est valide.");
      }
    }
  };

  return (
    <div className="adm-root animate-fade-in">
      
      {/* ── HEADER ── */}
      <header className="adm-header glass-card">
        <div className="adm-hdr-left">
          <div className="adm-server-badge">
            <Server size={15} />
            <span>CYCLE HEBDOMADAIRE (LUNDI MATIN → SAMEDI 14H00)</span>
          </div>
          <div>
            <h1 className="adm-title">Console de Gestion — {agencyName}</h1>
            <p className="adm-subtitle">Serveur Edge Autonome • Sauvegarde Automatique &amp; Réinitialisation du Lundi au Samedi 14h00</p>
          </div>
        </div>

        <div className="adm-hdr-actions">
          <button 
            className={`adm-btn ${isAdminUnlocked ? 'adm-btn-unlocked' : 'adm-btn-locked'}`} 
            onClick={() => isAdminUnlocked ? handleAdminLogout() : setShowPasswordModal(true)}
            title={isAdminUnlocked ? "Verrouiller la console Administrateur" : "Déverrouiller pour activer les fonctions sensibles"}
          >
            {isAdminUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
            {isAdminUnlocked ? 'Admin Déverrouillé' : 'Déverrouiller Admin'}
          </button>
          <button className="adm-btn adm-btn-sim" onClick={handleSimulateTraffic} disabled={isSimulating}>
            <Zap size={16} /> {isSimulating ? 'Ajout...' : 'Simuler Trafic (+4)'}
          </button>
          <button className="adm-btn adm-btn-danger" onClick={handleResetQueue} title="Archiver la semaine en DB et démarrer un nouveau cycle">
            <Database size={16} /> Archiver Semaine &amp; Réinitialiser (Samedi 14h)
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
        <section className="adm-card glass-card">
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

        {/* RIGHT COLUMN: LOCKED DATA ANALYTICS MODULE */}
        <section className="adm-card adm-analytics-teaser glass-card">
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

      {/* ── SECTIONS TECHNIQUES : SAUVEGARDES SQLITE & SYNCHRONISATION CLOUD ── */}
      <div className="adm-grid-secondary">
        
        {/* 1. SAUVEGARDES SQLITE */}
        <section className="adm-card glass-card">
          <div className="adm-card-hdr">
            <div className="adm-card-hdr-title">
              <HardDrive size={18} className="adm-card-ico" />
              <h2>Sauvegardes de la Base SQLite</h2>
            </div>
            <button 
              className="adm-btn adm-btn-primary" 
              onClick={handleCreateBackup}
              disabled={isBackingUp}
            >
              <Database size={15} /> {isBackingUp ? 'Sauvegarde...' : 'Sauvegarder BDD'}
            </button>
          </div>

          <p className="adm-card-desc">
            Sauvegardes automatiques quotidiennes conservées pendant 14 jours (dossier local <code>server/backups/</code>).
          </p>

          <div className="adm-backup-list">
            {backups.length === 0 ? (
              <div className="adm-empty-list">Aucune sauvegarde trouvée. Cliquez sur "Sauvegarder BDD" pour créer la première.</div>
            ) : (
              backups.map(b => (
                <div key={b.filename} className="adm-backup-item">
                  <div className="adm-backup-info">
                    <span className="adm-backup-name">{b.filename}</span>
                    <span className="adm-backup-meta">{b.sizeFormatted} • {new Date(b.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <a 
                    href={getBackupDownloadUrl(b.filename)} 
                    download={b.filename}
                    className="adm-download-link"
                    title="Télécharger la sauvegarde sur votre poste"
                  >
                    <Download size={14} /> Télécharger
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. SYNCHRONISATION SYNCOUTBOX (CLOUD SIÈGE) */}
        <section className="adm-card glass-card">
          <div className="adm-card-hdr">
            <div className="adm-card-hdr-title">
              <Cloud size={18} className="adm-card-ico" />
              <h2>Synchronisation Cloud Outbox (Siège)</h2>
            </div>
            <button 
              className="adm-btn adm-btn-sync" 
              onClick={handleTriggerSync}
              disabled={isSyncing}
            >
              <UploadCloud size={15} /> {isSyncing ? 'Synchronisation...' : 'Forcer Synchro'}
            </button>
          </div>

          <p className="adm-card-desc">
            Tous les événements de tickets sont mis en file d'attente locale et transmis au serveur central lors de la détection d'une connexion internet.
          </p>

          <div className="adm-sync-metrics">
            <div className="adm-sync-card">
              <span className="adm-sync-label">Événements en attente (Outbox)</span>
              <span className={`adm-sync-value ${syncStatus?.pendingCount > 0 ? 'txt-amber' : 'txt-green'}`}>
                {syncStatus ? syncStatus.pendingCount : '...'}
              </span>
            </div>
            <div className="adm-sync-card">
              <span className="adm-sync-label">Événements transmis</span>
              <span className="adm-sync-value txt-blue">
                {syncStatus ? syncStatus.sentCount : '...'}
              </span>
            </div>
          </div>

          <div className="adm-sync-footer">
            <div className="adm-sync-meta-row">
              <span>Serveur Central :</span>
              <strong>{syncStatus?.centralUrl || 'Local Edge (Autonome)'}</strong>
            </div>
            <div className="adm-sync-meta-row">
              <span>Dernier contrôle :</span>
              <strong>{syncStatus?.lastSyncAttempt ? new Date(syncStatus.lastSyncAttempt).toLocaleTimeString('fr-FR') : 'En attente'}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* ── MODAL MOT DE PASSE ADMIN ── */}
      {showPasswordModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal glass-card animate-scale-up">
            <div className="adm-modal-hdr">
              <div className="adm-modal-title">
                <Key size={20} className="txt-red" />
                <h3>Déverrouillage Administrateur</h3>
              </div>
              <button className="adm-modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdminLogin} className="adm-modal-form">
              <p className="adm-modal-desc">
                Veuillez saisir le mot de passe Administrateur pour effectuer des actions sensibles (Archivage, Réinitialisation, Sauvegardes).
              </p>
              {authError && <div className="adm-auth-error">{authError}</div>}
              <input 
                type="password" 
                placeholder="Mot de passe Administrateur" 
                className="adm-pwd-input"
                value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value)}
                autoFocus
              />
              <div className="adm-modal-actions">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="adm-btn adm-btn-danger">
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        .adm-root {
          max-width: 1440px;
          margin: 1.5rem auto;
          padding: 0 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        .glass-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04);
        }

        /* HEADER */
        .adm-header {
          padding: 1.5rem 2rem;
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
          gap: 0.45rem;
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
          font-weight: 600;
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
          border-radius: 12px;
          font-weight: 800;
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

        .adm-btn-sim:hover { background: #DBEAFE; transform: translateY(-1px); }

        .adm-btn-danger {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FECACA;
        }

        .adm-btn-danger:hover { background: #FEE2E2; transform: translateY(-1px); }

        .adm-toast {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #0F172A;
          color: #FFFFFF;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 800;
        }

        /* KPIS GRID */
        .adm-kpis-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .adm-kpi-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1.35rem 1.25rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 8px 20px -5px rgba(15, 23, 42, 0.04);
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
          width: 36px;
          height: 36px;
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
          font-size: 2.5rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1;
          margin: 0.5rem 0 0.2rem;
          letter-spacing: -0.03em;
        }

        .val-amber { color: #D97706; }
        .val-green { color: #10B981; }
        .val-red   { color: #D3122A; }

        .adm-unit { font-size: 1rem; color: #64748B; font-weight: 600; }

        .adm-kpi-sub {
          font-size: 0.72rem;
          color: #94A3B8;
          font-weight: 600;
        }

        /* GRID MAIN */
        .adm-grid-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .adm-card {
          padding: 1.75rem;
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

        .adm-card-ico { color: #2563EB; }
        .adm-card-ico.gold { color: #D97706; }

        .adm-tag-sub {
          font-size: 0.72rem;
          font-weight: 800;
          background: #F1F5F9;
          color: #64748B;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
        }

        .adm-tag-locked {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 800;
          background: #FEF3C7;
          color: #92400E;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
        }

        .adm-services-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
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
          width: 24px;
          height: 24px;
          border-radius: 6px;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.78rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-svc-name {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0F172A;
        }

        .adm-svc-stats {
          font-size: 0.78rem;
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
          transition: width 0.4s ease;
        }

        .adm-hardware-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 1rem;
          margin-top: 0.5rem;
        }

        .hw-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.6rem;
        }

        .hw-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          font-size: 0.78rem;
        }

        .hw-item span { color: #64748B; }
        .txt-green { color: #10B981; }

        /* TEASER LOCKED */
        .teaser-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .teaser-alert-banner {
          display: flex;
          gap: 0.75rem;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          padding: 0.85rem;
          border-radius: 12px;
          color: #92400E;
          font-size: 0.8rem;
        }

        .teaser-alert-ico { flex-shrink: 0; margin-top: 2px; }

        .teaser-locked-features {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .locked-feature-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 0.75rem;
        }

        .lf-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }

        .lf-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0F172A;
        }

        .lf-lock { color: #94A3B8; }

        .locked-feature-card p {
          font-size: 0.75rem;
          color: #64748B;
          margin: 0;
        }

        .teaser-footer-box {
          background: #0F172A;
          color: #FFFFFF;
          padding: 1rem;
          border-radius: 14px;
          text-align: center;
        }

        .tf-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
          margin-bottom: 0.4rem;
        }

        .teaser-footer-box p {
          font-size: 0.78rem;
          color: #CBD5E1;
          margin: 0;
        }

        /* Styles Nouveaux Modules Techniques (Sauvegarde SQLite & Synchro Cloud) */
        .adm-btn-unlocked {
          background: #ECFDF5;
          color: #047857;
          border-color: #A7F3D0;
        }
        .adm-btn-locked {
          background: #FEF3C7;
          color: #92400E;
          border-color: #FDE68A;
        }
        .adm-btn-primary {
          background: #0F172A;
          color: #FFFFFF;
          border-color: #0F172A;
        }
        .adm-btn-primary:hover {
          background: #1E293B;
        }
        .adm-btn-sync {
          background: #EFF6FF;
          color: #1D4ED8;
          border-color: #BFDBFE;
        }
        .adm-btn-sync:hover {
          background: #DBEAFE;
        }
        .adm-btn-secondary {
          background: #F1F5F9;
          color: #475569;
          border-color: #E2E8F0;
        }

        .adm-grid-secondary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .adm-card-desc {
          font-size: 0.8rem;
          color: #64748B;
          margin: 0.75rem 0 1rem;
          line-height: 1.4;
        }
        .adm-card-desc code {
          background: #F1F5F9;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          color: #0F172A;
        }

        .adm-backup-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-height: 220px;
          overflow-y: auto;
        }
        .adm-empty-list {
          font-size: 0.82rem;
          color: #94A3B8;
          text-align: center;
          padding: 1.5rem 0;
          font-style: italic;
        }
        .adm-backup-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
        }
        .adm-backup-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .adm-backup-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0F172A;
          font-family: monospace;
        }
        .adm-backup-meta {
          font-size: 0.72rem;
          color: #64748B;
        }
        .adm-download-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #2563EB;
          text-decoration: none;
          padding: 0.35rem 0.65rem;
          background: #EFF6FF;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .adm-download-link:hover {
          background: #DBEAFE;
        }

        .adm-sync-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .adm-sync-card {
          padding: 0.85rem;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .adm-sync-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
        }
        .adm-sync-value {
          font-size: 1.4rem;
          font-weight: 900;
        }
        .txt-amber { color: #D97706; }
        .txt-blue { color: #2563EB; }
        .txt-green { color: #059669; }

        .adm-sync-footer {
          padding-top: 0.75rem;
          border-top: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .adm-sync-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: #64748B;
        }
        .adm-sync-meta-row strong {
          color: #0F172A;
        }

        /* MODAL STYLES */
        .adm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }
        .adm-modal {
          max-width: 440px;
          width: 100%;
          padding: 2rem;
          background: #FFFFFF;
        }
        .adm-modal-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .adm-modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .adm-modal-title h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A;
        }
        .adm-modal-close {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #64748B;
        }
        .adm-modal-desc {
          font-size: 0.85rem;
          color: #64748B;
          margin-bottom: 1.25rem;
          line-height: 1.45;
        }
        .adm-auth-error {
          background: #FEF2F2;
          color: #DC2626;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.85rem;
        }
        .adm-pwd-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #CBD5E1;
          border-radius: 10px;
          font-size: 0.95rem;
          box-sizing: border-box;
          margin-bottom: 1.25rem;
          outline: none;
        }
        .adm-pwd-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .adm-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        @media (max-width: 900px) {
          .adm-kpis-grid { grid-template-columns: repeat(2, 1fr); }
          .adm-grid-main { grid-template-columns: 1fr; }
          .adm-grid-secondary { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
