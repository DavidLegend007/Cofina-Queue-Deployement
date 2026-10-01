import{c as O,R as t,u as B,j as e,V as C,p as b,s as w,t as T,a as U,C as V}from"./index-C8j-q2Ig.js";import{S as G}from"./sparkles-D7ZbL5NB.js";import{A as M}from"./arrow-right-Bn62b_x8.js";import{U as P}from"./users-hh1K6C3h.js";import{C as q}from"./circle-check-9WNUlV4S.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=O("Tv",[["rect",{width:"20",height:"15",x:"2",y:"7",rx:"2",ry:"2",key:"10ag99"}],["polyline",{points:"17 2 12 7 7 2",key:"11pgbg"}]]),$=typeof window<"u"?`${window.location.protocol}//${window.location.hostname}:4000`:"http://localhost:4000";function J({agencyName:z,tickets:c,lastCalledTicket:d,lang:n="fr"}){const[S,L]=t.useState(new Date),[l,D]=t.useState(!1),[E,F]=t.useState(c||[]),[f,y]=t.useState(d||null),[H,v]=t.useState(!0),j=t.useRef(null);t.useEffect(()=>{c&&c.length>0&&(F(c),v(!0))},[c]),t.useEffect(()=>{d&&y(d)},[d]),t.useEffect(()=>{let s=!0,i=0;const r=async()=>{try{const x=await fetch(`${$}/api/tickets/today-state`,{cache:"no-store",headers:{Accept:"application/json"}});if(!x.ok)throw new Error(`HTTP ${x.status}`);const A=await x.json();if(!s)return;i=0,v(!0);const k=Array.isArray(A.tickets)?A.tickets:[];F(k);const o=k.find(R=>R.status==="CALLED")||null;o&&o.id!==j.current&&(j.current=o.id,y(o),(!d||o.id!==d.id)&&(b(),w(o.ticketNumber,o.counterNumber,n)))}catch{i++,i>=2&&v(!1)}};r();const N=setInterval(r,5e3);return()=>{s=!1,clearInterval(N)}},[n]),t.useEffect(()=>{const s=setInterval(()=>L(new Date),1e3);return()=>clearInterval(s)},[]),t.useEffect(()=>{const s=i=>{const{ticket:r}=i.detail;r&&(b(),w(r.ticketNumber,r.counterNumber,n))};return window.addEventListener("ticket_called_audio",s),()=>window.removeEventListener("ticket_called_audio",s)},[n]);const a=t.useCallback(()=>{B(),D(!0)},[]);t.useEffect(()=>(window.addEventListener("click",a),window.addEventListener("pointerdown",a),window.addEventListener("touchstart",a),window.addEventListener("keydown",a),()=>{window.removeEventListener("click",a),window.removeEventListener("pointerdown",a),window.removeEventListener("touchstart",a),window.removeEventListener("keydown",a)}),[a]);const g=t.useCallback(s=>{if(!s)return!1;if(!s.createdAt)return!0;const i=new Date(s.createdAt);if(isNaN(i.getTime()))return!0;const r=new Date;return i.getFullYear()===r.getFullYear()&&i.getMonth()===r.getMonth()&&i.getDate()===r.getDate()},[]),u=t.useMemo(()=>(E||[]).filter(g),[E,g]),p=t.useMemo(()=>f&&g(f)?f:null,[f,g]),m=T[n]||T.fr,I=u.filter(s=>s.status==="CALLED"||s.status==="IN_PROGRESS"),h=u.filter(s=>s.status==="WAITING").sort((s,i)=>new Date(s.createdAt)-new Date(i.createdAt));return e.jsxs("div",{className:"disp-root animate-fade-in",children:[!l&&e.jsxs("div",{className:"disp-audio-unlock-banner",onClick:()=>{a(),b(),w("A-01","1",n)},style:{position:"fixed",top:0,left:0,right:0,zIndex:999999,backgroundColor:"#dc2626",color:"#ffffff",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:"14px",fontSize:"16px",fontWeight:"bold",cursor:"pointer",boxShadow:"0 4px 15px rgba(220, 38, 38, 0.5)",letterSpacing:"0.5px"},title:"Cliquez pour autoriser le son et la synthèse vocale sur ce navigateur",children:[e.jsx(C,{size:24,className:"audio-icon-pulse"}),e.jsx("span",{children:"🔊 CLIQUEZ UNE FOIS SUR L'ÉCRAN POUR ACTIVER LE SON ET LA VOIX DE LA TV"}),e.jsx("span",{style:{fontSize:"12px",background:"rgba(0,0,0,0.25)",padding:"4px 10px",borderRadius:"12px"},children:"Requis après chaque rechargement"})]}),e.jsxs("header",{className:"disp-header",children:[e.jsxs("div",{className:"disp-hdr-left",children:[e.jsx("div",{className:"disp-logo-box",children:e.jsx("img",{src:"/cofina.jpeg",alt:"Cofina Logo",className:"disp-logo-img"})}),e.jsxs("div",{className:"disp-hdr-title",children:[e.jsx("h1",{className:"disp-agency",children:z}),e.jsx("span",{className:"disp-sub",children:m.displayTitle})]})]}),e.jsxs("div",{className:"disp-hdr-right",children:[e.jsxs("div",{className:"disp-badge disp-badge-audio",onClick:()=>{a(),b(),w("A-01","1",n)},style:{cursor:"pointer",backgroundColor:l?"rgba(34, 197, 94, 0.15)":"rgba(239, 68, 68, 0.2)",borderColor:l?"#22c55e":"#ef4444",color:l?"#22c55e":"#fca5a5"},title:"Cliquer pour tester le carillon et la voix sur la TV",children:[e.jsx(C,{size:15,className:"audio-icon-pulse"}),e.jsx("span",{children:l?m.soundActive:"Activer le Son (Cliquer)"})]}),e.jsx("div",{className:"disp-clock",children:S.toLocaleTimeString(n==="en"?"en-US":"fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})})]})]}),p?e.jsxs("section",{className:"disp-hero-call animate-scale-up",children:[e.jsxs("div",{className:"disp-call-left",children:[e.jsxs("span",{className:"disp-call-badge",children:[e.jsx(G,{size:14})," ",m.displayNowCalling]}),e.jsx("div",{className:"disp-call-ticket",children:p.ticketNumber}),e.jsx("div",{className:"disp-call-service",children:p.serviceName})]}),e.jsx("div",{className:"disp-call-arrow",children:e.jsx(M,{size:38})}),e.jsxs("div",{className:"disp-call-right",children:[e.jsx("span",{className:"disp-call-dest-lbl",children:m.displayGoToCounter}),e.jsxs("div",{className:"disp-call-counter",children:[m.displayCounter," ",p.counterNumber]}),e.jsxs("div",{className:"disp-call-agent",children:["Caissier : ",p.agentName||"Agent Cofina"]})]})]}):e.jsxs("section",{className:"disp-hero-empty",children:[e.jsx("div",{className:"disp-empty-icon",children:e.jsx(_,{size:26})}),e.jsxs("div",{className:"disp-empty-txt",children:[e.jsx("h2",{children:"EN ATTENTE D'UN NOUVEL APPEL"}),e.jsx("p",{children:"Veuillez vous installer en salle d'attente. Votre numéro sera annoncé à l'écran."})]})]}),e.jsxs("main",{className:"disp-grid",children:[e.jsxs("section",{className:"disp-col-main",children:[e.jsxs("div",{className:"disp-sec-bar",children:[e.jsxs("div",{className:"disp-sec-title",children:[e.jsx("h2",{children:"POSTES EN SERVICE"}),e.jsx("span",{className:"disp-pulse-green",children:"● EN DIRECT"})]}),e.jsx("span",{className:"disp-sec-sub",children:"Guichets 1 à 6 (Caisses • Opérateurs • Accueil)"})]}),e.jsx("div",{className:"disp-counters-grid",children:[{num:1,name:"Caisse 1",pole:"Espèces"},{num:2,name:"Caisse 2",pole:"Espèces"},{num:3,name:"Caisse 3",pole:"Chèques"},{num:4,name:"Opérateur 1",pole:"Comptes"},{num:5,name:"Opérateur 2",pole:"Crédit"},{num:6,name:"Accueil",pole:"Orientation"}].map(s=>{const i=I.find(r=>r.counterNumber===s.num);return e.jsxs("div",{className:`disp-caisse-card ${i?"active-caisse":"idle-caisse"}`,children:[e.jsxs("div",{className:"caisse-top",children:[e.jsxs("span",{className:"caisse-num-badge",children:["G",s.num," • ",s.name.toUpperCase()]}),i?e.jsx("span",{className:"caisse-status-dot",children:"En traitement"}):e.jsx("span",{className:"caisse-pole-tag",children:s.pole})]}),i?e.jsxs("div",{className:"caisse-body",children:[e.jsx("div",{className:"caisse-ticket",children:i.ticketNumber}),e.jsx("div",{className:"caisse-service",children:i.serviceName})]}):e.jsx("div",{className:"caisse-idle-body",children:e.jsx("span",{children:"Disponible"})})]},s.num)})})]}),e.jsxs("aside",{className:"disp-col-side",children:[e.jsxs("div",{className:"disp-sec-bar",children:[e.jsx("div",{className:"disp-sec-title",children:e.jsx("h2",{children:"FILE D'ATTENTE"})}),e.jsxs("span",{className:"disp-count-chip",children:[e.jsx(P,{size:13})," ",h.length," en attente"]})]}),e.jsxs("div",{className:"disp-services-list",children:[h.slice(0,5).map((s,i)=>{const r=U.find(N=>N.code===s.serviceCode)||{color:"#0284C7"};return e.jsxs("div",{className:"disp-svc-row",children:[e.jsxs("div",{className:"disp-svc-info",children:[e.jsx("div",{className:"disp-svc-badge",style:{backgroundColor:r.color,boxShadow:`0 3px 10px ${r.color}40`},children:s.ticketNumber}),e.jsxs("div",{className:"disp-svc-names",children:[e.jsx("span",{className:"disp-svc-name",children:s.serviceName}),e.jsxs("span",{className:"disp-svc-time",children:[e.jsx(V,{size:12})," Reçu à ",new Date(s.createdAt).toLocaleTimeString(n==="en"?"en-US":"fr-FR",{hour:"2-digit",minute:"2-digit"})]})]})]}),e.jsx("span",{className:"disp-svc-status-pill",children:i===0?"Prochain":`${i+1}ᵉ`})]},s.id)}),h.length===0&&e.jsx("div",{className:"disp-svc-empty",children:"Aucun ticket en attente"}),h.length>5&&e.jsxs("div",{className:"disp-svc-more",children:["+ ",h.length-5," autres ticket(s)"]})]}),e.jsxs("div",{className:"disp-completed-box",children:[e.jsx("div",{className:"disp-comp-hdr",children:"Derniers tickets servis"}),e.jsxs("div",{className:"disp-comp-chips",children:[u.filter(s=>s.status==="COMPLETED").slice(0,4).map(s=>e.jsxs("span",{className:"disp-chip-done",children:[e.jsx(q,{size:12})," ",s.ticketNumber]},s.id)),u.filter(s=>s.status==="COMPLETED").length===0&&e.jsx("span",{className:"disp-chip-none",children:"Aucun ticket encore clôturé"})]})]})]})]}),e.jsxs("footer",{className:"disp-footer",children:[e.jsx("div",{className:"disp-foot-tag",children:"INFORMATION AGENT"}),e.jsx("div",{className:"disp-foot-marquee",children:e.jsx("marquee",{scrollamount:"5",children:"Cher Client, N'attendez plus, créez votre alias PI-SPI Cofina ! Simple, rapide et sécurisé. Suivez les étapes: https://bit.ly/4baN7O 0. Assistance au 92686060. • Bienvenue chez COFINA Togo • Pour vos dépôts, retraits et ouvertures de compte, nos caisses vous accueillent • Pensez à préparer votre pièce d'identité"})})]}),e.jsx("style",{children:`
        .disp-root {
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background: #F8FAFC;
          color: #0F172A;
          padding: 0.75rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          box-sizing: border-box;
        }

        /* HEADER COMPACT */
        .disp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          padding: 0.45rem 1.25rem;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          flex-shrink: 0;
        }

        .disp-hdr-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .disp-logo-box {
          background: #FFF5F5;
          padding: 0.25rem 0.65rem;
          border-radius: 10px;
          border: 1px solid #FEE2E2;
          display: flex;
          align-items: center;
        }

        .disp-logo-img {
          height: 32px;
          width: auto;
          object-fit: contain;
        }

        .disp-hdr-title {
          display: flex;
          flex-direction: column;
        }

        .disp-agency {
          font-size: 1.15rem;
          font-weight: 900;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .disp-sub {
          font-size: 0.72rem;
          font-weight: 800;
          color: #D3122A;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .disp-hdr-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .disp-badge-audio {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #FFF5F5;
          border: 1px solid #FECACA;
          color: #D3122A;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
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
          font-size: 1.55rem;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        /* HERO SPOTLIGHT BANNER COMPACT & IMPACTANT */
        .disp-hero-call {
          background: linear-gradient(135deg, #D3122A 0%, #B90E23 100%);
          border-radius: 16px;
          padding: 0.65rem 1.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
          box-shadow: 0 10px 24px rgba(211, 18, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        .disp-call-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          margin-bottom: 0.15rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .disp-call-ticket {
          font-size: 3.4rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
        }

        .disp-call-service {
          font-size: 1.05rem;
          font-weight: 700;
          opacity: 0.95;
          margin-top: 0.15rem;
        }

        .disp-call-arrow {
          animation: slideArrow 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
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
          font-size: 0.75rem;
          font-weight: 800;
          opacity: 0.9;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .disp-call-counter {
          font-size: 2.8rem;
          font-weight: 900;
          line-height: 1;
          margin-top: 0.1rem;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
        }

        .disp-call-agent {
          font-size: 0.88rem;
          opacity: 0.92;
          margin-top: 0.2rem;
          font-weight: 600;
        }

        .disp-hero-empty {
          background: #FFFFFF;
          border: 1.5px dashed #CBD5E1;
          border-radius: 16px;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .disp-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #FFF5F5;
          color: #D3122A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .disp-empty-txt h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.15rem;
        }

        .disp-empty-txt p {
          font-size: 0.82rem;
          color: #64748B;
          margin: 0;
        }

        /* GRID LAYOUT ZERO OVERFLOW (FLEX 1) */
        .disp-grid {
          display: grid;
          grid-template-columns: 2.15fr 1fr;
          gap: 1rem;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .disp-sec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.45rem;
          padding-bottom: 0.35rem;
          border-bottom: 2px solid #E2E8F0;
          flex-shrink: 0;
        }

        .disp-sec-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .disp-sec-title h2 {
          font-size: 0.95rem;
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
          font-size: 0.75rem;
          color: #94A3B8;
          font-weight: 600;
        }

        /* CAISSES & POSTES GRID */
        .disp-col-main {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .disp-counters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 0.65rem;
          flex: 1;
          min-height: 0;
        }

        .disp-caisse-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 0.65rem 0.9rem;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 0;
          overflow: hidden;
        }

        .disp-caisse-card.active-caisse {
          border-color: #D3122A;
          background: #FFFFFF;
          box-shadow: 0 6px 18px rgba(211, 18, 42, 0.12);
        }

        .caisse-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .caisse-num-badge {
          font-size: 0.78rem;
          font-weight: 900;
          color: #D3122A;
          letter-spacing: 0.04em;
        }

        .caisse-status-dot {
          font-size: 0.68rem;
          font-weight: 800;
          background: #DEF7EC;
          color: #03543F;
          border: 1px solid #A7F3D0;
          padding: 0.15rem 0.55rem;
          border-radius: 99px;
        }

        .caisse-pole-tag {
          font-size: 0.68rem;
          color: #94A3B8;
          font-weight: 700;
        }

        .caisse-body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          min-height: 0;
        }

        .caisse-ticket {
          font-size: 2.3rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1.1;
          margin: 0.2rem 0 0.1rem;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .caisse-service {
          font-size: 0.78rem;
          color: #64748B;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .caisse-idle-body {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #94A3B8;
          font-size: 0.88rem;
          font-weight: 700;
          background: #F8FAFC;
          border-radius: 10px;
          border: 1px dashed #CBD5E1;
          margin-top: 0.3rem;
        }

        /* SIDEBAR FILE D'ATTENTE AVEC BOUTONS/BADGES HORIZONTAUX ÉLÉGANTS */
        .disp-col-side {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 0.75rem 1rem;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .disp-count-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
        }

        .disp-services-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .disp-svc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.75rem;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }

        .disp-svc-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        /* BADGE TICKET HORIZONTAL (TI-004 EN UNE SEULE LIGNE) */
        .disp-svc-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 86px;
          height: 38px;
          padding: 0 0.65rem;
          border-radius: 9px;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 1.22rem;
          letter-spacing: 0.04em;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: monospace, var(--font-body, 'Inter', sans-serif);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
        }

        .disp-svc-names {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .disp-svc-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0F172A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .disp-svc-time {
          font-size: 0.72rem;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }

        .disp-svc-status-pill {
          font-size: 0.72rem;
          font-weight: 800;
          color: #1E293B;
          background: #E2E8F0;
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .disp-svc-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
          padding: 1.5rem 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .disp-svc-more {
          text-align: center;
          color: #94A3B8;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0;
        }

        /* RECENTLY COMPLETED */
        .disp-completed-box {
          margin-top: auto;
          padding-top: 0.45rem;
          border-top: 1px solid #E2E8F0;
          flex-shrink: 0;
        }

        .disp-comp-hdr {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
          letter-spacing: 0.05em;
        }

        .disp-comp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .disp-chip-done {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #DEF7EC;
          color: #03543F;
          border: 1px solid #A7F3D0;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.18rem 0.55rem;
          border-radius: 6px;
        }

        .disp-chip-none {
          font-size: 0.75rem;
          color: #CBD5E1;
        }

        /* FOOTER TICKER (TOUJOURS VISIBLE SANS SCROLL) */
        .disp-footer {
          display: flex;
          align-items: center;
          background: #0F172A;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          height: 36px;
          min-height: 36px;
          flex-shrink: 0;
        }

        .disp-foot-tag {
          background: #D3122A;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 0.75rem;
          padding: 0 1rem;
          height: 100%;
          display: flex;
          align-items: center;
          white-space: nowrap;
          letter-spacing: 0.05em;
        }

        .disp-foot-marquee {
          flex: 1;
          color: #F8FAFC;
          font-size: 0.85rem;
          font-weight: 600;
          padding-right: 1rem;
          display: flex;
          align-items: center;
        }

        @media (max-width: 900px) {
          .disp-grid { grid-template-columns: 1fr; }
          .disp-counters-grid { grid-template-columns: 1fr; }
          .disp-root { padding: 0.5rem; height: auto; max-height: none; overflow: auto; }
        }
      `})]})}export{J as default};
