// ============================================
// Rutas de KYC
// ============================================

import { Router } from 'express';
import * as kycController from '../controllers/kyc.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/kyc/documents
 * @desc    Crear/upload de documento KYC
 * @access  Privado
 */
router.post('/documents', kycController.createKYCDocument);

/**
 * @route   GET /api/kyc/my-documents
 * @desc    Obtener mis documentos KYC
 * @access  Privado
 */
router.get('/my-documents', kycController.getMyKYCDocuments);

/**
 * @route   GET /api/kyc/documents/:id
 * @desc    Obtener documento KYC por ID
 * @access  Privado (dueño o admin)
 */
router.get('/documents/:id', kycController.getKYCDocumentById);

/**
 * @route   GET /api/kyc/pending
 * @desc    Obtener documentos pendientes de revisión
 * @access  Privado (ADMIN)
 */
router.get('/pending', authorize('ADMIN'), kycController.getPendingKYCDocuments);

/**
 * @route   GET /api/kyc/stats
 * @desc    Obtener estadísticas de KYC
 * @access  Privado (ADMIN)
 */
router.get('/stats', authorize('ADMIN'), kycController.getKYCStats);

/**
 * @route   GET /api/kyc/documents
 * @desc    Obtener todos los documentos KYC
 * @access  Privado (ADMIN)
 */
router.get('/documents', authorize('ADMIN'), kycController.getAllKYCDocuments);

/**
 * @route   PATCH /api/kyc/documents/:id/review
 * @desc    Revisar documento KYC (aprobar/rechazar)
 * @access  Privado (ADMIN)
 */
router.patch('/documents/:id/review', authorize('ADMIN'), kycController.reviewKYCDocument);

export default router;
