import { describe, it, expect } from 'vitest';

describe('Suite de tests API Cofina Queue Edge', () => {
  const API_URL = 'http://localhost:4000';

  it('GET /health doit renvoyer un statut 200 et UP', async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('UP');
    expect(body.agency).toBeDefined();
  });

  it('POST /api/auth/login doit rejeter les mauvais mots de passe', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN', password: 'wrongpassword' })
    });
    expect(res.status).toBe(401);
  });
});
