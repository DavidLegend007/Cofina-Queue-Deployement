import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Banknote, 
  Wallet,
  Send,
  Globe,
  UserPlus, 
  FileCheck,
  ArrowRightLeft,
  FileText,
  Smartphone,
  CreditCard, 
  Headphones, 
  Accessibility,
  HelpCircle,
  X,
  Printer,
  CheckCircle2,
  ArrowRight,
  Clock,
  Eye
} from 'lucide-react';
import { createTicket, COFINA_SERVICES } from '../services/queueStore';

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

/* ─── 12 operations COFINA issues de COFINA_SERVICES ───────────────────────── */
const OPERATIONS = COFINA_SERVICES.map(s => ({
  id: `op-${s.code.toLowerCase()}`,
  code: s.code,
  label: s.name,
  iconName: s.icon
}));

const SERVICE_THEMES = {
  D:   { color: '#D3122A', gradient: 'linear-gradient(135deg, #D3122A 0%, #920020 100%)', bg: '#FFF5F5', border: '#FECACA', iconBg: 'rgba(211,18,42,0.12)' },
  R:   { color: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)', bg: '#FFF7ED', border: '#FFEDD5', iconBg: 'rgba(249,115,22,0.12)' },
  TN:  { color: '#2563EB', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', bg: '#EFF6FF', border: '#BFDBFE', iconBg: 'rgba(37,99,235,0.12)' },
  TI:  { color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)', bg: '#ECFEFF', border: '#A5F3FC', iconBg: 'rgba(6,182,212,0.12)' },
  O:   { color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', bg: '#ECFDF5', border: '#A7F3D0', iconBg: 'rgba(16,185,129,0.12)' },
  RC:  { color: '#D97706', gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', bg: '#FFFBEB', border: '#FDE68A', iconBg: 'rgba(217,119,6,0.12)' },
  V:   { color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', bg: '#F5F3FF', border: '#DDD6FE', iconBg: 'rgba(139,92,246,0.12)' },
  DR:  { color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', bg: '#FDF2F8', border: '#FBCFE8', iconBg: 'rgba(236,72,153,0.12)' },
  CM:  { color: '#D3122A', gradient: 'linear-gradient(135deg, #D3122A 0%, #920020 100%)', bg: '#FFF5F5', border: '#FECACA', iconBg: 'rgba(211,18,42,0.12)' },
  C:   { color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', bg: '#FFFBEB', border: '#FDE68A', iconBg: 'rgba(245,158,11,0.12)' },
  PC:  { color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', bg: '#EFF6FF', border: '#BFDBFE', iconBg: 'rgba(59,130,246,0.12)' },
  PMR: { color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', bg: '#ECFDF5', border: '#A7F3D0', iconBg: 'rgba(16,185,129,0.12)' },
};

/* ─── Textes bilingues ────────────────────────────────────────────────────── */
const TEXTS = {
  fr: {
    welcomeTitle:   'BIENVENUE A COFINA TOGO',
    welcomeSub:     'Institution Panafricaine de la Finance Inclusive\nVeuillez sélectionner votre opération',
    helpBtn:        "Besoin d'aide ?",
    ticketLabel:    'VOTRE NUMÉRO DE PASSAGE',
    waitNotice:     "Veuillez vous asseoir en salle d'attente. Votre numéro sera annoncé à l'écran TV.",
    resetText:      "Retour à l'accueil dans",
    finishBtn:      "TERMINER / RETOUR À L'ACCUEIL",
    helpTitle:      'Assistance & Orientation Client',
    helpBody:       "Veuillez vous adresser directement à l'un de nos agents d'accueil présents dans le hall pour vous guider et vous assister dans vos démarches. Vous pouvez également contacter notre Assistance au 92686060.",
    closeBtn:       'Fermer',
    audioNotice:    "Ticket créé, veuillez prendre place en salle d'attente",
    processingText: 'Génération de votre ticket…',
    qrHeader:       'TICKET NUMÉRIQUE (QR CODE)',
    qrSub:          'Ouvrez l\'appareil photo de votre téléphone ou une application lecteur QR et visez ce code pour suivre votre rang',
    scanBtn:        'Scanner le QR Code (Mobile)',
    printBtn:       'Imprimer le ticket papier',
    printingText:   'Impression thermique 80mm en cours…',
    printedText:    '✓ Ticket Papier Imprimé !',
  },
  en: {
    welcomeTitle:   'WELCOME TO COFINA Togo',
    welcomeSub:     'Pan-African Institution of Inclusive Finance.\nPlease select your operation',
    helpBtn:        'Need help?',
    ticketLabel:    'YOUR TICKET NUMBER',
    waitNotice:     'Please take a seat. Your number will be displayed on the TV screen.',
    resetText:      'Returning home in',
    finishBtn:      'FINISH / RETURN TO HOME',
    helpTitle:      'Customer Support & Guidance',
    helpBody:       'Please speak directly with one of our welcoming agents available in the lobby to guide and assist you with your request. You can also contact our Support line at 92686060.',
    closeBtn:       'Close',
    audioNotice:    'Ticket issued, please have a seat in the waiting area',
    processingText: 'Generating your ticket…',
    qrHeader:       'DIGITAL TICKET (QR CODE)',
    qrSub:          'Open your phone\'s camera or a QR scanner app and point it at this code to track your turn',
    scanBtn:        'Scan QR Code (Mobile)',
    printBtn:       'Print paper ticket',
    printingText:   '80mm thermal printing in progress…',
    printedText:    '✓ Paper Ticket Printed!',
  },
};

/* ─── Lucide Icon helper ─────────────────────────────────────────────────── */
const ICON_COMPONENTS = {
  Banknote,
  Wallet,
  Send,
  Globe,
  UserPlus,
  FileCheck,
  ArrowRightLeft,
  FileText,
  Smartphone,
  CreditCard,
  Headphones,
  Accessibility
};

function ServiceLucideIcon({ name, size = 44, color }) {
  const IconComp = ICON_COMPONENTS[name] || Banknote;
  return <IconComp size={size} color={color} />;
}

/* ─── Real QR Code ─────────────────────────────────────────────────── */
function RealQRCode({ value = '', size = 150 }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#1e40af', light: '#ffffff' } })
      .then(setSrc)
      .catch(console.error);
  }, [value, size]);
  return src ? <img src={src} alt="QR Code" width={size} height={size} style={{ borderRadius: '8px' }} /> : <div style={{ width: size, height: size }} />;
}

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const buildCSS = () => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');

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

  /* ── Premium Ticket Card — Boarding Pass Style ───────────────────────── */
  .bn-ticket-card {
    background:#ffffff; border-radius:24px; overflow:hidden;
    max-width:780px; width:100%;
    box-shadow:0 28px 72px rgba(0,0,0,.32), 0 0 0 1px rgba(255,255,255,.08);
    display:flex; flex-direction:row;
    animation:scaleUp .35s cubic-bezier(.175,.885,.32,1.275) forwards;
  }

  /* Gradient banner header */
  .bn-ticket-banner {
    padding:18px 22px 16px;
    display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
  }
  .bn-ticket-banner-logo { height:26px; object-fit:contain; filter:brightness(0) invert(1); }
  .bn-ticket-banner-agency {
    font-size:11px; font-weight:700; color:rgba(255,255,255,0.85);
    letter-spacing:0.04em; margin-top:5px;
  }
  .bn-ticket-service-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.18); backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,.32);
    border-radius:999px; padding:5px 14px;
    font-size:11px; font-weight:800; color:#fff;
    letter-spacing:0.08em; text-transform:uppercase; white-space:nowrap;
  }
  .bn-ticket-vip-badge {
    font-size:10px; color:rgba(255,255,255,.9); font-weight:800;
    letter-spacing:0.12em; text-align:right; margin-top:4px;
  }

  /* Perforated separator */
  .bn-perforated {
    display:flex; align-items:center; position:relative;
    margin:0 -1px;
  }
  .bn-perf-circle {
    width:22px; height:22px; border-radius:50%; flex-shrink:0;
    background:rgba(26,28,29,.65);
  }
  .bn-perforated-line {
    flex:1; border-top:2px dashed #e2e8f0;
  }
  
  .bn-perforated-vertical {
    display:flex; flex-direction:column; align-items:center; position:relative;
    width: 0px; z-index: 2;
  }
  .bn-perf-circle-v {
    width:22px; height:22px; border-radius:50%; flex-shrink:0;
    background:rgba(26,28,29,.65);
    position:absolute; left:-11px;
  }
  .bn-perf-circle-v:first-child { top:-11px; }
  .bn-perf-circle-v:last-child { bottom:-11px; }
  .bn-perforated-line-v {
    flex:1; border-left:2px dashed #cbd5e1;
  }

  /* Body */
  .bn-ticket-body {
    padding:14px 22px 10px;
    display:flex; flex-direction:column; align-items:center; gap:12px;
  }

  /* Number block */
  .bn-ticket-number-box {
    text-align:center; padding:10px 16px 12px; width:100%;
    background:linear-gradient(135deg,#fafafa 0%,#f1f5f9 100%);
    border-radius:14px; border:1.5px solid #e2e8f0;
  }
  .bn-receipt-label {
    font-size:9px; font-weight:800; letter-spacing:2.5px;
    text-transform:uppercase; color:#94a3b8; display:block; margin-bottom:2px;
  }
  .bn-receipt-number {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:60px; font-weight:800;
    line-height:1; margin:2px 0;
  }
  .bn-receipt-service {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:600;
    color:#64748b; margin:3px 0 0;
  }
  .bn-ticket-date { font-size:10px; color:#94a3b8; margin:4px 0 0; }

  /* QR section */
  .bn-qr-section {
    width:100%; border-radius:14px; padding:12px 16px 14px;
    display:flex; flex-direction:column; align-items:center; gap:9px;
    background:#f8faff; border:1.5px solid #dbeafe;
  }
  .bn-qr-title {
    font-weight:800; font-size:10px; letter-spacing:0.12em;
    color:#1e40af; text-transform:uppercase;
    display:flex; align-items:center; gap:6px;
  }
  .bn-qr-box {
    background:#fff; border:1px solid #e2e8f0; border-radius:10px;
    padding:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05);
  }
  .bn-qr-pulse {
    display:flex; align-items:center; gap:6px;
    font-size:10px; font-weight:800; color:#059669; letter-spacing:0.04em;
  }
  .bn-pulse-dot {
    width:7px; height:7px; background:#10b981; border-radius:50%;
    animation:pulseDot 1.6s ease-in-out infinite;
  }
  .bn-wait-info {
    font-size:11px; color:#64748b; text-align:center;
    font-weight:500; line-height:1.4;
  }

  /* Footer */
  .bn-ticket-footer {
    padding:8px 22px 18px;
    display:flex; flex-direction:column; gap:8px;
  }
  .bn-print-action-btn {
    background:#f8fafc; color:#475569;
    border:1.5px solid #e2e8f0; border-radius:11px;
    padding:9px 16px; font-family:'Plus Jakarta Sans',sans-serif;
    font-size:12px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    width:100%; transition:all 0.2s ease;
  }
  .bn-print-action-btn:hover { background:#f1f5f9; border-color:#cbd5e1; }
  .bn-print-action-btn.printed { background:#ecfdf5; color:#065f46; border-color:#6ee7b7; }
  .bn-finish-btn {
    background:#1a1c1d; color:#ffffff;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:700;
    border:none; border-radius:11px; padding:12px 20px; cursor:pointer;
    transition:opacity .2s; width:100%;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .bn-finish-btn:hover  { opacity:.82; }
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

  @keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleUp  { from{opacity:0;transform:scale(.90)} to{opacity:1;transform:scale(1)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

  /* ── BOUTON ACCESSIBILITÉ & CONTRASTE ÉLEVÉ ── */
  .bn-a11y-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #F1F5F9; border: 1.5px solid #CBD5E1; color: #334155;
    padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px;
    cursor: pointer; transition: all 0.2s ease;
  }
  .bn-a11y-btn:hover { background: #E2E8F0; }
  .bn-a11y-btn.active {
    background: #000000; border-color: #FACC15; color: #FACC15;
    box-shadow: 0 0 10px rgba(250, 204, 21, 0.4);
  }

  /* ── MODE CONTRASTE ÉLEVÉ (WCAG AAA) ── */
  .cofina-high-contrast {
    background: #000000 !important;
    color: #FFFFFF !important;
  }
  .cofina-high-contrast .bn-header,
  .cofina-high-contrast .bn-footer {
    background: #0A0A0A !important;
    border-color: #FACC15 !important;
  }
  .cofina-high-contrast .bn-welcome h1 {
    color: #FACC15 !important;
  }
  .cofina-high-contrast .bn-welcome p {
    color: #FFFFFF !important;
  }
  .cofina-high-contrast .bn-card {
    background: #111111 !important;
    border: 3px solid #FACC15 !important;
    box-shadow: 0 4px 15px rgba(250, 204, 21, 0.25) !important;
  }
  .cofina-high-contrast .bn-card-label {
    color: #FFFFFF !important;
    font-size: 26px !important;
    font-weight: 800 !important;
  }
  .cofina-high-contrast .bn-card:focus-visible {
    outline: 4px solid #FACC15 !important;
    outline-offset: 4px !important;
  }
  .cofina-high-contrast .bn-help-btn,
  .cofina-high-contrast .bn-lang-btn {
    border-color: #FACC15 !important;
    color: #FFFFFF !important;
    background: #111111 !important;
  }
  .cofina-high-contrast .bn-lang-btn.active {
    background: #FACC15 !important;
    color: #000000 !important;
    font-weight: 900 !important;
  }

  /* --- PRINT STYLES FOR THERMAL PRINTER (6cm x 4cm) --- */
  @page {
    size: 60mm 40mm;
    margin: 0;
  }
  @media print {
    /* Hide all main kiosk UI elements */
    .bn-header, .bn-main, .bn-footer, .bn-processing {
      display: none !important;
    }
    
    /* Hide global App UI elements from App.jsx */
    .nav-container, .cofina-global-footer, .cofina-floating-widget {
      display: none !important;
    }
    
    body, html, #root, .cofina-app-root, .main-content-area, .bn-root {
      background: #fff !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
    }
    
    .bn-overlay {
      background: transparent !important;
      backdrop-filter: none !important;
      position: relative !important;
      width: 60mm !important;
      height: 40mm !important;
      display: block !important;
      page-break-inside: avoid;
    }
    .bn-ticket-card, .bn-ticket-card * {
      visibility: visible;
    }
    .bn-ticket-card {
      position: absolute;
      left: 0;
      top: 0;
      width: 60mm !important;
      height: 40mm !important;
      margin: 0;
      padding: 2mm !important;
      box-shadow: none !important;
      transform: none !important;
      border: none !important;
      border-radius: 0 !important;
      display: block !important;
      overflow: hidden;
      background: #fff !important;
      color: #000 !important;
      box-sizing: border-box !important;
    }
    
    /* Hide the perforated line, right QR section, and footer buttons */
    .bn-perforated-vertical,
    .bn-ticket-card > div:nth-child(3),
    .bn-ticket-footer {
      display: none !important;
    }

    /* Adjust the left section (ticket info) to occupy the whole print area */
    .bn-ticket-card > div:nth-child(1) {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      height: 100% !important;
      padding: 0 !important;
      justify-content: center !important;
    }

    /* Compress the banner */
    .bn-ticket-banner {
      padding: 0 !important;
      margin-bottom: 2px !important;
      min-height: auto !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;
      background: transparent !important;
      color: #000 !important;
      border-bottom: 1px dashed #000 !important;
    }
    .bn-ticket-banner-logo {
      height: 10px !important;
    }
    .bn-ticket-banner-agency {
      font-size: 7px !important;
      color: #000 !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bn-ticket-service-badge {
      font-size: 7px !important;
      padding: 1px 3px !important;
      background: transparent !important;
      color: #000 !important;
      border: 1px solid #000 !important;
    }
    .bn-ticket-vip-badge {
      display: none !important;
    }

    /* Ticket body */
    .bn-ticket-body {
      padding: 0 !important;
      gap: 1px !important;
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }
    .bn-ticket-number-box {
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
    }
    .bn-ticket-number-box > div:first-child {
      display: none !important; /* Hide the big circular icon */
    }
    .bn-receipt-label {
      font-size: 8px !important;
      color: #000 !important;
      margin: 0 !important;
    }
    .bn-receipt-number {
      font-size: 26px !important;
      font-weight: bold !important;
      color: #000 !important;
      line-height: 1 !important;
      margin: 0 !important;
    }
    .bn-receipt-service {
      font-size: 9px !important;
      color: #000 !important;
      margin: 1px 0 0 0 !important;
    }
    .bn-ticket-date {
      font-size: 7px !important;
      color: #000 !important;
      margin: 1px 0 0 0 !important;
    }

    /* Wait info */
    .bn-wait-info {
      font-size: 8px !important;
      color: #000 !important;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin-top: 2px !important;
      text-align: center !important;
    }
  }
`;

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────────────────── */
export default function KioskModule({ agencyName, onTicketGenerated, lang = 'fr' }) {
  const [currentLang,    setCurrentLang]    = useState(lang);
  const [issuedTicket,   setIssuedTicket]   = useState(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [isPrinting,     setIsPrinting]     = useState(false);
  const [printed,        setIsPrinted]      = useState(false);
  const [scanned,        setIsScanned]      = useState(false);
  const [resetCountdown, setResetCountdown] = useState(30);
  const [showHelp,       setShowHelp]       = useState(false);
  const [clockTime,      setClockTime]      = useState(new Date());
  const [waitingCount,   setWaitingCount]   = useState(0);

  // URL du serveur pour le QR Code mobile (détection auto IP LAN)
  const [lanBaseUrl, setLanBaseUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const { hostname, origin } = window.location;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return origin;
      }
    }
    return 'http://192.168.1.100:3000';
  });

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.lanUrl) {
          if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            setLanBaseUrl(data.lanUrl);
          }
        }
      })
      .catch(() => {});
  }, []);

  // État du mode Accessibilité / Contraste Élevé (persistance locale)
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem('cofina_kiosk_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      try {
        localStorage.setItem('cofina_kiosk_high_contrast', String(next));
      } catch (_) {}
      return next;
    });
  };

  /* Horloge temps réel (rafraîchissement chaque seconde) */
  useEffect(() => {
    const timer = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const txt = TEXTS[currentLang] || TEXTS.fr;

  /* Countdown auto-reset */
  useEffect(() => {
    if (!issuedTicket) return;
    setResetCountdown(30);
    const id = setInterval(() => {
      setResetCountdown(prev => {
        if (prev <= 1) { handleReset(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [issuedTicket]);

  const handleCardTap = async (op) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsPrinting(false);
    setIsPrinted(false);
    setIsScanned(false);

    // Capture waiting count before creating ticket to show queue position
    let waitingBefore = 0;
    try {
      const raw = localStorage.getItem('cofina_queue_v1_store_togo');
      const stored = raw ? JSON.parse(raw) : null;
      if (stored && Array.isArray(stored.tickets)) {
        waitingBefore = stored.tickets.filter(t => t.status === 'WAITING').length;
      }
    } catch {}
    setWaitingCount(waitingBefore);

    try {
      const ticket = await createTicket(op.code, null, null, currentLang);
      setIssuedTicket({ ...ticket, operationLabel: op.label, op });
      setIsSubmitting(false);
      if (onTicketGenerated) onTicketGenerated(ticket);
    } catch (error) {
      console.error('Failed to create ticket', error);
      setIsSubmitting(false);
    }
  };

  const handlePrintTicket = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      setIsPrinted(true);
    }, 100);
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
    setResetCountdown(30);
  };

  return (
    <div className={`bn-root ${highContrast ? 'cofina-high-contrast' : ''}`}>
      <style>{buildCSS()}</style>

      {/* HEADER KIOSK */}
      <header className="bn-header" role="banner">
        <img src="/cofina.jpeg" alt="Cofina Logo" className="bn-header-logo" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            type="button"
            className={`bn-a11y-btn ${highContrast ? 'active' : ''}`}
            onClick={toggleHighContrast}
            aria-label="Basculer le mode Contraste Élevé pour malvoyants (Accessibilité WCAG)"
            aria-pressed={highContrast}
            title="Mode Accessibilité & Contraste Élevé"
          >
            <Eye size={18} />
            <span>{highContrast ? 'Mode Standard' : 'Contraste Élevé (A11y)'}</span>
          </button>
          <div className="bn-agency-badge">
            <span>📍 {agencyName}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="bn-main" role="main">
        <div className="bn-welcome">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: highContrast ? '#111111' : '#FFF5F5',
            border: highContrast ? '2px solid #FACC15' : '1.5px solid #FECACA',
            padding: '6px 18px',
            borderRadius: '99px',
            marginBottom: '16px',
            color: highContrast ? '#FACC15' : '#D3122A',
            fontWeight: '800',
            fontFamily: 'monospace',
            fontSize: '17px',
            boxShadow: '0 2px 10px rgba(211, 18, 42, 0.08)'
          }}>
            <Clock size={18} />
            <span>{clockTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <h1>{txt.welcomeTitle}</h1>
          <p>{txt.welcomeSub}</p>
        </div>

        <div className="bn-grid">
          {OPERATIONS.map(op => {
            const theme = SERVICE_THEMES[op.code] || SERVICE_THEMES.D;
            return (
              <button
                key={op.id}
                className="bn-card"
                onClick={() => handleCardTap(op)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardTap(op);
                  }
                }}
                disabled={isSubmitting}
                role="button"
                tabIndex={0}
                aria-label={`Prendre un ticket pour : ${op.label} (Service ${op.code})`}
                style={{
                  borderColor: highContrast ? '#FACC15' : theme.border,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="bn-card-overlay" style={{ background: theme.color }} />
                
                {/* Code Chip Badge */}
                <span 
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: theme.color,
                    color: '#FFFFFF',
                    fontWeight: '900',
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '99px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    boxShadow: `0 2px 8px ${theme.color}40`
                  }}
                >
                  {op.code}
                </span>

                {/* Service Icon Container with Service Color */}
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: theme.bg,
                    color: theme.color,
                    border: `2px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: `0 6px 18px ${theme.color}25`
                  }}
                >
                  <ServiceLucideIcon name={op.iconName} size={44} color={theme.color} />
                </div>
                <span className="bn-card-label" style={{ color: '#1A1C1D' }}>
                  {op.label}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bn-footer">
        <button className="bn-help-btn" onClick={() => setShowHelp(true)}>
          <HelpCircle size={20} />
          <span>{txt.helpBtn}</span>
        </button>

        <div className="bn-lang-toggle">
          <button
            className={`bn-lang-btn ${currentLang === 'fr' ? 'active' : 'inactive'}`}
            onClick={() => setCurrentLang('fr')}
          >
            FR
          </button>
          <button
            className={`bn-lang-btn ${currentLang === 'en' ? 'active' : 'inactive'}`}
            onClick={() => setCurrentLang('en')}
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

      {/* MODAL TICKET PREMIUM — BOARDING PASS COFINA */}
      {issuedTicket && (() => {
        const theme = SERVICE_THEMES[issuedTicket.serviceCode] || SERVICE_THEMES.D;
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const avgMin = (COFINA_SERVICES.find(s => s.code === issuedTicket.serviceCode) || {}).avgTimeMin || 5;
        const estWait = Math.max(2, waitingCount * avgMin);
        return (
          <div className="bn-overlay" onClick={handleReset} role="dialog" aria-modal="true" aria-label="Ticket de passage généré">
            <div className="bn-ticket-card" onClick={e => e.stopPropagation()} aria-live="polite">

              {/* ── SECTION GAUCHE (INFOS TICKET) ── */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="bn-ticket-banner" style={{ background: theme.gradient }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <img src="/cofina.jpeg" alt="Cofina" className="bn-ticket-banner-logo" />
                    <span className="bn-ticket-banner-agency">📍 {agencyName}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <span className="bn-ticket-service-badge">
                      {theme.emoji} {issuedTicket.serviceName}
                    </span>
                    {theme.vip && (
                      <span className="bn-ticket-vip-badge">★ ACCÈS PRIORITAIRE VIP</span>
                    )}
                  </div>
                </div>

                <div className="bn-ticket-body" style={{ flex: 1, justifyContent: 'center' }}>
                  <div className="bn-ticket-number-box" style={{ borderColor: theme.border }}>
                    {/* Icone de Service Couleur sur le Ticket */}
                    <div 
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: theme.bg,
                        color: theme.color,
                        border: `2px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px auto',
                        boxShadow: `0 4px 14px ${theme.color}25`
                      }}
                    >
                      <ServiceLucideIcon name={issuedTicket.op?.iconName || 'Banknote'} size={32} color={theme.color} />
                    </div>

                    <span className="bn-receipt-label">{txt.ticketLabel}</span>
                    <div className="bn-receipt-number" style={{ color: theme.color }}>
                      {issuedTicket.ticketNumber}
                    </div>
                    <p className="bn-receipt-service" style={{ color: theme.color, fontWeight: '700' }}>
                      {issuedTicket.operationLabel}
                    </p>
                    <p className="bn-ticket-date">
                      {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} · {timeStr}
                    </p>
                  </div>
                  
                  {waitingCount >= 0 && (
                    <div className="bn-wait-info" style={{ marginTop: '16px' }}>
                      {waitingCount === 0
                        ? '🎉 Vous êtes le prochain ! Approchez-vous d\'un guichet.'
                        : `👥 ~${waitingCount} personne${waitingCount > 1 ? 's' : ''} avant vous · Attente estimée ~${estWait} min`
                      }
                    </div>
                  )}
                </div>

                <div className="bn-ticket-footer" style={{ paddingBottom: '24px' }}>
                  <button
                    type="button"
                    className={`bn-print-action-btn ${printed ? 'printed' : ''}`}
                    onClick={handlePrintTicket}
                    disabled={isPrinting}
                  >
                    {printed ? <CheckCircle2 size={16} /> : <Printer size={16} />}
                    <span>
                      {isPrinting ? 'Impression en cours…' : printed ? '✓ Reçu papier imprimé !' : '🖨️ Imprimer un reçu papier (Optionnel)'}
                    </span>
                  </button>
                  <button className="bn-finish-btn" onClick={handleReset}>
                    <span>TERMINER ({resetCountdown}s)</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* ── LIGNE PERFORÉE VERTICALE ── */}
              <div className="bn-perforated-vertical">
                <div className="bn-perf-circle-v" />
                <div className="bn-perforated-line-v" />
                <div className="bn-perf-circle-v" />
              </div>

              {/* ── SECTION DROITE (QR CODE) ── */}
              <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', padding: '32px 24px', background: '#f8faff', justifyContent: 'center' }}>
                <div className="bn-qr-section" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                  <div className="bn-qr-title" style={{ fontSize: '13px', marginBottom: '12px' }}>
                    <span>📱</span>
                    <span>TICKET NUMÉRIQUE</span>
                  </div>
                  <div className="bn-qr-box" style={{ padding: '16px' }}>
                    <RealQRCode value={`${lanBaseUrl}/?ticket=${issuedTicket.ticketNumber}`} size={160} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', textAlign: 'center', margin: '14px 0 6px 0', lineHeight: '1.4' }}>
                    {txt.qrSub}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: '0 0 14px 0', lineHeight: '1.3' }}>
                    {currentLang === 'en' 
                      ? '📶 Connect to agency Wi-Fi to track your turn on your mobile' 
                      : '📶 Connectez-vous au Wi-Fi de l\'agence pour le suivi en direct'}
                  </p>
                  <div className="bn-qr-pulse">
                    <div className="bn-pulse-dot" />
                    <span>SUIVI EN DIRECT SUR MOBILE</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="bn-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="bn-help-modal" onClick={e => e.stopPropagation()}>
            <button className="bn-help-close" onClick={() => setShowHelp(false)}>
              <X size={24} />
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

