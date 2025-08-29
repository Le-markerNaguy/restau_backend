import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "./types/socket.js";


let ioInstance: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;


export function initWebSocket(httpServer: any) {
ioInstance = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
cors: { origin: (process.env.FRONTEND_URL?.split(",") as string[]) || ["*"] }
});


ioInstance.on("connection", (socket) => {
socket.on("admin:join", () => {
socket.join("admins");
});
});


return ioInstance;
}


export function getIo() {
if (!ioInstance) throw new Error("Socket.io non initialisé");
return ioInstance;
}