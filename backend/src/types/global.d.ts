import type { Server as SocketIOServer } from "socket.io";

declare global {
  var io: SocketIOServer | undefined;
  var users: Record<string, string> | undefined;
}

export {};
