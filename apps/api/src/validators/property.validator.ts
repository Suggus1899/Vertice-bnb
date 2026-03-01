// ============================================
// Validadores con Zod para Propiedades
// ============================================

import { z } from 'zod';

// Schema para crear propiedad
export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  priceUsd: z.number().positive('Price must be positive'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Venezuela'),
  type: z.enum(['ROOM', 'APARTMENT', 'HOUSE']),
  gender: z.enum(['MIXED', 'FEMALE_ONLY', 'MALE_ONLY']),
  services: z.record(z.boolean()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  rules: z.record(z.boolean()).optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// Schema para actualizar propiedad
export const updatePropertySchema = createPropertySchema.partial();

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// Schema para filtros de búsqueda
export const propertyFiltersSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusKm: z.number().positive().optional().default(5),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  type: z.enum(['ROOM', 'APARTMENT', 'HOUSE']).optional(),
  gender: z.enum(['MIXED', 'FEMALE_ONLY', 'MALE_ONLY']).optional(),
  amenities: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;
