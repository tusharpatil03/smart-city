import { app } from "./app";
import mongoose from "mongoose";
import { Server } from "http";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./shared/config/env";
import { connectMongo } from "./shared/db/mongoose";

let httpServer: Server | null = null;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown", error);
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await connectMongo();

    httpServer = createServer(app);

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.clientOrigin,
        methods: ["GET", "POST"]
      }
    });

    const users: Record<string, string> = {};

    global.io = io;
    global.users = users;

    io.on("connection", (socket) => {
      console.log(`[Socket.IO] New connection: ${socket.id}`);
      
      socket.on("register", (userId: string) => {
        if (typeof userId !== "string") {
          console.warn(`[Socket.IO] Invalid userId type: ${typeof userId}`);
          return;
        }

        const trimmedUserId = userId.trim();
        if (!trimmedUserId) {
          console.warn(`[Socket.IO] Empty userId string`);
          return;
        }

        users[trimmedUserId] = socket.id;
        socket.data.userId = trimmedUserId;
        console.log(`[Socket.IO] ✅ Registered user ${trimmedUserId} → socket ${socket.id}`);
      });

      socket.on("disconnect", () => {
        console.log(`[Socket.IO] Disconnected: ${socket.id}`);
        const socketUserId = typeof socket.data.userId === "string" ? socket.data.userId : undefined;

        if (socketUserId && users[socketUserId] === socket.id) {
          delete users[socketUserId];
          return;
        }

        Object.entries(users).forEach(([userId, socketId]) => {
          if (socketId === socket.id) {
            delete users[userId];
          }
        });
      });
    });

    httpServer.listen(env.port, () => {
      // Keep startup logs explicit for easier runtime diagnosis.
      console.log(`Server listening on port ${env.port} in ${env.nodeEnv} mode`);
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void startServer();
