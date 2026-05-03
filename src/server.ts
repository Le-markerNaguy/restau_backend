import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { initWebSocket } from "./websocket";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL manquant : définis-le dans les variables d’environnement (Render, .env, etc.).");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET manquant : sans lui, la connexion (jwt.sign) échoue en 500.");
  process.exit(1);
}

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
