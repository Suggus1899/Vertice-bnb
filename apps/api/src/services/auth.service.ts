// ============================================
// Servicio de Autenticación
// Contiene la lógica de negocio para auth
// ============================================

import bcrypt from 'bcrypt';
import { authRepository } from '../repositories/auth.repository';
import { generateTokens, verifyRefreshToken, getRefreshTokenExpiration, type JWTPayload } from '../utils/jwt';
import { AppError, ValidationError, UnauthorizedError, ConflictError } from '../utils/errors';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import { prisma } from '@vetice/database';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async register(input: RegisterInput) {
    const { email, password, role, firstName, lastName, phone, university, major } = input;

    // Verificar si el email ya existe
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const user = await authRepository.createUser({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phone: phone ?? '',
      university: university ?? '',
      major: major ?? '',
    });

    // Generar tokens
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    // Retornar datos sin password
    const { password: _, ...userWithoutPassword } = user;
    const profile = role === 'STUDENT' 
      ? (user as any).studentProfile 
      : (user as any).hostProfile;
    
    return {
      user: {
        ...userWithoutPassword,
        profile,
      },
      ...tokens,
    };
  }

  /**
   * Inicia sesión de un usuario
   */
  async login(input: LoginInput) {
    const { email, password } = input;

    // Buscar usuario
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Guardar refresh token en DB para persistencia de sesión
    const refreshExpSeconds = getRefreshTokenExpiration();
    const expiresAt = new Date(Date.now() + refreshExpSeconds * 1000);
    await authRepository.updateRefreshToken(user.id, tokens.refreshToken, expiresAt);

    // Retornar datos sin password
    const { password: _, ...userWithoutPassword } = user;
    const profile = user.role === 'STUDENT' 
      ? (user as any).studentProfile 
      : (user as any).hostProfile;

    return {
      user: {
        ...userWithoutPassword,
        profile,
      },
      ...tokens,
    };
  }

  /**
   * Refresca los tokens usando un refresh token válido
   */
  async refreshToken(token: string) {
    try {
      // Verificar validez del JWT
      const payload = verifyRefreshToken(token);

      // Validar que el refresh token existe en BD
      const storedToken = await authRepository.findRefreshToken(token);

      if (!storedToken || storedToken.userId !== payload.userId) {
        throw new UnauthorizedError("Refresh token not found or invalid");
      }

      if (storedToken.expiresAt < new Date()) {
        await authRepository.removeRefreshToken(token);
        throw new UnauthorizedError("Refresh token expired");
      }

      const user = await authRepository.findUserById(payload.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Generar nuevos tokens
      const newTokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Rotación de tokens: borrar el viejo y guardar el nuevo
      const refreshExpSeconds = getRefreshTokenExpiration();
      const expiresAt = new Date(Date.now() + refreshExpSeconds * 1000);
      await authRepository.updateRefreshToken(user.id, newTokens.refreshToken, expiresAt);

      return newTokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError("Invalid refresh token");
    }
  }
  /**
   * Logout (por ahora solo es limpiar tokens del lado del cliente)
   */
  async logout(token: string) {
    await authRepository.removeRefreshToken(token);
    return { message: 'Logout successful' };
  }

  /**
   * Obtiene el perfil de un usuario
   */
  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      profile: user.role === 'STUDENT' ? user.studentProfile : user.hostProfile,
    };
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string; bio?: string; avatar?: string }
  ) {
    
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Actualizar perfil según el rol
    if (user.role === 'STUDENT' && (user as any).studentProfile) {
      const updatedProfile = await prisma.studentProfile.update({
        where: { id: (user as any).studentProfile!.id },
        data: {
          firstName: data.firstName ?? undefined,
          lastName: data.lastName ?? undefined,
          phone: data.phone ?? undefined,
          bio: data.bio ?? undefined,
          avatar: data.avatar ?? undefined,
        },
      });

      return {
        ...user,
        studentProfile: updatedProfile,
      };
    }

    if (user.role === 'HOST' && (user as any).hostProfile) {
      const updatedProfile = await prisma.hostProfile.update({
        where: { id: (user as any).hostProfile!.id },
        data: {
          firstName: data.firstName ?? undefined,
          lastName: data.lastName ?? undefined,
          phone: data.phone ?? undefined,
          bio: data.bio ?? undefined,
          avatar: data.avatar ?? undefined,
        },
      });

      return {
        ...user,
        hostProfile: updatedProfile,
      };
    }

    throw new ValidationError('Profile not found');
  }
}

export const authService = new AuthService();
