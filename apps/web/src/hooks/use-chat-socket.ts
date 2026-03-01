'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseChatSocketOptions {
  onMessageReceived?: (message: any) => void;
  onUserOnline?: (data: { userId: string; online: boolean }) => void;
  onUserTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onMessagesRead?: (data: { messageIds: string[] }) => void;
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { onMessageReceived, onUserOnline, onUserTyping, onMessagesRead } = options;

  useEffect(() => {
    // Obtener token y userId del localStorage
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.id) {
      console.warn('No auth token or user ID found');
      return;
    }

    // Conectar a Socket.io
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token,
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
    });

    socketRef.current.on('receive_message', (message) => {
      console.log('Message received:', message);
      onMessageReceived?.(message);
    });

    socketRef.current.on('user_online', (data) => {
      onUserOnline?.(data);
    });

    socketRef.current.on('user_typing', (data) => {
      onUserTyping?.(data);
    });

    socketRef.current.on('messages_read', (data) => {
      onMessagesRead?.(data);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onMessageReceived, onUserOnline, onUserTyping, onMessagesRead]);

  const sendMessage = useCallback((receiverId: string, content: string, propertyId?: string) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(
        'send_message',
        { receiverId, content, propertyId },
        (response: { success: boolean; messageId?: string; error?: string }) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }, []);

  const markAsRead = useCallback((messageIds: string[]) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(
        'mark_read',
        { messageIds },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }, []);

  const startTyping = useCallback((receiverId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { receiverId });
    }
  }, []);

  const stopTyping = useCallback((receiverId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop_typing', { receiverId });
    }
  }, []);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  };
}
