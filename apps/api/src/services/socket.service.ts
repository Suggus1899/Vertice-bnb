// ============================================
// Configuración de Socket.io
// Maneja conexiones en tiempo real
// ============================================

import type { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "@vetice/database";

let io: SocketIOServer;

export function getIO() {
  return io;
}

interface ServerToClientEvents {
  user_online: (data: { userId: string; online: boolean }) => void;
  receive_message: (data: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    propertyId: string | null;
    createdAt: Date;
    sender: {
      id: string;
      email: string;
      studentProfile: {
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
      } | null;
      hostProfile: {
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
      } | null;
    };
  }) => void;
  messages_read: (data: { messageIds: string[] }) => void;
  user_typing: (data: { userId: string; isTyping: boolean }) => void;
}

interface ClientToServerEvents {
  send_message: (
    data: { receiverId: string; content: string; propertyId?: string },
    callback: (response: {
      success: boolean;
      messageId?: string;
      error?: string;
    }) => void,
  ) => void;
  mark_read: (
    data: { messageIds: string[] },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;
  typing: (data: { receiverId: string }) => void;
  stop_typing: (data: { receiverId: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
}

const onlineUsers = new Map<
  string,
  Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
>();

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin:
        process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token || !userId) {
      return next(new Error("Auth token required"));
    }

    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    onlineUsers.set(socket.data.userId, socket);

    io.emit("user_online", { userId: socket.data.userId, online: true });

    socket.join(`user:${socket.data.userId}`);

    socket.on("send_message", async (data, callback) => {
      try {
        const { receiverId, content, propertyId } = data;
        const senderId = socket.data.userId;

        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content,
            propertyId: propertyId || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                studentProfile: {
                  select: { firstName: true, lastName: true, avatar: true },
                },
                hostProfile: {
                  select: { firstName: true, lastName: true, avatar: true },
                },
              },
            },
          },
        });

        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          receiverSocket.emit("receive_message", {
            id: message.id,
            senderId,
            receiverId,
            content: message.content,
            propertyId: message.propertyId,
            createdAt: message.createdAt,
            sender: message.sender,
          });
        }

        callback({ success: true, messageId: message.id });
      } catch (error) {
        console.error("Error sending message:", error);
        callback({ success: false, error: "Failed to send message" });
      }
    });

    socket.on("mark_read", async (data, callback) => {
      try {
        const { messageIds } = data;

        await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
          },
          data: {
            readAt: new Date(),
          },
        });

        const messages = await prisma.message.findMany({
          where: { id: { in: messageIds } },
          select: { senderId: true },
        });

        const senderIds = [...new Set(messages.map((m) => m.senderId))];
        senderIds.forEach((senderId) => {
          const senderSocket = onlineUsers.get(senderId);
          if (senderSocket) {
            senderSocket.emit("messages_read", { messageIds });
          }
        });

        callback({ success: true });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        callback({ success: false, error: "Failed to mark as read" });
      }
    });

    socket.on("typing", (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) {
        receiverSocket.emit("user_typing", {
          userId: socket.data.userId,
          isTyping: true,
        });
      }
    });

    socket.on("stop_typing", (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) {
        receiverSocket.emit("user_typing", {
          userId: socket.data.userId,
          isTyping: false,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);

      onlineUsers.delete(socket.data.userId);

      io.emit("user_online", {
        userId: socket.data.userId,
        online: false,
      });

      socket.leave(`user:${socket.data.userId}`);
    });
  });

  const getOnlineUsers = () => Array.from(onlineUsers.keys());

  const sendToUser = (
    userId: string,
    event: keyof ServerToClientEvents,
    data: unknown,
  ) => {
    const userSocket = onlineUsers.get(userId);
    if (userSocket) {
      (
        userSocket.emit as (
          event: keyof ServerToClientEvents,
          data: unknown,
        ) => void
      )(event, data);
      return true;
    }
    return false;
  };

  console.log("Socket.io initialized");
  return { io, getOnlineUsers, sendToUser };
}

export type SocketIOWithHelpers = SocketIOServer<
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData
> & {
  getOnlineUsers: () => string[];
  sendToUser: (
    userId: string,
    event: keyof ServerToClientEvents,
    data: unknown,
  ) => boolean;
};
