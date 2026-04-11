import rateLimit from 'express-rate-limit';

export const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sendEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 25,
  message: { error: 'Demasiados envíos de correo, intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
