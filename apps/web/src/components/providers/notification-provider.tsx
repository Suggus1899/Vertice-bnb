'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Toaster } from 'sonner';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Inicializa el listener de sockets para notificaciones
  useNotifications();

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {children}
    </>
  );
}
