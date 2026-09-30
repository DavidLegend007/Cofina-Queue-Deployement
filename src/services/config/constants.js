export const STORAGE_KEY = 'cofina_queue_v1_store_togo';
export const CHANNEL_NAME = 'cofina_queue_sync_v1_togo';
export const AGENT_PROFILES_KEY = 'cofina_agent_profiles_v1_togo';

export const COFINA_AGENCIES = [
  { id: 'AGC-01', name: 'Agence Siège Cofina Togo (Kodjoviakopé)', city: 'Kodjoviakopé', address: 'Rue de la Paix, Kodjoviakopé' },
  { id: 'AGC-02', name: 'Agence COFINA Agoè Assiyéyé', city: 'Lomé', address: 'Carrefour Agoè Assiyéyé' },
  { id: 'AGC-03', name: 'Agence COFINA Adidogomé', city: 'Lomé', address: 'Route de Kpalimé, Adidogomé' },
  { id: 'AGC-04', name: 'Agence COFINA Akodessewa', city: 'Lomé', address: 'Zone Portuaire, Akodessewa' }
];

export const COFINA_SERVICES = [
  { code: 'D', name: 'Dépôt', description: 'Versements', color: '#D3122A', avgTimeMin: 3, icon: 'Banknote', badge: 'Dépôt' },
  { code: 'R', name: 'Retrait', description: 'Retraits caisse', color: '#F97316', avgTimeMin: 3, icon: 'Wallet', badge: 'Retrait' },
  { code: 'TN', name: 'Transfert national', description: 'Envoi/Réception', color: '#2563EB', avgTimeMin: 5, icon: 'Send', badge: 'Transfert' },
  { code: 'TI', name: 'Transfert international', description: 'Envoi/Réception', color: '#06B6D4', avgTimeMin: 8, icon: 'Globe', badge: 'Transfert' },
  { code: 'O', name: 'Ouverture de compte', description: 'Nouveaux comptes', color: '#10B981', avgTimeMin: 15, icon: 'UserPlus', badge: 'Compte' },
  { code: 'RC', name: 'Remise de chèque', description: 'Dépôt chèque', color: '#D97706', avgTimeMin: 4, icon: 'FileCheck', badge: 'Chèque' },
  { code: 'V', name: 'Virement', description: 'Virement bancaire', color: '#8B5CF6', avgTimeMin: 5, icon: 'ArrowRightLeft', badge: 'Virement' },
  { code: 'DR', name: 'Demande de Relevé', description: 'Relevé de compte', color: '#EC4899', avgTimeMin: 3, icon: 'FileText', badge: 'Relevé' },
  { code: 'CM', name: 'COFINA Mobile+', description: 'Assistance mobile', color: '#D3122A', avgTimeMin: 5, icon: 'Smartphone', badge: 'Digital' },
  { code: 'C', name: 'Crédit', description: 'Demande de prêt', color: '#F59E0B', avgTimeMin: 20, icon: 'CreditCard', badge: 'Crédit' },
  { code: 'PC', name: 'Parler à un conseiller', description: 'Assistance client', color: '#3B82F6', avgTimeMin: 15, icon: 'Headphones', badge: 'Conseil' },
  { code: 'PMR', name: 'Mobilité Réduite', description: 'Accès prioritaire', color: '#10B981', avgTimeMin: 5, icon: 'Accessibility', badge: 'Priorité', isPriority: true }
];

// 6 POSTES PHYSIQUES COFINA : 3 Caisses, 2 Opérateurs, 1 Accueil
export const INITIAL_AGENTS = [
  { id: 'AGT-01', name: 'Mensah Koffi', defaultCounter: 1, avatar: '👨🏽‍💼', title: 'Caissier 1 (Espèces)' },
  { id: 'AGT-02', name: 'Amégadjie Afiwa', defaultCounter: 2, avatar: '👩🏽‍💼', title: 'Caissière 2 (Espèces)' },
  { id: 'AGT-03', name: 'Lawani Komlan', defaultCounter: 3, avatar: '👨🏿‍💼', title: 'Caissier 3 (Chèques & Opérations)' },
  { id: 'AGT-04', name: 'Adzoh Kodjo', defaultCounter: 4, avatar: '👨🏽‍💼', title: 'Opérateur 1 (Comptes & Crédits)' },
  { id: 'AGT-05', name: 'Kouassi Mawunyo', defaultCounter: 5, avatar: '👩🏽‍💼', title: 'Opératrice 2 (Conseil & Microfinance)' },
  { id: 'AGT-06', name: 'Abalo Essivi', defaultCounter: 6, avatar: '👩🏽‍💼', title: 'Accueil & Orientation' }
];

export const SERVER_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : 'http://localhost:4000';
