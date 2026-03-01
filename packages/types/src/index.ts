// ============================================
// Tipos Compartidos - Vetice-bnb
// ============================================

// Roles de usuario
export type UserRole = 'STUDENT' | 'HOST' | 'ADMIN';

// Estado de KYC
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';

// Tipo de propiedad
export type PropertyType = 'ROOM' | 'APARTMENT' | 'HOUSE';

// Género
export type Gender = 'MIXED' | 'FEMALE_ONLY' | 'MALE_ONLY';

// Estado de reserva
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';

// Tipo de documento KYC
export type KycType = 'STUDENT_ID' | 'ENROLLMENT_CERT' | 'ID_CARD';

// ============================================
// Entidades principales
// ============================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  university?: string;
  major?: string;
  enrollmentYear?: number;
  avatar?: string;
  bio?: string;
}

export interface HostProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  idCard?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  priceUsd: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  city?: string;
  state?: string;
  country: string;
  type: PropertyType;
  gender: Gender;
  rules?: Record<string, unknown>;
  services?: Record<string, boolean>;
  paymentMethods?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  studentId: string;
  startDate: string;
  endDate: string;
  totalPriceUsd: number;
  rateApplied: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

export interface ExchangeRate {
  id: number;
  currency: string;
  rate: number;
  source?: string;
  date: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: KycType;
  fileUrl: string;
  status: KycStatus;
  reviewedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  authorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// ============================================
// DTOs y filtros
// ============================================

export interface PropertyFilters {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  type?: PropertyType;
  gender?: Gender;
  amenities?: string[];
  paymentMethods?: string[];
  startDate?: string;
  endDate?: string;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  priceUsd: number;
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  type: PropertyType;
  gender: Gender;
  services?: Record<string, boolean>;
  paymentMethods?: string[];
}

export interface CreateBookingInput {
  propertyId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

// ============================================
// Respuestas de API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}
