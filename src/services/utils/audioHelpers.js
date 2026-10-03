// ============================================================
// audioHelpers.js — Logique concrète de diffusion sonore
// Carillon Web Audio + TTS Serveur (100% fiable, hors-ligne)
// AVEC FILE D'ATTENTE FIFO STRICTE (Zéro superposition / Zéro coupure)
// ============================================================

// ── URL de base du serveur (déterminé dynamiquement) ─────────
const getServerBase = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return 'http://localhost:4000';
};

// ── 0. AudioContext Partagé & Persistant (Ne jamais fermer pour conserver l'état débloqué) ──
let sharedAudioCtx = null;

export const getSharedAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

// Écouteur universel passif de déblocage automatique dès le premier contact
if (typeof window !== 'undefined') {
  const handleUserGesture = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };
  window.addEventListener('click', handleUserGesture, { passive: true });
  window.addEventListener('keydown', handleUserGesture, { passive: true });
  window.addEventListener('pointerdown', handleUserGesture, { passive: true });
  window.addEventListener('touchstart', handleUserGesture, { passive: true });
}

export const unlockAudio = () => {
  try {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.02);
      }).catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }
  } catch (e) {
    console.warn('unlockAudio error:', e);
  }
};

// ── 1. Carillon d'annonce (Bip 2 tons, Web Audio natif) ─────────────────────
// Retourne une Promise qui se résout quand le carillon a fini de sonner (~1.2s)
let lastChimeTriggerTime = 0;
export const playCallChime = () => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') return resolve();
      const ctx = getSharedAudioContext();
      if (!ctx) return resolve();

      // Anti-rebond : éviter deux carillons lancés en moins de 600ms
      const now = Date.now();
      if (now - lastChimeTriggerTime < 600) {
        return resolve();
      }
      lastChimeTriggerTime = now;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const t0 = ctx.currentTime;

      // Ton 1 : 880 Hz (0.55s)
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

      // Ton 2 : 1108.73 Hz (0.85s)
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

      // Résolution après la durée du carillon (on garde ctx OUVERT pour les annonces suivantes)
      setTimeout(() => {
        resolve();
      }, 1200);
    } catch (e) {
      console.warn('playCallChime error:', e);
      resolve();
    }
  });
};

// ── 2. Fallback synthèse vocale navigateur (avec Promise de fin de parole) ────
const speakFallbackPromise = (text, lang = 'fr') => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve();
      window.speechSynthesis.cancel(); // Annule toute parole antérieure bloquée

      const isEn = lang === 'en';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEn ? 'en-US' : 'fr-FR';
      utterance.rate = 0.85; // Bien lent et posé
      utterance.pitch = 1.10; // Tonalité chaleureuse

      const voices = window.speechSynthesis.getVoices();
      let targetVoice = null;
      if (isEn) {
        targetVoice = voices.find(v =>
          (v.lang || '').toLowerCase().startsWith('en') &&
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural') ||
           v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria') ||
           v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('jenny'))
        ) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
      } else {
        targetVoice = voices.find(v =>
          (v.lang || '').toLowerCase().startsWith('fr') &&
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('femme') ||
           v.name.toLowerCase().includes('hortense') || v.name.toLowerCase().includes('julie') ||
           v.name.toLowerCase().includes('marie') || v.name.toLowerCase().includes('amelie') ||
           v.name.toLowerCase().includes('audrey') || v.name.toLowerCase().includes('siwis'))
        ) || voices.find(v =>
          v.localService === true && (v.lang || '').toLowerCase().startsWith('fr')
        ) || voices.find(v => (v.lang || '').toLowerCase().startsWith('fr'));
      }

      if (targetVoice) utterance.voice = targetVoice;

      let hasEnded = false;
      const finish = () => {
        if (!hasEnded) {
          hasEnded = true;
          resolve();
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;
      // Sécurité max 8s au cas où le navigateur n'émet pas onend
      setTimeout(finish, 8000);

      window.__cofina_speech = utterance;
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch (e) {
      console.warn('[TTS] Fallback speechSynthesis error:', e);
      resolve();
    }
  });
};

// ── 3. Lecture vocale WAV via Web Audio API (attend la fin exacte de lecture) ──
const playVoiceWav = (text, lang = 'fr') => {
  return new Promise(async (resolve) => {
    if (typeof window === 'undefined') return resolve();
    try {
      const url = `${getServerBase()}/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;
      const response = await fetch(url, { cache: 'no-store' });

      // Si le serveur répond 503 (moteur indisponible) → fallback navigateur
      if (!response.ok) {
        console.warn('[TTS] Serveur TTS indisponible (code', response.status, '), fallback navigateur');
        await speakFallbackPromise(text, lang);
        return resolve();
      }

      const arrayBuffer = await response.arrayBuffer();
      const ctx = getSharedAudioContext();
      if (!ctx) {
        await speakFallbackPromise(text, lang);
        return resolve();
      }

      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      // Décodage avec support Promise + Fallback Callback
      let audioBuffer;
      try {
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      } catch (err) {
        audioBuffer = await new Promise((res, rej) => {
          ctx.decodeAudioData(arrayBuffer, res, rej);
        });
      }

      if (!audioBuffer) {
        throw new Error('Buffer audio vide');
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      let finished = false;
      const onFinished = () => {
        if (!finished) {
          finished = true;
          try { source.disconnect(); } catch (_) {}
          resolve();
        }
      };

      source.onended = onFinished;
      source.start(0);
      
      // Sécurité maximale basée sur la durée réelle du buffer + 1s de marge
      const maxDurationMs = Math.ceil((audioBuffer.duration || 6) * 1000) + 1000;
      setTimeout(onFinished, maxDurationMs);

      console.log(`[TTS] ✅ Annonce vocale en cours (${audioBuffer.duration ? audioBuffer.duration.toFixed(1) : '?'}s)...`);
    } catch (e) {
      console.warn('[TTS] Fetch/Lecture /api/tts échoué:', e, '→ fallback navigateur');
      await speakFallbackPromise(text, lang);
      resolve();
    }
  });
};

// ── 4. File d'attente FIFO (Orchestration séquentielle stricte) ───────────────
// Empêche ABSOLUMENT deux annonces de se chevaucher ou de démarrer en même temps
const audioQueue = [];
let isQueueProcessing = false;
let lastAnnouncedTicketKey = '';
let lastAnnouncedTimestamp = 0;

const processAudioQueue = async () => {
  if (isQueueProcessing) return;
  if (audioQueue.length === 0) return;

  isQueueProcessing = true;

  while (audioQueue.length > 0) {
    const item = audioQueue.shift();
    try {
      console.log(`[AudioQueue] 📢 Démarrage annonce pour : ${item.ticketNumber || 'Ticket'}`);

      // Étape 1 : Jouer le carillon et ATTENDRE qu'il finisse complètement (~1.2s)
      if (item.includeChime !== false) {
        await playCallChime();
        // Petite pause d'attente naturelle après le bip (300ms)
        await new Promise(r => setTimeout(r, 300));
      }

      // Étape 2 : Jouer la voix TTS et ATTENDRE qu'elle ait TOTALEMENT fini de parler !
      await playVoiceWav(item.text, item.lang || 'fr');

      // Étape 3 : Pause de respiration de 600ms avant de permettre l'annonce du ticket suivant
      await new Promise(r => setTimeout(r, 600));

      console.log(`[AudioQueue] ✅ Annonce terminée avec succès pour : ${item.ticketNumber || 'Ticket'}`);
    } catch (err) {
      console.warn('[AudioQueue] Erreur dans la file d\'annonces:', err);
    }
  }

  isQueueProcessing = false;
};

// ── 5. Annonce de création de ticket (Borne tactile Kiosk) ───────────────────
export const speakTicketGenerated = (ticketNumber, lang = 'fr') => {
  try {
    const rawTicket = String(ticketNumber || '').trim();
    const formattedTicket = rawTicket
      .replace(/-/g, ' ')
      .replace(/([A-Za-z]+)(\d+)/g, '$1 $2');
    const isEn = lang === 'en';
    const text = isEn
      ? `Welcome to Cofina Togo. Your ticket, ${formattedTicket}, has been created. Please take a seat in the waiting room. Thank you.`
      : `Bienvenue chez Cofina Togo. Votre ticket, ${formattedTicket}, est bien créé. Merci de prendre place en salle d'attente.`;

    // Sur la borne, pas de carillon, voix uniquement dans la file séquentielle
    audioQueue.push({ text, ticketNumber: rawTicket, includeChime: false, lang });
    processAudioQueue();
  } catch (e) {
    console.warn('speakTicketGenerated error:', e);
  }
};

// ── 6. Annonce d'appel ticket sur l'Écran TV ─────────────────────────────────
export const speakTicketCall = (ticketNumber, counterNumber, lang = 'fr') => {
  try {
    const rawTicket = String(ticketNumber || '').trim();
    // Séparer lettres et chiffres : "D001" → "D, 0 0 1"
    const cleanNum = rawTicket.replace(/-/g, '');
    const letterPart = cleanNum.replace(/[0-9]/g, '');
    const digitPart = cleanNum.replace(/[^0-9]/g, '');
    const spacedDigits = digitPart.split('').join(' ');

    const isEn = lang === 'en';
    // Les virgules et points introduisent des micro-pauses pour une diction lente et solennelle
    const text = isEn
      ? `Ticket, ${letterPart}, ${spacedDigits}. Please proceed to counter ${counterNumber}. Thank you.`
      : `Ticket, ${letterPart}, ${spacedDigits}. Veuillez vous présenter à la caisse ${counterNumber}. Merci.`;

    // Anti-doublon / Anti-rebond (ex: déclenchement simultané WebSocket + Polling)
    const dedupKey = `${cleanNum}_${counterNumber}_${lang}`;
    const now = Date.now();
    if (dedupKey === lastAnnouncedTicketKey && (now - lastAnnouncedTimestamp) < 4000) {
      console.log(`[AudioQueue] ⏳ Doublon ${dedupKey} ignoré (${now - lastAnnouncedTimestamp}ms)`);
      return;
    }
    lastAnnouncedTicketKey = dedupKey;
    lastAnnouncedTimestamp = now;

    // Ne pas laisser s'accumuler plus de 3 annonces en attente si appel massif
    if (audioQueue.length >= 3) {
      audioQueue.shift();
    }

    audioQueue.push({ text, ticketNumber: rawTicket, counterNumber, includeChime: true, lang });
    processAudioQueue();
  } catch (e) {
    console.warn('speakTicketCall error:', e);
  }
};

// Conservé pour compatibilité
export const getAfricanOrBestVoice = (lang = 'fr') => null;
