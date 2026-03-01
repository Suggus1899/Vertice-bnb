// ============================================
// Controlador de Reservas
// Maneja las peticiones HTTP para reservas
// ============================================

import type { Request, Response, NextFunction } from "express";
import { prisma } from "@vetice/database";
import { bookingRepository } from "../repositories/booking.repository";
import { getLatestExchangeRate } from "../services/exchange-rate.service";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking.validator";
import { AppError, NotFoundError, ForbiddenError } from "../utils/errors";
import { NotificationService } from "../services/notification.service";
import { EmailService } from "../services/email.service";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = req.user!.userId;
    const { propertyId, startDate, endDate, notes } = createBookingSchema.parse(
      req.body,
    );

    const isAvailable = await bookingRepository.isPropertyAvailable(
      propertyId,
      new Date(startDate),
      new Date(endDate),
    );

    if (!isAvailable) {
      throw new AppError(409, "Property is not available for selected dates");
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPriceUsd = Number(property.priceUsd) * nights;

    const latestRate = await getLatestExchangeRate();
    const rateApplied = latestRate?.rate ? Number(latestRate.rate) : 45.5;

    const booking = await bookingRepository.create({
      propertyId,
      studentId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPriceUsd,
      rateApplied,
      notes: notes || undefined,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let bookings = [];

    if (userRole === "STUDENT") {
      bookings = await bookingRepository.findByStudentId(userId);
    } else if (userRole === "HOST") {
      bookings = await bookingRepository.findByHostId(userId);
    } else {
      bookings = await prisma.booking.findMany({
        include: {
          property: true,
          student: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Booking ID is required");

    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (
      userRole !== "ADMIN" &&
      booking.studentId !== userId &&
      booking.property.hostId !== userId
    ) {
      throw new ForbiddenError(
        "You do not have permission to view this booking",
      );
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Booking ID is required");

    const { status } = updateBookingStatusSchema.parse(req.body);

    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== "ADMIN" && booking.property.hostId !== userId) {
      throw new ForbiddenError("Only the host can update booking status");
    }

    const updatedBooking = await bookingRepository.updateStatus(id, status);

    // Notificación en tiempo real
    NotificationService.notifyBookingUpdate(updatedBooking.studentId, status, updatedBooking.property.title);

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()}`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Booking ID is required");

    const userId = req.user!.userId;

    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.studentId !== userId && req.user!.role !== "ADMIN") {
      throw new ForbiddenError("You can only cancel your own bookings");
    }

    const canceledBooking = await bookingRepository.cancel(id);

    res.status(200).json({
      success: true,
      message: "Booking canceled successfully",
      data: canceledBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;

    const stats = await bookingRepository.getHostStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getExchangeRate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const latestRate = await getLatestExchangeRate();

    res.status(200).json({
      success: true,
      data: {
        rate: latestRate?.rate ? Number(latestRate.rate) : 45.5,
        currency: "VES",
        source: latestRate?.source || "BCV",
        date: latestRate?.date || new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Booking ID is required");

    const userId = req.user!.userId;

    const booking = await bookingRepository.findById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.studentId !== userId) {
      throw new ForbiddenError("You can only pay for your own bookings");
    }

    if (booking.status !== "PENDING") {
      throw new AppError(400, "Only pending bookings can be paid");
    }

    // Simulamos un pago exitoso cambiándolo a CONFIRMED
    const updated = await bookingRepository.updateStatus(id, "CONFIRMED");

    // Notificar al usuario (aunque él mismo está haciendo la acción, sirve para feedback visual UI)
    NotificationService.notifyBookingUpdate(userId, "CONFIRMED", updated.property.title);

    // Notificación por Email (Mock) - Asumiendo que tenemos acceso al email del usuario
    // Para una implementación real, deberíamos incluir el email en el retorno del repo
    EmailService.sendBookingConfirmation(
      req.user!.email, 
      updated.property.title, 
      Number(updated.totalPriceUsd)
    ).catch(console.error);

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
