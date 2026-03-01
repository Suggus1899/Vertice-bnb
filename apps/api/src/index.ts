import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import propertyRoutes from "./routes/property.routes";
import chatRoutes from "./routes/chat.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import kycRoutes from "./routes/kyc.routes";
import { initializeSocket } from "./services/socket.service";
import { startExchangeRateSync } from "./utils/sync-rates";
import { AppError } from "./utils/errors";
import type { Request, Response, NextFunction } from "express";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Crear HTTP server
const httpServer = createServer(app);

// Inicializar Socket.io
const socketServer = initializeSocket(httpServer);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    socket: {
      connected: socketServer.io.engine.clientsCount,
    },
  });
});

// API Routes
app.get("/api", (req, res) => {
  res.json({
    name: "Vetice API",
    version: "0.0.1",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        refresh: "POST /api/auth/refresh",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
        updateProfile: "PATCH /api/auth/me",
      },
      upload: {
        avatar: "POST /api/upload/avatar",
        property: "POST /api/upload/property",
        multiple: "POST /api/upload/multiple",
      },
      properties: {
        list: "GET /api/properties",
        myProperties: "GET /api/properties/my-properties",
        stats: "GET /api/properties/stats",
        getById: "GET /api/properties/:id",
        create: "POST /api/properties",
        update: "PATCH /api/properties/:id",
        delete: "DELETE /api/properties/:id",
        toggleStatus: "PATCH /api/properties/:id/toggle-status",
        addImage: "POST /api/properties/:id/images",
        removeImage: "DELETE /api/properties/:id/images/:imageId",
      },
      chat: {
        conversations: "GET /api/chat/conversations",
        messages: "GET /api/chat/messages/:otherUserId",
        markRead: "POST /api/chat/mark-read",
        unread: "GET /api/chat/unread",
      },
    },
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Upload routes
app.use("/api/upload", uploadRoutes);

// Property routes
app.use("/api/properties", propertyRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// KYC routes
app.use("/api/kyc", kycRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar cron job de tasas de cambio
if (process.env.NODE_ENV !== "test") {
  startExchangeRateSync();
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use(
  (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);

    // Si es un error operacional conocido
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    // Error desconocido - 500
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 Auth endpoints: /api/auth/*`);
  console.log(`📸 Upload endpoints: /api/upload/*`);
  console.log(`🏠 Property endpoints: /api/properties/*`);
  console.log(`💬 Chat endpoints: /api/chat/*`);
  console.log(`📅 Booking endpoints: /api/bookings/*`);
  console.log(`📄 KYC endpoints: /api/kyc/*`);
  console.log(`🔌 Socket.io ready for real-time chat`);
  console.log(`💱 BCV rate sync started (daily at 9:00 AM)`);
});

export default app;
