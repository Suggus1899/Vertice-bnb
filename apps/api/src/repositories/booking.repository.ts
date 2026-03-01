// ============================================
// Repositorio de Reservas
// Maneja operaciones de base de datos para reservas
// ============================================

import { prisma } from '@vetice/database';
import type { BookingStatus } from '@vetice/types';

export interface CreateBookingData {
  propertyId: string;
  studentId: string;
  startDate: Date;
  endDate: Date;
  totalPriceUsd: number;
  rateApplied: number;
  notes?: string;
}

export class BookingRepository {
  /**
   * Crea una nueva reserva
   */
  async create(data: CreateBookingData) {
    return prisma.booking.create({
      data: {
        propertyId: data.propertyId,
        studentId: data.studentId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPriceUsd: data.totalPriceUsd,
        rateApplied: data.rateApplied,
        status: 'PENDING',
        notes: data.notes ?? null,
      },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            host: {
              include: {
                user: { select: { email: true, isVerified: true } },
              },
            },
          },
        },
        student: {
          select: {
            email: true,
            studentProfile: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });
  }

  /**
   * Obtiene una reserva por ID
   */
  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            images: true,
            host: {
              include: {
                user: { select: { email: true, isVerified: true } },
              },
            },
          },
        },
        student: {
          select: {
            email: true,
            studentProfile: { select: { firstName: true, lastName: true, avatar: true, phone: true } },
          },
        },
      },
    });
  }

  /**
   * Obtiene las reservas de un estudiante
   */
  async findByStudentId(studentId: string) {
    return prisma.booking.findMany({
      where: { studentId },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene las reservas de una propiedad (anfitrión)
   */
  async findByPropertyId(propertyId: string) {
    return prisma.booking.findMany({
      where: { propertyId },
      include: {
        student: {
          select: {
            email: true,
            studentProfile: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Obtiene las reservas de un anfitrión (todas sus propiedades)
   */
  async findByHostId(hostId: string) {
    return prisma.booking.findMany({
      where: {
        property: {
          hostId,
        },
      },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        student: {
          select: {
            email: true,
            studentProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualiza el estado de una reserva
   */
  async updateStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        property: { select: { title: true } },
      },
    });
  }

  /**
   * Cancela una reserva
   */
  async cancel(id: string) {
    return this.updateStatus(id, 'CANCELED');
  }

  /**
   * Confirma una reserva
   */
  async confirm(id: string) {
    return this.updateStatus(id, 'CONFIRMED');
  }

  /**
   * Verifica si una propiedad está disponible en las fechas dadas
   */
  async isPropertyAvailable(propertyId: string, startDate: Date, endDate: Date, excludeBookingId?: string) {
    const whereClause: any = {
      propertyId,
      status: { in: ['PENDING', 'CONFIRMED'] },
    };

    if (excludeBookingId) {
      whereClause.id = { not: excludeBookingId };
    }

    whereClause.OR = [
      {
        startDate: { lte: startDate },
        endDate: { gt: startDate },
      },
      {
        startDate: { lt: endDate },
        endDate: { gte: endDate },
      },
      {
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      },
    ];

    const conflictingBookings = await prisma.booking.count({
      where: whereClause,
    });

    return conflictingBookings === 0;
  }

  /**
   * Obtiene estadísticas de reservas para un anfitrión
   */
  async getHostStats(hostId: string) {
    const [total, pending, confirmed, canceled, completed] = await Promise.all([
      prisma.booking.count({
        where: { property: { hostId } },
      }),
      prisma.booking.count({
        where: { property: { hostId }, status: 'PENDING' },
      }),
      prisma.booking.count({
        where: { property: { hostId }, status: 'CONFIRMED' },
      }),
      prisma.booking.count({
        where: { property: { hostId }, status: 'CANCELED' },
      }),
      prisma.booking.count({
        where: { property: { hostId }, status: 'COMPLETED' },
      }),
    ]);

    // Calcular ingresos totales
    const revenue = await prisma.booking.aggregate({
      where: {
        property: { hostId },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      _sum: { totalPriceUsd: true },
    });

    return {
      total,
      pending,
      confirmed,
      canceled,
      completed,
      revenue: revenue._sum.totalPriceUsd || 0,
    };
  }
}

export const bookingRepository = new BookingRepository();
