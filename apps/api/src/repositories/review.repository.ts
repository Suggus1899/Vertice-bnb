// ============================================
// Repositorio de Reseñas
// Maneja operaciones de base de datos para calificaciones
// ============================================

import { prisma } from '@vetice/database';

export interface CreateReviewData {
  bookingId: string;
  propertyId: string;
  authorId: string;
  rating: number;
  comment?: string;
}

export class ReviewRepository {
  /**
   * Crea una nueva reseña
   */
  async create(data: CreateReviewData) {
    return prisma.review.create({
      data: {
        bookingId: data.bookingId,
        propertyId: data.propertyId,
        authorId: data.authorId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        author: {
          select: {
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtiene una reseña por Booking ID
   */
  async findByBookingId(bookingId: string) {
    return prisma.review.findUnique({
      where: { bookingId },
    });
  }

  /**
   * Obtiene reseñas de una propiedad
   */
  async findByPropertyId(propertyId: string) {
    return prisma.review.findMany({
      where: { propertyId },
      include: {
        author: {
          select: {
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calcula el promedio de calificación de una propiedad
   */
  async getAverageRating(propertyId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { propertyId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      average: aggregate._avg.rating || 0,
      count: aggregate._count.rating,
    };
  }
}

export const reviewRepository = new ReviewRepository();
