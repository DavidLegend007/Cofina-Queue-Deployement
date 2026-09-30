export const playCallChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Tone 1: High chime
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

    // Tone 2: Warm resolve chime
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

    // Clean up Web Audio Context after playback to prevent memory leaks
    setTimeout(() => {
      try { ctx.close(); } catch (_) {}
    }, 1400);

  } catch (e) {
    console.warn('Audio chime playback omitted:', e);
  }
};

export const getAfricanOrBestVoice = (targetLang = 'fr') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isFr = targetLang.startsWith('fr');

  if (isFr) {
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

    const preferredWarmVoice = voices.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.startsWith('fr') && (
        n.includes('google') || n.includes('natural') || n.includes('hortense') || 
        n.includes('julie') || n.includes('celine') || n.includes('online')
      );
    });
    if (preferredWarmVoice) return preferredWarmVoice;

    const anyFrVoice = voices.find(v => v.lang.toLowerCase().startsWith('fr'));
    if (anyFrVoice) return anyFrVoice;
  }

  return voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) || null;
};

export const speakTicketGenerated = (ticketNumber, lang = 'fr') => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const formattedTicket = ticketNumber.split('-').map((part, i) => i === 1 ? part.split('').join(' ') : part).join(' ');
    const isEn = lang === 'en';
    const text = isEn 
      ? `Welcome to Cofina Togo. Your ticket ${formattedTicket} has been created. Please take a seat in the waiting room.`
      : `Bienvenue à l'agence Cofina Togo ! Votre ticket numéro ${formattedTicket} est bien créé. Merci de prendre place en salle d'attente.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    const matchedVoice = getAfricanOrBestVoice(isEn ? 'en' : 'fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 200);
  } catch (e) {
    console.warn('Speech synthesis TEMPS 1 error:', e);
  }
};

let pendingSpeakTimeout = null;
let currentSafetyTimer = null;

export const speakTicketCall = (ticketNumber, counterNumber, lang = 'fr', onEndCallback = null) => {
  let finished = false;

  if (pendingSpeakTimeout) {
    clearTimeout(pendingSpeakTimeout);
    pendingSpeakTimeout = null;
  }
  if (currentSafetyTimer) {
    clearTimeout(currentSafetyTimer);
    currentSafetyTimer = null;
  }

  const triggerEnd = () => {
    if (finished) return;
    finished = true;
    if (currentSafetyTimer) {
      clearTimeout(currentSafetyTimer);
      currentSafetyTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ticket_voice_ended', { 
        detail: { ticketNumber, counterNumber } 
      }));
    }
    if (typeof onEndCallback === 'function') {
      try {
        onEndCallback();
      } catch (err) {
        console.error('Error in speakTicketCall callback:', err);
      }
    }
  };

  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      triggerEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const formattedTicket = ticketNumber ? ticketNumber.split('-').map((part, i) => i === 1 ? part.split('').join(' ') : part).join(' ') : '';
    const isEn = lang === 'en';
    const text = isEn 
      ? `Ticket ${formattedTicket}, please proceed to Counter ${counterNumber}.`
      : `Ticket ${formattedTicket}... Veuillez vous présenter au Guichet ${counterNumber}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEn ? 'en-US' : 'fr-FR';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      triggerEnd();
    };

    utterance.onerror = (e) => {
      // Les événements 'interrupted' ou 'canceled' surviennent normalement quand un appel est remplacé
      if (e && (e.error === 'interrupted' || e.error === 'canceled')) {
        return;
      }
      triggerEnd();
    };

    const matchedVoice = getAfricanOrBestVoice(isEn ? 'en' : 'fr');
    if (matchedVoice) utterance.voice = matchedVoice;

    // Délai de sécurité : si la voix est muette ou bloquée, débloquer après 5.5s
    currentSafetyTimer = setTimeout(() => {
      triggerEnd();
    }, 5500);

    pendingSpeakTimeout = setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        triggerEnd();
      }
    }, 450);
  } catch (e) {
    triggerEnd();
  }
};


