import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const JWT_SECRET = process.env.JWT_SECRET || 'cofina_edge_togo_secret_key_2026';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cofinaAdmin2026!';
export const AGENT_PASSWORD = process.env.AGENT_PASSWORD || 'cofina2026';

export interface TokenPayload {
  id?: string;
  username: string;
  role: 'AGENT' | 'ADMIN';
  agency?: string;
}

/**
 * Hash un mot de passe ou code PIN en utilisant bcrypt avec sel (salt rounds = 10)
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare un mot de passe en clair avec son hash bcrypt
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Génère un jeton JWT sécurisé valide 12 heures
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

/**
 * Middleware d'authentification JWT pour les routes sécurisées
 */
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé : Jeton de connexion (Token) manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Jeton de connexion invalide ou expiré' });
    }
    req.user = user as TokenPayload;
    next();
  });
}

/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * Ex: requireRole(['ADMIN']) ou requireRole(['AGENT', 'ADMIN'])
 */
export function requireRole(allowedRoles: ('AGENT' | 'ADMIN')[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Accès refusé : Rôle '${req.user.role}' insuffisant. Requis : [${allowedRoles.join(', ')}]` 
      });
    }

    next();
  };
}
