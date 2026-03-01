// ============================================
// Rutas de Autenticación
// ============================================

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Público
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh token
 * @access  Público
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout de usuario
 * @access  Privado
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario
 * @access  Privado
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route   PATCH /api/auth/me
 * @desc    Actualizar perfil del usuario
 * @access  Privado
 */
router.patch('/me', authenticate, authController.updateProfile);

export default router;
