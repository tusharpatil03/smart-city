import { io, type Socket } from "socket.io-client";

const fallbackBaseUrl = "http://localhost:5000";
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? fallbackBaseUrl;
const socketServerUrl = new URL(configuredBaseUrl, window.location.origin).origin;

export const socket: Socket = io(socketServerUrl, {
  autoConnect: true,
  transports: ["websocket", "polling"]
});
