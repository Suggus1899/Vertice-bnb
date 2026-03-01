// ============================================
// Validadores con Zod para Reservas
// ============================================

import { z } from 'zod';

// Schema para crear reserva
export const createBookingSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  notes: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// Schema para actualizar estado de reserva
export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED']),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

// Schema para upload de comprobante
export const paymentProofSchema = z.object({
  bookingId: z.string().uuid(),
  paymentMethod: z.string(),
  referenceNumber: z.string().optional(),
});

export type PaymentProofInput = z.infer<typeof paymentProofSchema>;
