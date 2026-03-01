// ============================================
// Repositorio de Chat
// Maneja operaciones de base de datos para chat
// ============================================

import { prisma } from '@vetice/database';

export class ChatRepository {
  /**
   * Obtiene las conversaciones de un usuario
   */
  async getConversations(userId: string) {
    // Obtener todos los mensajes donde el usuario es emisor o receptor
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { firstName: true, lastName: true, avatar: true } },
            hostProfile: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { firstName: true, lastName: true, avatar: true } },
            hostProfile: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupar mensajes por conversación (usuario con el que chatea)
    const conversations = new Map<string, any>();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!conversations.has(otherUserId)) {
        const profile = otherUser.studentProfile || otherUser.hostProfile;
        conversations.set(otherUserId, {
          userId: otherUserId,
          email: otherUser.email,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          avatar: profile?.avatar,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          unreadCount: 0,
          property: message.property,
        });
      }

      // Actualizar último mensaje si este es más reciente
      const conv = conversations.get(otherUserId);
      if (message.createdAt > conv.lastMessageAt) {
        conv.lastMessage = message.content;
        conv.lastMessageAt = message.createdAt;
        conv.property = message.property;
      }

      // Contar mensajes no leídos
      if (message.receiverId === userId && !message.readAt) {
        conv.unreadCount++;
      }
    });

    return Array.from(conversations.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  /**
   * Obtiene el historial de mensajes entre dos usuarios
   */
  async getMessageHistory(userId1: string, userId2: string, limit = 50) {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            studentProfile: { select: { firstName: true, lastName: true, avatar: true } },
            hostProfile: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Marca mensajes como leídos
   */
  async markMessagesAsRead(messageIds: string[]) {
    return prisma.message.updateMany({
      where: {
        id: { in: messageIds },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Obtiene mensajes no leídos
   */
  async getUnreadMessages(userId: string) {
    return prisma.message.findMany({
      where: {
        receiverId: userId,
        readAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            hostProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const chatRepository = new ChatRepository();
