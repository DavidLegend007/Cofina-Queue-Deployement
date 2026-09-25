import rateLimit from 'express-rate-limit';

// Limite pour le login (anti force-brute) : 5 tentatives max par minute par IP
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans une minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite générale pour l'API : 120 requêtes par minute par IP
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Trop de requêtes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite pour la borne tactile de création de tickets : 15 tickets / minute max par IP
export const ticketCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Génération de tickets temporairement restreinte. Veuillez patienter.' }
});
