import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { initWebSocket } from "./websocket";
import { extractPostgresHostPort, normalizeDatabaseUrl } from "./dbConnectionString";

dotenv.config();

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (!databaseUrl) {
  console.error("❌ DATABASE_URL manquant : définis-le dans les variables d’environnement (Render, .env, etc.).");
  process.exit(1);
}
process.env.DATABASE_URL = databaseUrl;

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET manquant : sans lui, la connexion (jwt.sign) échoue en 500.");
  process.exit(1);
}

/** Log hôte/port détectés dans DATABASE_URL (sans afficher le mot de passe). Utile pour déboguer P1001 sur Render. */
function logDatabaseUrlTarget() {
  const parsed = extractPostgresHostPort(databaseUrl);
  if (!parsed || !parsed.host) {
    console.warn(
      "⚠️ DATABASE_URL : impossible de lire hôte/port (format invalide, ou mot de passe avec @ non encodé en %40)."
    );
    return;
  }
  const portPart = parsed.port ? `:${parsed.port}` : "";
  console.log(`📦 DATABASE_URL → hôte: ${parsed.host}${portPart}`);
  if (parsed.host.length < 4 || parsed.host === "base") {
    console.warn("⚠️ Hôte DATABASE_URL suspect : copie l’URI complet depuis Supabase (pooler + port 6543 pour l’app).");
  }
}
logDatabaseUrlTarget();

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
