'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export enum NotificationType {
  KYC_UPDATE = "KYC_UPDATE",
  BOOKING_UPDATE = "BOOKING_UPDATE",
  NEW_MESSAGE = "NEW_MESSAGE",
}

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  payload?: any;
}

export function useNotifications() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return;
    
    const user = JSON.parse(userStr);
    if (!user.id) return;

    // Conectar a Socket.io para notificaciones
    // Usamos el mismo endpoint que el chat
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token,
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('notification', (data: NotificationData) => {
      console.log('Push notification received:', data);
      
      // Mostrar toast según el tipo
      switch (data.type) {
        case NotificationType.KYC_UPDATE:
          toast.info(data.title, { description: data.message });
          break;
        case NotificationType.BOOKING_UPDATE:
          toast.success(data.title, { description: data.message });
          break;
        case NotificationType.NEW_MESSAGE:
          // Solo si no estamos en la página de chat (opcional)
          toast.message(data.title, { description: data.message });
          break;
        default:
          toast(data.title, { description: data.message });
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Notification socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
  };
}
