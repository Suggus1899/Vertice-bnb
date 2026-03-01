// ============================================
// Controlador de Autenticación
// Maneja las peticiones HTTP para auth
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { AppError } from '../utils/errors';

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, HOST]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar body
    const validatedData = registerSchema.parse(req.body);

    // Registrar usuario
    const result = await authService.register(validatedData);

    // Enviar email de bienvenida (sin esperar a que termine para no bloquear la respuesta)
    EmailService.sendWelcomeEmail(result.user.email, result.user.profile.firstName).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar body
    const validatedData = loginSchema.parse(req.body);

    // Login
    const result = await authService.login(validatedData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Refresh tokens
    const tokens = await authService.refreshToken(validatedData.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout de usuario
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      // Si no hay refresh token, simplemente responder éxito (ya se borró del cliente)
      return res.status(200).json({
        success: true,
        message: 'Logged out from client',
      });
    }

    await authService.logout(refreshToken as string);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener perfil del usuario
 * GET /api/auth/me
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const profile = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar perfil del usuario
 * PATCH /api/auth/me
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { firstName, lastName, phone, bio, avatar } = req.body;

    const updatedProfile = await authService.updateProfile(userId, {
      firstName,
      lastName,
      phone,
      bio,
      avatar,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
