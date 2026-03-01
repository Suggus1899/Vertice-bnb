// ============================================
// Rutas de Propiedades
// ============================================

import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/properties
 * @desc    Buscar propiedades con filtros
 * @access  Público
 */
router.get('/', propertyController.getProperties);

/**
 * @route   GET /api/properties/my-properties
 * @desc    Obtener propiedades del anfitrión actual
 * @access  Privado (HOST)
 */
router.get('/my-properties', authenticate, propertyController.getMyProperties);

/**
 * @route   GET /api/properties/stats
 * @desc    Obtener estadísticas de propiedades
 * @access  Privado (HOST)
 */
router.get('/stats', authenticate, propertyController.getPropertyStats);

/**
 * @route   GET /api/properties/:id
 * @desc    Obtener propiedad por ID
 * @access  Público
 */
router.get('/:id', propertyController.getPropertyById);

/**
 * @route   POST /api/properties
 * @desc    Crear nueva propiedad
 * @access  Privado (HOST)
 */
router.post('/', authenticate, propertyController.createProperty);

/**
 * @route   PATCH /api/properties/:id
 * @desc    Actualizar propiedad
 * @access  Privado (HOST)
 */
router.patch('/:id', authenticate, propertyController.updateProperty);

/**
 * @route   PATCH /api/properties/:id/toggle-status
 * @desc    Activar/desactivar propiedad
 * @access  Privado (HOST)
 */
router.patch('/:id/toggle-status', authenticate, propertyController.togglePropertyStatus);

/**
 * @route   POST /api/properties/:id/images
 * @desc    Agregar imagen a propiedad
 * @access  Privado (HOST)
 */
router.post('/:id/images', authenticate, propertyController.addPropertyImage);

/**
 * @route   DELETE /api/properties/:id/images/:imageId
 * @desc    Eliminar imagen de propiedad
 * @access  Privado (HOST)
 */
router.delete('/:id/images/:imageId', authenticate, propertyController.removePropertyImage);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Eliminar propiedad
 * @access  Privado (HOST)
 */
router.delete('/:id', authenticate, propertyController.deleteProperty);

export default router;
