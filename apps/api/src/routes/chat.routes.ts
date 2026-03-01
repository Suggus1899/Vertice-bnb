// ============================================
// Rutas de Chat
// ============================================

import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas de chat requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/chat/conversations
 * @desc    Obtener conversaciones del usuario
 * @access  Privado
 */
router.get('/conversations', chatController.getConversations);

/**
 * @route   GET /api/chat/messages/:otherUserId
 * @desc    Obtener historial de mensajes con un usuario
 * @access  Privado
 */
router.get('/messages/:otherUserId', chatController.getMessageHistory);

/**
 * @route   POST /api/chat/mark-read
 * @desc    Marcar mensajes como leídos
 * @access  Privado
 */
router.post('/mark-read', chatController.markMessagesAsRead);

/**
 * @route   GET /api/chat/unread
 * @desc    Obtener mensajes no leídos
 * @access  Privado
 */
router.get('/unread', chatController.getUnreadMessages);

export default router;
