// ============================================
// Servicio de Cloudinary para upload de imágenes
// ============================================

import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
}

/**
 * Sube una imagen (base64 o buffer) a Cloudinary
 */
export async function uploadImage(
  file: string | Buffer,
  folder: string = 'vetice',
  options: {
    resourceType?: 'image' | 'video' | 'raw';
    transformation?: Array<Record<string, any>>;
  } = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: options.resourceType || 'image',
    };

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    // Determinar si es base64 o buffer
    const uploadSource = typeof file === 'string' ? file : { buffer: file };

    cloudinary.uploader.upload(
      uploadSource as any,
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
          });
        }
      }
    );
  });
}

/**
 * Elimina una imagen de Cloudinary por public_id
 */
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Genera una URL firmada para upload directo desde el cliente
 * Útil para evitar pasar archivos por el servidor
 */
export function getUploadSignature(
  params: Record<string, any> = {}
): Promise<{ signature: string; timestamp: number; apiKey: string }> {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Construir string para firmar
  const paramsString = Object.entries({ ...params, timestamp })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Crear signature con SHA1
  const crypto = require('crypto');
  const apiSecret = cloudinary.config().api_secret || '';
  const signature = crypto
    .createHash('sha1')
    .update(paramsString + apiSecret)
    .digest('hex');

  return Promise.resolve({
    signature,
    timestamp,
    apiKey: cloudinary.config().api_key || '',
  });
}

/**
 * Optimiza una imagen para avatar (resize y crop)
 */
export function getOptimizedAvatarUrl(publicId: string, size: number = 200): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width: size, height: size, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
}

export const cloudinaryService = {
  uploadImage,
  deleteImage,
  getUploadSignature,
  getOptimizedAvatarUrl,
};
