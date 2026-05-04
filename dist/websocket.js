"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.getIo = getIo;
const socket_io_1 = require("socket.io");
let ioInstance = null;
function initWebSocket(httpServer) {
    ioInstance = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL?.split(",") || ["*"],
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
function getIo() {
    if (!ioInstance)
        throw new Error("Socket.io non initialisé");
    return ioInstance;
}
