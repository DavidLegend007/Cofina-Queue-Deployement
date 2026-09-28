export const generateESCPOSPayload = (ticket, agencyName = 'COFINA TOGO - KODJOVIAKOPÉ', lang = 'fr') => {
  const dateStr = new Date(ticket.createdAt || Date.now()).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
  const isEn = lang === 'en';
  return `
========================================
             COFINA TOGO                
    ${agencyName.toUpperCase()}
========================================
Date: ${dateStr}

      ${isEn ? 'YOUR QUEUE NUMBER:' : 'VOTRE NUMÉRO DE PASSAGE:'}

       ----------------------
            ${ticket.ticketNumber}
       ----------------------

Service : ${ticket.serviceName}
${ticket.priority ? (isEn ? '★ PRIORITY ACCESS ★\n' : '★ ACCÈS PRIORITAIRE ★\n') : ''}
----------------------------------------
       [ ${isEn ? 'SCAN YOUR QR CODE' : 'SCANNER VOTRE QR CODE'} ]
        [ ${typeof window !== 'undefined' ? `${window.location.origin}/?ticket=${ticket.ticketNumber}` : `/?ticket=${ticket.ticketNumber}`} ]
----------------------------------------
${isEn ? 'Welcome! Please take a seat in the waiting room.\nYour number will be called on the TV screen.' : 'Bienvenue ! Prenez place en salle d\'attente.\nVotre numéro sera annoncé à l\'écran TV.'}
========================================
\x1DV\x41\x00`; // Cut paper ESC/POS command
};
