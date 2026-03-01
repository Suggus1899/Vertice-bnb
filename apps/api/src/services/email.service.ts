// ============================================
// Servicio de Email (Mock)
// Base para futuras integraciones (Resend, SendGrid, etc.)
// ============================================

export class EmailService {
  /**
   * Simula el envío de un email
   */
  private static async send(to: string, subject: string, body: string) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL CONTENT]: ${body}`);
    // Simular latencia
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Email de Bienvenida
   */
  static async sendWelcomeEmail(email: string, name: string) {
    return this.send(
      email,
      "¡Bienvenido a Vértice!",
      `Hola ${name}, gracias por registrarte en la plataforma de alojamiento estudiantil líder.`
    );
  }

  /**
   * Notificación de KYC
   */
  static async sendKYCUpdate(email: string, status: string, notes?: string) {
    const message = status === "APPROVED" 
      ? "Tu perfil ha sido verificado con éxito." 
      : `Tu documento KYC ha sido rechazado. Motivo: ${notes || "No especificado"}.`;
    
    return this.send(email, "Actualización de Verificación (KYC)", message);
  }

  /**
   * Confirmación de Reserva/Pago
   */
  static async sendBookingConfirmation(email: string, propertyTitle: string, total: number) {
    return this.send(
      email,
      "Confirmación de Reserva",
      `Tu pago para "${propertyTitle}" por un total de $${total} ha sido procesado correctamente.`
    );
  }
}
