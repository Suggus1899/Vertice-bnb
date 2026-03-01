// ============================================
// Rutas de Reseñas
// ============================================

import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Crear nueva reseña
 * @access  Privado (STUDENT)
 */
router.post("/", authenticate, reviewController.createReview);

/**
 * @route   GET /api/reviews/property/:propertyId
 * @desc    Obtener reseñas de una propiedad
 * @access  Público
 */
router.get("/property/:propertyId", reviewController.getPropertyReviews);

export default router;
