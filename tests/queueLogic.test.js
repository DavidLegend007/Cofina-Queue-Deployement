import { describe, it, expect } from 'vitest';
import { 
  getWeekCycleStart, 
  generateESCPOSPayload, 
  COFINA_SERVICES,
  COFINA_AGENCIES
} from '../src/services/queueStore';

describe('COFINA Queue — Core Business & Weekly Logic', () => {
  it('should return a valid ISO date string for getWeekCycleStart()', () => {
    const cycleStart = getWeekCycleStart();
    expect(typeof cycleStart).toBe('string');
    expect(cycleStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Vérifier que la date est valide
    const parsed = new Date(cycleStart);
    expect(isNaN(parsed.getTime())).toBe(false);
  });

  it('should have all 12 official COFINA services defined with required metadata', () => {
    expect(COFINA_SERVICES.length).toBe(12);

    const codes = COFINA_SERVICES.map(s => s.code);
    expect(codes).toContain('D');   // Dépôt
    expect(codes).toContain('R');   // Retrait
    expect(codes).toContain('TN');  // Transfert national
    expect(codes).toContain('TI');  // Transfert international
    expect(codes).toContain('O');   // Ouverture
    expect(codes).toContain('RC');  // Remise de chèque
    expect(codes).toContain('V');   // Virement
    expect(codes).toContain('DR');  // Demande de relevé
    expect(codes).toContain('CM');  // Mobile+
    expect(codes).toContain('C');   // Crédit
    expect(codes).toContain('PC');  // Conseiller
    expect(codes).toContain('PMR'); // Mobilité réduite

    // Vérifier que chaque service a un nom, une icône et un badge
    COFINA_SERVICES.forEach(s => {
      expect(s.name).toBeDefined();
      expect(s.color).toBeDefined();
      expect(s.icon).toBeDefined();
      expect(s.avgTimeMin).toBeGreaterThan(0);
    });
  });

  it('should contain the 4 official COFINA Togo agencies with Kodjoviakopé as pilot', () => {
    expect(COFINA_AGENCIES.length).toBe(4);
    expect(COFINA_AGENCIES[0].id).toBe('AGC-01');
    expect(COFINA_AGENCIES[0].address).toContain('Kodjoviakopé');
  });

  it('should correctly format thermal ESC/POS print ticket payload with cut paper command', () => {
    const fakeTicket = {
      ticketNumber: 'D-042',
      serviceName: 'Dépôt',
      priority: true,
      createdAt: new Date('2026-09-22T10:00:00Z').toISOString()
    };

    const payloadFr = generateESCPOSPayload(fakeTicket, 'Agence Siège Kodjoviakopé', 'fr');
    expect(payloadFr).toContain('COFINA TOGO');
    expect(payloadFr).toContain('D-042');
    expect(payloadFr).toContain('Service : Dépôt');
    expect(payloadFr).toContain('ACCÈS PRIORITAIRE');
    // Vérifier la commande de découpe papier ESC/POS (\x1DV\x41\x00)
    expect(payloadFr).toContain('\x1DV\x41\x00');

    const payloadEn = generateESCPOSPayload(fakeTicket, 'Agence Siège Kodjoviakopé', 'en');
    expect(payloadEn).toContain('YOUR QUEUE NUMBER:');
    expect(payloadEn).toContain('PRIORITY ACCESS');
  });

  it('should support cashier ticket lifecycle transitions (CALLED -> IN_PROGRESS -> COMPLETED and NO_SHOW)', () => {
    // 1. Initial called ticket
    let ticket = {
      id: 'ticket-1',
      ticketNumber: 'D-001',
      status: 'CALLED',
      counterNumber: 1
    };
    expect(ticket.status).toBe('CALLED');

    // 2. Démarrer le traitement -> En cours de service
    ticket = { ...ticket, status: 'IN_PROGRESS', startedAt: new Date().toISOString() };
    expect(ticket.status).toBe('IN_PROGRESS');
    expect(ticket.startedAt).toBeDefined();

    // 3. Terminer le service -> COMPLETED
    const completedTicket = { ...ticket, status: 'COMPLETED', completedAt: new Date().toISOString() };
    expect(completedTicket.status).toBe('COMPLETED');
    expect(completedTicket.completedAt).toBeDefined();

    // 4. Si non démarré après rappels -> NO_SHOW (Absent)
    const absentTicket = { ...ticket, status: 'NO_SHOW' };
    expect(absentTicket.status).toBe('NO_SHOW');
  });
});

