import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { createTicket } from '../services/queueStore';

/* ─── Design tokens (COFINA Brand Theme) ─────────────── */
const MD = {
  background:              '#f9f9fb',
  surface:                 '#f9f9fb',
  surfaceLowest:           '#ffffff',
  surfaceContainerHighest: '#e2e2e4',
  surfaceContainerHigh:    '#e8e8ea',
  surfaceContainer:        '#eeeef0',
  outlineVariant:          '#e6bdbb',
  onBackground:            '#1a1c1d',
  onSurface:               '#1a1c1d',
  onSurfaceVariant:        '#5d3f3f',
  primary:                 '#a80025',
  primaryContainer:        '#d60032',
  onPrimaryContainer:      '#ffe6e5',
  secondaryContainer:      '#e4e2e2',
  onSecondaryContainer:    '#646464',
};

/* ─── 8 operations COFINA ────────────────────────────────────────────────── */
const OPERATIONS = [
  { id: 'op-depot',     code: 'A', label: 'Dépôt',               icon: 'payments',      filled: true,  primary: true  },
  { id: 'op-retrait',   code: 'A', label: 'Retrait',             icon: 'money',         filled: false, primary: false },
  { id: 'op-ouverture', code: 'B', label: 'Ouverture de compte', icon: 'person_add',    filled: false, primary: false },
  { id: 'op-credit',    code: 'C', label: 'Crédit',              icon: 'credit_card',   filled: false, primary: false },
  { id: 'op-epargne',   code: 'B', label: 'Épargne',             icon: 'savings',       filled: false, primary: false },
  { id: 'op-remb',      code: 'C', label: 'Remboursement',       icon: 'receipt_long',  filled: false, primary: false },
  { id: 'op-conseil',   code: 'V', label: 'Conseiller',          icon: 'support_agent', filled: false, primary: false },
  { id: 'op-autres',    code: 'V', label: 'Autres services',     icon: 'apps',          filled: false, primary: false },
];

/* ─── Textes bilingues ────────────────────────────────────────────────────── */
const TEXTS = {
  fr: {
    welcomeTitle:   'Bienvenue chez COFINA',
    welcomeSub:     'Veuillez sélectionner votre opération',
    helpBtn:        "Besoin d'aide ?",
    ticketLabel:    'VOTRE NUMÉRO DE PASSAGE',
    waitNotice:     "Veuillez vous asseoir en salle d'attente. Votre numéro sera annoncé à l'écran TV.",
    resetText:      "Retour à l'accueil dans",
    finishBtn:      "TERMINER / RETOUR À L'ACCUEIL",
    helpTitle:      'Assistance Guichet Cofina',
    helpBody:       "Un agent d'accueil COFINA est disponible dans le hall pour vous guider et vous aider dans votre démarche.",
    closeBtn:       'Fermer',
    audioNotice:    "Ticket créé, veuillez prendre place en salle d'attente",
    processingText: 'Génération de votre ticket…',
    qrHeader:       'TICKET NUMÉRIQUE (QR CODE)',
    qrSub:          'Scannez le QR Code ci-dessous avec votre téléphone',
    scanBtn:        'Scanner le QR Code (Mobile)',
    printBtn:       'Imprimer le ticket papier',
    printingText:   'Impression thermique 80mm en cours…',
    printedText:    '✓ Ticket Papier Imprimé !',
  },
  en: {
    welcomeTitle:   'Welcome to COFINA',
    welcomeSub:     'Please select your transaction',
    helpBtn:        'Need help?',
    ticketLabel:    'YOUR TICKET NUMBER',
    waitNotice:     'Please take a seat. Your number will be displayed on the TV screen.',
    resetText:      'Returning home in',
    finishBtn:      'FINISH / RETURN TO HOME',
    helpTitle:      'Cofina Help Center',
    helpBody:       'A COFINA welcoming agent is available in the lobby to assist and guide you.',
    closeBtn:       'Close',
    audioNotice:    'Ticket issued, please have a seat in the waiting area',
    processingText: 'Generating your ticket…',
    qrHeader:       'DIGITAL TICKET (QR CODE)',
    qrSub:          'Scan the QR Code below with your phone camera',
    scanBtn:        'Scan QR Code (Mobile)',
    printBtn:       'Print paper ticket',
    printingText:   '80mm thermal printing in progress…',
    printedText:    '✓ Paper Ticket Printed!',
  },
};

/* ─── Material Symbol helper ──────────────────────────────────────────────── */
const MatIcon = ({ name, filled = false, size = 48 }) => (
  <span
    className="material-symbols-outlined"
    style={{
      fontSize: size,
      fontVariationSettings: filled
        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"
        : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {name}
  </span>
);

/* ─── QR Code SVG ─────────────────────────────────────────────────── */
function QRCodeSVG({ value = '', size = 150 }) {
  const cells = 21;
  const cs = size / cells;
  const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const finderBlocks = (rOff, cOff) => {
    const pts = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const onCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (onEdge || onCenter) pts.push([r + rOff, c + cOff]);
      }
    }
    return pts;
  };
  const fixed = new Set([
    ...finderBlocks(0, 0),
    ...finderBlocks(0, 14),
    ...finderBlocks(14, 0),
  ].map(([r, c]) => `${r},${c}`));

  const modules = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const key = `${r},${c}`;
      const on = fixed.has(key)
        ? true
        : ((seed * (r + 1) * 31 + (c + 1) * 17) % 100) > 45;
      if (on) modules.push([r, c]);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {modules.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c * cs} y={r * cs} width={cs} height={cs} fill="#1a1c1d" />
      ))}
    </svg>
  );
}

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const buildCSS = () => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  .bn-root {
    min-height:100vh; display:flex; flex-direction:column;
    background:${MD.background}; color:${MD.onBackground};
    font-family:'Inter',sans-serif; overflow:hidden;
    touch-action:manipulation; user-select:none;
  }
  .bn-header {
    position:fixed; top:0; left:0; right:0; height:96px;
    background:${MD.surface}; border-bottom:1px solid ${MD.outlineVariant};
    display:flex; align-items:center; justify-content:space-between;
    padding:0 40px; z-index:50;
  }
  .bn-header-logo { height:48px; object-fit:contain; }
  .bn-agency-badge {
    background: #FFF5F5; border: 1px solid #FECACA; color: #D3122A;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700;
    padding: 8px 18px; border-radius: 9999px; display: flex; align-items: center; gap: 6px;
  }
  .bn-main {
    flex:1; padding:128px 64px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    width:100%; max-width:1920px; margin:0 auto;
  }
  .bn-welcome { text-align:center; margin-bottom:64px; width:100%; max-width:900px; }
  .bn-welcome h1 {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:48px; font-weight:700;
    letter-spacing:-0.02em; line-height:1.2; color:${MD.onBackground}; margin-bottom:8px;
  }
  .bn-welcome p {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:24px;
    font-weight:600; line-height:1.4; color:${MD.onSurfaceVariant};
  }
  .bn-grid {
    display:grid; grid-template-columns:repeat(2,1fr);
    gap:24px; width:100%; max-width:1152px;
  }
  @media(min-width:800px){ .bn-grid{grid-template-columns:repeat(4,1fr);} }
  .bn-card {
    position:relative; background:${MD.surfaceLowest};
    border:1px solid ${MD.outlineVariant}; border-radius:12px;
    padding:40px; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:24px; height:256px;
    box-shadow:0 1px 2px rgba(0,0,0,.06); cursor:pointer; overflow:hidden;
    transition:box-shadow .2s ease; outline:none; width:100%;
  }
  .bn-card:hover  { box-shadow:0 4px 12px rgba(0,0,0,.10); }
  .bn-card:active { transform:scale(.98); transition:transform .1s ease-in-out; }
  .bn-card:disabled { opacity:.6; cursor:not-allowed; }
  .bn-card-overlay {
    position:absolute; inset:0; background:${MD.primaryContainer};
    opacity:0; transition:opacity .3s; pointer-events:none;
  }
  .bn-card:hover .bn-card-overlay { opacity:.05; }
  .bn-icon-primary {
    width:80px; height:80px; border-radius:50%;
    background:${MD.primaryContainer}; color:${MD.onPrimaryContainer};
    display:flex; align-items:center; justify-content:center;
    position:relative; z-index:1; flex-shrink:0;
  }
  .bn-icon-neutral {
    width:80px; height:80px; border-radius:50%;
    background:${MD.surfaceContainerHighest}; color:${MD.onSurface};
    display:flex; align-items:center; justify-content:center;
    position:relative; z-index:1; flex-shrink:0;
  }
  .bn-card-label {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:24px; font-weight:600;
    line-height:1.4; color:${MD.onSurface}; text-align:center; position:relative; z-index:1;
  }
  .bn-footer {
    position:fixed; bottom:0; left:0; right:0; height:96px;
    background:rgba(249,249,251,.8); backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px); border-top:1px solid ${MD.outlineVariant};
    display:flex; align-items:center; justify-content:space-between;
    padding:0 64px; z-index:50;
  }
  .bn-help-btn {
    display:flex; align-items:center; gap:8px; padding:0 24px; height:56px;
    background:${MD.secondaryContainer}; color:${MD.onSecondaryContainer};
    border:none; border-radius:9999px; font-family:'Inter',sans-serif;
    font-size:14px; font-weight:600; letter-spacing:.01em; cursor:pointer; transition:background .2s;
  }
  .bn-help-btn:hover { background:${MD.surfaceContainerHigh}; }
  .bn-lang-toggle {
    display:flex; background:${MD.surfaceContainerHighest}; border-radius:9999px;
    padding:4px; height:56px; align-items:center;
  }
  .bn-lang-btn {
    padding:0 40px; height:100%; border-radius:9999px; border:none;
    font-family:'Inter',sans-serif; font-size:14px; font-weight:600;
    letter-spacing:.01em; cursor:pointer; transition:all .2s; display:flex; align-items:center;
  }
  .bn-lang-btn.active  { background:${MD.surface}; color:${MD.onSurface}; box-shadow:0 1px 3px rgba(0,0,0,.12); }
  .bn-lang-btn.inactive{ background:transparent; color:${MD.onSurfaceVariant}; }
  .bn-lang-btn.inactive:hover { color:${MD.onSurface}; }

  /* Overlay générique */
  .bn-overlay {
    position:fixed; inset:0; background:rgba(26,28,29,.65);
    backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center;
    padding:24px; z-index:100; animation:fadeIn .25s ease forwards;
  }

  /* Ticket Card (Ultra-Clean & Compact) */
  .bn-ticket-card {
    background:${MD.surfaceLowest}; border-radius:24px; padding:20px 24px;
    max-width:440px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,.22);
    display:flex; flex-direction:column; align-items:center; gap:10px;
    animation:scaleUp .3s cubic-bezier(.175,.885,.32,1.275) forwards;
  }
  .bn-ticket-header { text-align:center; }
  .bn-receipt-logo { height:40px; object-fit:contain; margin-bottom:2px; }
  .bn-agency-name { font-weight:700; color:${MD.onSurface}; font-size:14px; margin:2px 0 0 0; }
  .bn-ticket-date { font-size:12px; color:${MD.onSurfaceVariant}; margin:0; }

  .bn-ticket-number-box {
    background: #fdf3f3; border: 1.5px dashed ${MD.outlineVariant};
    border-radius: 20px; padding: 12px 20px; width: 100%; text-align: center;
  }
  .bn-receipt-label {
    font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    color:${MD.onSurfaceVariant}; display:block;
  }
  .bn-receipt-number {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:72px; font-weight:700;
    line-height:1; color:${MD.primary}; margin:4px 0;
  }
  .bn-receipt-service {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:18px; font-weight:600;
    color:${MD.onSurface}; margin:0;
  }

  .bn-qr-section {
    background: #f4f6fa; border: 1px solid #dbe2ef;
    border-radius: 20px; padding: 16px 20px; width: 100%;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .bn-qr-title { font-weight: 700; font-size: 12px; letter-spacing: 0.05em; color: #1e3a8a; text-transform: uppercase; }
  .bn-qr-sub { font-size: 12px; color: #475569; text-align: center; margin: -4px 0 2px 0; }
  .bn-qr-box {
    background: #ffffff; border: 1px solid #cbd5e1;
    border-radius: 16px; padding: 12px; display: flex; flex-direction: column;
    align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }
  .bn-qr-url { font-family:monospace; font-size:11px; color:${MD.onSurfaceVariant}; margin:0; }

  .bn-scan-action-btn {
    background: #1e40af; color: #ffffff; border: none; border-radius: 14px;
    padding: 12px 20px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 700; cursor: pointer; display: flex;
    align-items: center; justify-content: center; gap: 8px; width: 100%;
    transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(30,64,175,0.2);
  }
  .bn-scan-action-btn:hover { background: #1d4ed8; }
  .bn-scan-action-btn:active { transform: scale(0.98); }
  .bn-scan-action-btn.active { background: #059669; box-shadow: 0 4px 10px rgba(5,150,105,0.2); }

  .bn-success-notice {
    background:#ecfdf5; color:#065f46; border-radius:12px; padding:12px 16px;
    font-size:13px; font-weight:500; display:flex; align-items:center; gap:10px;
    text-align:left; width:100%; margin:0;
  }

  .bn-print-section { width: 100%; }
  .bn-print-action-btn {
    background: ${MD.primaryContainer}; color: #ffffff; border: none; border-radius: 16px;
    padding: 16px 24px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px; font-weight: 700; cursor: pointer; display: flex;
    align-items: center; justify-content: center; gap: 10px; width: 100%;
    transition: all 0.2s ease; box-shadow: 0 6px 16px rgba(214,0,50,0.25);
  }
  .bn-print-action-btn:hover { background: #b8002b; }
  .bn-print-action-btn:active { transform: scale(0.98); }
  .bn-print-action-btn.printed { background: #15803d; box-shadow: 0 4px 12px rgba(21,128,61,0.25); }

  .bn-countdown {
    background:#fffbeb; border:1px solid #fcd34d; color:#78350f;
    border-radius:9999px; padding:8px 20px; font-size:13px; font-weight:600;
    display:flex; align-items:center; gap:8px; margin:0;
    flex-wrap:wrap; justify-content:center;
  }
  .bn-finish-btn {
    background:${MD.onSurface}; color:${MD.surface};
    font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:700;
    border:none; border-radius:14px; padding:14px 28px; cursor:pointer;
    transition:opacity .2s; letter-spacing:.02em; width:100%;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .bn-finish-btn:hover  { opacity:.85; }
  .bn-finish-btn:active { transform:scale(.98); }

  .bn-help-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; padding:24px;
    z-index:200; animation:fadeIn .2s ease forwards;
  }
  .bn-help-modal {
    background:${MD.surfaceLowest}; border-radius:24px; padding:32px;
    max-width:440px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,.25); position:relative;
  }
  .bn-help-close {
    position:absolute; top:16px; right:16px; background:none; border:none;
    cursor:pointer; color:${MD.onSurfaceVariant}; padding:8px; border-radius:50%;
  }
  .bn-help-close:hover { background:${MD.surfaceContainer}; }
  .bn-help-primary-btn {
    width:100%; background:${MD.primary}; color:#fff; border:none; border-radius:12px;
    padding:14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:700;
    cursor:pointer; transition:background .2s;
  }
  .bn-help-primary-btn:hover { background:#8a001f; }

  .bn-processing {
    position:fixed; inset:0; background:rgba(26,28,29,.4); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; z-index:90;
  }
  .bn-processing-card {
    background:${MD.surfaceLowest}; border-radius:20px; padding:32px 48px;
    display:flex; align-items:center; gap:16px;
    box-shadow:0 20px 40px rgba(0,0,0,.15);
    font-family:'Plus Jakarta Sans',sans-serif; font-size:20px; font-weight:600; color:${MD.onSurface};
  }
  .bn-spinner {
    width:28px; height:28px; border:3px solid ${MD.outlineVariant};
    border-top-color:${MD.primary}; border-radius:50%;
    animation:spin .7s linear infinite; flex-shrink:0;
  }

  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleUp { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────────────────── */
export default function KioskModule({ agencyName, onTicketGenerated, lang = 'fr' }) {
  const [issuedTicket,   setIssuedTicket]   = useState(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [isPrinting,     setIsPrinting]     = useState(false);
  const [printed,        setIsPrinted]      = useState(false);
  const [scanned,        setIsScanned]      = useState(false);
  const [resetCountdown, setResetCountdown] = useState(15);
  const [showHelp,       setShowHelp]       = useState(false);
  const [clockTime,      setClockTime]      = useState(new Date());

  /* Horloge temps réel (rafraîchissement chaque seconde) */
  useEffect(() => {
    const timer = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const txt = TEXTS[lang] || TEXTS.fr;

  /* Countdown auto-reset */
  useEffect(() => {
    if (!issuedTicket) return;
    setResetCountdown(15);
    const id = setInterval(() => {
      setResetCountdown(prev => {
        if (prev <= 1) { handleReset(); return 15; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [issuedTicket]);

  const handleCardTap = (op) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsPrinting(false);
    setIsPrinted(false);
    setIsScanned(false);

    setTimeout(() => {
      const ticket = createTicket(op.code, null, null, lang);
      setIssuedTicket({ ...ticket, operationLabel: op.label, op });
      setIsSubmitting(false);
      try { confetti({ particleCount: 65, spread: 75, origin: { y: 0.65 } }); } catch {}
      if (onTicketGenerated) onTicketGenerated(ticket);
    }, 300);
  };

  const handlePrintTicket = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setIsPrinted(true);
    }, 700);
  };

  const handleScanQR = () => {
    setIsScanned(true);
  };

  const handleReset = () => {
    setIssuedTicket(null);
    setIsSubmitting(false);
    setIsPrinting(false);
    setIsPrinted(false);
    setIsScanned(false);
    setResetCountdown(15);
  };

  return (
    <div className="bn-root">
      <style>{buildCSS()}</style>

      {/* HEADER KIOSK CLEARED (NO CLOCK FOR CLIENT KIOSK) */}
      <header className="bn-header">
        <img src="/COFINA.png" alt="Cofina Logo" className="bn-header-logo" />
        <div className="bn-agency-badge">
          <span>📍 {agencyName}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="bn-main">
        <div className="bn-welcome">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFF5F5',
            border: '1px solid #FECACA',
            padding: '6px 18px',
            borderRadius: '99px',
            marginBottom: '16px',
            color: '#D3122A',
            fontWeight: '700',
            fontFamily: 'monospace',
            fontSize: '18px'
          }}>
            <span>⏱️ {clockTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <h1>{txt.welcomeTitle}</h1>
          <p>{txt.welcomeSub}</p>
        </div>

        <div className="bn-grid">
          {OPERATIONS.map(op => (
            <button
              key={op.id}
              className="bn-card"
              onClick={() => handleCardTap(op)}
              disabled={isSubmitting}
            >
              <div className="bn-card-overlay" />
              <div className={op.primary ? 'bn-icon-primary' : 'bn-icon-neutral'}>
                <MatIcon name={op.icon} filled={op.filled} size={48} />
              </div>
              <span className="bn-card-label">{op.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bn-footer">
        <button className="bn-help-btn" onClick={() => setShowHelp(true)}>
          <MatIcon name="help_outline" size={20} />
          <span>{txt.helpBtn}</span>
        </button>

        <div className="bn-lang-toggle">
          <button
            className={`bn-lang-btn ${lang === 'fr' ? 'active' : 'inactive'}`}
            onClick={() => setLang('fr')}
          >
            FR
          </button>
          <button
            className={`bn-lang-btn ${lang === 'en' ? 'active' : 'inactive'}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>
      </footer>

      {/* OVERLAY CHARGEMENT */}
      {isSubmitting && (
        <div className="bn-processing">
          <div className="bn-processing-card">
            <div className="bn-spinner" />
            <span>{txt.processingText}</span>
          </div>
        </div>
      )}

      {/* MODAL TICKET GÉNÉRÉ (QR CODE EN MOYEN PRINCIPAL DÈS LA SÉLECTION) */}
      {issuedTicket && (
        <div className="bn-overlay" onClick={handleReset}>
          <div className="bn-ticket-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '18px 22px', gap: '10px' }}>
            <div className="bn-ticket-header">
              <img src="/COFINA.png" alt="Cofina" className="bn-receipt-logo" style={{ height: '30px' }} />
              <p className="bn-agency-name" style={{ fontSize: '12px', margin: '2px 0 0 0' }}>{agencyName}</p>
            </div>

            <div className="bn-ticket-number-box" style={{ padding: '8px 14px', borderRadius: '12px' }}>
              <span className="bn-receipt-label" style={{ fontSize: '10px' }}>{txt.ticketLabel}</span>
              <h1 className="bn-receipt-number" style={{ fontSize: '50px', margin: '2px 0' }}>{issuedTicket.ticketNumber}</h1>
              <p className="bn-receipt-service" style={{ fontSize: '14px' }}>{issuedTicket.serviceName}</p>
            </div>

            {/* MOYEN PRINCIPAL : BLOC QR CODE VISIBLE IMMÉDIATEMENT */}
            <div className="bn-qr-box" style={{ 
              width: '100%', 
              background: '#f8fafc', 
              border: '2px solid #3b82f6', 
              borderRadius: '14px', 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.12)'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                📱 MOYEN PRINCIPAL — SCANNER SUR MOBILE
              </span>
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <QRCodeSVG value={`https://cofina.tg/q/${issuedTicket.ticketNumber}`} size={110} />
              </div>
              <span style={{ fontSize: '11px', color: '#475569', textAlign: 'center', fontWeight: '600' }}>
                Scannez avec la caméra de votre téléphone pour suivre votre rang en direct
              </span>
            </div>

            {/* MOYEN SECONDAIRE : IMPRESSION PAPIER (OPTIONNEL) */}
            <div style={{ width: '100%' }}>
              <button
                type="button"
                className={`bn-print-action-btn ${printed ? 'printed' : ''}`}
                onClick={handlePrintTicket}
                disabled={isPrinting}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  fontSize: '12px', 
                  borderRadius: '10px',
                  background: printed ? '#15803d' : '#f1f5f9',
                  color: printed ? '#ffffff' : '#475569',
                  border: printed ? 'none' : '1px solid #cbd5e1',
                  boxShadow: 'none',
                  fontWeight: '600'
                }}
              >
                <MatIcon name={printed ? "check_circle" : "print"} size={16} />
                <span>
                  {isPrinting ? 'Impression papier…' : printed ? '✓ Ticket Papier Imprimé !' : '🖨️ Imprimer un ticket papier (Optionnel)'}
                </span>
              </button>
            </div>

            {/* Bouton de Fin avec Décompte Intégré */}
            <button className="bn-finish-btn" onClick={handleReset} style={{ padding: '10px 18px', fontSize: '13px', borderRadius: '10px', marginTop: '2px' }}>
              <span>TERMINER ({resetCountdown}s)</span>
              <MatIcon name="arrow_forward" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="bn-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="bn-help-modal" onClick={e => e.stopPropagation()}>
            <button className="bn-help-close" onClick={() => setShowHelp(false)}>
              <MatIcon name="close" size={24} />
            </button>
            <h2>{txt.helpTitle}</h2>
            <p style={{ margin: '16px 0 24px 0', color: MD.onSurfaceVariant, lineHeight: 1.5 }}>
              {txt.helpBody}
            </p>
            <button className="bn-help-primary-btn" onClick={() => setShowHelp(false)}>
              {txt.closeBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

