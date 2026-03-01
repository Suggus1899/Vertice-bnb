// ============================================
// Repositorio de KYC
// Maneja operaciones de base de datos para KYC
// ============================================

import { prisma } from "@vetice/database";
import type { KycStatus, KycType } from "@vetice/types";

export interface CreateKYCDocumentData {
  userId: string;
  type: KycType;
  fileUrl: string;
}

export class KYCRepository {
  /**
   * Crea un nuevo documento KYC
   */
  async create(data: CreateKYCDocumentData) {
    return prisma.kYCDocument.create({
      data,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            hostProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Obtiene un documento KYC por ID
   */
  async findById(id: string) {
    return prisma.kYCDocument.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            studentProfile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
            hostProfile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    });
  }

  /**
   * Obtiene los documentos KYC de un usuario
   */
  async findByUserId(userId: string) {
    return prisma.kYCDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Obtiene todos los documentos KYC pendientes de revisión
   */
  async findPending() {
    return prisma.kYCDocument.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            studentProfile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
            hostProfile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Obtiene todos los documentos KYC (para admin)
   */
  async findAll(status?: KycStatus) {
    return prisma.kYCDocument.findMany({
      where: status ? { status } : {},
      include: {
        user: {
          select: {
            email: true,
            role: true,
            studentProfile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
            hostProfile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Actualiza el estado de un documento KYC
   */
  async updateStatus(
    id: string,
    status: KycStatus,
    reviewedBy: string,
    notes?: string,
  ) {
    return prisma.kYCDocument.update({
      where: { id },
      data: {
        status,
        reviewedBy,
        notes: notes ?? null,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Aprueba un documento KYC y actualiza el estado del usuario
   */
  async approve(id: string, reviewedBy: string, notes?: string) {
    const document = await this.updateStatus(id, "APPROVED", reviewedBy, notes);

    // Obtener el userId del documento
    const doc = await prisma.kYCDocument.findUnique({
      where: { id },
      select: { userId: true, user: { select: { role: true } } },
    });

    if (!doc) {
      throw new Error("Document not found");
    }

    // Actualizar el estado KYC del usuario
    await prisma.user.update({
      where: { id: doc.userId },
      data: {
        kycStatus: "APPROVED",
      },
    });

    // Si es anfitrión, también actualizar hostProfile
    if (doc.user.role === "HOST") {
      await prisma.hostProfile.update({
        where: { userId: doc.userId },
        data: {
          isVerified: true,
        },
      });
    }

    return document;
  }

  /**
   * Rechaza un documento KYC
   */
  async reject(id: string, reviewedBy: string, notes?: string) {
    const document = await this.updateStatus(id, "REJECTED", reviewedBy, notes);

    // Si el usuario no tiene otros documentos aprobados, actualizar su kycStatus
    const approvedCount = await prisma.kYCDocument.count({
      where: {
        userId: document.userId,
        status: "APPROVED",
      },
    });

    if (approvedCount === 0) {
      await prisma.user.update({
        where: { id: document.userId },
        data: {
          kycStatus: "PENDING",
        },
      });
    }

    return document;
  }

  /**
   * Obtiene estadísticas de KYC para admin
   */
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.kYCDocument.count(),
      prisma.kYCDocument.count({ where: { status: "PENDING" } }),
      prisma.kYCDocument.count({ where: { status: "APPROVED" } }),
      prisma.kYCDocument.count({ where: { status: "REJECTED" } }),
    ]);

    // Usuarios verificados vs no verificados
    const verifiedUsers = await prisma.user.count({
      where: { kycStatus: "APPROVED" },
    });

    const pendingUsers = await prisma.user.count({
      where: { kycStatus: "PENDING" },
    });

    return {
      documents: {
        total,
        pending,
        approved,
        rejected,
      },
      users: {
        verified: verifiedUsers,
        pending: pendingUsers,
        total: verifiedUsers + pendingUsers,
      },
    };
  }
}

export const kYCRepository = new KYCRepository();
