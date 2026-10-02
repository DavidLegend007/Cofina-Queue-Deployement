import{c as b,r as a,e as ee,j as e,L as te,t as N,f as C,b as z,V as D}from"./index-Bq0gLAzD.js";import{d as ie,p as ne,e as re,u as x}from"./ticketApi-DwVRNgxo.js";import{P as I,a as S,U as se}from"./AgentModule-DCaIgNpN.js";import{L as oe}from"./trending-up-BjLscQs5.js";import{X as ae}from"./x-Dza12pZC.js";import{C as B}from"./circle-check-RIHWjgip.js";import{S as de}from"./sparkles-cHitTZOy.js";import"./star-DSUhYjCq.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=b("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=b("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=b("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);function ye({lang:u="fr",tickets:w=[],onlineCounters:F=[],agencyName:me="Agence Siège Kodjoviakopé",onStateChange:d=()=>{},isStandalone:h=!1}){const r=N[u]||N.fr,[T,L]=a.useState(!0),[c,y]=a.useState(!1),_=()=>{const i=`${window.location.origin}${window.location.pathname}?widgetOnly=true`,n=window.open(i,"CofinaTellerWidget","width=360,height=420,resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no");n&&n.focus()},l=ee(),[O,R]=a.useState(()=>typeof window<"u"&&!!localStorage.getItem("cofina_jwt_token")&&!!localStorage.getItem("cofina_agent_username")),M=()=>{var i;if(typeof window<"u"){const n=localStorage.getItem("cofina_agent_username");if(n){const s=l.find(m=>m.name===n);if(s)return s.id}}return((i=l[0])==null?void 0:i.id)||"AGT-01"},P=()=>{if(typeof window<"u"){const i=localStorage.getItem("cofina_agent_counter");if(i)return parseInt(i,10)}return 1},[G,W]=a.useState(M),[o,$]=a.useState(P),[U,k]=a.useState(0);a.useEffect(()=>{const i=()=>{const n=typeof window<"u"&&!!localStorage.getItem("cofina_jwt_token")&&!!localStorage.getItem("cofina_agent_username");if(R(n),n){const s=localStorage.getItem("cofina_agent_username"),m=l.find(Q=>Q.name===s);m&&W(m.id);const v=parseInt(localStorage.getItem("cofina_agent_counter")||"1",10);v&&$(v)}};return window.addEventListener("storage",i),window.addEventListener("cofina_auth_changed",i),()=>{window.removeEventListener("storage",i),window.removeEventListener("cofina_auth_changed",i)}},[l]);const f=l.find(i=>i.id===G)||l[0],g=I.find(i=>i.number===o)||I[0],q=g!=null&&g.services?g.services.join(","):"ALL",j=w.filter(i=>i.counterNumber===o&&(i.status==="CALLED"||i.status==="IN_PROGRESS"));j.sort((i,n)=>{const s=new Date(i.calledAt||i.startedAt||i.createdAt).getTime();return new Date(n.calledAt||n.startedAt||n.createdAt).getTime()-s});const t=j[0]||null,A=w.filter(i=>i.status==="WAITING"),p=F.includes(o),V=()=>{C(o,!p),d()};a.useEffect(()=>{let i=null;if(t&&(t.calledAt||t.createdAt)){const n=new Date(t.calledAt||t.createdAt).getTime();i=setInterval(()=>{const s=Math.max(0,Math.floor((Date.now()-n)/1e3));k(s)},1e3)}else k(0);return()=>{i&&clearInterval(i)}},[t]);const H=i=>{const n=Math.floor(i/60),s=i%60;return`${String(n).padStart(2,"0")}:${String(s).padStart(2,"0")}`},K=h||typeof window<"u"&&(window.location.search.includes("widgetOnly")||window.location.search.includes("mode=widget")),E=async()=>{await ne(f.id,f.name,o,q,(t==null?void 0:t.id)||null,u),d()},X=async()=>{t&&(await re(t.id,u),d())},Y=async()=>{t&&(await x(t.id,"NO_SHOW"),d())},Z=async()=>{t&&(await x(t.id,"IN_PROGRESS"),d())},J=async()=>{t&&(await x(t.id,"COMPLETED"),d())};return!T||!K&&!O?null:e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`cofina-floating-widget ${c?"widget-minimized":""}`,children:[e.jsxs("div",{className:"widget-header",children:[e.jsxs("div",{className:"widget-hdr-left",children:[e.jsx("div",{className:"widget-icon-wrap",children:e.jsx(te,{size:16})}),e.jsxs("div",{children:[e.jsx("div",{className:"widget-title-text",children:r.widgetTitle}),e.jsxs("div",{className:"widget-sub-text",children:["Caisse ",o," • ",f.name]})]})]}),e.jsxs("div",{className:"widget-hdr-controls",children:[!h&&e.jsx("button",{className:"widget-control-btn popout-btn",onClick:_,title:"Détacher en fenêtre Bureau indépendante (Toujours accessible même si la page est réduite)",style:{background:"rgba(37, 99, 235, 0.25)",color:"#60a5fa",border:"1px solid rgba(96, 165, 250, 0.4)"},children:e.jsx(le,{size:14})}),e.jsx("button",{className:"widget-control-btn",onClick:()=>y(!c),title:c?"Agrandir":"Réduire",children:c?e.jsx(ce,{size:14}):e.jsx(ge,{size:14})}),e.jsx("button",{className:"widget-control-btn",onClick:()=>{F.includes(o)&&C(o,!1),ie(),d(),typeof window<"u"&&window.dispatchEvent(new Event("cofina_auth_changed"))},title:"Déconnexion session caisse",style:{color:"#FDA4AF"},children:e.jsx(oe,{size:14})}),e.jsx("button",{className:"widget-control-btn close-btn",onClick:()=>L(!1),title:"Masquer",children:e.jsx(ae,{size:14})})]})]}),c?e.jsxs("div",{className:"widget-compact-body",onClick:()=>y(!1),children:[e.jsxs("div",{className:"compact-ticket-badge",children:[e.jsxs("span",{className:"compact-lbl",children:[r.widgetActiveTicket," :"]}),e.jsx("strong",{className:"compact-num",children:t?t.ticketNumber:"-"})]}),e.jsxs("div",{className:"compact-wait-pill",children:[e.jsx("span",{className:"wait-dot"}),e.jsxs("span",{children:[A.length," ",r.widgetWaitingBadge]})]}),e.jsxs("button",{className:"compact-next-btn",onClick:i=>{i.stopPropagation(),E()},children:[e.jsx(S,{size:14})," ",r.widgetBtnNext]})]}):e.jsxs("div",{className:"widget-content-body",children:[e.jsxs("div",{className:"widget-config-row",children:[e.jsxs("div",{className:"widget-select-group",children:[e.jsx("label",{children:"Guichet :"}),e.jsxs("div",{style:{fontSize:"0.82rem",fontWeight:800,color:"#0F172A",background:"#F1F5F9",border:"1px solid #CBD5E1",padding:"0.25rem 0.6rem",borderRadius:"8px",display:"flex",alignItems:"center",gap:"0.3rem"},title:"Poste physique assigné et verrouillé",children:["🔒 Guichet ",o," (",g.name,")"]})]}),e.jsxs("button",{type:"button",className:`widget-btn-toggle ${p?"online":"offline"}`,onClick:V,title:"Basculer le statut de la Caisse (Ouverte / Fermée)",children:[e.jsx("div",{className:`status-dot ${p?"dot-online":"dot-offline"}`}),e.jsx("span",{children:p?"Ouverte":"Fermée"})]}),e.jsxs("div",{className:"widget-waiting-badge",children:[e.jsx("span",{className:"pulse-indicator"}),e.jsxs("span",{children:[e.jsx("strong",{children:A.length})," ",r.agentWaitingCount]})]})]}),e.jsx("div",{className:`widget-ticket-card ${t?"card-has-ticket":"card-empty"}`,children:t?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"widget-ticket-top",children:[e.jsx("span",{className:"ticket-status-pill",children:t.status==="IN_PROGRESS"?"En cours de service":t.status==="CALLED"?r.displayStatusCalled:t.status}),t.priority&&e.jsxs("span",{className:"priority-pill",children:["★ ",r.agentPriorityBadge]})]}),e.jsx("div",{className:"widget-ticket-num",children:t.ticketNumber}),e.jsx("div",{className:"widget-ticket-service",children:t.serviceName}),e.jsxs("div",{className:"widget-timer-row",children:[e.jsx(z,{size:14,className:"timer-icon"}),e.jsxs("span",{children:[r.agentTimerLabel," :"]}),e.jsx("strong",{className:"timer-val",children:H(U)})]}),t.status==="CALLED"&&e.jsxs("div",{style:{fontSize:"0.75rem",color:"#2563EB",marginTop:"0.4rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.35rem",fontWeight:600},children:[e.jsx(D,{size:13})," Ticket appelé • En attente"]}),t.status==="IN_PROGRESS"&&e.jsxs("div",{style:{fontSize:"0.75rem",color:"#059669",marginTop:"0.4rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.35rem",fontWeight:700},children:[e.jsx(B,{size:13})," En cours de service"]})]}):e.jsxs("div",{className:"widget-empty-msg",children:[e.jsx("p",{children:e.jsx("strong",{children:r.widgetNoTicket})}),e.jsx("span",{className:"sub",children:r.agentClickCallNext})]})}),e.jsxs("div",{className:"widget-actions-grid",children:[e.jsxs("button",{className:"widget-btn btn-call-next",onClick:E,children:[e.jsx(S,{size:16}),e.jsx("span",{children:r.widgetBtnNext})]}),e.jsxs("button",{className:"widget-btn btn-recall",onClick:X,disabled:!t,children:[e.jsx(D,{size:16}),e.jsx("span",{children:r.widgetBtnRecall})]}),e.jsxs("button",{className:"widget-btn btn-absent",onClick:Y,disabled:!t,children:[e.jsx(se,{size:16}),e.jsx("span",{children:"Absent"})]}),t&&t.status==="CALLED"&&e.jsxs("button",{className:"widget-btn btn-processing",onClick:Z,style:{gridColumn:"span 2"},children:[e.jsx(z,{size:16}),e.jsx("span",{children:"Démarrer le traitement"})]}),t&&t.status==="IN_PROGRESS"&&e.jsxs("button",{className:"widget-btn btn-complete",onClick:J,style:{gridColumn:"span 2"},children:[e.jsx(B,{size:16}),e.jsx("span",{children:"Terminer le service"})]})]}),e.jsxs("div",{className:"widget-footer-hint",children:[e.jsx(de,{size:13}),e.jsx("span",{children:r.agentWidgetNotice})]})]})]}),e.jsx("style",{children:`
        .cofina-floating-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 380px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08);
          z-index: 9999;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cofina-floating-widget.widget-minimized {
          width: 320px;
        }

        .cofina-floating-widget.widget-banking-overlay {
          box-shadow: 0 0 0 4px #D3122A, 0 30px 60px rgba(0, 0, 0, 0.35);
        }

        /* HEADER */
        .widget-header {
          background: #0F172A;
          color: #FFFFFF;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #D3122A;
        }

        .widget-hdr-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .widget-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #D3122A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .widget-title-text {
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #FFFFFF;
        }

        .widget-sub-text {
          font-size: 0.68rem;
          color: #94A3B8;
        }

        .widget-hdr-controls {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .widget-control-btn, .widget-sim-toggle-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .widget-sim-toggle-btn {
          background: #D3122A;
          color: #FFFFFF;
        }

        .widget-control-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }

        .widget-control-btn.close-btn:hover {
          background: #EF4444;
          color: #FFFFFF;
        }

        /* MINIMIZED BODY */
        .widget-compact-body {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          cursor: pointer;
          background: #F8FAFC;
        }

        .compact-ticket-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
        }

        .compact-num {
          color: #D3122A;
          font-size: 1.05rem;
          font-weight: 900;
        }

        .compact-wait-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 0.25rem 0.55rem;
          border-radius: 99px;
        }

        .wait-dot {
          width: 6px;
          height: 6px;
          background: #10B981;
          border-radius: 50%;
        }

        .compact-next-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: #0F172A;
          color: #FFFFFF;
          border: none;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }

        /* CONTENT BODY EXPANDED - ULTRA COMPACT & SLIM */
        .widget-content-body {
          padding: 0.65rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          background: #FFFFFF;
        }

        .widget-config-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .widget-select-group {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #475569;
          font-weight: 700;
        }

        .widget-select {
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
          border: 1.5px solid #CBD5E1;
          font-size: 0.75rem;
          font-weight: 800;
          color: #0F172A;
          outline: none;
        }

        .widget-btn-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.5rem;
          border-radius: 99px;
          border: 1px solid transparent;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .widget-btn-toggle.online {
          background: #ECFDF5;
          color: #059669;
          border-color: #A7F3D0;
        }

        .widget-btn-toggle.offline {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FECACA;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot-online {
          background: #10B981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .dot-offline {
          background: #EF4444;
        }

        .widget-waiting-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: #FFF5F5;
          color: #D3122A;
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          border: 1px solid #FEE2E2;
        }

        .pulse-indicator {
          width: 5px;
          height: 5px;
          background: #D3122A;
          border-radius: 50%;
          animation: pulseFast 1s infinite;
        }

        @keyframes pulseFast {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        /* ACTIVE TICKET CARD */
        .widget-ticket-card {
          border-radius: 10px;
          padding: 0.5rem 0.65rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .widget-ticket-card.card-has-ticket {
          background: linear-gradient(135deg, #FFF5F5 0%, #FEF2F2 100%);
          border: 1.5px solid #FCA5A5;
        }

        .widget-ticket-card.card-empty {
          background: #F8FAFC;
          border: 1.5px dashed #CBD5E1;
          color: #64748B;
          padding: 0.4rem;
        }

        .widget-ticket-top {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 0.15rem;
        }

        .ticket-status-pill {
          background: #D3122A;
          color: #FFFFFF;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.1rem 0.4rem;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .priority-pill {
          background: #D97706;
          color: #FFFFFF;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.1rem 0.4rem;
          border-radius: 99px;
        }

        .widget-ticket-num {
          font-size: 1.6rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0.1rem 0;
        }

        .widget-ticket-service {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .widget-timer-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          margin-top: 0.25rem;
          font-size: 0.7rem;
          color: #64748B;
        }

        .timer-val {
          font-family: monospace;
          font-size: 0.85rem;
          color: #D3122A;
          font-weight: 900;
        }

        .widget-empty-msg p {
          margin: 0;
          font-size: 0.82rem;
          color: #334155;
        }

        .widget-empty-msg .sub {
          font-size: 0.68rem;
          color: #94A3B8;
        }

        /* ACTIONS GRID */
        .widget-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
        }

        .widget-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          padding: 0.45rem 0.4rem;
          border-radius: 8px;
          border: none;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-call-next {
          grid-column: span 2;
          background: #D3122A;
          color: #FFFFFF;
          font-size: 0.82rem;
          box-shadow: 0 3px 8px rgba(211, 18, 42, 0.2);
        }

        .btn-call-next:hover {
          background: #B91C1C;
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
          color: #0F172A;
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

        .widget-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .widget-footer-hint {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #F8FAFC;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          font-size: 0.68rem;
          color: #64748B;
          line-height: 1.2;
        }

        /* ── SIMULATED BANKING CORE SOFTWARE OVERLAY SCREEN ── */
        .sim-banking-screen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #090D16;
          z-index: 9990;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          color: #E2E8F0;
        }

        .sim-banking-header {
          background: #0F172A;
          border-bottom: 1px solid #1E293B;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sim-bank-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 900;
          color: #38BDF8;
          font-size: 0.95rem;
        }

        .sim-bank-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #94A3B8;
        }

        .sim-divider {
          color: #334155;
        }

        .sim-close-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #D3122A;
          color: #FFFFFF;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }

        .sim-banking-body {
          flex: 1;
          display: flex;
        }

        .sim-bank-sidebar {
          width: 240px;
          background: #0F172A;
          border-right: 1px solid #1E293B;
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .sim-side-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          color: #94A3B8;
          cursor: pointer;
        }

        .sim-side-item.active {
          background: #0369A1;
          color: #FFFFFF;
          font-weight: 800;
        }

        .sim-bank-main {
          flex: 1;
          padding: 2rem;
          background: #0B1120;
        }

        .sim-card {
          background: #0F172A;
          border: 1px solid #1E293B;
          border-radius: 16px;
          padding: 1.5rem;
          max-width: 800px;
        }

        .sim-card h3 {
          margin: 0 0 0.25rem 0;
          color: #F8FAFC;
          font-size: 1.1rem;
        }

        .sim-sub {
          margin: 0 0 1.5rem 0;
          font-size: 0.82rem;
          color: #64748B;
        }

        .sim-form-group label {
          display: block;
          font-size: 0.78rem;
          color: #94A3B8;
          margin-bottom: 0.4rem;
          font-weight: 700;
        }

        .sim-input-row {
          display: flex;
          gap: 0.5rem;
        }

        .sim-input {
          flex: 1;
          background: #020617;
          border: 1px solid #334155;
          color: #F8FAFC;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
        }

        .sim-search-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #0284C7;
          color: #FFFFFF;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
        }

        .sim-account-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #1E293B;
        }

        .sim-stat-box {
          background: #020617;
          padding: 0.85rem;
          border-radius: 10px;
          border: 1px solid #1E293B;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sim-stat-box span {
          font-size: 0.68rem;
          color: #64748B;
          font-weight: 800;
        }

        .sim-stat-box strong {
          font-size: 0.95rem;
          color: #F8FAFC;
        }

        .text-green {
          color: #10B981 !important;
        }
      `})]})}export{ye as default};
