// ============================================
// Controlador de Propiedades
// Maneja las peticiones HTTP para propiedades
// ============================================

import type { Request, Response, NextFunction } from "express";
import { propertyService } from "../services/property.service";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFiltersSchema,
} from "../validators/property.validator";
import { AppError } from "../utils/errors";

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hostId = req.user!.userId;

    const validatedData = createPropertySchema.parse(req.body);

    const property = await propertyService.create(hostId, validatedData);

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = propertyFiltersSchema.parse(req.query);

    const properties = await propertyService.search(filters);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Property ID is required");

    const property = await propertyService.findById(id);

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProperties = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hostId = req.user!.userId;

    const properties = await propertyService.findByHostId(hostId);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hostId = req.user!.userId;

    const stats = await propertyService.getStats(hostId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Property ID is required");
    const hostId = req.user!.userId;

    const validatedData = updatePropertySchema.parse(req.body);

    const property = await propertyService.update(id, hostId, validatedData);

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Property ID is required");
    const hostId = req.user!.userId;

    await propertyService.delete(id, hostId);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const togglePropertyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Property ID is required");
    const hostId = req.user!.userId;

    const property = await propertyService.toggleStatus(id, hostId);

    res.status(200).json({
      success: true,
      message: `Property ${property.isActive ? "activated" : "deactivated"} successfully`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const addPropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(400, "Property ID is required");
    const hostId = req.user!.userId;
    const { imageUrl, caption, isPrimary } = req.body;

    if (!imageUrl) {
      throw new AppError(400, "imageUrl is required");
    }

    const image = await propertyService.addImage(
      id,
      hostId,
      imageUrl,
      caption,
      isPrimary,
    );

    res.status(201).json({
      success: true,
      message: "Image added successfully",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

export const removePropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, imageId } = req.params;
    if (!id) throw new AppError(400, "Property ID is required");
    if (!imageId) throw new AppError(400, "Image ID is required");
    const hostId = req.user!.userId;

    await propertyService.removeImage(id, hostId, imageId);

    res.status(200).json({
      success: true,
      message: "Image removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
