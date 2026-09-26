import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'cofina_edge_togo_secret_key_2026';

describe('COFINA Security & RBAC — Cryptography & JWT', () => {
  it('should hash a password using bcrypt with random salt', async () => {
    const plain = '1234';
    const salt = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash(plain, salt);
    const hash2 = await bcrypt.hash(plain, await bcrypt.genSalt(10));

    expect(hash1).not.toBe(plain);
    expect(hash1).not.toBe(hash2);

    const match1 = await bcrypt.compare(plain, hash1);
    const match2 = await bcrypt.compare('wrong', hash1);

    expect(match1).toBe(true);
    expect(match2).toBe(false);
  });

  it('should sign and verify JWT tokens containing user role (AGENT vs ADMIN)', () => {
    const agentPayload = { username: 'koffi', role: 'AGENT', agency: 'KODJOVIAKOPE' };
    const agentToken = jwt.sign(agentPayload, JWT_SECRET, { expiresIn: '1h' });

    const decodedAgent = jwt.verify(agentToken, JWT_SECRET) as any;
    expect(decodedAgent.username).toBe('koffi');
    expect(decodedAgent.role).toBe('AGENT');

    const adminPayload = { username: 'admin', role: 'ADMIN', agency: 'KODJOVIAKOPE' };
    const adminToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' });

    const decodedAdmin = jwt.verify(adminToken, JWT_SECRET) as any;
    expect(decodedAdmin.role).toBe('ADMIN');
  });

  it('should reject malformed or tampered JWT tokens', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature';
    expect(() => jwt.verify(fakeToken, JWT_SECRET)).toThrow();
  });
});
