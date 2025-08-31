import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "./types/socket.js";

let ioInstance: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function initWebSocket(httpServer: any) {
  ioInstance = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: (process.env.FRONTEND_URL?.split(",") as string[]) || ["*"],
      credentials: true
    },
    transports: ["websocket"] // 🌟 WebSocket forcé
  });

  ioInstance.on("connection", (socket) => {
    console.log("✅ Admin connecté via WebSocket :", socket.id);

    socket.on("admin:join", () => {
      socket.join("admins");
      console.log(`⚡ Socket ${socket.id} rejoint la room "admins"`);
    });
  });

  return ioInstance;
}

export function getIo() {
  if (!ioInstance) throw new Error("Socket.io non initialisé");
  return ioInstance;
}
