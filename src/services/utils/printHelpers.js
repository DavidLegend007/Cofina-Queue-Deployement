export const generateESCPOSPayload = (ticket, agencyName = 'COFINA TOGO', lang = 'fr') => {
  const now = new Date(ticket.createdAt || Date.now());
  const dateStr = now.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR');
  const timeStr = now.toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  const isEn = lang === 'en';

  // URL raccourcie pour tenir sur 58mm (32 chars max par ligne)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const ticketUrl = `${origin}/?ticket=${ticket.ticketNumber}`;
  // Couper l'URL en 2 lignes si elle dépasse 30 chars
  const urlLines = ticketUrl.length > 30
    ? [ticketUrl.slice(0, 30), ticketUrl.slice(30)]
    : [ticketUrl];

  return `================================
      COFINA TOGO - AGENCE
================================
${dateStr}         ${timeStr}
--------------------------------
 ${isEn ? 'YOUR NUMBER:' : 'VOTRE NUMÉRO :'}

       *** ${ticket.ticketNumber} ***

${ticket.serviceName}
${ticket.priority ? (isEn ? '>> PRIORITAIRE <<\n' : '>> PRIORITAIRE <<\n') : ''}--------------------------------
${urlLines.join('\n')}
================================
${isEn ? 'Please wait, your number\nwill be called on screen.' : 'Merci de patienter.\nVotre numéro sera appelé.'}\n\n\n
\x1DV\x41\x00`;
};
