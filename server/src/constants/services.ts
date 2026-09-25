export const SERVICE_DEFINITIONS = {
  D:   { name: 'Dépôt Espèces', category: 'CASH' },
  R:   { name: 'Retrait Espèces', category: 'CASH' },
  TN:  { name: 'Transfert National', category: 'TRANSFER' },
  TI:  { name: 'Transfert International', category: 'TRANSFER' },
  O:   { name: 'Ouverture de Compte', category: 'CUSTOMER_SERVICE' },
  RC:  { name: 'Réclamation & SAV', category: 'CUSTOMER_SERVICE' },
  V:   { name: 'Virement & Opérations', category: 'OPERATIONS' },
  DR:  { name: 'Demande de Relevé', category: 'CUSTOMER_SERVICE' },
  CM:  { name: 'Conseil & Microfinance', category: 'ADVISING' },
  C:   { name: 'Crédit & Prêt', category: 'CREDIT' },
  PC:  { name: 'Paiement Chèque', category: 'OPERATIONS' },
  PMR: { name: 'Priorité PMR / Femmes Enceintes', category: 'PRIORITY' }
} as const;

export type ServiceCode = keyof typeof SERVICE_DEFINITIONS;
export const ALL_SERVICE_CODES = Object.keys(SERVICE_DEFINITIONS) as ServiceCode[];
