/**
 * GROUPE COFINA TOGO — DICTIONNAIRE MULTILINGUE (FR / EN)
 * i18n System for Cofina Queue Management System
 */

export const translations = {
  fr: {
    // Brand & System
    brandName: "COFINA QUEUE",
    brandSub: "Système de File d'Attente",
    edgeStatus: "Serveur Edge OK",
    demoAgencyLabel: "AGENCE DÉMONSTRATION",
    testAudio: "Test Audio",
    soundActive: "Audio Actif",
    soundMuted: "Audio Muet",

    // Nav Tabs
    navKiosk: "Borne Tactile",
    navDisplay: "Écran TV Public",
    navAgent: "Poste Agent",
    navAdmin: "Supervision",
    navWidget: "Widget Flottant",
    badgeClient: "Client",
    badgeAccueil: "Accueil",
    badgeGuichet: "Guichet",
    badgeEdge: "Edge Local",
    badgeMini: "Mini-Overlay",

    // Services (12 Services Officiels COFINA Togo)
    service_D_name: "Dépôt",
    service_R_name: "Retrait",
    service_TN_name: "Transfert national",
    service_TI_name: "Transfert international",
    service_O_name: "Ouverture de compte",
    service_RC_name: "Remise de chèque",
    service_V_name: "Virement",
    service_DR_name: "Demande de Relevé",
    service_CM_name: "COFINA Mobile+",
    service_C_name: "Crédit",
    service_PC_name: "Parler à un conseiller",
    service_PMR_name: "Mobilité Réduite",

    // Kiosk Module
    kioskTitle: "BIENVENUE A COFINA Togo",
    kioskSubtitle: "Institution Panafricaine de la Finance Inclusive.\nVeuillez sélectionner votre opération",
    kioskSelectService: "Sélectionnez votre Service",
    kioskPriorityNotice: "Accès Prioritaire disponible pour femmes commerçantes, personnes âgées et VIP.",
    kioskTicketGenerated: "TICKET GÉNÉRÉ AVEC SUCCÈS !",
    kioskTicketNumber: "VOTRE NUMÉRO :",
    kioskPleaseWait: "Veuillez prendre place dans la salle d'attente.",
    kioskAutoReset: "Réinitialisation automatique dans",
    kioskSeconds: "secondes",
    kioskPrintSimulated: "Impression Thermique 80mm ESC/POS activée",
    kioskCloseModal: "Fermer & Prendre le Ticket",
    kioskPhoneOptional: "N° Téléphone (Optionnel pour SMS / Notification)",
    kioskPhonePlaceholder: "ex: 90 12 34 56",
    kioskGenerating: "Génération en cours...",
    kioskTakeTicket: "Retirez votre ticket ci-dessous :",
    kioskHelpTitle: "Assistance & Orientation Client",
    kioskHelpBody: "Veuillez vous adresser directement à l'un de nos agents d'accueil présents dans le hall pour vous guider et vous assister dans vos démarches. Vous pouvez également contacter notre Assistance au 92686060.",

    // Display Module
    displayTitle: "SALLE D'ATTENTE — SUIVI DES GUICHETS",
    displaySubtitle: "Veuillez surveiller l'écran et vous présenter au guichet indiqué dès l'appel de votre numéro.",
    displayNowCalling: "DERNIER TICKET APPELÉ",
    displayGoToCounter: "VEUILLEZ VOUS PRÉSENTER À LA",
    displayCounter: "CAISSE",
    displayQueueTitle: "ÉTAT DES GUICHETS EN DIRECT",
    displayCounterCol: "Guichet / Caisse",
    displayAgentCol: "Caissier en Service",
    displayTicketCol: "Ticket en cours",
    displayStatusCol: "Statut",
    displayStatusCalled: "EN COURS D'APPEL",
    displayStatusServing: "EN CLIENTÈLE",
    displayStatusAvailable: "DISPONIBLE",
    displayWaitingQueue: "Prochains tickets en attente",
    displayNoWaiting: "Aucun ticket en attente",

    // Agent Module
    agentTitle: "Station de Travail Caissier",
    agentSubtitle: "Gérez l'appel et le traitement des clients à votre guichet.",
    agentSelectTeller: "Sélectionner le Caissier :",
    agentSelectCounter: "Guichet Affecté :",
    agentCounterLabel: "CAISSE",
    agentServiceFilter: "Filtre de Service :",
    agentFilterAll: "Tous les Services",
    agentCurrentServing: "CLIENT ACTUELLEMENT EN CHARGE",
    agentNoActiveTicket: "Aucun client en cours de traitement à cette caisse",
    agentClickCallNext: "Cliquer sur 'Appeler Client Suivant' pour débuter",
    agentTimerLabel: "DURÉE EN CHARGE",
    agentBtnCallNext: "Appeler Suivant",
    agentBtnRecall: "Rappeler le Client",
    agentBtnNoShow: "Client Absent (No-Show)",
    agentBtnComplete: "Terminer la Transaction",
    agentQueueListTitle: "FILE D'ATTENTE DE L'AGENCE",
    agentWaitingCount: "client(s) en attente",
    agentPriorityBadge: "PRIORITAIRE",
    agentOpenWidgetBtn: "Mode Widget Flottant Overlay",
    agentWidgetNotice: "Le widget flottant vous permet de contrôler la file tout en restant dans votre logiciel de compte bancaire !",

    // Floating Teller Widget
    widgetTitle: "COFINA TELLER WIDGET",
    widgetSubtitle: "Superposition Caissier",
    widgetMinimisedLabel: "Caisse",
    widgetWaitingBadge: "en attente",
    widgetActiveTicket: "TICKET EN COURS",
    widgetNoTicket: "Pas de ticket actif",
    widgetBtnNext: "Suivant",
    widgetBtnRecall: "Rappeler",
    widgetBtnNoShow: "Absent",
    widgetBtnComplete: "Terminer",
    widgetSimulateBankingApp: "Simuler Logiciel Bancaire (Amplitude / Delta)",
    widgetExitBankingApp: "Quitter Mode Simulation",
    widgetBankingSoftwareTitle: "SYSTÈME BANCAIRE CORE (AMPLITUDE CORE BANKING V6.4)",
    widgetBankingAccountInput: "N° Compte Client Cofina :",
    widgetBankingAccountSearch: "Rechercher Solde / Opération",
    widgetBankingOverlayDesc: "Le widget Cofina reste superposé par-dessus votre logiciel métier pour un travail fluide.",

    // Admin / Supervision
    adminTitle: "Console de Gestion & Supervision",
    adminSubtitle: "Panneau réservé aux chefs d'agence & supervision • Serveur Edge Autonome",
    adminKpiTotal: "Total Tickets Jour",
    adminKpiWaiting: "En Attente",
    adminKpiServing: "En cours aux Caisses",
    adminKpiCompleted: "Clients Servis",
    adminKpiAvgWait: "Temps Moyen d'Attente",
    adminBtnSimulate: "Simuler Trafic (+4)",
    adminBtnReset: "Réinitialiser la Journée",
    adminCsvExport: "Exporter Données CSV (Agence)",
    adminCsvDesc: "Téléchargez le journal complet des tickets de la journée pour archivage local.",
    adminServicesBreakdown: "Répartition par Service",
    adminRecentTickets: "Journal des Derniers Tickets",
    adminResetConfirm: "Voulez-vous vraiment réinitialiser la file d'attente de la journée ?",

    // Profile Page
    profileTitle: "Profil & Performance Caissier",
    profileSubtitle: "Visualisez et modifiez vos informations personnelles et consultez vos statistiques.",
    profileEditTitle: "Édition du Profil",
    profileName: "Nom & Prénom",
    profileTitleRole: "Titre / Rôle",
    profileDefaultCounter: "Guichet par Défaut",
    profileAvatar: "Avatar / Émoji",
    profileSaveBtn: "Enregistrer les modifications",
    profileBadgeTitle: "Badges de Performance",
    profileBadgeFast: "Ultra Rapide",
    profileBadgeEfficient: "Performant",
    profileBadgeSenior: "Senior Caisse",
    profileBadgeExcellence: "Service Excellence",

    // Audio Speech Synthesis Text
    speechGenerated: (ticketNumber) => {
      const formatted = ticketNumber.replace('-', ' ');
      return `Bienvenue chez Cofina Togo. Votre ticket ${formatted} est créé. Vous pouvez prendre place dans la salle d'attente.`;
    },
    speechCall: (ticketNumber, counterNumber) => {
      const formatted = ticketNumber.replace('-', ' ');
      return `Ticket ${formatted}, veuillez passer à la Caisse ${counterNumber}.`;
    }
  },

  en: {
    // Brand & System
    brandName: "COFINA QUEUE",
    brandSub: "Queue Management System",
    edgeStatus: "Edge Server OK",
    demoAgencyLabel: "DEMONSTRATION AGENCY",
    testAudio: "Audio Test",
    soundActive: "Audio Active",
    soundMuted: "Audio Muted",

    // Nav Tabs
    navKiosk: "Kiosk Touchscreen",
    navDisplay: "Public TV Screen",
    navAgent: "Teller Workstation",
    navAdmin: "Supervision",
    navWidget: "Floating Widget",
    badgeClient: "Customer",
    badgeAccueil: "Reception",
    badgeGuichet: "Counter",
    badgeEdge: "Local Edge",
    badgeMini: "Mini-Overlay",

    // Services (12 Official COFINA Togo Services)
    service_D_name: "Deposit",
    service_R_name: "Withdrawal",
    service_TN_name: "National Transfer",
    service_TI_name: "International Transfer",
    service_O_name: "Account Opening",
    service_RC_name: "Check Deposit",
    service_V_name: "Wire Transfer",
    service_DR_name: "Account Statement Request",
    service_CM_name: "COFINA Mobile+",
    service_C_name: "Credit & Loan",
    service_PC_name: "Speak with an Advisor",
    service_PMR_name: "Reduced Mobility",

    // Kiosk Module
    kioskTitle: "WELCOME TO COFINA Togo",
    kioskSubtitle: "Pan-African Institution of Inclusive Finance.\nPlease select your operation",
    kioskSelectService: "Select Your Service",
    kioskPriorityNotice: "Priority access available for market women, senior citizens, and VIPs.",
    kioskTicketGenerated: "TICKET GENERATED SUCCESSFULLY!",
    kioskTicketNumber: "YOUR TICKET NUMBER:",
    kioskPleaseWait: "Please take a seat in the waiting area.",
    kioskAutoReset: "Automatic reset in",
    kioskSeconds: "seconds",
    kioskPrintSimulated: "ESC/POS 80mm Thermal Printing enabled",
    kioskCloseModal: "Close & Collect Ticket",
    kioskPhoneOptional: "Phone Number (Optional for SMS / Alert)",
    kioskPhonePlaceholder: "e.g. 90 12 34 56",
    kioskGenerating: "Generating...",
    kioskTakeTicket: "Collect your ticket below:",
    kioskHelpTitle: "Customer Support & Guidance",
    kioskHelpBody: "Please speak directly with one of our welcoming agents available in the lobby to guide and assist you with your request. You can also contact our Support line at 92686060.",

    // Display Module
    displayTitle: "WAITING ROOM — COUNTER DISPLAY",
    displaySubtitle: "Please watch the screen and proceed to the indicated counter as soon as your number is called.",
    displayNowCalling: "CURRENTLY CALLED TICKET",
    displayGoToCounter: "PLEASE PROCEED TO",
    displayCounter: "COUNTER",
    displayQueueTitle: "LIVE COUNTER STATUS",
    displayCounterCol: "Counter / Guichet",
    displayAgentCol: "Teller On Duty",
    displayTicketCol: "Active Ticket",
    displayStatusCol: "Status",
    displayStatusCalled: "NOW CALLING",
    displayStatusServing: "SERVICING CUSTOMER",
    displayStatusAvailable: "AVAILABLE",
    displayWaitingQueue: "Next Waiting Tickets",
    displayNoWaiting: "No tickets in queue",

    // Agent Module
    agentTitle: "Teller Workstation",
    agentSubtitle: "Manage customer calls and servicing at your counter.",
    agentSelectTeller: "Select Teller:",
    agentSelectCounter: "Assigned Counter:",
    agentCounterLabel: "COUNTER",
    agentServiceFilter: "Service Filter:",
    agentFilterAll: "All Services",
    agentCurrentServing: "CURRENTLY SERVICING CUSTOMER",
    agentNoActiveTicket: "No customer currently in service at this counter",
    agentClickCallNext: "Click 'Call Next Customer' to begin",
    agentTimerLabel: "SERVICE DURATION",
    agentBtnCallNext: "Call Next",
    agentBtnRecall: "Recall Customer",
    agentBtnNoShow: "No-Show Customer",
    agentBtnComplete: "Complete Transaction",
    agentQueueListTitle: "AGENCY QUEUE LIST",
    agentWaitingCount: "customer(s) waiting",
    agentPriorityBadge: "PRIORITY",
    agentOpenWidgetBtn: "Floating Overlay Widget Mode",
    agentWidgetNotice: "The floating widget lets you control the queue while remaining in your core banking software!",

    // Floating Teller Widget
    widgetTitle: "COFINA TELLER WIDGET",
    widgetSubtitle: "Teller Overlay",
    widgetMinimisedLabel: "Counter",
    widgetWaitingBadge: "waiting",
    widgetActiveTicket: "ACTIVE TICKET",
    widgetNoTicket: "No active ticket",
    widgetBtnNext: "Call Next",
    widgetBtnRecall: "Recall",
    widgetBtnNoShow: "No-Show",
    widgetBtnComplete: "Finish",
    widgetSimulateBankingApp: "Simulate Banking Software (Amplitude / Delta)",
    widgetExitBankingApp: "Exit Simulation Mode",
    widgetBankingSoftwareTitle: "CORE BANKING SYSTEM (AMPLITUDE CORE BANKING V6.4)",
    widgetBankingAccountInput: "Customer Account N°:",
    widgetBankingAccountSearch: "Search Balance / Operation",
    widgetBankingOverlayDesc: "The Cofina widget remains overlayed on top of your banking software for seamless workflow.",

    // Admin / Supervision
    adminTitle: "Management & Supervision Console",
    adminSubtitle: "Panel reserved for branch managers & supervisors • Autonomous Edge Server",
    adminKpiTotal: "Total Daily Tickets",
    adminKpiWaiting: "Waiting",
    adminKpiServing: "In Service at Counters",
    adminKpiCompleted: "Customers Serviced",
    adminKpiAvgWait: "Average Waiting Time",
    adminBtnSimulate: "Simulate Traffic (+4)",
    adminBtnReset: "Reset Day Queue",
    adminCsvExport: "Export CSV Data (Agency)",
    adminCsvDesc: "Download complete ticket logs for local archiving.",
    adminServicesBreakdown: "Service Breakdown",
    adminRecentTickets: "Recent Tickets Log",
    adminResetConfirm: "Are you sure you want to reset today's queue?",

    // Profile Page
    profileTitle: "Teller Profile & Performance",
    profileSubtitle: "View and edit your personal information and check your stats.",
    profileEditTitle: "Edit Profile",
    profileName: "Full Name",
    profileTitleRole: "Title / Role",
    profileDefaultCounter: "Default Counter",
    profileAvatar: "Avatar / Emoji",
    profileSaveBtn: "Save Changes",
    profileBadgeTitle: "Performance Badges",
    profileBadgeFast: "Ultra Fast",
    profileBadgeEfficient: "Efficient",
    profileBadgeSenior: "Senior Teller",
    profileBadgeExcellence: "Excellence Service",

    // Audio Speech Synthesis Text
    speechGenerated: (ticketNumber) => {
      const formatted = ticketNumber.replace('-', ' ');
      return `Welcome to Cofina Togo. Your ticket ${formatted} has been created. Please take a seat in the waiting area.`;
    },
    speechCall: (ticketNumber, counterNumber) => {
      const formatted = ticketNumber.replace('-', ' ');
      return `Ticket ${formatted}, please proceed to Counter ${counterNumber}.`;
    }
  }
};
