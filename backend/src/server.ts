import { app } from "./app";
import mongoose from "mongoose";
import { Server } from "http";
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

    httpServer = app.listen(env.port, () => {
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
