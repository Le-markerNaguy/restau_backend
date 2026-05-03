import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { initWebSocket } from "./websocket";

dotenv.config();

const PORT = parseInt(process.env.PORT || "8080", 10);

// Crée le serveur HTTP
const server = http.createServer(app);

// Initialise WebSocket
initWebSocket(server);

// Démarre l'écoute sur le port
server.listen(PORT, () => {
  console.log(`✅ API démarrée sur : http://localhost:${PORT}`);
});

// Gestion des erreurs (port déjà utilisé, etc.)
server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    const newPort = PORT + 1;
    console.warn(`⚠️  Le port ${PORT} est déjà utilisé, tentative sur ${newPort}...`);
    server.listen(newPort, () => {
      console.log(`✅ API démarrée sur : http://localhost:${newPort}`);
    });
  } else {
    throw err;
  }
});
