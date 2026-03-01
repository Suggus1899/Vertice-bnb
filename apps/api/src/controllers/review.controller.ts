// ============================================
// Controlador de Reseñas
// Maneja peticiones HTTP para calificaciones
// ============================================

import { Request, Response, NextFunction } from "express";
import { reviewRepository } from "../repositories/review.repository";
import { bookingRepository } from "../repositories/booking.repository";
import { AppError, NotFoundError, ForbiddenError } from "../utils/errors";
import { z } from "zod";

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a new review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const body = createReviewSchema.parse(req.body);

    const booking = await bookingRepository.findById(body.bookingId);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    // Validar que el usuario es el estudiante de la reserva
    if (booking.studentId !== userId) {
      throw new ForbiddenError("You can only review your own bookings");
    }

    // Validar que la reserva esté COMPLETADA (o confirmada para pruebas/demo)
    // En producción idealmente solo COMPLETED
    if (booking.status !== "COMPLETED" && booking.status !== "CONFIRMED") {
      throw new AppError(400, "You can only review completed or confirmed bookings");
    }

    // Validar si ya existe una reseña
    const existingReview = await reviewRepository.findByBookingId(body.bookingId);
    if (existingReview) {
      throw new AppError(400, "You have already reviewed this booking");
    }

    const review = await reviewRepository.create({
      bookingId: body.bookingId,
      propertyId: booking.propertyId,
      authorId: userId,
      rating: body.rating,
      comment: body.comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/reviews/property/{propertyId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get reviews for a property
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 */
export const getPropertyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params;
    if (!propertyId) throw new AppError(400, "Property ID is required");

    const [reviews, stats] = await Promise.all([
      reviewRepository.findByPropertyId(propertyId),
      reviewRepository.getAverageRating(propertyId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};
