// ============================================
// Repositorio de Autenticación
// Maneja operaciones de base de datos para auth
// ============================================

import { prisma } from "@vetice/database";
import type { UserRole } from "@vetice/types";

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | undefined;
  university?: string | undefined;
  major?: string | undefined;
}

export class AuthRepository {
  /**
   * Verifica si un email ya está registrado
   */
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        hostProfile: true,
      },
    });
  }

  /**
   * Busca un usuario por ID
   */
  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        hostProfile: true,
      },
    });
  }

  /**
   * Crea un nuevo usuario con su perfil
   */
  async createUser(data: CreateUserInput) {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      university,
      major,
    } = data;

    return prisma.user.create({
      data: {
        email,
        password,
        role,
        studentProfile:
          role === "STUDENT"
            ? {
                create: {
                  firstName,
                  lastName,
                  phone: phone ?? null,
                  university: university ?? null,
                  major: major ?? null,
                },
              }
            : undefined,
        hostProfile:
          role === "HOST"
            ? {
                create: {
                  firstName,
                  lastName,
                  phone: phone ?? null,
                },
              }
            : undefined,
      },
      include: {
        studentProfile: true,
        hostProfile: true,
      },
    });
  }

  /**
   * Actualiza el token de refresh (guarda en DB)
   */
  async updateRefreshToken(userId: string, token: string, expiresAt: Date) {
    // Eliminar tokens anteriores para este usuario (opcional, depende de si permitimos múltiples sesiones)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Elimina el token de refresh (logout)
   */
  async removeRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  /**
   * Busca un refresh token válido en la base de datos
   */
  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Verifica si un usuario es estudiante
   */
  async isStudent(userId: string) {
    const user = await this.findUserById(userId);
    return user?.role === "STUDENT";
  }

  /**
   * Verifica si un usuario es anfitrión
   */
  async isHost(userId: string) {
    const user = await this.findUserById(userId);
    return user?.role === "HOST";
  }
}

export const authRepository = new AuthRepository();
