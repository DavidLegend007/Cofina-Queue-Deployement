export const generateESCPOSPayload = (ticket, agencyName = 'COFINA TOGO - KODJOVIAKOPÉ', lang = 'fr') => {
  const dateStr = new Date(ticket.createdAt || Date.now()).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
  const isEn = lang === 'en';
  return `
================================
          COFINA TOGO           
   ${agencyName.toUpperCase()}
================================
Date: ${dateStr}

  ${isEn ? 'YOUR QUEUE NUMBER:' : 'VOTRE NUMÉRO DE PASSAGE:'}

       ------------------
            ${ticket.ticketNumber}
       ------------------

Service : ${ticket.serviceName}
${ticket.priority ? (isEn ? '★ PRIORITY ACCESS ★\n' : '★ ACCÈS PRIORITAIRE ★\n') : ''}--------------------------------
    [ ${isEn ? 'SCAN QR CODE' : 'SCANNER QR CODE'} ]
 [ ${typeof window !== 'undefined' ? `${window.location.origin}/?ticket=${ticket.ticketNumber}` : `/?ticket=${ticket.ticketNumber}`} ]
--------------------------------
${isEn ? 'Please take a seat.\nNumber called on TV screen.' : 'Prenez place en salle d\'attente.\nNuméro annoncé sur écran TV.'}
================================
\x1DV\x41\x00`; // Cut paper ESC/POS command
};
