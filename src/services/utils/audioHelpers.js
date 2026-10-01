// ============================================================
// audioHelpers.js — Logique concrète de diffusion sonore
// Carillon Web Audio + TTS Serveur Windows (100% fiable, hors-ligne)
// ============================================================

// ── URL de base du serveur (déterminé dynamiquement) ─────────
const getServerBase = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return 'http://localhost:4000';
};

// ── 0. Déblocage universel de l'AudioContext ──────────────────
export const unlockAudio = () => {
  try {
    if (typeof window === 'undefined') return;
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

// ── 1. Carillon d'annonce (Bip 2 tons, Web Audio natif) ─────────────────────
export const playCallChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t0 = ctx.currentTime;

    // Ton 1 : 880 Hz
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

    // Ton 2 : 1108.73 Hz
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

    setTimeout(() => { try { ctx.close(); } catch (_) {} }, 1400);
  } catch (e) {
    console.warn('playCallChime error:', e);
  }
};

// ── 2. Annonce vocale : fetch WAV depuis le serveur → jouer via Web Audio API ──
// Le serveur génère le WAV avec espeak-ng (Ubuntu) et le retourne en audio/wav.
// Le navigateur Zeus le joue via AudioContext.decodeAudioData() (même API que le bip).
// → Le son sort des haut-parleurs de la TV ✅
const speakViaTTSServer = async (text) => {
  if (typeof window === 'undefined') return;
  try {
    const url = `${getServerBase()}/api/tts?text=${encodeURIComponent(text)}`;
    const response = await fetch(url, { cache: 'no-store' });

    // Si le serveur répond 503 (espeak-ng non installé) → fallback navigateur
    if (!response.ok) {
      console.warn('[TTS] Serveur TTS indisponible (code', response.status, '), fallback navigateur');
      speakFallback(text);
      return;
    }

    // Décoder et jouer le WAV reçu via Web Audio API (identique au bip → fonctionne dans Zeus)
    const arrayBuffer = await response.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      speakFallback(text);
      return;
    }
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {});

    ctx.decodeAudioData(arrayBuffer, (audioBuffer) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
      source.onended = () => { try { ctx.close(); } catch (_) {} };
      console.log('[TTS] ✅ Annonce vocale jouée sur la TV via Web Audio API');
    }, (decodeErr) => {
      console.warn('[TTS] Erreur décodage WAV:', decodeErr, '→ fallback navigateur');
      speakFallback(text);
      try { ctx.close(); } catch (_) {}
    });
  } catch (e) {
    console.warn('[TTS] Fetch /api/tts échoué:', e, '→ fallback navigateur');
    speakFallback(text);
  }
};

// ── 3. Fallback : Synthèse vocale navigateur si serveur indisponible ──────────
const speakFallback = (text) => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v =>
      v.localService === true && (v.lang || '').toLowerCase().startsWith('fr')
    ) || voices.find(v => (v.lang || '').toLowerCase().startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;
    window.__cofina_speech = utterance;
    window.speechSynthesis.speak(utterance);
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  } catch (e) {
    console.warn('[TTS] Fallback speechSynthesis error:', e);
  }
};

// ── 4. Annonce de création de ticket (Borne) ─────────────────────────────────
export const speakTicketGenerated = (ticketNumber, lang = 'fr') => {
  try {
    const rawTicket = String(ticketNumber || '').trim();
    const formattedTicket = rawTicket
      .replace(/-/g, ' ')
      .replace(/([A-Za-z]+)(\d+)/g, '$1 $2');
    const isEn = lang === 'en';
    const text = isEn
      ? `Welcome to Cofina Togo. Your ticket ${formattedTicket} has been created. Please take a seat in the waiting room.`
      : `Bienvenue à l'agence Cofina Togo ! Votre ticket numéro ${formattedTicket} est bien créé. Merci de prendre place en salle d'attente.`;

    setTimeout(() => speakViaTTSServer(text), 200);
  } catch (e) {
    console.warn('speakTicketGenerated error:', e);
  }
};

// ── 5. Annonce d'appel ticket sur l'Écran TV ─────────────────────────────────
export const speakTicketCall = (ticketNumber, counterNumber, lang = 'fr') => {
  try {
    const rawTicket = String(ticketNumber || '').trim();
    // Séparer lettres et chiffres : "D001" → "D 0 0 1"
    const cleanNum = rawTicket.replace(/-/g, '');
    const letterPart = cleanNum.replace(/[0-9]/g, '');
    const digitPart = cleanNum.replace(/[^0-9]/g, '');
    const formattedTicket = `${letterPart} ${digitPart.split('').join(' ')}`.trim();

    const isEn = lang === 'en';
    const text = isEn
      ? `Ticket ${formattedTicket}, please proceed to Counter ${counterNumber}.`
      : `Ticket ${formattedTicket}, veuillez passer à la caisse ${counterNumber}.`;

    // Laisser le carillon se terminer (450ms) avant de parler
    setTimeout(() => speakViaTTSServer(text), 450);
  } catch (e) {
    console.warn('speakTicketCall error:', e);
  }
};

// Conservé pour compatibilité avec Navbar.jsx (test voix)
export const getAfricanOrBestVoice = (lang = 'fr') => null;
