// ============================================
// Controlador de Upload
// Maneja upload de imágenes a Cloudinary
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { uploadImage, deleteImage } from '../services/cloudinary.service';
import { AppError, ValidationError } from '../utils/errors';

/**
 * Sube un avatar (imagen de perfil)
 * POST /api/upload/avatar
 */
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si hay archivo
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    // Subir a Cloudinary
    const result = await uploadImage(req.file.buffer, 'vetice/avatars', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sube una imagen de propiedad
 * POST /api/upload/property
 */
export const uploadPropertyImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const result = await uploadImage(req.file.buffer, 'vetice/properties', {
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Property image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sube múltiples imágenes
 * POST /api/upload/multiple
 */
export const uploadMultiple = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ValidationError('No files uploaded');
    }

    const uploadPromises = req.files.map((file: any) =>
      uploadImage(file.buffer, 'vetice/properties')
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results.map(result => ({
        url: result.url,
        publicId: result.publicId,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una imagen
 * DELETE /api/upload/:publicId
 */
export const deleteImageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      throw new ValidationError('Public ID is required');
    }

    await deleteImage(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
