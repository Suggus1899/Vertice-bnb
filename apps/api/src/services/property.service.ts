import { prisma } from '@vetice/database';
import { propertyRepository } from '../repositories/property.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import type { CreatePropertyInput, UpdatePropertyInput, PropertyFilters } from '../validators/property.validator';

export class PropertyService {
  /**
   * Crea una nueva propiedad
   */
  async create(hostId: string, input: CreatePropertyInput) {
    // Verificar que el host existe (se podría agregar validación adicional)
    const property = await propertyRepository.create({
      ...input,
      hostId,
      city: input.city ?? '',
      state: input.state ?? '',
      services: input.services ?? {},
      paymentMethods: input.paymentMethods ?? [],
      rules: input.rules ?? {},
    });

    return property;
  }

  /**
   * Obtiene una propiedad por ID
   */
  async findById(id: string) {
    const property = await propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    return property;
  }

  /**
   * Obtiene todas las propiedades de un anfitrión
   */
  async findByHostId(hostId: string) {
    return propertyRepository.findByHostId(hostId);
  }

  /**
   * Busca propiedades con filtros
   */
  async search(filters: PropertyFilters) {
    return propertyRepository.findWithFilters(filters);
  }

  /**
   * Actualiza una propiedad
   */
  async update(id: string, hostId: string, input: UpdatePropertyInput) {
    // Verificar que la propiedad existe
    const property = await propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Verificar que el usuario es el propietario
    if (property.hostId !== hostId) {
      throw new ForbiddenError('You can only update your own properties');
    }

    // Filtrar campos undefined
    const updateData: Partial<CreatePropertyInput> = {};
    if (input.title) updateData.title = input.title;
    if (input.description) updateData.description = input.description;
    if (input.priceUsd) updateData.priceUsd = input.priceUsd;
    if (input.latitude && input.longitude) {
      updateData.latitude = input.latitude;
      updateData.longitude = input.longitude;
    }
    if (input.address) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city ?? '';
    if (input.state !== undefined) updateData.state = input.state ?? '';
    if (input.type) updateData.type = input.type;
    if (input.gender) updateData.gender = input.gender;
    if (input.services !== undefined) updateData.services = input.services ?? {};
    if (input.paymentMethods !== undefined) updateData.paymentMethods = input.paymentMethods ?? [];
    if (input.rules !== undefined) updateData.rules = input.rules ?? {};

    return propertyRepository.update(id, updateData);
  }

  /**
   * Elimina una propiedad
   */
  async delete(id: string, hostId: string) {
    // Verificar que la propiedad existe
    const property = await propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Verificar que el usuario es el propietario
    if (property.hostId !== hostId) {
      throw new ForbiddenError('You can only delete your own properties');
    }

    // Eliminar propiedad
    await propertyRepository.delete(id);

    return { message: 'Property deleted successfully' };
  }

  /**
   * Activa o desactiva una propiedad
   */
  async toggleStatus(id: string, hostId: string) {
    const property = await propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (property.hostId !== hostId) {
      throw new ForbiddenError('You can only manage your own properties');
    }

    // Actualizar el campo isActive directamente en el repositorio
    const updated = await prisma.property.update({
      where: { id },
      data: { isActive: !(property as any).isActive },
      include: { images: true, host: true },
    });

    return updated;
  }

  /**
   * Obtiene estadísticas de propiedades de un anfitrión
   */
  async getStats(hostId: string) {
    return propertyRepository.getStats(hostId);
  }

  /**
   * Agrega una imagen a una propiedad
   */
  async addImage(
    propertyId: string,
    hostId: string,
    imageUrl: string,
    caption?: string,
    isPrimary?: boolean
  ) {
    const property = await propertyRepository.findById(propertyId);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (property.hostId !== hostId) {
      throw new ForbiddenError('You can only manage images for your own properties');
    }

    // Si es imagen primaria, quitar el primary de las demás
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { propertyId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Obtener el siguiente orden
    const maxOrder = await prisma.propertyImage.aggregate({
      where: { propertyId },
      _max: { order: true },
    });

    return prisma.propertyImage.create({
      data: {
        propertyId,
        url: imageUrl,
        caption: caption ?? null,
        isPrimary: isPrimary || false,
        order: (maxOrder._max.order || 0) + 1,
      },
    });
  }

  /**
   * Elimina una imagen de una propiedad
   */
  async removeImage(propertyId: string, hostId: string, imageId: string) {
    const property = await propertyRepository.findById(propertyId);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (property.hostId !== hostId) {
      throw new ForbiddenError('You can only manage images for your own properties');
    }

    return prisma.propertyImage.delete({
      where: { id: imageId },
    });
  }
}

export const propertyService = new PropertyService();
