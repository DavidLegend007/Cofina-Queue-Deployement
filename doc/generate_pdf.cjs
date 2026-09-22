/**
 * Générateur PDF — Note Technique Chef IT COFINA
 * Design : Document administratif épuré aux couleurs COFINA
 * Icônes : Lucide SVG intégrées inline
 */
const fs   = require('fs');
const path = require('path');

const logoPath   = path.join(__dirname, '..', 'logo.jpeg');
const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : null;

const mdContent = fs.readFileSync(path.join(__dirname, 'NOTE_TECHNIQUE_CHEF_IT.md'), 'utf8');

// ── Icônes Lucide (SVG inline, stroke-based 24×24) ───────────────────────────
const ICONS = {
  cpu        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  network    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><line x1="12" y1="8" x2="12" y2="12"/></svg>`,
  shield     : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  layout     : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  database   : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  cloud      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  building   : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="7" width="6" height="5" rx="1"/></svg>`,
  wrench     : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  testTube   : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2 20 7.5l-7 7-5.5-5.5 7-7Z"/><path d="m10 10.5-5.5 5.5a2.12 2.12 0 1 0 3 3l5.5-5.5"/><path d="m17 2 5 5"/><path d="m3 15 4 4"/></svg>`,
  package    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  phone      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  fileText   : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  lock       : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  info       : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

// Section → icône
const SECTION_ICONS = {
  '1': ICONS.fileText,
  '2': ICONS.cpu,
  '3': ICONS.network,
  '4': ICONS.shield,
  '5': ICONS.layout,
  '6': ICONS.database,
  '7': ICONS.cloud,
  '8': ICONS.building,
  '9': ICONS.wrench,
  '10': ICONS.testTube,
  '11': ICONS.package,
  '12': ICONS.phone,
};

// ── Convertisseur Markdown → HTML ───────────────────────────────────────────
function mdToHtml(md) {
  const lines = md.split('\n');
  const out   = [];
  let inPre   = false, preLines = [], preLang = '';
  let inTable = false, tableRows = [];
  let inUl    = false, ulItems   = [];
  let inOl    = false, olItems   = [];

  const flushUl = () => {
    if (inUl) { out.push(`<ul>${ulItems.map(i=>`<li>${inlineFormat(i)}</li>`).join('')}</ul>`); ulItems=[]; inUl=false; }
  };
  const flushOl = () => {
    if (inOl) { out.push(`<ol>${olItems.map(i=>`<li>${inlineFormat(i)}</li>`).join('')}</ol>`); olItems=[]; inOl=false; }
  };
  const flushTable = () => {
    if (!inTable || !tableRows.length) return;
    const header = tableRows[0];
    const body   = tableRows.slice(2); // skip separator row
    let html = '<table><thead><tr>';
    header.forEach(h => { html += `<th>${inlineFormat(h.trim())}</th>`; });
    html += '</tr></thead><tbody>';
    body.forEach(row => {
      html += '<tr>';
      row.forEach(c => { html += `<td>${inlineFormat(c.trim())}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    out.push(html);
    tableRows = []; inTable = false;
  };

  lines.forEach(line => {
    // Fenced code block
    if (line.startsWith('```')) {
      if (!inPre) { inPre=true; preLang=line.slice(3).trim()||''; preLines=[]; return; }
      else { out.push(`<pre class="lang-${preLang}"><code>${escHtml(preLines.join('\n'))}</code></pre>`); inPre=false; return; }
    }
    if (inPre) { preLines.push(line); return; }

    // Tables
    if (line.startsWith('|')) {
      flushUl(); flushOl();
      inTable = true;
      const cells = line.split('|').slice(1,-1);
      tableRows.push(cells);
      return;
    } else if (inTable) { flushTable(); }

    // HR
    if (/^---+$/.test(line.trim())) { flushUl(); flushOl(); out.push('<hr/>'); return; }

    // Headings
    const h1m = line.match(/^# (.+)/);
    const h2m = line.match(/^## (\d+)\. (.+)/);
    const h2g = line.match(/^## (.+)/);
    const h3m = line.match(/^### (.+)/);
    const h4m = line.match(/^#### (.+)/);

    if (h1m) { flushUl(); flushOl(); out.push(`<h1>${inlineFormat(h1m[1])}</h1>`); return; }
    if (h2m) {
      flushUl(); flushOl();
      const num  = h2m[1];
      const text = h2m[2];
      const icon = SECTION_ICONS[num] || ICONS.fileText;
      out.push(`<h2 class="section-heading"><span class="section-icon">${icon}</span><span class="section-num">${num}.</span> ${inlineFormat(text)}</h2>`);
      return;
    }
    if (h2g) { flushUl(); flushOl(); out.push(`<h2 class="section-heading"><span class="section-icon">${ICONS.fileText}</span> ${inlineFormat(h2g[1])}</h2>`); return; }
    if (h3m) { flushUl(); flushOl(); out.push(`<h3>${inlineFormat(h3m[1])}</h3>`); return; }
    if (h4m) { flushUl(); flushOl(); out.push(`<h4>${inlineFormat(h4m[1])}</h4>`); return; }

    // Blockquotes
    const bqm = line.match(/^> (.+)/);
    if (bqm) { flushUl(); flushOl(); out.push(`<blockquote>${inlineFormat(bqm[1])}</blockquote>`); return; }

    // Ordered list
    const olm = line.match(/^\d+\. (.+)/);
    if (olm) { flushUl(); inOl=true; olItems.push(olm[1]); return; }

    // Unordered list
    const ulm = line.match(/^[-*] (.+)/);
    if (ulm) { flushOl(); inUl=true; ulItems.push(ulm[1]); return; }

    // Empty line → flush lists, paragraph break
    if (line.trim() === '') { flushUl(); flushOl(); out.push('<div class="spacer"></div>'); return; }

    // Paragraph
    flushUl(); flushOl();
    out.push(`<p>${inlineFormat(line)}</p>`);
  });
  flushUl(); flushOl(); flushTable();
  return out.join('\n');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function inlineFormat(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Replace ✅ ❌ ⚠️ 🔒 🟢 🟡 with Lucide icons
    .replace(/✅/g, `<span class="icon-ok">${ICONS.checkCircle}</span>`)
    .replace(/❌/g, `<span class="icon-no">${ICONS.xCircle}</span>`)
    .replace(/⚠️/g, `<span class="icon-warn">${ICONS.alertCircle}</span>`)
    .replace(/🔒/g, `<span class="icon-lock">${ICONS.lock}</span>`)
    .replace(/🟢/g, `<span class="badge badge-ok">Faible</span>`)
    .replace(/🟡/g, `<span class="badge badge-warn">Modéré</span>`)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

const bodyHtml = mdToHtml(mdContent);

// ── Template HTML ────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Note Technique IT — COFINA Queue System V1</title>
<style>
/* ── Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

/* ── Variables Marque COFINA ── */
:root {
  --red:    #C8102E;
  --gray:   #58595B;
  --light:  #F4F4F4;
  --border: #DCDCDC;
  --text:   #2C2C2C;
  --muted:  #6B6B6B;
  --white:  #FFFFFF;
  --red-bg: #FEF2F2;
  --red-lite: rgba(200,16,46,0.08);
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

/* ── Base ── */
body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 9.5pt;
  line-height: 1.7;
  color: var(--text);
  background: var(--white);
}

/* ══════════════════════════════════════
   COVER PAGE
══════════════════════════════════════ */
.cover {
  page-break-after: always;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--white);
  position: relative;
  overflow: hidden;
}

/* Bande latérale gauche rouge */
.cover::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 6px;
  height: 100%;
  background: var(--red);
}

/* Bande décorative haut */
.cover-top-bar {
  height: 180px;
  background: var(--light);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 60px;
  gap: 32px;
}

.cover-logo {
  height: 70px;
  object-fit: contain;
  display: block;
}

.cover-top-divider {
  width: 1px;
  height: 50px;
  background: var(--border);
}

.cover-top-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cover-top-label .direction {
  font-size: 8pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--red);
}
.cover-top-label .dept {
  font-size: 9pt;
  color: var(--gray);
  font-weight: 400;
}

/* Corps de la couverture */
.cover-body {
  flex: 1;
  padding: 64px 60px 0;
}

.cover-eyebrow {
  font-size: 8pt;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cover-eyebrow::before {
  content: '';
  display: block;
  width: 24px;
  height: 2px;
  background: var(--red);
  flex-shrink: 0;
}

.cover-title {
  font-size: 30pt;
  font-weight: 700;
  line-height: 1.15;
  color: var(--text);
  letter-spacing: -0.5px;
  max-width: 560px;
  margin-bottom: 8px;
}
.cover-title span { color: var(--red); }

.cover-subtitle {
  font-size: 12pt;
  font-weight: 300;
  color: var(--muted);
  margin-bottom: 48px;
  border-left: 3px solid var(--red);
  padding-left: 14px;
}

/* Fiche d'identité du document */
.cover-meta {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  border-top: 1px solid var(--border);
  margin-bottom: 0;
}
.cover-meta-item {
  padding: 18px 20px;
  border-right: 1px solid var(--border);
}
.cover-meta-item:last-child { border-right: none; }
.cover-meta-item .label {
  font-size: 7pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--muted);
  margin-bottom: 4px;
}
.cover-meta-item .value {
  font-size: 9pt;
  font-weight: 500;
  color: var(--text);
}
.cover-meta-item .value.red { color: var(--red); }

/* Pied de couverture */
.cover-footer {
  padding: 20px 60px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cover-footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--red);
  border-radius: 4px;
  font-size: 7.5pt;
  font-weight: 600;
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.cover-footer-ref {
  font-size: 7.5pt;
  color: var(--muted);
}

/* ══════════════════════════════════════
   EN-TÊTE DE PAGE (running header)
══════════════════════════════════════ */
@page { margin: 24mm 20mm 20mm 20mm; size: A4; }
@page :first { margin: 0; }

/* ══════════════════════════════════════
   CONTENU DU DOCUMENT
══════════════════════════════════════ */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0 14px;
  border-bottom: 2px solid var(--red);
  margin-bottom: 28px;
}
.doc-header img { height: 36px; object-fit: contain; }
.doc-header-info { text-align: right; font-size: 7.5pt; color: var(--muted); line-height: 1.5; }
.doc-header-info strong { color: var(--text); }

.content { max-width: 100%; }

/* ── H1 (titre principal dans le doc, caché car sur couverture) ── */
h1 { display: none; }

/* ── H2 — Titres de section ── */
h2.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12pt;
  font-weight: 600;
  color: var(--white);
  background: var(--gray);
  padding: 10px 16px;
  margin: 36px 0 16px;
  border-radius: 2px;
  page-break-after: avoid;
  letter-spacing: 0.1px;
}
h2.section-heading .section-icon {
  display: inline-flex;
  align-items: center;
  color: var(--white);
  opacity: 0.85;
  flex-shrink: 0;
}
h2.section-heading .section-num {
  color: var(--red);
  font-weight: 700;
  font-size: 11pt;
}

/* ── H3 ── */
h3 {
  font-size: 10pt;
  font-weight: 600;
  color: var(--text);
  margin: 20px 0 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border);
  page-break-after: avoid;
}

/* ── H4 ── */
h4 {
  font-size: 8.5pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted);
  margin: 14px 0 6px;
}

/* ── Paragraphes ── */
p { color: #3C3C3C; margin-bottom: 7px; }
.spacer { height: 6px; }

/* ── Listes ── */
ul, ol { margin: 6px 0 10px 20px; }
li { margin-bottom: 4px; color: #3C3C3C; }

/* ── Code inline ── */
code {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 8pt;
  background: var(--light);
  color: var(--red);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid var(--border);
}

/* ── Blocs de code ── */
pre {
  background: #1E1E2E;
  color: #CDD6F4;
  padding: 14px 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0 14px;
  page-break-inside: avoid;
  border-left: 3px solid var(--red);
}
pre code {
  background: none;
  color: #CDD6F4;
  border: none;
  padding: 0;
  font-size: 7.5pt;
  line-height: 1.7;
}

/* ── Tableaux ── */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0 16px;
  font-size: 8.5pt;
  page-break-inside: avoid;
}
thead tr th {
  background: var(--text);
  color: var(--white);
  font-weight: 600;
  font-size: 7.5pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 9px 12px;
  text-align: left;
  border: none;
}
tbody tr td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
tbody tr:nth-child(even) td { background: #FAFAFA; }
tbody tr:last-child td { border-bottom: none; }

/* ── Blockquotes ── */
blockquote {
  border-left: 3px solid var(--red);
  background: var(--red-bg);
  padding: 10px 16px;
  margin: 12px 0;
  border-radius: 0 4px 4px 0;
  font-size: 9pt;
  color: #7C1024;
  page-break-inside: avoid;
}

/* ── HR ── */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 24px 0;
}

/* ── Icônes inline dans texte ── */
.icon-ok  { display:inline-flex;align-items:center;color:#166534; vertical-align:middle; }
.icon-no  { display:inline-flex;align-items:center;color:#991B1B; vertical-align:middle; }
.icon-warn{ display:inline-flex;align-items:center;color:#92400E; vertical-align:middle; }
.icon-lock{ display:inline-flex;align-items:center;color:var(--gray); vertical-align:middle; }

/* ── Badges statut ── */
.badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 7pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  vertical-align: middle;
}
.badge-ok   { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
.badge-warn { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }

/* ── Print ── */
@media print {
  body { background: white; }
  pre { background: #1E1E2E !important; }
  thead tr th { background: var(--text) !important; }
  h2.section-heading { background: var(--gray) !important; color: white !important; }
  tbody tr:nth-child(even) td { background: #FAFAFA !important; }
  blockquote { background: var(--red-bg) !important; }
}
</style>
</head>
<body>

<!-- ══ PAGE DE COUVERTURE ══ -->
<div class="cover">
  <div class="cover-top-bar">
    ${logoBase64 ? `<img class="cover-logo" src="${logoBase64}" alt="COFINA — Compagnie Financière Africaine" />` : '<span style="font-size:1.5rem;font-weight:700;color:#C8102E;">COFINA</span>'}
    <div class="cover-top-divider"></div>
    <div class="cover-top-label">
      <div class="direction">Direction des Systèmes d'Information</div>
      <div class="dept">Document Technique Interne — Confidentiel</div>
    </div>
  </div>

  <div class="cover-body">
    <div class="cover-eyebrow">Note Technique</div>
    <div class="cover-title">Système de Gestion<br/>de File d'Attente<br/><span>Queue System V1</span></div>
    <div class="cover-subtitle">
      Guide complet à l'attention du Responsable des Systèmes d'Information<br/>
      Architecture, Sécurité, Réseau, Déploiement &amp; Maintenance
    </div>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="label">Référence</div>
        <div class="value">COFINA-IT-QSYSv1-2026</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Date d'émission</div>
        <div class="value">Septembre 2026</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Statut</div>
        <div class="value red">● Production — Agence Pilote</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Version</div>
        <div class="value">V1.0</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Prestataire</div>
        <div class="value">Matrix Industrie</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Périmètre</div>
        <div class="value">Agences Togo — Lomé</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="cover-footer-badge">${ICONS.lock}&nbsp; Usage Interne — DSI COFINA Togo</div>
    <div class="cover-footer-ref">© 2026 Groupe COFINA — Compagnie Financière Africaine — Tous droits réservés</div>
  </div>
</div>

<!-- ══ CONTENU PRINCIPAL ══ -->
<div class="doc-header">
  ${logoBase64 ? `<img src="${logoBase64}" alt="COFINA" />` : '<strong style="color:#C8102E;">COFINA</strong>'}
  <div class="doc-header-info">
    <strong>Note Technique — Queue System V1</strong><br/>
    Réf. COFINA-IT-QSYSv1-2026 &nbsp;|&nbsp; Septembre 2026 &nbsp;|&nbsp; Confidentiel DSI
  </div>
</div>

<div class="content">
${bodyHtml}
</div>

</body>
</html>`;

// ── Écriture HTML ─────────────────────────────────────────────────────────────
const htmlOut = path.join(__dirname, 'NOTE_TECHNIQUE_CHEF_IT.html');
fs.writeFileSync(htmlOut, html, 'utf8');
console.log('✅ HTML généré :', htmlOut);

// ── Génération PDF via Puppeteer ──────────────────────────────────────────────
async function generatePdf() {
  let puppeteer;
  try { puppeteer = require(path.join(__dirname, 'node_modules', 'puppeteer')); }
  catch { try { puppeteer = require('puppeteer'); } catch {} }
  if (!puppeteer) {
    console.log('ℹ️  Puppeteer absent. Ouvrez le HTML dans Chrome → Ctrl+P → "Enregistrer en PDF".');
    return;
  }
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page    = await browser.newPage();
  await page.goto(`file://${htmlOut}`, { waitUntil: 'networkidle0', timeout: 60000 });
  const pdfOut  = path.join(__dirname, 'NOTE_TECHNIQUE_CHEF_IT.pdf');
  await page.pdf({
    path: pdfOut,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#9CA3AF;padding:0 20mm;display:flex;justify-content:space-between;font-family:Inter,sans-serif;">
      <span>COFINA Queue System V1 — Note Technique DSI — Confidentiel</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`,
    margin: { top: '20mm', bottom: '18mm', left: '20mm', right: '20mm' },
  });
  await browser.close();
  const size = (fs.statSync(pdfOut).size / 1024).toFixed(0);
  console.log('✅ PDF généré : ' + pdfOut + ' (' + size + ' Ko)');
}

generatePdf().catch(e => console.error('Erreur PDF :', e.message));
