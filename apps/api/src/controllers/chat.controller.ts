// ============================================
// Controlador de Chat
// Maneja las peticiones HTTP para chat
// ============================================

import type { Request, Response, NextFunction } from "express";
import { chatRepository } from "../repositories/chat.repository";
import { AppError } from "../utils/errors";

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;

    const conversations = await chatRepository.getConversations(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessageHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { otherUserId } = req.params;
    if (!otherUserId) throw new AppError(400, "otherUserId is required");
    const { limit = 50 } = req.query;

    const messages = await chatRepository.getMessageHistory(
      userId,
      otherUserId,
      Number(limit),
    );

    res.status(200).json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

export const markMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      throw new AppError(400, "messageIds array is required");
    }

    await chatRepository.markMessagesAsRead(messageIds);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;

    const messages = await chatRepository.getUnreadMessages(userId);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
