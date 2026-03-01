// ============================================
// Controlador de KYC
// Maneja las peticiones HTTP para KYC
// ============================================

import type { Request, Response, NextFunction } from "express";
import { prisma } from "@vetice/database";
import { kYCRepository } from "../repositories/kyc.repository";
import { AppError, NotFoundError, ForbiddenError } from "../utils/errors";
import { z } from "zod";
import { NotificationService } from "../services/notification.service";
import { EmailService } from "../services/email.service";

const createKYCSchema = z.object({
  type: z.enum(["STUDENT_ID", "ENROLLMENT_CERT", "ID_CARD"]),
  fileUrl: z.string().url("Invalid file URL"),
});

const reviewKYCSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().max(500).optional(),
});

export const createKYCDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { type, fileUrl } = createKYCSchema.parse(req.body);

    const existing = await prisma.kYCDocument.findFirst({
      where: {
        userId,
        type,
        status: "PENDING",
      },
    });

    if (existing) {
      throw new AppError(
        409,
        "You already have a pending document of this type",
      );
    }

    const document = await kYCRepository.create({
      userId,
      type,
      fileUrl,
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyKYCDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;

    const documents = await kYCRepository.findByUserId(userId);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

export const getKYCDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Document ID is required");
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const document = await kYCRepository.findById(id);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (document.userId !== userId && userRole !== "ADMIN") {
      throw new ForbiddenError(
        "You do not have permission to view this document",
      );
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingKYCDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const documents = await kYCRepository.findPending();

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

export const getKYCStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await kYCRepository.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewKYCDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Document ID is required");
    const reviewerId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== "ADMIN") {
      throw new ForbiddenError("Only administrators can review KYC documents");
    }

    const { status, notes } = reviewKYCSchema.parse(req.body);

    const document = await kYCRepository.findById(id);

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (document.status !== "PENDING") {
      throw new AppError(400, "Document has already been reviewed");
    }

    let updatedDocument;
    if (status === "APPROVED") {
      updatedDocument = await kYCRepository.approve(
        id,
        reviewerId,
        notes || undefined,
      );
    } else {
      updatedDocument = await kYCRepository.reject(
        id,
        reviewerId,
        notes || undefined,
      );
    }

    res.status(200).json({
      success: true,
      message: `Document ${status.toLowerCase()}`,
      data: updatedDocument,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllKYCDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.query;

    const documents = await kYCRepository.findAll(
      status ? (status as "PENDING" | "APPROVED" | "REJECTED") : undefined,
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};
