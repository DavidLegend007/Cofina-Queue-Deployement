import{c as V,r as s,a as F,p as M,j as e,V as $,m as B,C,S as G,B as Y,n as H}from"./index-Cd1px65I.js";import{C as A}from"./circle-alert-DY5G1Wuj.js";import{U as W}from"./users-Br7t0lf7.js";import{S as q}from"./sparkles-C_GLiqXz.js";import{C as K}from"./circle-check-BPZTyp7B.js";import{S as _}from"./star-BFDZfLzf.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=V("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);function ae({ticketNumber:o,tickets:c=[],agencyName:h="COFINA Togo — Agence Siège Kodjoviakopé",lang:S="fr",onBackToKiosk:b=null}){const[j,E]=s.useState(S),[y,m]=s.useState(c),[l,z]=s.useState(!0),[k,I]=s.useState(0),[R,O]=s.useState(!1),[D,L]=s.useState(null),[u,P]=s.useState(null),x=s.useRef(null);s.useEffect(()=>{c&&c.length>0&&m(c)},[c]),s.useEffect(()=>{const r=async()=>{try{const d=String(o||"").trim();if(!d)return;const w=await fetch(`/api/tickets/track/${encodeURIComponent(d)}`);if(w.ok){const i=await w.json();if(i&&i.ticket){L(i.ticket),typeof i.positionAhead=="number"&&P(i.positionAhead),Array.isArray(i.allTodayTickets)&&i.allTodayTickets.length>0&&m(i.allTodayTickets);return}}const T=await fetch("/api/tickets/today-state");if(T.ok){const i=await T.json(),g=(i==null?void 0:i.tickets)||(i==null?void 0:i.data)||(Array.isArray(i)?i:[]);Array.isArray(g)&&g.length>0&&m(g)}}catch{}};r();const n=setInterval(r,3e3);return()=>clearInterval(n)},[o]);const v=r=>String(r||"").replace(/[\s\-_]/g,"").toUpperCase(),t=D||y.find(r=>r.ticketNumber===o||v(r.ticketNumber)===v(o))||null,p=t?F.find(r=>r.code===t.serviceCode)||{name:t.serviceName||"Opération Caisse",color:"#D3122A"}:{name:"Opération Caisse",color:"#D3122A"},N=y.filter(r=>r.status==="WAITING");let f=u!==null?u:0;if(u===null&&t&&t.status==="WAITING"){const r=new Date(t.createdAt).getTime();f=N.filter(n=>{if(n.id===t.id)return!1;const d=new Date(n.createdAt).getTime();return n.priority&&!t.priority?!0:!n.priority&&t.priority?!1:d<r}).length}const U=Math.max(2,f*4);s.useEffect(()=>{if(t){const r=t.status;if(x.current&&x.current!=="CALLED"&&r==="CALLED"&&(l&&M(),typeof navigator<"u"&&"vibrate"in navigator))try{navigator.vibrate([400,200,400,200,600])}catch{}x.current=r}},[t,l]);const a=j==="en";return e.jsxs("div",{className:"mobile-ticket-container",children:[e.jsxs("header",{className:"mobile-appbar",children:[e.jsxs("div",{className:"appbar-brand",children:[e.jsx("img",{src:"/cofina.jpeg",alt:"COFINA Logo",className:"appbar-logo"}),e.jsxs("div",{className:"appbar-text",children:[e.jsx("span",{className:"appbar-title",children:"COFINA TOGO"}),e.jsx("span",{className:"appbar-agency",children:h})]})]}),e.jsxs("div",{className:"appbar-actions",children:[e.jsx("button",{type:"button",className:"lang-pill",onClick:()=>E(r=>r==="fr"?"en":"fr"),children:j.toUpperCase()}),e.jsx("button",{type:"button",className:`sound-pill ${l?"active":""}`,onClick:()=>z(r=>!r),title:l?"Son activé":"Son coupé",children:l?e.jsx($,{size:16}):e.jsx(B,{size:16})})]})]}),e.jsxs("div",{className:"live-status-bar",children:[e.jsxs("div",{className:"pulse-indicator",children:[e.jsx("span",{className:"ping-dot"}),e.jsx("span",{className:"static-dot"})]}),e.jsx("span",{className:"live-status-text",children:a?"LIVE QUEUE SYNCHRONIZED":"SUIVI DE FILE EN DIRECT"})]}),e.jsx("main",{className:"mobile-main",children:t?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`ticket-pass-card status-${t.status.toLowerCase()}`,children:[e.jsxs("div",{className:"ticket-pass-header",children:[e.jsx("span",{className:"service-pill",style:{backgroundColor:`${p.color||"#D3122A"}15`,color:p.color||"#D3122A",borderColor:`${p.color||"#D3122A"}30`},children:p.name}),t.priority&&e.jsxs("span",{className:"priority-pill",children:["★ ",a?"PRIORITY":"PRIORITAIRE"]})]}),e.jsxs("div",{className:"ticket-hero-number",children:[e.jsx("span",{className:"ticket-hero-label",children:a?"YOUR TICKET":"VOTRE TICKET"}),e.jsx("h1",{className:"ticket-hero-code",children:t.ticketNumber})]}),e.jsxs("div",{className:"ticket-pass-divider",children:[e.jsx("div",{className:"cutout-left"}),e.jsx("div",{className:"dashed-line"}),e.jsx("div",{className:"cutout-right"})]}),e.jsxs("div",{className:"ticket-pass-footer",children:[e.jsxs("div",{className:"pass-meta-item",children:[e.jsx(C,{size:14}),e.jsxs("span",{children:[a?"Issued at:":"Émis à :"," ",new Date(t.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})]})]}),e.jsxs("div",{className:"pass-meta-item",children:[e.jsx(G,{size:14}),e.jsx("span",{children:"E-Ticket Mobile"})]})]})]}),t.status==="CALLED"&&e.jsxs("section",{className:"state-card card-called animate-bounce-subtle",children:[e.jsx("div",{className:"called-hero-icon",children:e.jsx(Y,{size:36,className:"ringing-bell"})}),e.jsx("h2",{className:"called-title",children:a?"IT'S YOUR TURN!":"C'EST VOTRE TOUR !"}),e.jsx("p",{className:"called-subtitle",children:a?"Please proceed immediately to the counter:":"Veuillez vous présenter immédiatement au :"}),e.jsxs("div",{className:"counter-destination-box",children:[e.jsx("span",{className:"destination-label",children:a?"COUNTER":"GUICHET"}),e.jsx("span",{className:"destination-number",children:t.counterNumber||1})]}),t.agentName&&e.jsx("div",{className:"agent-signature",children:e.jsxs("span",{children:[a?"Teller:":"Caissier :"," ",e.jsx("strong",{children:t.agentName})]})})]}),t.status==="WAITING"&&e.jsxs("section",{className:"state-card card-waiting",children:[e.jsx("div",{className:"queue-radar",children:e.jsxs("div",{className:"radar-circle",children:[e.jsx("span",{className:"radar-count",children:f}),e.jsx("span",{className:"radar-unit",children:f<=1?a?"person ahead":"personne devant":a?"people ahead":"personnes devant"})]})}),e.jsxs("div",{className:"waiting-info-grid",children:[e.jsxs("div",{className:"info-box",children:[e.jsx(C,{size:20,className:"info-icon"}),e.jsxs("div",{children:[e.jsx("span",{className:"info-title",children:a?"Estimated wait":"Temps estimé"}),e.jsxs("strong",{className:"info-val",children:["~",U," min"]})]})]}),e.jsxs("div",{className:"info-box",children:[e.jsx(W,{size:20,className:"info-icon"}),e.jsxs("div",{children:[e.jsx("span",{className:"info-title",children:a?"Total in line":"Dans la file"}),e.jsx("strong",{className:"info-val",children:N.length})]})]})]}),e.jsx("div",{className:"waiting-advice",children:e.jsx("p",{children:a?"You can comfortably take a seat in the lounge. Your phone will alert you automatically when called.":"Vous pouvez vous asseoir en salle d'attente. Cette page sonnera et vibrera dès que votre numéro sera appelé."})})]}),t.status==="IN_PROGRESS"&&e.jsxs("section",{className:"state-card card-in-progress",children:[e.jsxs("div",{className:"progress-badge",children:[e.jsx(q,{size:24}),e.jsx("h3",{children:a?"Service in Progress":"Traitement en cours"})]}),e.jsx("p",{children:a?`You are currently being attended at Counter ${t.counterNumber||1}.`:`Vous êtes actuellement pris en charge au Guichet ${t.counterNumber||1}.`})]}),t.status==="COMPLETED"&&e.jsxs("section",{className:"state-card card-completed",children:[e.jsx("div",{className:"completed-check",children:e.jsx(K,{size:44,color:"#10B981"})}),e.jsx("h2",{children:a?"Service Completed!":"Opération Terminée !"}),e.jsx("p",{children:a?"Thank you for choosing COFINA Togo for your financial operations.":"Merci de votre confiance et bonne journée avec COFINA Togo !"}),e.jsxs("div",{className:"satisfaction-box",children:[e.jsx("span",{className:"sat-title",children:a?"How was your experience today?":"Votre avis sur notre accueil :"}),e.jsx("div",{className:"stars-row",children:[1,2,3,4,5].map(r=>e.jsx("button",{type:"button",className:`star-btn ${k>=r?"selected":""}`,onClick:()=>{I(r),O(!0)},children:e.jsx(_,{size:28,fill:k>=r?"#F59E0B":"none",color:"#F59E0B"})},r))}),R&&e.jsxs("span",{className:"feedback-thank",children:["✓ ",a?"Thank you for your rating!":"Merci pour votre note !"]})]})]}),t.status==="NO_SHOW"&&e.jsxs("section",{className:"state-card card-no-show",children:[e.jsx(A,{size:36,color:"#DC2626"}),e.jsx("h3",{children:a?"Ticket Missed":"Ticket Marqué Absent"}),e.jsx("p",{children:a?"Your ticket was called but no response was received. Please contact the reception desk.":"Votre numéro a été appelé au guichet sans réponse. Veuillez vous rapprocher de l'agent d'accueil."})]}),e.jsxs("div",{className:"mobile-footer-tips",children:[e.jsx(H,{size:16}),e.jsx("span",{children:h})]})]}):e.jsxs("div",{className:"mobile-empty-card",children:[e.jsx(A,{size:48,color:"#D3122A",style:{marginBottom:"1rem"}}),e.jsx("h2",{children:a?"Ticket not found":"Ticket introuvable"}),e.jsx("p",{children:a?`The ticket "${o}" could not be found or has expired.`:`Le ticket "${o}" n'a pas été trouvé ou a expiré.`}),b&&e.jsxs("button",{type:"button",className:"btn-return",onClick:b,children:[e.jsx(J,{size:18}),e.jsx("span",{children:a?"Back to Kiosk":"Retour à la Borne"})]})]})}),e.jsx("style",{children:`
        .mobile-ticket-container {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          max-width: 480px;
          margin: 0 auto;
          box-shadow: 0 0 40px rgba(0,0,0,0.06);
          position: relative;
        }

        .mobile-appbar {
          background: #ffffff;
          padding: 0.9rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .appbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .appbar-logo {
          height: 38px;
          width: auto;
          border-radius: 6px;
        }

        .appbar-text {
          display: flex;
          flex-direction: column;
        }

        .appbar-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #D3122A;
          letter-spacing: 0.5px;
        }

        .appbar-agency {
          font-size: 0.72rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .appbar-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lang-pill, .sound-pill {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          padding: 0.35rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .sound-pill.active {
          background: #fee2e2;
          border-color: #fecaca;
          color: #D3122A;
        }

        .live-status-bar {
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.4rem 1rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .pulse-indicator {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ping-dot {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #22c55e;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.75;
        }

        .static-dot {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        .mobile-main {
          flex: 1;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* TICKET PASS CARD */
        .ticket-pass-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          transition: transform 0.2s;
        }

        .ticket-pass-header {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .service-pill {
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid transparent;
        }

        .priority-pill {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
        }

        .ticket-hero-number {
          text-align: center;
          padding: 0.75rem 1rem 1.25rem 1rem;
        }

        .ticket-hero-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #94a3b8;
        }

        .ticket-hero-code {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -1px;
          margin: 0.2rem 0 0 0;
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .ticket-pass-divider {
          display: flex;
          align-items: center;
          position: relative;
          height: 20px;
        }

        .cutout-left, .cutout-right {
          width: 14px;
          height: 24px;
          background: #f8fafc;
          position: absolute;
          z-index: 2;
        }

        .cutout-left {
          left: 0;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
          border: 1px solid #e2e8f0;
          border-left: none;
        }

        .cutout-right {
          right: 0;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
          border: 1px solid #e2e8f0;
          border-right: none;
        }

        .dashed-line {
          width: 100%;
          border-top: 2px dashed #e2e8f0;
          margin: 0 16px;
        }

        .ticket-pass-footer {
          padding: 0.9rem 1.25rem;
          background: #fafafc;
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #64748b;
        }

        .pass-meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* STATE CARDS */
        .state-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem 1.25rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          text-align: center;
        }

        /* 1. CALLED STATE */
        .card-called {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.4);
        }

        .called-hero-icon {
          width: 68px;
          height: 68px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem auto;
        }

        .ringing-bell {
          animation: ring 1s infinite alternate;
        }

        @keyframes ring {
          0% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }

        .called-title {
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0 0 0.25rem 0;
          letter-spacing: 0.5px;
        }

        .called-subtitle {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.9);
          margin: 0 0 1.2rem 0;
        }

        .counter-destination-box {
          background: #ffffff;
          color: #065f46;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }

        .destination-label {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #059669;
        }

        .destination-number {
          font-size: 3.2rem;
          font-weight: 900;
          line-height: 1;
        }

        .agent-signature {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.9);
        }

        /* 2. WAITING STATE */
        .card-waiting {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .queue-radar {
          margin: 0.5rem 0 1.25rem 0;
        }

        .radar-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: #eff6ff;
          border: 4px solid #bfdbfe;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 8px #f0fdf4;
        }

        .radar-count {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1d4ed8;
          line-height: 1;
        }

        .radar-unit {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 0.25rem;
        }

        .waiting-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
          margin-bottom: 1rem;
        }

        .info-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-align: left;
        }

        .info-icon {
          color: #D3122A;
        }

        .info-title {
          display: block;
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 600;
        }

        .info-val {
          font-size: 0.95rem;
          color: #0f172a;
          font-weight: 800;
        }

        .waiting-advice {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.78rem;
          color: #92400e;
          line-height: 1.4;
        }

        /* 3. IN PROGRESS */
        .card-in-progress {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }

        .progress-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #2563eb;
        }

        /* 4. COMPLETED */
        .card-completed {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .completed-check {
          margin-bottom: 0.5rem;
        }

        .satisfaction-box {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px dashed #a7f3d0;
        }

        .sat-title {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
        }

        .stars-row {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.2rem;
          transition: transform 0.15s;
        }

        .star-btn:hover {
          transform: scale(1.15);
        }

        .feedback-thank {
          display: block;
          margin-top: 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #059669;
        }

        /* FOOTER TIPS */
        .mobile-footer-tips {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: #94a3b8;
          padding: 1rem 0;
        }

        .mobile-empty-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem 1.5rem;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .btn-return {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1.5rem;
        }
      `})]})}export{ae as default};
