// ============================================
// Rutas de Reservas
// ============================================

import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/bookings/exchange-rate
 * @desc    Obtener tasa de cambio actual
 * @access  Público
 */
router.get('/exchange-rate', bookingController.getExchangeRate);

/**
 * @route   POST /api/bookings
 * @desc    Crear nueva reserva
 * @access  Privado (STUDENT)
 */
router.post('/', bookingController.createBooking);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Obtener mis reservas
 * @access  Privado
 */
router.get('/my-bookings', bookingController.getMyBookings);

/**
 * @route   GET /api/bookings/stats
 * @desc    Obtener estadísticas de reservas
 * @access  Privado (HOST)
 */
router.get('/stats', bookingController.getBookingStats);

/**
 * @route   GET /api/bookings/:id
 * @desc    Obtener reserva por ID
 * @access  Privado
 */
router.get('/:id', bookingController.getBookingById);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Actualizar estado de reserva
 * @access  Privado (HOST)
 */
router.patch('/:id/status', bookingController.updateBookingStatus);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancelar reserva
 * @access  Privado (STUDENT)
 */
router.patch('/:id/cancel', bookingController.cancelBooking);

/**
 * @route   POST /api/bookings/:id/pay
 * @desc    Procesar pago de reserva (Mock)
 * @access  Privado (STUDENT)
 */
router.post('/:id/pay', bookingController.processPayment);

export default router;
