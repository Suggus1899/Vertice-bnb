// ============================================
// Rutas de Upload
// ============================================

import { Router } from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Configurar multer para memoria (buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * @route   POST /api/upload/avatar
 * @desc    Subir avatar de usuario
 * @access  Privado
 */
router.post('/avatar', authenticate, upload.single('avatar'), uploadController.uploadAvatar);

/**
 * @route   POST /api/upload/property
 * @desc    Subir imagen de propiedad
 * @access  Privado
 */
router.post('/property', authenticate, upload.single('image'), uploadController.uploadPropertyImage);

/**
 * @route   POST /api/upload/multiple
 * @desc    Subir múltiples imágenes
 * @access  Privado
 */
router.post('/multiple', authenticate, upload.array('images', 10), uploadController.uploadMultiple);

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Eliminar imagen
 * @access  Privado
 */
router.delete('/:publicId', authenticate, uploadController.deleteImageById);

export default router;
