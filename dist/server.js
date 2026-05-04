"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./dnsPreferIpv4");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const websocket_1 = require("./websocket");
const dbConnectionString_1 = require("./dbConnectionString");
dotenv_1.default.config();
const rawDatabaseUrl = (0, dbConnectionString_1.normalizeDatabaseUrl)(process.env.DATABASE_URL);
if (!rawDatabaseUrl) {
    console.error("❌ DATABASE_URL manquant : définis-le dans les variables d’environnement (Render, .env, etc.).");
    process.exit(1);
}
const databaseUrl = (0, dbConnectionString_1.getDatabaseUrlForRuntime)(process.env.DATABASE_URL);
process.env.DATABASE_URL = databaseUrl;
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET manquant : sans lui, la connexion (jwt.sign) échoue en 500.");
    process.exit(1);
}
/** Log hôte/port détectés dans DATABASE_URL (sans afficher le mot de passe). Utile pour déboguer P1001 sur Render. */
function logDatabaseUrlTarget() {
    const parsed = (0, dbConnectionString_1.extractPostgresHostPort)(rawDatabaseUrl);
    if (!parsed || !parsed.host) {
        console.warn("⚠️ DATABASE_URL : impossible de lire hôte/port (format invalide, ou mot de passe avec @ non encodé en %40).");
        console.warn(`   ${(0, dbConnectionString_1.databaseUrlDiagnostics)(rawDatabaseUrl)}`);
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
const server = http_1.default.createServer(app_1.default);
// Initialise WebSocket
(0, websocket_1.initWebSocket)(server);
// Démarre l'écoute sur le port
server.listen(PORT, () => {
    console.log(`✅ API démarrée sur : http://localhost:${PORT}`);
});
// Gestion des erreurs (port déjà utilisé, etc.)
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        const newPort = PORT + 1;
        console.warn(`⚠️  Le port ${PORT} est déjà utilisé, tentative sur ${newPort}...`);
        server.listen(newPort, () => {
            console.log(`✅ API démarrée sur : http://localhost:${newPort}`);
        });
    }
    else {
        throw err;
    }
});
