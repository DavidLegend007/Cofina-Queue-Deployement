import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Chargement sécurisé de .env (support racine ou dossier server/)
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('FATAL: La variable d\'environnement JWT_SECRET est obligatoire en production.');
}
if (isProduction && (!process.env.ADMIN_PASSWORD || !process.env.AGENT_PASSWORD)) {
    throw new Error('FATAL: ADMIN_PASSWORD et AGENT_PASSWORD doivent être configurés dans le fichier .env.');
}
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_jwt_secret_must_change_in_prod';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cofinaAdmin2026!';
export const AGENT_PASSWORD = process.env.AGENT_PASSWORD || 'cofina2026';
/**
 * Hash un mot de passe ou code PIN en utilisant bcrypt avec sel (salt rounds = 10)
 */
export async function hashPassword(plainText) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainText, salt);
}
/**
 * Compare un mot de passe en clair avec son hash bcrypt
 */
export async function comparePassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
}
/**
 * Génère un jeton JWT sécurisé valide 12 heures
 */
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}
/**
 * Middleware d'authentification JWT pour les routes sécurisées
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;
    if (!token) {
        return res.status(401).json({ error: 'Jeton d\'authentification manquant' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Jeton d\'authentification invalide ou expiré' });
        }
        req.user = user;
        next();
    });
}
/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * Ex: requireRole(['ADMIN']) ou requireRole(['AGENT', 'ADMIN'])
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
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
