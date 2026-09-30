import { describe, it, expect } from 'vitest';

describe('Suite de tests API & Sécurité Cofina Queue Edge', () => {
  const API_URL = 'http://localhost:4000';

  it('GET /health doit renvoyer un statut 200 et UP avec l\'agence de Kodjoviakopé', async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('UP');
    expect(body.agency).toContain('Kodjoviakopé');
    expect(body.agencyCode).toBe('AGC-01');
  });

  it('POST /api/auth/login doit rejeter les mauvais mots de passe avec 401', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN', password: 'wrongpassword' })
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login doit rejeter les requêtes sans mot de passe (Fail-Safe)', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'AGENT', username: 'agent' })
    });
    expect(res.status).toBe(400); // Validation Zod échoue : password obligatoire
  });

  it('POST /api/tickets/call-next sans token JWT doit être rejeté avec 401 (P0.1 Bypass résolu)', async () => {
    const res = await fetch(`${API_URL}/api/tickets/call-next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'AGT-01',
        agentName: 'Mensah Koffi',
        counterNumber: 1
      })
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Jeton d\'authentification manquant');
  });

  it('GET /api/reload-clients sans token JWT doit être rejeté avec 401 (P1.2 DoS résolu)', async () => {
    const res = await fetch(`${API_URL}/api/reload-clients`);
    expect(res.status).toBe(401);
  });
});
