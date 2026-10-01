export const generateESCPOSPayload = (ticket, agencyName = 'COFINA TOGO', lang = 'fr') => {
  const now = new Date(ticket.createdAt || Date.now());
  const dateStr = now.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR');
  const timeStr = now.toLocaleTimeString(lang === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  const isEn = lang === 'en';

  return `================================
      COFINA TOGO - AGENCE
================================
${dateStr}         ${timeStr}
--------------------------------
${isEn ? 'YOUR QUEUE NUMBER:' : 'VOTRE NUMÉRO :'}

       *** ${ticket.ticketNumber} ***

Service : ${ticket.serviceName}
${ticket.priority ? (isEn ? '>> PRIORITY ACCESS <<\n' : '>> ACCÈS PRIORITAIRE <<\n') : ''}--------------------------------
${isEn ? 'Please wait, your number\nwill be called on screen.' : 'Merci de patienter.\nVotre numéro sera appelé.'}
\x1DV\x41\x00`;
};
