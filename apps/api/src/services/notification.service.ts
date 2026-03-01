// ============================================
// Servicio de Notificaciones
// Maneja el envío de eventos en tiempo real
// ============================================

import { getIO } from "./socket.service";

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

export class NotificationService {
  /**
   * Envía una notificación a un usuario específico
   */
  static notifyUser(userId: string, data: NotificationData) {
    const io = getIO();
    if (!io) return;

    // Emitir al "cuarto" del usuario (el socket service une a cada usuario a un cuarto con su ID)
    io.to(userId).emit("notification", data);
  }

  /**
   * Notifica cambio en estado de KYC
   */
  static notifyKYCUpdate(userId: string, status: string, notes?: string) {
    this.notifyUser(userId, {
      type: NotificationType.KYC_UPDATE,
      title: "Actualización de KYC",
      message: `Tu documento KYC ha sido ${status === "APPROVED" ? "aprobado" : "rechazado"}.${notes ? ` Nota: ${notes}` : ""}`,
      payload: { status, notes },
    });
  }

  /**
   * Notifica cambio en estado de Reserva
   */
  static notifyBookingUpdate(userId: string, status: string, propertyTitle: string) {
    this.notifyUser(userId, {
      type: NotificationType.BOOKING_UPDATE,
      title: "Actualización de Reserva",
      message: `Tu reserva para "${propertyTitle}" ahora está ${status}.`,
      payload: { status },
    });
  }
}
