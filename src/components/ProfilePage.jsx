import React, { useState, useRef } from 'react';
import {
  Camera, Edit3, Check, X, Award, TrendingUp, Clock,
  Star, Shield, Target, CheckCircle2, User, Briefcase,
  Calendar, ChevronLeft, Upload, Trash2, Zap, Crown
} from 'lucide-react';
import { getStoredAgentProfiles, saveAgentProfile } from '../services/queueStore';

/* ── BADGE DEFINITIONS ── */
const BADGES = [
  { id: 'speed',   icon: Zap,       label: 'Rapide',      desc: 'Temps moyen < 4 min',   color: '#F59E0B', bg: '#FFFBEB', threshold: (s) => s.avgTime > 0 && s.avgTime < 4 },
  { id: 'volume',  icon: TrendingUp, label: 'Performant',  desc: '20+ clients/jour',       color: '#10B981', bg: '#F0FDF4', threshold: (s) => s.served >= 20 },
  { id: 'senior',  icon: Crown,      label: 'Senior',      desc: '100+ clients traités',   color: '#8B5CF6', bg: '#F5F3FF', threshold: (s) => s.totalAll >= 100 },
  { id: 'perfect', icon: Star,       label: 'Excellence',  desc: "0 absent aujourd'hui",   color: '#D3122A', bg: '#FFF5F5', threshold: (s) => s.noShow === 0 && s.served > 0 },
  { id: 'shield',  icon: Shield,     label: 'Fiable',      desc: "Connecté 5j d'affilée",  color: '#3B82F6', bg: '#EFF6FF', threshold: () => true },
];

const AVATAR_EMOJIS = ['👨🏽‍💼','👩🏽‍💼','👨🏿‍💼','👩🏿‍💼','🧑🏽‍💻','⚡','🏦','💼','🌟','👑'];

import { translations } from '../services/translations';

export default function ProfilePage({ agentId, agencyName, tickets, onClose, lang = 'fr' }) {
  const t = translations[lang] || translations.fr;
  const [agentsList, setAgentsList] = useState(() => getStoredAgentProfiles());
  const agent = agentsList.find(a => a.id === agentId) || agentsList[0];

  const [isEditing, setIsEditing]         = useState(false);
  const [editForm, setEditForm]           = useState({ ...agent });
  const [avatarPreview, setAvatarPreview] = useState(agent.photoUrl || null);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const fileInputRef = useRef(null);

  /* ── Stats ── */
  const myTickets   = tickets.filter(t => t.agentId === agent.id || t.counterNumber === agent.defaultCounter);
  const servedToday = myTickets.filter(t => t.status === 'COMPLETED');
  const noShowToday = myTickets.filter(t => t.status === 'NO_SHOW');
  const totalAll    = (agent.totalServed || 0) + servedToday.length;

  const avgTimeSec = servedToday.length > 0
    ? servedToday.reduce((acc, t) => {
        if (t.completedAt && t.calledAt) return acc + (new Date(t.completedAt) - new Date(t.calledAt)) / 1000;
        return acc + 240;
      }, 0) / servedToday.length
    : 0;
  const avgTimeMin = Math.round(avgTimeSec / 60) || 0;

  const stats = { served: servedToday.length, noShow: noShowToday.length, avgTime: avgTimeMin, totalAll };
  const earnedBadges = BADGES.filter(b => b.threshold(stats));
  const presenceRate = (servedToday.length + noShowToday.length) > 0
    ? Math.round((servedToday.length / (servedToday.length + noShowToday.length)) * 100) : 100;

  /* ── Handlers ── */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Photo trop volumineuse. Max 3 Mo.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setAvatarPreview(ev.target.result);
      setEditForm(prev => ({ ...prev, photoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setEditForm(prev => ({ ...prev, photoUrl: null }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = saveAgentProfile({ ...editForm, photoUrl: avatarPreview });
    setAgentsList(updated);
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const openEdit = () => {
    setEditForm({ ...agent });
    setAvatarPreview(agent.photoUrl || null);
    setIsEditing(true);
  };

  const todayDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-sheet" onClick={e => e.stopPropagation()}>

        {/* CLOSE */}
        <button className="pp-back-btn" onClick={onClose}>
          <ChevronLeft size={18} /><span>Retour</span>
        </button>

        {/* ══ HERO ══ */}
        <div className="pp-hero">
          <div className="pp-cover" />
          <div className="pp-avatar-zone">
            <div className="pp-avatar-ring">
              {agent.photoUrl
                ? <img src={agent.photoUrl} alt={agent.name} className="pp-avatar-img" />
                : <div className="pp-avatar-emoji">{agent.avatar || '👨🏽‍💼'}</div>}
              <button className="pp-cam-btn" onClick={openEdit} title="Modifier la photo">
                <Camera size={15} />
              </button>
            </div>
          </div>
          <div className="pp-hero-info">
            <h1 className="pp-name">{agent.name}</h1>
            <p className="pp-role">{agent.title || `Caissier — Guichet ${agent.defaultCounter}`}</p>
            <div className="pp-pill-row">
              <span className="pp-pill pp-pill-red">📍 {agencyName}</span>
              <span className="pp-pill pp-pill-blue">Guichet {agent.defaultCounter}</span>
              <span className="pp-pill pp-pill-green">{earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button className="pp-edit-fab" onClick={openEdit}><Edit3 size={15} /> Modifier le profil</button>
          {saveSuccess && <div className="pp-toast"><CheckCircle2 size={15} /> Profil sauvegardé !</div>}
        </div>

        {/* ══ BODY ══ */}
        <div className="pp-body">

          {/* STATS */}
          <div className="pp-stats-row">
            {[
              { icon: CheckCircle2, cls: 'green',  val: servedToday.length,    lbl: 'Clients servis',  sub: "Aujourd'hui" },
              { icon: Clock,        cls: 'blue',   val: avgTimeMin || '–', u: 'min', lbl: 'Tps moyen', sub: 'Par client' },
              { icon: TrendingUp,   cls: 'purple', val: totalAll,              lbl: 'Total traités',   sub: 'Depuis début' },
              { icon: Award,        cls: 'amber',  val: earnedBadges.length,   lbl: 'Badges gagnés',  sub: `Sur ${BADGES.length}` },
            ].map(({ icon: Icon, cls, val, u, lbl, sub }) => (
              <div key={lbl} className="pp-stat">
                <Icon size={20} className={`pp-stat-ico ${cls}`} />
                <div className="pp-stat-num">{val}{u && <span className="pp-stat-u">{u}</span>}</div>
                <div className="pp-stat-lbl">{lbl}</div>
                <div className="pp-stat-sub">{sub}</div>
              </div>
            ))}
          </div>

          {/* COLUMNS */}
          <div className="pp-cols">
            <div className="pp-col">
              {/* Infos */}
              <div className="pp-card">
                <h2 className="pp-card-title"><User size={14} /> Informations</h2>
                <div className="pp-info-list">
                  {[
                    ['Identifiant', <span className="pp-mono">{agent.id}</span>],
                    ['Nom complet', agent.name],
                    ['Poste / Rôle', agent.title || 'Caissier'],
                    ['Guichet attribué', `Guichet ${agent.defaultCounter}`],
                    ['Agence', agencyName],
                    ['Date', todayDate],
                  ].map(([k, v]) => (
                    <div key={k} className="pp-info-row">
                      <span className="pp-info-k">{k}</span>
                      <span className="pp-info-v">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Perf */}
              <div className="pp-card">
                <h2 className="pp-card-title"><TrendingUp size={14} /> Performance du jour</h2>
                <div className="pp-bars">
                  <div className="pp-bar-item">
                    <div className="pp-bar-top"><span>Clients servis</span><span>{servedToday.length} / 30</span></div>
                    <div className="pp-bar-track"><div className="pp-bar-fill pp-bar-green" style={{ width: `${Math.min((servedToday.length/30)*100,100)}%` }} /></div>
                  </div>
                  <div className="pp-bar-item">
                    <div className="pp-bar-top"><span>Temps moyen (objectif 5 min)</span><span>{avgTimeMin || 4} min</span></div>
                    <div className="pp-bar-track"><div className="pp-bar-fill pp-bar-blue" style={{ width: `${Math.min(Math.max(100-((avgTimeMin||4)/5)*80,20),100)}%` }} /></div>
                  </div>
                  <div className="pp-bar-item">
                    <div className="pp-bar-top"><span>Taux présence clients</span><span>{presenceRate}%</span></div>
                    <div className="pp-bar-track"><div className="pp-bar-fill pp-bar-red" style={{ width: `${presenceRate}%` }} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pp-col">
              {/* Badges */}
              <div className="pp-card">
                <h2 className="pp-card-title"><Award size={14} /> Badges &amp; Récompenses</h2>
                <div className="pp-badge-list">
                  {BADGES.map(badge => {
                    const earned = badge.threshold(stats);
                    const Icon = badge.icon;
                    return (
                      <div key={badge.id} className={`pp-badge ${earned ? 'pp-badge-on' : 'pp-badge-off'}`}
                        style={earned ? { '--bc': badge.color, '--bb': badge.bg } : {}}>
                        <div className="pp-badge-ico" style={earned ? { background: badge.bg, color: badge.color } : {}}>
                          <Icon size={18} />
                        </div>
                        <div className="pp-badge-txt">
                          <div className="pp-badge-name">{badge.label}</div>
                          <div className="pp-badge-desc">{badge.desc}</div>
                        </div>
                        {earned && <div className="pp-badge-chk" style={{ background: badge.color }}><Check size={10} /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Activity */}
              <div className="pp-card">
                <h2 className="pp-card-title"><Calendar size={14} /> Activité récente</h2>
                <div className="pp-act-list">
                  {servedToday.slice(0, 6).map(t => (
                    <div key={t.id} className="pp-act-item">
                      <div className="pp-act-dot" />
                      <div className="pp-act-body">
                        <span className="pp-act-num">{t.ticketNumber}</span>
                        <span className="pp-act-srv">{t.serviceName}</span>
                      </div>
                      <span className="pp-act-time">
                        {t.completedAt ? new Date(t.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '–'}
                      </span>
                    </div>
                  ))}
                  {servedToday.length === 0 && (
                    <div className="pp-act-empty"><Briefcase size={26} /><p>Aucune activité pour le moment</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ EDIT MODAL ══ */}
        {isEditing && (
          <div className="pp-edit-overlay" onClick={() => setIsEditing(false)}>
            <div className="pp-edit-modal" onClick={e => e.stopPropagation()}>
              <div className="pp-edit-hdr">
                <div className="pp-edit-hdr-left"><Edit3 size={18} className="pp-edit-ico" /><h3>Modifier le profil</h3></div>
                <button className="pp-edit-close" onClick={() => setIsEditing(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="pp-edit-form">
                <div className="pp-edit-photo-row">
                  <div className="pp-edit-photo-side">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="preview" className="pp-edit-photo-img" />
                      : <div className="pp-edit-photo-placeholder">{editForm.avatar || '👨🏽‍💼'}</div>}
                    <div className="pp-edit-photo-btns">
                      <button type="button" className="pp-edit-upload-btn" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={13} /> Uploader une photo
                      </button>
                      {avatarPreview && (
                        <button type="button" className="pp-edit-del-btn" onClick={handleRemovePhoto}>
                          <Trash2 size={13} /> Supprimer
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                    </div>
                  </div>
                  <div className="pp-edit-emoji-side">
                    <label className="pp-edit-lbl">Ou choisir un avatar :</label>
                    <div className="pp-edit-emoji-grid">
                      {AVATAR_EMOJIS.map(emoji => (
                        <button key={emoji} type="button"
                          className={`pp-emoji-btn ${editForm.avatar === emoji && !avatarPreview ? 'pp-emoji-sel' : ''}`}
                          onClick={() => {
                            setAvatarPreview(null);
                            setEditForm(prev => ({ ...prev, avatar: emoji, photoUrl: null }));
                          }}>{emoji}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pp-edit-fields">
                  <div className="pp-edit-fg">
                    <label className="pp-edit-lbl">Nom complet *</label>
                    <input type="text" required className="pp-edit-input" value={editForm.name}
                      onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="ex: Mensah Koffi" />
                  </div>
                  <div className="pp-edit-fg">
                    <label className="pp-edit-lbl">Titre / Poste</label>
                    <input type="text" className="pp-edit-input" value={editForm.title || ''}
                      onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="ex: Caissier Senior" />
                  </div>
                  <div className="pp-edit-fg">
                    <label className="pp-edit-lbl">Guichet par défaut</label>
                    <select className="pp-edit-input" value={editForm.defaultCounter}
                      onChange={e => setEditForm(p => ({ ...p, defaultCounter: Number(e.target.value) }))}>
                      {[1,2,3,4].map(n => <option key={n} value={n}>Guichet {n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pp-edit-actions">
                  <button type="button" className="pp-edit-cancel" onClick={() => setIsEditing(false)}>Annuler</button>
                  <button type="submit" className="pp-edit-save"><Check size={15} /> Sauvegarder</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pp-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(6px);
          z-index: 8000;
          display: flex; align-items: stretch; justify-content: flex-end;
          animation: ppFadeIn 0.25s ease;
          font-family: 'Inter', system-ui, sans-serif;
        }
        @keyframes ppFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .pp-sheet {
          width: 100%; max-width: 880px;
          background: #F8FAFC;
          overflow-y: auto;
          position: relative;
          animation: ppSlide 0.32s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.18);
        }
        @keyframes ppSlide { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .pp-back-btn {
          position: absolute; top: 1rem; left: 1rem; z-index: 10;
          display: flex; align-items: center; gap: 0.35rem;
          background: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.6);
          color: #334155; font-weight: 700; font-size: 0.82rem;
          padding: 0.4rem 0.85rem; border-radius: 99px; cursor: pointer;
          backdrop-filter: blur(4px); transition: all 0.2s;
        }
        .pp-back-btn:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

        .pp-hero { position: relative; text-align: center; padding-bottom: 1.5rem; }
        .pp-cover {
          height: 168px;
          background: linear-gradient(135deg, #0F172A 0%, #D3122A 55%, #1E3A5F 100%);
          position: relative; overflow: hidden;
        }
        .pp-cover::after {
          content: ''; position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
        }

        .pp-avatar-zone { display: flex; justify-content: center; margin-top: -58px; position: relative; z-index: 2; }
        .pp-avatar-ring {
          width: 116px; height: 116px; border-radius: 50%;
          border: 4px solid #fff; box-shadow: 0 8px 28px rgba(0,0,0,0.22);
          background: linear-gradient(135deg, #F1F5F9, #E2E8F0);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .pp-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .pp-avatar-emoji { font-size: 3.6rem; line-height: 1; }
        .pp-cam-btn {
          position: absolute; bottom: 4px; right: 4px;
          width: 30px; height: 30px; border-radius: 50%;
          background: #D3122A; color: white; border: 2.5px solid white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.2s;
        }
        .pp-cam-btn:hover { transform: scale(1.12); }

        .pp-hero-info { margin-top: 1rem; padding: 0 1.5rem; }
        .pp-name { font-size: 1.8rem; font-weight: 900; color: #0F172A; margin: 0 0 0.2rem; letter-spacing: -0.02em; }
        .pp-role { font-size: 0.9rem; color: #64748B; font-weight: 600; margin: 0 0 0.8rem; }
        .pp-pill-row { display: flex; align-items: center; justify-content: center; gap: 0.6rem; flex-wrap: wrap; }
        .pp-pill { font-size: 0.75rem; font-weight: 700; padding: 0.28rem 0.75rem; border-radius: 99px; border: 1px solid; }
        .pp-pill-red   { background: #FEF2F2; color: #D3122A; border-color: #FECACA; }
        .pp-pill-blue  { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
        .pp-pill-green { background: #F0FDF4; color: #15803D; border-color: #BBF7D0; }

        .pp-edit-fab {
          display: inline-flex; align-items: center; gap: 0.45rem;
          margin-top: 1.2rem; padding: 0.6rem 1.4rem;
          background: #0F172A; color: white; border: none;
          border-radius: 99px; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(15,23,42,0.28);
        }
        .pp-edit-fab:hover { background: #D3122A; transform: translateY(-1px); box-shadow: 0 8px 22px rgba(211,18,42,0.32); }

        .pp-toast {
          display: inline-flex; align-items: center; gap: 0.5rem;
          margin-top: 0.9rem; padding: 0.45rem 1rem;
          background: #D1FAE5; color: #065F46;
          border-radius: 99px; font-weight: 700; font-size: 0.82rem;
          border: 1px solid #A7F3D0;
          animation: ppFadeUp 0.3s ease;
        }
        @keyframes ppFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .pp-body { padding: 1.5rem 2rem 3rem; display: flex; flex-direction: column; gap: 1.5rem; }

        .pp-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        .pp-stat {
          background: #fff; border-radius: 16px; padding: 1.2rem 1rem;
          text-align: center; border: 1px solid #E2E8F0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pp-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .pp-stat-ico { margin-bottom: 0.4rem; }
        .pp-stat-ico.green  { color: #10B981; }
        .pp-stat-ico.blue   { color: #3B82F6; }
        .pp-stat-ico.purple { color: #8B5CF6; }
        .pp-stat-ico.amber  { color: #F59E0B; }
        .pp-stat-num { font-size: 1.9rem; font-weight: 900; color: #0F172A; line-height: 1; margin-bottom: 0.2rem; }
        .pp-stat-u { font-size: 0.95rem; font-weight: 600; color: #64748B; }
        .pp-stat-lbl { font-size: 0.78rem; font-weight: 700; color: #1E293B; }
        .pp-stat-sub { font-size: 0.68rem; color: #94A3B8; margin-top: 0.1rem; }

        .pp-cols { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.5rem; }
        .pp-col { display: flex; flex-direction: column; gap: 1.5rem; }

        .pp-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 1.4rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .pp-card-title {
          display: flex; align-items: center; gap: 0.45rem;
          font-size: 0.78rem; font-weight: 800; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.07em;
          margin: 0 0 1rem;
        }

        .pp-info-list { display: flex; flex-direction: column; }
        .pp-info-row { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid #F1F5F9; }
        .pp-info-row:last-child { border-bottom: none; }
        .pp-info-k { font-size: 0.78rem; color: #94A3B8; font-weight: 600; }
        .pp-info-v { font-size: 0.82rem; color: #1E293B; font-weight: 700; text-align: right; }
        .pp-mono { font-family: monospace; background: #F1F5F9; padding: 0.1rem 0.45rem; border-radius: 5px; color: #D3122A; font-size: 0.82rem; }

        .pp-bars { display: flex; flex-direction: column; gap: 1rem; }
        .pp-bar-top { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem; }
        .pp-bar-track { height: 7px; background: #F1F5F9; border-radius: 99px; overflow: hidden; }
        .pp-bar-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(0.34,1.56,0.64,1); }
        .pp-bar-green { background: linear-gradient(90deg, #10B981, #34D399); }
        .pp-bar-blue  { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
        .pp-bar-red   { background: linear-gradient(90deg, #D3122A, #F87171); }

        .pp-badge-list { display: flex; flex-direction: column; gap: 0.55rem; }
        .pp-badge {
          display: flex; align-items: center; gap: 0.7rem;
          padding: 0.7rem 0.9rem; border-radius: 12px;
          border: 1px solid #E2E8F0; background: #F8FAFC;
          transition: all 0.2s; position: relative;
        }
        .pp-badge-on  { border-color: var(--bc); background: var(--bb); }
        .pp-badge-off { opacity: 0.35; filter: grayscale(1); }
        .pp-badge-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #E2E8F0; color: #94A3B8; flex-shrink: 0; }
        .pp-badge-txt { flex: 1; }
        .pp-badge-name { font-size: 0.82rem; font-weight: 800; color: #1E293B; }
        .pp-badge-desc { font-size: 0.7rem; color: #64748B; margin-top: 0.08rem; }
        .pp-badge-chk { width: 18px; height: 18px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; }

        .pp-act-list { display: flex; flex-direction: column; gap: 0.45rem; }
        .pp-act-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.7rem; background: #F8FAFC; border-radius: 10px; border: 1px solid #F1F5F9; transition: background 0.15s; }
        .pp-act-item:hover { background: #F1F5F9; }
        .pp-act-dot { width: 7px; height: 7px; border-radius: 50%; background: #10B981; flex-shrink: 0; }
        .pp-act-body { flex: 1; display: flex; flex-direction: column; gap: 0.06rem; }
        .pp-act-num { font-family: monospace; font-weight: 800; font-size: 0.85rem; color: #0F172A; }
        .pp-act-srv { font-size: 0.7rem; color: #94A3B8; }
        .pp-act-time { font-size: 0.72rem; font-weight: 600; color: #CBD5E1; }
        .pp-act-empty { text-align: center; padding: 1.5rem; color: #CBD5E1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .pp-act-empty p { font-size: 0.82rem; color: #94A3B8; margin: 0; }

        /* EDIT MODAL */
        .pp-edit-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.65); backdrop-filter: blur(6px);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 1rem; animation: ppFadeIn 0.2s ease;
        }
        .pp-edit-modal {
          background: #fff; border-radius: 24px;
          width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          animation: ppModalPop 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes ppModalPop { from { opacity: 0; transform: scale(0.9) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .pp-edit-hdr { display: flex; align-items: center; justify-content: space-between; padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid #F1F5F9; }
        .pp-edit-hdr-left { display: flex; align-items: center; gap: 0.6rem; }
        .pp-edit-hdr-left h3 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #0F172A; }
        .pp-edit-ico { color: #D3122A; }
        .pp-edit-close { background: #F1F5F9; border: none; color: #64748B; width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
        .pp-edit-close:hover { background: #E2E8F0; color: #1E293B; }

        .pp-edit-form { padding: 1.4rem; display: flex; flex-direction: column; gap: 1.4rem; }
        .pp-edit-photo-row { display: flex; gap: 1.25rem; align-items: flex-start; }
        .pp-edit-photo-side { display: flex; flex-direction: column; align-items: center; gap: 0.65rem; flex-shrink: 0; }
        .pp-edit-photo-img { width: 92px; height: 92px; border-radius: 50%; object-fit: cover; border: 3px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .pp-edit-photo-placeholder { width: 92px; height: 92px; border-radius: 50%; background: linear-gradient(135deg,#F1F5F9,#E2E8F0); display: flex; align-items: center; justify-content: center; font-size: 2.6rem; border: 3px solid #E2E8F0; }
        .pp-edit-photo-btns { display: flex; flex-direction: column; gap: 0.38rem; }
        .pp-edit-upload-btn, .pp-edit-del-btn { display: flex; align-items: center; gap: 0.38rem; padding: 0.38rem 0.75rem; border-radius: 8px; font-size: 0.76rem; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; white-space: nowrap; }
        .pp-edit-upload-btn { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
        .pp-edit-upload-btn:hover { background: #DBEAFE; }
        .pp-edit-del-btn { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
        .pp-edit-del-btn:hover { background: #FEE2E2; }
        .pp-edit-emoji-side { flex: 1; }
        .pp-edit-emoji-grid { display: flex; flex-wrap: wrap; gap: 0.38rem; margin-top: 0.38rem; }
        .pp-emoji-btn { font-size: 1.55rem; padding: 0.28rem 0.45rem; border-radius: 8px; border: 1px solid #E2E8F0; background: #F8FAFC; cursor: pointer; transition: all 0.15s; }
        .pp-emoji-btn:hover { background: #F1F5F9; transform: scale(1.1); }
        .pp-emoji-sel { border-color: #D3122A; background: #FFF5F5; transform: scale(1.1); }

        .pp-edit-fields { display: flex; flex-direction: column; gap: 0.9rem; }
        .pp-edit-fg { display: flex; flex-direction: column; gap: 0.3rem; }
        .pp-edit-lbl { font-size: 0.78rem; font-weight: 700; color: #475569; }
        .pp-edit-input { width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; border: 1.5px solid #E2E8F0; font-size: 0.9rem; color: #0F172A; background: #FAFAFA; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .pp-edit-input:focus { border-color: #D3122A; box-shadow: 0 0 0 3px rgba(211,18,42,0.1); background: #fff; }

        .pp-edit-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.7rem; padding-top: 0.6rem; border-top: 1px solid #F1F5F9; }
        .pp-edit-cancel { padding: 0.6rem 1.2rem; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #fff; color: #475569; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.15s; }
        .pp-edit-cancel:hover { background: #F1F5F9; }
        .pp-edit-save { display: flex; align-items: center; gap: 0.45rem; padding: 0.6rem 1.4rem; border-radius: 10px; border: none; background: linear-gradient(135deg,#D3122A,#B90E23); color: #fff; font-weight: 800; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 14px rgba(211,18,42,0.32); transition: all 0.2s; }
        .pp-edit-save:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(211,18,42,0.42); }

        @media (max-width: 680px) {
          .pp-stats-row { grid-template-columns: repeat(2,1fr); }
          .pp-cols { grid-template-columns: 1fr; }
          .pp-body { padding: 1rem; }
          .pp-sheet { max-width: 100%; }
          .pp-edit-photo-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
