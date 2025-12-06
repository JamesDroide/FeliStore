import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware de autenticación JWT
 * Verifica el token en el header Authorization
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado - Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'felistore-secret-key');

    // Obtener usuario de la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        walletAddress: true,
        isVerified: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    return res.status(500).json({ error: 'Error de autenticación' });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega el usuario si existe
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'felistore-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        walletAddress: true,
        isVerified: true,
        role: true
      }
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // No hacer nada, continuar sin usuario
  }

  next();
};

export default { authenticate, authorize, optionalAuth };

