// ============================================
// Repositorio de Propiedades
// Maneja operaciones de base de datos para propiedades
// ============================================

import { prisma } from "@vetice/database";
import type { PropertyFilters } from "../validators/property.validator";

export interface CreatePropertyData {
  hostId: string;
  title: string;
  description: string;
  priceUsd: number;
  latitude: number;
  longitude: number;
  address: string;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  type: "ROOM" | "APARTMENT" | "HOUSE";
  gender: "MIXED" | "FEMALE_ONLY" | "MALE_ONLY";
  services?: Record<string, boolean> | undefined;
  paymentMethods?: string[] | undefined;
  rules?: Record<string, boolean> | undefined;
}

export class PropertyRepository {
  /**
   * Crea una nueva propiedad
   */
  async create(data: CreatePropertyData) {
    const {
      hostId,
      title,
      description,
      priceUsd,
      latitude,
      longitude,
      address,
      city,
      state,
      country,
      type,
      gender,
      services,
      paymentMethods,
      rules,
    } = data;

    // Crear la propiedad (sin la ubicación inicialmente)
    const property = await (prisma.property as any).create({
      data: {
        hostId,
        title,
        description,
        priceUsd,
        address,
        city,
        state,
        country,
        type,
        gender,
        services: services as any,
        paymentMethods: paymentMethods as any,
        rules: rules as any,
      },
    });

    // Actualizar la ubicación por separado (PostGIS geography es Unsupported en Prisma)
    await this.updateLocation(property.id, latitude, longitude);

    return this.findById(property.id);
  }

  /**
   * Busca una propiedad por ID
   */
  async findById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        host: {
          include: {
            user: {
              select: {
                email: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtiene todas las propiedades de un anfitrión
   */
  async findByHostId(hostId: string) {
    return prisma.property.findMany({
      where: { hostId },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Busca propiedades con filtros y geolocalización
   */
  async findWithFilters(filters: PropertyFilters) {
    const {
      latitude,
      longitude,
      radiusKm = 5,
      minPrice,
      maxPrice,
      type,
      gender,
      amenities,
      startDate,
      endDate,
      isActive = true,
    } = filters;

    // SRID para WGS84
    const SRID = 4326;

    // Construir where clause
    const whereClause: any = { isActive };

    if (type) whereClause.type = type;
    if (gender) whereClause.gender = gender;

    if (minPrice || maxPrice) {
      whereClause.priceUsd = {};
      if (minPrice) whereClause.priceUsd.gte = minPrice;
      if (maxPrice) whereClause.priceUsd.lte = maxPrice;
    }

    // Filtrado por amenidades (JSON)
    if (amenities && amenities.length > 0) {
      // Usamos AND para asegurar que la propiedad tenga TODAS las amenidades solicitadas
      whereClause.AND = amenities.map((amenity) => ({
        services: {
          path: [amenity],
          equals: true,
        },
      }));
    }

    // Filtrado por disponibilidad de fechas
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Buscamos propiedades que NO tengan solapamientos con reservas confirmadas
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] }, // Solo reservas que bloquean
          OR: [
            {
              startDate: { lte: start },
              endDate: { gt: start },
            },
            {
              startDate: { lt: end },
              endDate: { gte: end },
            },
            {
              startDate: { gte: start },
              endDate: { lte: end },
            },
          ],
        },
        select: { propertyId: true },
      });

      const reservedPropertyIds = [...new Set(conflictingBookings.map((b) => b.propertyId))];
      
      if (reservedPropertyIds.length > 0) {
        whereClause.id = {
          ...(whereClause.id || {}),
          notIn: reservedPropertyIds,
        };
      }
    }

    // Filtrado geoespacial
    if (latitude && longitude) {
      const result: any[] = await prisma.$queryRaw`
        SELECT id FROM properties
        WHERE ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${SRID})::geography,
          ${radiusKm * 1000}
        )
      `;
      const propertyIds = result.map((row) => row.id);

      if (propertyIds.length === 0) {
        return [];
      }

      whereClause.id = {
        ...(whereClause.id || {}),
        in: propertyIds,
      };
    }

    return prisma.property.findMany({
      where: whereClause,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        host: {
          include: {
            user: {
              select: {
                email: true,
                isVerified: true,
              },
            },
          },
        },
        _count: {
          select: { reviews: true },
        },
        // Nota: El promedio de estrellas se calculará idealmente en el frontend 
        // o mediante un campo virtual si fuera necesario, pero por ahora 
        // incluimos el conteo para mostrar "N reseñas".
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Actualiza una propiedad
   */
  async update(id: string, data: Partial<CreatePropertyData>) {
    const { latitude, longitude, ...restOfData } = data;
    const updateData: any = { ...restOfData };

    // Si hay lat/lng, actualizar con SQL raw
    if (latitude !== undefined && longitude !== undefined) {
      await this.updateLocation(id, latitude, longitude);
    }

    return prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        host: true,
      },
    });
  }

  /**
   * Helper privado para actualizar la ubicación PostGIS
   */
  private async updateLocation(id: string, lat: number, lng: number) {
    const SRID = 4326;
    return prisma.$executeRawUnsafe(
      `UPDATE properties SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), ${SRID})::geography WHERE id = '${id}'`
    );
  }

  /**
   * Elimina una propiedad
   */
  async delete(id: string) {
    return prisma.property.delete({
      where: { id },
    });
  }

  /**
   * Cuenta las propiedades de un anfitrión
   */
  async countByHostId(hostId: string) {
    return prisma.property.count({
      where: { hostId },
    });
  }

  /**
   * Obtiene estadísticas de propiedades
   */
  async getStats(hostId: string) {
    const [total, active, inactive] = await Promise.all([
      this.countByHostId(hostId),
      prisma.property.count({ where: { hostId, isActive: true } }),
      prisma.property.count({ where: { hostId, isActive: false } }),
    ]);

    return { total, active, inactive };
  }
}

export const propertyRepository = new PropertyRepository();
