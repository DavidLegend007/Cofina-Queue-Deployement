import{c as o,b as m,r as d,j as e,C as K,a as W}from"./index-CrIU2_GK.js";import{g as L,a as f,l as _,b as J,r as Z}from"./ticketApi-BnJw9-wI.js";import{L as X,a as c,C as ee,T as ae,K as se}from"./trending-up-CP1jog-C.js";import{U as re}from"./users-Bz8hQdzQ.js";import{C as ie}from"./circle-check-Df0eHCRL.js";import{S as ne}from"./sparkles-ChcnRCuJ.js";import{C as de}from"./circle-alert-B0LM_zVH.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=o("ChartNoAxesColumn",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=o("CloudUpload",[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=o("Cloud",[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=o("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=o("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=o("HardDrive",[["line",{x1:"22",x2:"2",y1:"12",y2:"12",key:"1y58io"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}],["line",{x1:"6",x2:"6.01",y1:"16",y2:"16",key:"sgf278"}],["line",{x1:"10",x2:"10.01",y1:"16",y2:"16",key:"1l4acy"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=o("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]),pe=async()=>{const i=await f(),s=await fetch(`${m}/api/backup/list`,{headers:i});if(!s.ok)throw new Error("Impossible de charger la liste des sauvegardes");return await s.json()},ue=async()=>{const i=await f(),s=await fetch(`${m}/api/backup/create`,{method:"POST",headers:i});if(!s.ok)throw new Error("Échec de création de la sauvegarde");return await s.json()},he=i=>{const s=L();return`${m}/api/backup/download/${encodeURIComponent(i)}?token=${s}`},xe=async()=>{const i=await fetch(`${m}/api/sync/status`);if(!i.ok)throw new Error("Impossible de récupérer l'état de synchronisation");return await i.json()},ge=async()=>{const i=await f(),s=await fetch(`${m}/api/sync/trigger`,{method:"POST",headers:i});if(!s.ok)throw new Error("Échec du déclenchement de la synchronisation");return await s.json()};function Ee({agencyName:i,tickets:s,onRefresh:b,lang:fe="fr"}){const[j,y]=d.useState(null),[p,v]=d.useState(()=>!!L()),[M,l]=d.useState(!1),[k,F]=d.useState(""),[N,w]=d.useState(""),[E,R]=d.useState([]),[A,S]=d.useState(!1),[r,P]=d.useState(null),[C,z]=d.useState(!1),u=async()=>{try{const a=await pe();R(a)}catch{}},h=async()=>{try{const a=await xe();P(a)}catch{}};d.useEffect(()=>{u(),h();const a=setInterval(()=>{h()},15e3);return()=>clearInterval(a)},[]);const x=s.length,U=s.filter(a=>a.status==="WAITING").length;s.filter(a=>a.status==="CALLED"||a.status==="IN_PROGRESS").length;const O=s.filter(a=>a.status==="COMPLETED").length;let D=0;const g=s.filter(a=>a.calledAt&&a.createdAt);g.forEach(a=>{const n=(new Date(a.calledAt)-new Date(a.createdAt))/1e3;n>0&&(D+=n)});const q=g.length>0?Math.round(D/g.length/60):0,t=a=>{y(a),setTimeout(()=>y(null),3e3)},$=async a=>{a==null||a.preventDefault(),w("");try{await _(k),v(!0),l(!1),F(""),t("Session Administrateur déverrouillée avec succès !"),u()}catch{w("Mot de passe Administrateur incorrect")}},H=()=>{J(),v(!1),t("Session Administrateur verrouillée.")},V=async()=>{var a;if(!p){l(!0);return}S(!0);try{const n=await ue();t(`Sauvegarde créée : ${(a=n.backup)==null?void 0:a.filename}`),await u()}catch{t("Erreur lors de la création de la sauvegarde.")}finally{S(!1)}},Y=async()=>{var a;if(!p){l(!0);return}z(!0);try{const n=await ge();t(`Synchronisation exécutée (${((a=n.result)==null?void 0:a.processed)||0} événements traités)`),await h()}catch{t("Erreur lors de la synchronisation.")}finally{z(!1)}},G=async()=>{if(!p){l(!0);return}if(window.confirm(`Voulez-vous vraiment archiver la semaine (Lundi → Samedi 14h) en base de données et réinitialiser la file d'attente ?

Tous les tickets de la semaine seront automatiquement sauvegardés en base de données SQLite.`))try{await Z(),t("Semaine (Lundi - Samedi 14h) archivée en BDD SQLite & File d'attente réinitialisée !"),b&&b(),u(),h()}catch{t("Erreur lors de l'archivage. Vérifiez que le mot de passe admin est valide.")}};return e.jsxs("div",{className:"adm-root animate-fade-in",children:[e.jsxs("header",{className:"adm-header glass-card",children:[e.jsxs("div",{className:"adm-hdr-left",children:[e.jsxs("div",{className:"adm-server-badge",children:[e.jsx(I,{size:15}),e.jsx("span",{children:"CYCLE HEBDOMADAIRE (LUNDI MATIN → SAMEDI 14H00)"})]}),e.jsxs("div",{children:[e.jsxs("h1",{className:"adm-title",children:["Console de Gestion — ",i]}),e.jsx("p",{className:"adm-subtitle",children:"Serveur Edge Autonome • Sauvegarde Automatique & Réinitialisation du Lundi au Samedi 14h00"})]})]}),e.jsxs("div",{className:"adm-hdr-actions",children:[p?e.jsxs("button",{className:"adm-btn adm-btn-unlocked",onClick:H,title:"Se déconnecter de la session Administrateur",children:[e.jsx(X,{size:16})," Déconnexion"]}):e.jsxs("button",{className:"adm-btn adm-btn-locked",onClick:()=>l(!0),title:"Se connecter en tant qu'Administrateur",children:[e.jsx(c,{size:16})," Connexion"]}),e.jsxs("button",{className:"adm-btn adm-btn-danger",onClick:G,title:"Archiver la semaine en DB et démarrer un nouveau cycle",children:[e.jsx(T,{size:16})," Archiver Semaine & Réinitialiser (Samedi 14h)"]})]})]}),j&&e.jsxs("div",{className:"adm-toast",children:[e.jsx(ee,{size:16})," ",j]}),e.jsxs("section",{className:"adm-kpis-grid",children:[e.jsxs("div",{className:"adm-kpi-card",children:[e.jsxs("div",{className:"adm-kpi-top",children:[e.jsx("span",{className:"adm-kpi-lbl",children:"TICKETS ÉMIS JOURNÉE"}),e.jsx("div",{className:"adm-kpi-ico ico-blue",children:e.jsx(re,{size:18})})]}),e.jsx("div",{className:"adm-kpi-val",children:x}),e.jsx("span",{className:"adm-kpi-sub",children:"Total borne aujourd'hui"})]}),e.jsxs("div",{className:"adm-kpi-card",children:[e.jsxs("div",{className:"adm-kpi-top",children:[e.jsx("span",{className:"adm-kpi-lbl",children:"EN ATTENTE SALLE"}),e.jsx("div",{className:"adm-kpi-ico ico-amber",children:e.jsx(K,{size:18})})]}),e.jsx("div",{className:"adm-kpi-val val-amber",children:U}),e.jsx("span",{className:"adm-kpi-sub",children:"Clients en attente"})]}),e.jsxs("div",{className:"adm-kpi-card",children:[e.jsxs("div",{className:"adm-kpi-top",children:[e.jsx("span",{className:"adm-kpi-lbl",children:"CLIENTS TRAITÉS"}),e.jsx("div",{className:"adm-kpi-ico ico-green",children:e.jsx(ie,{size:18})})]}),e.jsx("div",{className:"adm-kpi-val val-green",children:O}),e.jsx("span",{className:"adm-kpi-sub",children:"Passés aux guichets"})]}),e.jsxs("div",{className:"adm-kpi-card",children:[e.jsxs("div",{className:"adm-kpi-top",children:[e.jsx("span",{className:"adm-kpi-lbl",children:"TEMPS MOYEN BRUT"}),e.jsx("div",{className:"adm-kpi-ico ico-red",children:e.jsx(ae,{size:18})})]}),e.jsxs("div",{className:"adm-kpi-val val-red",children:[q," ",e.jsx("span",{className:"adm-unit",children:"min"})]}),e.jsx("span",{className:"adm-kpi-sub",children:"Estimation locale brute"})]})]}),e.jsxs("div",{className:"adm-grid-main",children:[e.jsxs("section",{className:"adm-card glass-card",children:[e.jsxs("div",{className:"adm-card-hdr",children:[e.jsxs("div",{className:"adm-card-hdr-title",children:[e.jsx(te,{size:18,className:"adm-card-ico"}),e.jsx("h2",{children:"Volumes par Service"})]}),e.jsx("span",{className:"adm-tag-sub",children:"Compteur instantané"})]}),e.jsx("div",{className:"adm-services-list",children:W.map(a=>{const n=s.filter(Q=>Q.serviceCode===a.code).length,B=x>0?Math.round(n/x*100):0;return e.jsxs("div",{className:"adm-svc-item",children:[e.jsxs("div",{className:"adm-svc-top",children:[e.jsxs("div",{className:"adm-svc-info",children:[e.jsx("span",{className:"adm-svc-code",style:{background:a.color},children:a.code}),e.jsx("span",{className:"adm-svc-name",children:a.name})]}),e.jsxs("span",{className:"adm-svc-stats",children:[e.jsx("strong",{children:n})," tickets (",B,"%)"]})]}),e.jsx("div",{className:"adm-bar-track",children:e.jsx("div",{className:"adm-bar-fill",style:{width:`${B}%`,background:a.color}})})]},a.code)})}),e.jsxs("div",{className:"adm-hardware-box",children:[e.jsxs("div",{className:"hw-title",children:[e.jsx(I,{size:15})," État Matériel Agence"]}),e.jsxs("div",{className:"hw-grid",children:[e.jsxs("div",{className:"hw-item",children:[e.jsx("span",{children:"Serveur Edge :"})," ",e.jsx("strong",{className:"txt-green",children:"En ligne"})]}),e.jsxs("div",{className:"hw-item",children:[e.jsx("span",{children:"Borne Tactile :"})," ",e.jsx("strong",{className:"txt-green",children:"Connectée"})]}),e.jsxs("div",{className:"hw-item",children:[e.jsx("span",{children:"Écran TV :"})," ",e.jsx("strong",{className:"txt-green",children:"Connecté"})]}),e.jsxs("div",{className:"hw-item",children:[e.jsx("span",{children:"Imprimante :"})," ",e.jsx("strong",{className:"txt-green",children:"Prête"})]})]})]})]}),e.jsxs("section",{className:"adm-card adm-analytics-teaser glass-card",children:[e.jsxs("div",{className:"adm-card-hdr",children:[e.jsxs("div",{className:"adm-card-hdr-title",children:[e.jsx(ne,{size:18,className:"adm-card-ico gold"}),e.jsx("h2",{children:"Intelligence Opérationnelle & Data"})]}),e.jsxs("span",{className:"adm-tag-locked",children:[e.jsx(c,{size:12})," Service Expert"]})]}),e.jsxs("div",{className:"teaser-content",children:[e.jsxs("div",{className:"teaser-alert-banner",children:[e.jsx(de,{size:20,className:"teaser-alert-ico"}),e.jsxs("div",{children:[e.jsx("strong",{children:"Analyse Décisionnelle & Consolidation Groupe"}),e.jsx("p",{children:"Les fonctionnalités d'analyse avancée et de reporting comparatif 4 agences nécessitent le traitement mensuel par votre Data Analyste dédié."})]})]}),e.jsxs("div",{className:"teaser-locked-features",children:[e.jsxs("div",{className:"locked-feature-card",children:[e.jsxs("div",{className:"lf-hdr",children:[e.jsx("span",{className:"lf-title",children:"📊 Prédiction des Pics de Charge"}),e.jsx(c,{size:14,className:"lf-lock"})]}),e.jsx("p",{children:"Modélisation horaire par agence pour optimiser l'ouverture des guichets."})]}),e.jsxs("div",{className:"locked-feature-card",children:[e.jsxs("div",{className:"lf-hdr",children:[e.jsx("span",{className:"lf-title",children:"🏢 Comparatif Inter-Services"}),e.jsx(c,{size:14,className:"lf-lock"})]}),e.jsx("p",{children:"Benchmarking des performances entre les différents services de l'agence."})]}),e.jsxs("div",{className:"locked-feature-card",children:[e.jsxs("div",{className:"lf-hdr",children:[e.jsx("span",{className:"lf-title",children:"📈 Audit de Performance Caissiers & SLA"}),e.jsx(c,{size:14,className:"lf-lock"})]}),e.jsx("p",{children:"Rapports mensuels de productivité et ratios d'absentéisme clients."})]})]}),e.jsxs("div",{className:"teaser-footer-box",children:[e.jsx("div",{className:"tf-badge",children:"💼 Service Data Analytics"}),e.jsx("p",{children:"Pour activer le rapport mensuel exécutif PDF et le tableau de bord de la Direction Générale, contactez votre Data Analyste référent."})]})]})]})]}),e.jsxs("div",{className:"adm-grid-secondary",children:[e.jsxs("section",{className:"adm-card glass-card",children:[e.jsxs("div",{className:"adm-card-hdr",children:[e.jsxs("div",{className:"adm-card-hdr-title",children:[e.jsx(me,{size:18,className:"adm-card-ico"}),e.jsx("h2",{children:"Sauvegardes de la Base SQLite"})]}),e.jsxs("button",{className:"adm-btn adm-btn-primary",onClick:V,disabled:A,children:[e.jsx(T,{size:15})," ",A?"Sauvegarde...":"Sauvegarder BDD"]})]}),e.jsxs("p",{className:"adm-card-desc",children:["Sauvegardes automatiques quotidiennes conservées pendant 14 jours (dossier local ",e.jsx("code",{children:"server/backups/"}),")."]}),e.jsx("div",{className:"adm-backup-list",children:E.length===0?e.jsx("div",{className:"adm-empty-list",children:'Aucune sauvegarde trouvée. Cliquez sur "Sauvegarder BDD" pour créer la première.'}):E.map(a=>e.jsxs("div",{className:"adm-backup-item",children:[e.jsxs("div",{className:"adm-backup-info",children:[e.jsx("span",{className:"adm-backup-name",children:a.filename}),e.jsxs("span",{className:"adm-backup-meta",children:[a.sizeFormatted," • ",new Date(a.createdAt).toLocaleString("fr-FR")]})]}),e.jsxs("a",{href:he(a.filename),download:a.filename,className:"adm-download-link",title:"Télécharger la sauvegarde sur votre poste",children:[e.jsx(ce,{size:14})," Télécharger"]})]},a.filename))})]}),e.jsxs("section",{className:"adm-card glass-card",children:[e.jsxs("div",{className:"adm-card-hdr",children:[e.jsxs("div",{className:"adm-card-hdr-title",children:[e.jsx(oe,{size:18,className:"adm-card-ico"}),e.jsx("h2",{children:"Synchronisation Cloud Outbox (Siège)"})]}),e.jsxs("button",{className:"adm-btn adm-btn-sync",onClick:Y,disabled:C,children:[e.jsx(le,{size:15})," ",C?"Synchronisation...":"Forcer Synchro"]})]}),e.jsx("p",{className:"adm-card-desc",children:"Tous les événements de tickets sont mis en file d'attente locale et transmis au serveur central lors de la détection d'une connexion internet."}),e.jsxs("div",{className:"adm-sync-metrics",children:[e.jsxs("div",{className:"adm-sync-card",children:[e.jsx("span",{className:"adm-sync-label",children:"Événements en attente (Outbox)"}),e.jsx("span",{className:`adm-sync-value ${(r==null?void 0:r.pendingCount)>0?"txt-amber":"txt-green"}`,children:r?r.pendingCount:"..."})]}),e.jsxs("div",{className:"adm-sync-card",children:[e.jsx("span",{className:"adm-sync-label",children:"Événements transmis"}),e.jsx("span",{className:"adm-sync-value txt-blue",children:r?r.sentCount:"..."})]})]}),e.jsxs("div",{className:"adm-sync-footer",children:[e.jsxs("div",{className:"adm-sync-meta-row",children:[e.jsx("span",{children:"Serveur Central :"}),e.jsx("strong",{children:(r==null?void 0:r.centralUrl)||"Local Edge (Autonome)"})]}),e.jsxs("div",{className:"adm-sync-meta-row",children:[e.jsx("span",{children:"Dernier contrôle :"}),e.jsx("strong",{children:r!=null&&r.lastSyncAttempt?new Date(r.lastSyncAttempt).toLocaleTimeString("fr-FR"):"En attente"})]})]})]})]}),M&&e.jsx("div",{className:"adm-modal-overlay",children:e.jsxs("div",{className:"adm-modal glass-card animate-scale-up",children:[e.jsxs("div",{className:"adm-modal-hdr",children:[e.jsxs("div",{className:"adm-modal-title",children:[e.jsx(se,{size:20,className:"txt-red"}),e.jsx("h3",{children:"Déverrouillage Administrateur"})]}),e.jsx("button",{className:"adm-modal-close",onClick:()=>l(!1),children:"✕"})]}),e.jsxs("form",{onSubmit:$,className:"adm-modal-form",children:[e.jsx("p",{className:"adm-modal-desc",children:"Veuillez saisir le mot de passe Administrateur pour effectuer des actions sensibles (Archivage, Réinitialisation, Sauvegardes)."}),N&&e.jsx("div",{className:"adm-auth-error",children:N}),e.jsx("input",{type:"password",placeholder:"Mot de passe Administrateur",className:"adm-pwd-input",value:k,onChange:a=>F(a.target.value),autoFocus:!0}),e.jsxs("div",{className:"adm-modal-actions",children:[e.jsx("button",{type:"button",className:"adm-btn adm-btn-secondary",onClick:()=>l(!1),children:"Annuler"}),e.jsx("button",{type:"submit",className:"adm-btn adm-btn-danger",children:"Déverrouiller"})]})]})]})}),e.jsx("style",{children:`
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

        .adm-btn-locked {
          background: #F8FAFC;
          color: #475569;
          border-color: #E2E8F0;
        }
        .adm-btn-locked:hover { background: #F1F5F9; transform: translateY(-1px); }

        .adm-btn-unlocked {
          background: #F0FDF4;
          color: #166534;
          border-color: #BBF7D0;
        }
        .adm-btn-unlocked:hover { background: #DCFCE7; transform: translateY(-1px); }

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
      `})]})}export{Ee as default};
