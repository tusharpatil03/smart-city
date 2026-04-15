import dotenv from "dotenv";

dotenv.config();

export type NodeEnvironment = "development" | "test" | "production";

interface EnvConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  mongodbUri: string;
}

const parseNodeEnv = (value: string | undefined): NodeEnvironment => {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }

  return "development";
};

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 4000;
  }

  return parsed;
};

const requireValue = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env: EnvConfig = {
  nodeEnv: parseNodeEnv(process.env.NODE_ENV),
  port: parsePort(process.env.PORT),
  mongodbUri: requireValue(process.env.MONGODB_URI, "MONGODB_URI")
};
