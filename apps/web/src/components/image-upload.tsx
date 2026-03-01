'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Spinner } from '@vetice/ui';
import { cn } from '@vetice/ui';

export interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // en MB
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

export default function ImageUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 5, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
  },
  multiple = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadedImages, setUploadedImages] = React.useState<{ url: string; file: File }[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      // Manejar archivos rechazados
      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map((f) => f.errors.map((e: any) => e.message).join(', '));
        setError(`Archivos rechazados: ${reasons.join(', ')}`);
        return;
      }

      // Verificar límite de archivos
      if (uploadedImages.length + acceptedFiles.length > maxFiles) {
        setError(`Máximo ${maxFiles} archivos permitidos`);
        return;
      }

      setIsUploading(true);

      try {
        // Aquí iría el upload real a Cloudinary
        // Por ahora solo guardamos las URLs temporales
        const newImages = acceptedFiles.map((file) => ({
          file,
          url: URL.createObjectURL(file),
        }));

        setUploadedImages((prev) => [...prev, ...newImages]);

        // Llamar al callback de upload
        await onUpload(acceptedFiles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir imágenes');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, maxFiles, uploadedImages.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize: maxSize * 1024 * 1024,
    maxFiles,
  });

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      const image = newImages[index];
      if (image) {
        URL.revokeObjectURL(image.url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  React.useEffect(() => {
    return () => {
      // Limpiar URLs temporales
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-vertice-primary bg-vertice-primary/5'
            : 'border-input hover:border-vertice-primary/50 hover:bg-muted/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          {isDragActive ? (
            <p className="text-vertice-primary font-medium">Suelta las imágenes aquí...</p>
          ) : (
            <>
              <p className="font-medium">
                Arrastra y suelta imágenes aquí, o haz clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, WEBP hasta {maxSize}MB (máx {maxFiles} archivos)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Loading */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          <p>Subiendo imágenes...</p>
        </div>
      )}

      {/* Imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-vertice-primary text-vertice-primary-foreground text-xs rounded-full">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {uploadedImages.length} de {maxFiles} imágenes subidas
      </p>
    </div>
  );
}
