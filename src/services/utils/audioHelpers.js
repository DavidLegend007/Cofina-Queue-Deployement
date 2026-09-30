// ============================================================
// audioHelpers.js — Logique concrète de diffusion sonore
// Carillon Web Audio + Synthèse vocale fluide et fiable
// ============================================================

// Références persistantes globales pour éviter le bug de garbage-collection de Chromium
let currentUtterance = null;
let cachedVoices = [];

const loadCachedVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
      }
    } catch (_) {}
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadCachedVoices();
  window.speechSynthesis.onvoiceschanged = loadCachedVoices;
}

// ── 0. Déblocage universel de l'audio et de la parole ─────────
export const unlockAudio = () => {
  try {
    if (typeof window === 'undefined') return;

    // Déblocage SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      loadCachedVoices();
      // Envoi d'une énonciation vide pour forcer Chrome à accorder les droits
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0.01;
      silent.rate = 10;
      window.speechSynthesis.speak(silent);
    }

    // Déblocage Web Audio
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      ctx.resume().then(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        setTimeout(() => ctx.close().catch(() => {}), 200);
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('unlockAudio error:', e);
  }
};

// ── 1. Carillon d'annonce (Bip 2 tons) ──────────────────────
export const playCallChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t0 = ctx.currentTime;

    // Ton 1 : Carillon haut (880 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t0);
    gain1.gain.setValueAtTime(0.3, t0);
    gain1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t0);
    osc1.stop(t0 + 0.55);

    // Ton 2 : Carillon de résolution (1108.73 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1108.73, t0 + 0.25);
    gain2.gain.setValueAtTime(0.35, t0 + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, t0 + 1.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t0 + 0.25);
    osc2.stop(t0 + 1.1);

    setTimeout(() => {
      try { ctx.close(); } catch (_) {}
    }, 1400);

  } catch (e) {
    console.warn('Audio chime playback omitted:', e);
  }
};

// ── 2. Sélection de la meilleure voix disponible ────────────
export const getAfricanOrBestVoice = (targetLang = 'fr') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  let voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isFr = targetLang.startsWith('fr');

  if (isFr) {
    // 1. Recherche d'une voix africaine francophone
    const africanVoice = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return (
        l.includes('fr-tg') || l.includes('fr-bj') || l.includes('fr-ci') || 
        l.includes('fr-sn') || l.includes('fr-cm') || l.includes('fr-bf') ||
        n.includes('togo') || n.includes('africa') || n.includes('ivoire') || n.includes('senegal')
      );
    });
    if (africanVoice) return africanVoice;

    // 2. Recherche d'une voix française locale de qualité
    const preferredVoice = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.startsWith('fr') && !n.includes('online') && (
        n.includes('google') || n.includes('hortense') || n.includes('julie') || 
        n.includes('celine') || n.includes('paul') || n.includes('desktop')
      );
    });
    if (preferredVoice) return preferredVoice;

    // 3. Toute voix française disponible
    const anyFrVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('fr'));
    if (anyFrVoice) return anyFrVoice;
  } else {
    const anyEnVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
    if (anyEnVoice) return anyEnVoice;
  }

  // 4. Repli de secours : voix par défaut du système pour ne jamais être silencieux
  return voices.find(v => v.default) || voices[0] || null;
};

// ── 3. Annonce de création de ticket (Borne) ────────────────
export const speakTicketGenerated = (ticketNumber, lang = 'fr') => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const formattedTicket = (ticketNumber || '').replace('-', ' ');
    const isEn = lang === 'en';
    const text = isEn 
      ? `Welcome to Cofina Togo. Your ticket ${formattedTicket} has been created. Please take a seat in the waiting room.`
      : `Bienvenue à l'agence Cofina Togo ! Votre ticket numéro ${formattedTicket} est bien créé. Merci de prendre place en salle d'attente.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    const matchedVoice = getAfricanOrBestVoice(isEn ? 'en' : 'fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    // Fix garbage collector Chromium
    currentUtterance = utterance;
    window.__cofina_speech = utterance;

    utterance.onend = () => {
      currentUtterance = null;
      window.__cofina_speech = null;
    };
    utterance.onerror = () => {
      currentUtterance = null;
      window.__cofina_speech = null;
    };

    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (_) {}
    }, 200);
  } catch (e) {
    console.warn('Speech synthesis TEMPS 1 error:', e);
  }
};

// ── 4. Annonce vocale d'appel (Écran TV) ────────────────────
export const speakTicketCall = (ticketNumber, counterNumber, lang = 'fr') => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const formattedTicket = (ticketNumber || '').replace('-', ' ');
    const isEn = lang === 'en';

    // Phrase concrète directe
    const text = isEn 
      ? `Ticket ${formattedTicket}, please proceed to Counter ${counterNumber}.`
      : `Ticket ${formattedTicket}, veuillez passer à la caisse ${counterNumber}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    const matchedVoice = getAfricanOrBestVoice(isEn ? 'en' : 'fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    // Fix bug garbage collection Chrome : conserver la référence en mémoire vive
    currentUtterance = utterance;
    window.__cofina_speech = utterance;

    utterance.onend = () => {
      currentUtterance = null;
      window.__cofina_speech = null;
    };
    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      currentUtterance = null;
      window.__cofina_speech = null;
    };

    // Déclencher 450ms après le carillon pour un enchaînement naturel
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel(); // Vide tout appel précédent en attente
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.warn('SpeechSynthesis speak error:', err);
      }
    }, 450);

  } catch (e) {
    console.warn('Speech synthesis TEMPS 2 error:', e);
  }
};
