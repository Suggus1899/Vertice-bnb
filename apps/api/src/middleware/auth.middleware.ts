// ============================================
// Middleware de Autenticación
// Verifica y valida tokens JWT
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JWTPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import type { UserRole } from '@vetice/types';

// Extender Request para incluir usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const payload = verifyAccessToken(token);

    // Adjuntar payload al request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

/**
 * Middleware para verificar roles
 * @param allowedRoles - Roles permitidos para acceder a la ruta
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Role ${req.user.role} is not authorized to access this resource`)
      );
    }

    next();
  };
}

/**
 * Middleware combinado: autentica y autoriza
 * @param allowedRoles - Roles permitidos (opcional, si no se pasa solo autentica)
 */
export function requireAuth(...allowedRoles: UserRole[]) {
  if (allowedRoles.length === 0) {
    return authenticate;
  }

  return [authenticate, authorize(...allowedRoles)];
}

/**
 * Middleware opcional: intenta autenticar pero no falla si no hay token
 * Útil para rutas que muestran contenido diferente para usuarios logueados
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Si falla la autenticación, continuar sin usuario
    next();
  }
}
