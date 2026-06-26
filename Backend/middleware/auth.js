import jwt from 'jsonwebtoken';
import { config } from '../utils/config.js';

export const generateToken = (user) => {
  if (!user._id && !user.id) {
    throw new Error('User ID is required to generate token');
  }

  const payload = {
    id: user._id || user.id
  };

  return jwt.sign(payload, config.jwtSecret, { 
    expiresIn: config.jwtExpiration,
    issuer: 'champions-game'
  });
};

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};

export const requireOwnership = (req, res, next) => {
  const resourceId = req.params.id || req.params.userId;
  if (!resourceId) {
    return res.status(400).json({ error: 'ID del recurso no proporcionado' });
  }
  if (req.userId !== resourceId) {
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      req.userId = decoded.id;
    }
    
    next();
  } catch {
    next();
  }
};
