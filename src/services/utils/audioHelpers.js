// ============================================================
// audioHelpers.js
// 🔒 Tout son (bip + voix) est EXCLUSIVEMENT réservé à l'écran TV.
//    Les autres pages (caisses, borne, admin) ne produisent aucun son.
//    Vérification via window.COFINA_IS_DISPLAY_TV positionné par App.jsx.
// ============================================================

const isDisplayTV = () =>
  typeof window !== 'undefined' && window.COFINA_IS_DISPLAY_TV === true;

// ── Bip d'annonce (Web Audio API) ───────────────────────────
export const playCallChime = () => {
  if (!isDisplayTV()) return; // 🔒 TV uniquement
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Tone 1 : High chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Tone 2 : Warm resolve chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 1.2);

    setTimeout(() => { try { ctx.close(); } catch (_) {} }, 1400);
  } catch (e) {
    console.warn('Audio chime playback omitted:', e);
  }
};

// ── Sélection de la meilleure voix française ────────────────
export const getAfricanOrBestVoice = (targetLang = 'fr') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isFr = targetLang.startsWith('fr');

  if (isFr) {
    // Priorité : voix africaine francophone
    const africanVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.includes('fr-tg') || l.includes('fr-bj') || l.includes('fr-ci') ||
        l.includes('fr-sn') || l.includes('fr-cm') || l.includes('fr-bf') ||
        l.includes('fr-mg') || l.includes('fr-ma') || l.includes('fr-tn') ||
        n.includes('togo') || n.includes('africa') || n.includes('ivoire') || n.includes('senegal')
      );
    });
    if (africanVoice) return africanVoice;

    // Secondaire : voix française Google/naturelle
    const preferredVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.startsWith('fr') && (
        n.includes('google') || n.includes('natural') || n.includes('hortense') ||
        n.includes('julie') || n.includes('celine') || n.includes('online')
      );
    });
    if (preferredVoice) return preferredVoice;

    // Fallback : n'importe quelle voix fr
    const anyFrVoice = voices.find(v => v.lang.toLowerCase().startsWith('fr'));
    if (anyFrVoice) return anyFrVoice;
  }

  return voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) || null;
};

// ── Annonce de création de ticket (borne) ───────────────────
export const speakTicketGenerated = (ticketNumber, _lang = 'fr') => {
  if (!isDisplayTV()) return; // 🔒 TV uniquement
  try {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const formattedTicket = ticketNumber
      .split('-')
      .map((part, i) => i === 1 ? part.split('').join(' ') : part)
      .join(' ');

    // Toujours en français
    const text = `Bienvenue à l'agence Cofina Togo ! Votre ticket numéro ${formattedTicket} est bien créé. Merci de prendre place en salle d'attente.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    const matchedVoice = getAfricanOrBestVoice('fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    setTimeout(() => { window.speechSynthesis.speak(utterance); }, 200);
  } catch (e) {
    console.warn('Speech synthesis speakTicketGenerated error:', e);
  }
};

// ── Appel de ticket au guichet (TV uniquement) ──────────────
let pendingSpeakTimeout = null;
let currentSafetyTimer = null;

export const speakTicketCall = (ticketNumber, counterNumber, _lang = 'fr', onEndCallback = null) => {
  // 🔒 TV uniquement : sur les pages caisse/borne/admin → déclencher seulement le callback
  if (!isDisplayTV()) {
    if (typeof onEndCallback === 'function') {
      try { onEndCallback(); } catch (_) {}
    }
    return;
  }

  let finished = false;

  if (pendingSpeakTimeout) { clearTimeout(pendingSpeakTimeout); pendingSpeakTimeout = null; }
  if (currentSafetyTimer)  { clearTimeout(currentSafetyTimer);  currentSafetyTimer  = null; }

  const triggerEnd = () => {
    if (finished) return;
    finished = true;
    if (currentSafetyTimer) { clearTimeout(currentSafetyTimer); currentSafetyTimer = null; }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ticket_voice_ended', {
        detail: { ticketNumber, counterNumber }
      }));
    }
    if (typeof onEndCallback === 'function') {
      try { onEndCallback(); } catch (err) {
        console.error('Error in speakTicketCall callback:', err);
      }
    }
  };

  try {
    if (!('speechSynthesis' in window)) { triggerEnd(); return; }

    window.speechSynthesis.cancel();

    const formattedTicket = ticketNumber
      ? ticketNumber.split('-').map((part, i) => i === 1 ? part.split('').join(' ') : part).join(' ')
      : '';

    // Toujours en français, quelle que soit la langue de l'interface
    const text = `Ticket ${formattedTicket}... Veuillez vous présenter au Guichet ${counterNumber}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    utterance.onend  = () => triggerEnd();
    utterance.onerror = (e) => {
      if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
      triggerEnd();
    };

    const matchedVoice = getAfricanOrBestVoice('fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    // Sécurité : débloquer après 5.5 s si la voix reste muette
    currentSafetyTimer = setTimeout(() => triggerEnd(), 5500);

    pendingSpeakTimeout = setTimeout(() => {
      try { window.speechSynthesis.speak(utterance); } catch (err) { triggerEnd(); }
    }, 450);

  } catch (e) {
    triggerEnd();
  }
};
