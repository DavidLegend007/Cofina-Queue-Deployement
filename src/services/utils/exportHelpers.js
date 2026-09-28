export const exportAgencyDataCSV = (tickets, agencyName) => {
  if (!tickets || tickets.length === 0) return;
  
  const headers = ["ID Ticket", "Numéro", "Code Service", "Nom Service", "Prioritaire", "Statut", "Caisse", "Caissier", "Créé Le", "Appelé Le", "Début Traitement", "Terminé Le", "Attente (min)", "Traitement (min)"];
  const rows = tickets.map(t => {
    const waitMin = (t.calledAt && t.createdAt) 
      ? Math.round(((new Date(t.calledAt) - new Date(t.createdAt)) / 1000) / 60) 
      : "-";
    const startRef = t.startedAt || t.calledAt;
    const serviceMin = (t.completedAt && startRef) 
      ? Math.round(((new Date(t.completedAt) - new Date(startRef)) / 1000) / 60) 
      : "-";

    return [
      t.id,
      t.ticketNumber,
      t.serviceCode,
      `"${t.serviceName}"`,
      t.priority ? "Oui" : "Non",
      t.status,
      t.counterNumber || "-",
      `"${t.agentName || "-"}"`,
      t.createdAt || "-",
      t.calledAt || "-",
      t.startedAt || "-",
      t.completedAt || "-",
      waitMin,
      serviceMin
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cofina_togo_export_${agencyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
