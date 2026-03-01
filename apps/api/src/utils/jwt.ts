// ============================================
// Utilitarios para JWT
// ============================================

import jwt from "jsonwebtoken";
import type { UserRole } from "@vetice/types";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default-access-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";

function parseExpiration(exp: string): number {
  const unit = exp.slice(-1);
  const value = parseInt(exp.slice(0, -1));

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return value;
  }
}

export function generateTokens(payload: JWTPayload): TokenPair {
  const accessExpiresIn = parseExpiration(ACCESS_EXPIRATION);
  const refreshExpiresIn = parseExpiration(REFRESH_EXPIRATION);

  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  });

  const refreshToken = jwt.sign({ userId: payload.userId }, REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: accessExpiresIn,
  };
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
  } catch {
    throw new Error("Invalid or expired refresh token");
  }
}

export function getAccessTokenExpiration(): number {
  return parseExpiration(ACCESS_EXPIRATION);
}

export function getRefreshTokenExpiration(): number {
  return parseExpiration(REFRESH_EXPIRATION);
}
