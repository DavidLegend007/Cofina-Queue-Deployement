/**
 * Générateur PDF — PRESENTATION_LOGICIEL.md
 * Style : Document business / présentation produit COFINA
 * Cible : Directeurs d'agence, DG, management non-technique
 */
const fs   = require('fs');
const path = require('path');

const logoPath   = path.join(__dirname, '..', 'logo.jpeg');
const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : null;

const mdContent = fs.readFileSync(path.join(__dirname, 'PRESENTATION_LOGICIEL.md'), 'utf8');

// ── Icônes Lucide SVG ────────────────────────────────────────────────────────
const ICONS = {
  users       : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4V1"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  smartphone  : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  monitor     : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  zap         : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  barChart    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  globe       : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  star        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  shield      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  map         : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  trendingUp  : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  checkCircle : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  clock       : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  lock        : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};

const SECTION_ICONS = {
  '1' : null,
  '2' : ICONS.zap,
  '3' : ICONS.smartphone,
  '4' : ICONS.globe,
  '5' : ICONS.users,
  '6' : ICONS.barChart,
  '7' : ICONS.map,
  '8' : ICONS.shield,
  '9' : ICONS.trendingUp,
};

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function inlineFormat(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/`([^`]+)`/g,    '<code>$1</code>')
    .replace(/✅/g, `<span class="icon-ok">${ICONS.checkCircle}</span>`)
    .replace(/❌/g, `<span class="badge badge-no">Non disponible</span>`)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out   = [];
  let inPre=false, preLines=[], preLang='';
  let inTable=false, tableRows=[];
  let inUl=false, ulItems=[];
  let inOl=false, olItems=[], olStart=1;

  const flushUl = () => {
    if (!inUl) return;
    out.push('<ul>' + ulItems.map(i=>`<li>${inlineFormat(i)}</li>`).join('') + '</ul>');
    ulItems=[]; inUl=false;
  };
  const flushOl = () => {
    if (!inOl) return;
    out.push('<ol>' + olItems.map(i=>`<li>${inlineFormat(i)}</li>`).join('') + '</ol>');
    olItems=[]; inOl=false;
  };
  const flushTable = () => {
    if (!inTable || !tableRows.length) return;
    const head = tableRows[0];
    const body = tableRows.slice(2);
    // Detect summary table (2 cols, first row both empty → borderless)
    const isSummary = head.length === 2 && head.every(c => c.trim() === '');
    if (isSummary) {
      let t = '<table class="summary-table"><tbody>';
      body.forEach(r => { t += '<tr>' + r.map(c=>`<td>${inlineFormat(c.trim())}</td>`).join('') + '</tr>'; });
      t += '</tbody></table>';
      out.push(t);
    } else {
      let t = '<table><thead><tr>' + head.map(h=>`<th>${inlineFormat(h.trim())}</th>`).join('') + '</tr></thead><tbody>';
      body.forEach(r => { t += '<tr>' + r.map(c=>`<td>${inlineFormat(c.trim())}</td>`).join('') + '</tr>'; });
      t += '</tbody></table>';
      out.push(t);
    }
    tableRows=[]; inTable=false;
  };

  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (!inPre) { inPre=true; preLang=line.slice(3).trim()||''; preLines=[]; return; }
      else { out.push(`<pre><code>${escHtml(preLines.join('\n'))}</code></pre>`); inPre=false; return; }
    }
    if (inPre) { preLines.push(line); return; }

    if (line.startsWith('|')) {
      flushUl(); flushOl();
      inTable=true;
      tableRows.push(line.split('|').slice(1,-1));
      return;
    } else if (inTable) { flushTable(); }

    if (/^---+$/.test(line.trim())) { flushUl(); flushOl(); out.push('<hr/>'); return; }

    const h1m  = line.match(/^# (.+)/);
    const h2m  = line.match(/^## (\d+)\. (.+)/);
    const h2g  = line.match(/^## (.+)/);
    const h3m  = line.match(/^### (.+)/);
    const h4m  = line.match(/^#### (.+)/);
    const bqm  = line.match(/^> (.+)/);
    const olm  = line.match(/^\d+\. (.+)/);
    const ulm  = line.match(/^[-*] (.+)/);

    if (h1m) { flushUl(); flushOl(); out.push(`<h1>${inlineFormat(h1m[1])}</h1>`); return; }
    if (h2m) {
      flushUl(); flushOl();
      const num=h2m[1], text=h2m[2];
      const icon = SECTION_ICONS[num] || '';
      out.push(`<h2><span class="sec-icon">${icon}</span><span class="sec-num">${num}.</span> ${inlineFormat(text)}</h2>`);
      return;
    }
    if (h2g) { flushUl(); flushOl(); out.push(`<h2><span class="sec-icon">${ICONS.star}</span> ${inlineFormat(h2g[1])}</h2>`); return; }
    if (h3m) { flushUl(); flushOl(); out.push(`<h3>${inlineFormat(h3m[1])}</h3>`); return; }
    if (h4m) { flushUl(); flushOl(); out.push(`<h4>${inlineFormat(h4m[1])}</h4>`); return; }
    if (bqm) { flushUl(); flushOl(); out.push(`<blockquote>${inlineFormat(bqm[1])}</blockquote>`); return; }
    if (olm) { flushUl(); inOl=true; olItems.push(olm[1]); return; }
    if (ulm) { flushOl(); inUl=true; ulItems.push(ulm[1]); return; }
    if (line.trim() === '') { flushUl(); flushOl(); out.push('<div class="sp"></div>'); return; }
    flushUl(); flushOl();
    out.push(`<p>${inlineFormat(line)}</p>`);
  });
  flushUl(); flushOl(); flushTable();
  return out.join('\n');
}

const bodyHtml = mdToHtml(mdContent);

// ── HTML ─────────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>COFINA Queue System V1 — Présentation Logiciel</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

:root {
  --red:      #C8102E;
  --red-dark: #9B0B22;
  --red-lite: rgba(200,16,46,0.07);
  --gray:     #58595B;
  --light:    #F5F5F5;
  --border:   #E0E0E0;
  --text:     #1A1A1A;
  --muted:    #6B6B6B;
  --white:    #FFFFFF;
  --step-bg:  #FAFAFA;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 10pt;
  line-height: 1.75;
  color: var(--text);
  background: white;
}

/* ══ COUVERTURE ══ */
.cover {
  page-break-after: always;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--white);
  position: relative;
}
/* Barre rouge gauche */
.cover::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 5px; height: 100%;
  background: var(--red);
}

/* Hero section */
.cover-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

/* Entête avec logo */
.cover-header {
  padding: 36px 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.cover-header img { height: 52px; object-fit: contain; }
.cover-header-tag {
  font-size: 8pt;
  font-weight: 500;
  color: var(--muted);
  text-align: right;
  line-height: 1.5;
}

/* Bloc principal couverture */
.cover-main {
  flex: 1;
  padding: 56px 56px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cover-label {
  display: inline-block;
  background: var(--red);
  color: white;
  font-size: 7.5pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 5px 14px;
  border-radius: 2px;
  margin-bottom: 24px;
  width: fit-content;
}

.cover-title {
  font-size: 34pt;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text);
  letter-spacing: -1px;
  margin-bottom: 6px;
}
.cover-title .accent { color: var(--red); }

.cover-version {
  font-size: 15pt;
  font-weight: 300;
  color: var(--muted);
  margin-bottom: 36px;
  letter-spacing: -0.3px;
}

.cover-description {
  font-size: 11pt;
  line-height: 1.8;
  color: #444;
  max-width: 520px;
  padding-left: 18px;
  border-left: 3px solid var(--red);
  margin-bottom: 48px;
}

/* Grille stats couverture */
.cover-stats {
  display: flex;
  gap: 0;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}
.cover-stat {
  flex: 1;
  padding: 20px 22px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.cover-stat .num {
  font-size: 22pt;
  font-weight: 700;
  color: var(--red);
  line-height: 1;
  margin-bottom: 4px;
}
.cover-stat .lbl {
  font-size: 8pt;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Pied couverture */
.cover-foot {
  padding: 18px 56px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 7.5pt;
  color: var(--muted);
}
.cover-foot-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--gray);
}

/* ══ HEADER courant ══ */
.running-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 30px;
}
.running-header img { height: 28px; object-fit: contain; }
.running-header-info {
  font-size: 7.5pt;
  color: var(--muted);
  text-align: right;
  line-height: 1.5;
}

/* ══ CONTENU ══ */
@page { margin: 22mm 20mm 20mm 20mm; size: A4; }
@page :first { margin: 0; }

.content { max-width: 100%; }

/* H1 masqué (sur couverture) */
h1 { display: none; }

/* H2 — Sections */
h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14pt;
  font-weight: 700;
  color: var(--red);
  margin: 36px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--red);
  page-break-after: avoid;
  letter-spacing: -0.2px;
}
h2 .sec-icon {
  display: inline-flex;
  align-items: center;
  color: var(--red);
  opacity: 0.75;
  flex-shrink: 0;
}
h2 .sec-num { color: var(--gray); font-weight: 400; font-size: 11pt; }

/* H3 */
h3 {
  font-size: 11pt;
  font-weight: 600;
  color: var(--text);
  margin: 22px 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  page-break-after: avoid;
}

/* H4 */
h4 {
  font-size: 9pt;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 14px 0 5px;
}

/* Paragraphes */
p { color: #333; margin-bottom: 8px; }
.sp { height: 8px; }

/* Intro (premier paragraphe après H2) */
p.intro {
  font-size: 11pt;
  font-weight: 300;
  color: #555;
  line-height: 1.8;
}

/* Listes */
ul, ol { margin: 8px 0 12px 22px; }
li { margin-bottom: 5px; color: #333; }

/* Code inline */
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8pt;
  background: var(--light);
  color: var(--red-dark);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid var(--border);
}

/* Blocs de code */
pre {
  background: var(--light);
  border: 1px solid var(--border);
  border-left: 3px solid var(--gray);
  color: var(--gray);
  padding: 14px 16px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8pt;
  line-height: 1.7;
  margin: 10px 0 14px;
  page-break-inside: avoid;
}
pre code { background:none; border:none; padding:0; color: var(--gray); }

/* Tableaux normaux */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0 16px;
  font-size: 9pt;
  page-break-inside: avoid;
}
thead tr th {
  background: var(--red);
  color: white;
  font-weight: 600;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 14px;
  text-align: left;
}
tbody tr td {
  padding: 9px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
tbody tr:nth-child(even) td { background: #FAFAFA; }
tbody tr:last-child td { border-bottom: none; }

/* Tableau sommaire (2 colonnes sans en-tête) */
table.summary-table {
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}
table.summary-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}
table.summary-table tr td:first-child {
  font-weight: 600;
  color: var(--gray);
  width: 35%;
  background: var(--light);
  font-size: 8.5pt;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Blockquotes */
blockquote {
  border-left: 3px solid var(--red);
  background: var(--red-lite);
  padding: 12px 18px;
  margin: 12px 0;
  border-radius: 0 4px 4px 0;
  font-size: 9.5pt;
  color: #7C1024;
  page-break-inside: avoid;
}

/* HR */
hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }

/* Étapes numérotées stylisées */
.step-box {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: var(--step-bg);
  border: 1px solid var(--border);
  border-left: 3px solid var(--red);
  border-radius: 0 6px 6px 0;
  margin: 10px 0;
  page-break-inside: avoid;
}
.step-num {
  width: 30px; height: 30px;
  background: var(--red);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10pt; font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Icônes */
.icon-ok { display:inline-flex; align-items:center; color:#166534; vertical-align:middle; }
.badge { display:inline-block; padding:1px 8px; border-radius:10px; font-size:7pt; font-weight:600; }
.badge-no { background:#FEE2E2; color:#991B1B; border:1px solid #FECACA; }

/* Feuille de route */
.badge-dispo { background:#D1FAE5; color:#065F46; border:1px solid #A7F3D0; font-size:7pt; padding:2px 8px; border-radius:10px; font-weight:600; display:inline-block; }
.badge-soon  { background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; font-size:7pt; padding:2px 8px; border-radius:10px; font-weight:600; display:inline-block; }
.badge-tbd   { background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; font-size:7pt; padding:2px 8px; border-radius:10px; font-weight:600; display:inline-block; }

@media print {
  pre { background: var(--light) !important; }
  table.summary-table tr td:first-child { background: var(--light) !important; }
  tbody tr:nth-child(even) td { background: #FAFAFA !important; }
  thead tr th { background: var(--red) !important; }
  blockquote { background: var(--red-lite) !important; }
  h2 { color: var(--red) !important; border-color: var(--red) !important; }
  .cover::before { background: var(--red) !important; }
}
</style>
</head>
<body>

<!-- ══ PAGE DE COUVERTURE ══ -->
<div class="cover">
  <div class="cover-hero">
    <div class="cover-header">
      ${logoBase64
        ? `<img src="${logoBase64}" alt="COFINA — Compagnie Financière Africaine" />`
        : `<strong style="font-size:1.4rem;color:#C8102E;font-weight:700;">COFINA</strong>`}
      <div class="cover-header-tag">
        Compagnie Financière Africaine<br/>
        Groupe COFINA — Togo
      </div>
    </div>

    <div class="cover-main">
      <div class="cover-label">Présentation Produit</div>
      <div class="cover-title">COFINA<br/><span class="accent">Queue</span><br/>System</div>
      <div class="cover-version">version 1 — Septembre 2026</div>
      <div class="cover-description">
        Solution de gestion intelligente de la file d'attente, conçue sur mesure pour les agences COFINA au Togo.<br/>
        Robuste, accessible et 100% opérationnel sans connexion internet.
      </div>

      <div class="cover-stats">
        <div class="cover-stat">
          <div class="num">12</div>
          <div class="lbl">Services COFINA</div>
        </div>
        <div class="cover-stat">
          <div class="num">4</div>
          <div class="lbl">Postes caissiers</div>
        </div>
        <div class="cover-stat">
          <div class="num">100%</div>
          <div class="lbl">Hors-ligne garanti</div>
        </div>
        <div class="cover-stat">
          <div class="num">V1</div>
          <div class="lbl">En production</div>
        </div>
      </div>
    </div>
  </div>

  <div class="cover-foot">
    <div class="cover-foot-badge">${ICONS.lock}&nbsp; Document Interne — Usage Directionnel</div>
    <div>Préparé par Matrix Industrie &nbsp;·&nbsp; © 2026 Groupe COFINA — Tous droits réservés</div>
  </div>
</div>

<!-- ══ CONTENU ══ -->
<div class="running-header">
  ${logoBase64 ? `<img src="${logoBase64}" alt="COFINA" />` : `<strong style="color:#C8102E;">COFINA</strong>`}
  <div class="running-header-info">
    COFINA Queue System V1 — Présentation Logiciel<br/>
    Document Interne — Septembre 2026
  </div>
</div>

<div class="content">
${bodyHtml}
</div>

</body>
</html>`;

// ── Écriture ─────────────────────────────────────────────────────────────────
const htmlOut = path.join(__dirname, 'PRESENTATION_LOGICIEL.html');
fs.writeFileSync(htmlOut, html, 'utf8');
console.log('✅ HTML généré :', htmlOut);

async function generatePdf() {
  let puppeteer;
  try { puppeteer = require(path.join(__dirname, 'node_modules', 'puppeteer')); }
  catch { try { puppeteer = require('puppeteer'); } catch {} }
  if (!puppeteer) {
    console.log('ℹ️  Puppeteer absent. Ouvrez le HTML dans Chrome → Ctrl+P → Enregistrer en PDF.');
    return;
  }
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page    = await browser.newPage();
  await page.goto('file://' + htmlOut, { waitUntil: 'networkidle0', timeout: 60000 });
  const pdfOut  = path.join(__dirname, 'PRESENTATION_LOGICIEL.pdf');
  await page.pdf({
    path: pdfOut,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#9CA3AF;padding:0 20mm;display:flex;justify-content:space-between;font-family:Inter,sans-serif;">
      <span>COFINA Queue System V1 — Présentation Logiciel — Confidentiel</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`,
    margin: { top: '20mm', bottom: '18mm', left: '20mm', right: '20mm' },
  });
  await browser.close();
  const size = Math.round(require('fs').statSync(pdfOut).size / 1024);
  console.log('✅ PDF généré : ' + pdfOut + ' (' + size + ' Ko)');
}

generatePdf().catch(e => console.error('Erreur PDF :', e.message));
