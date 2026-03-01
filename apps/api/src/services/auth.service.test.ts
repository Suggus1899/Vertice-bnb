import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { authRepository } from '../repositories/auth.repository';
import * as jwtUtils from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

// Mock dependencias
vi.mock('../repositories/auth.repository');
vi.mock('../utils/jwt');
vi.mock('@vetice/database', () => ({
  prisma: {
    refreshToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    }
  }
}));

describe('AuthService - Session Management', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('refreshToken', () => {
    it('should rotate tokens if existing token is valid and exists in DB', async () => {
      const oldToken = 'old-refresh-token';
      const userId = 'user-123';
      const payload = { userId };
      const storedToken = { userId, token: oldToken, expiresAt: new Date(Date.now() + 10000) };
      const user = { id: userId, email: 'test@example.com', role: 'STUDENT' };
      const newTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };

      // Configurar mocks
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue(payload);
      vi.mocked(authRepository.findRefreshToken).mockResolvedValue(storedToken as any);
      vi.mocked(authRepository.findUserById).mockResolvedValue(user as any);
      vi.mocked(jwtUtils.generateTokens).mockReturnValue(newTokens as any);
      vi.mocked(jwtUtils.getRefreshTokenExpiration).mockReturnValue(604800); // 7 days

      const result = await authService.refreshToken(oldToken);

      expect(authRepository.findRefreshToken).toHaveBeenCalledWith(oldToken);
      expect(authRepository.updateRefreshToken).toHaveBeenCalled();
      expect(result).toEqual(newTokens);
    });

    it('should throw UnauthorizedError if token is not in DB', async () => {
      const oldToken = 'unknown-token';
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ userId: '123' });
      vi.mocked(authRepository.findRefreshToken).mockResolvedValue(null);

      await expect(authService.refreshToken(oldToken)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if token is expired in DB', async () => {
      const oldToken = 'expired-token';
      const storedToken = { userId: '123', token: oldToken, expiresAt: new Date(Date.now() - 10000) };
      
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ userId: '123' });
      vi.mocked(authRepository.findRefreshToken).mockResolvedValue(storedToken as any);

      await expect(authService.refreshToken(oldToken)).rejects.toThrow('Refresh token expired');
      expect(authRepository.removeRefreshToken).toHaveBeenCalledWith(oldToken);
    });
  });

  describe('logout', () => {
    it('should call repository to remove token', async () => {
      const token = 'active-token';
      await authService.logout(token);
      expect(authRepository.removeRefreshToken).toHaveBeenCalledWith(token);
    });
  });
});
