"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const disheRoutes_1 = __importDefault(require("./routes/disheRoutes")); // ✅ corrigé
const tableRoutes_1 = __importDefault(require("./routes/tableRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const superAdminRoutes_1 = __importDefault(require("./routes/superAdminRoutes"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const app = (0, express_1.default)();
// ---------- MIDDLEWARES GLOBAUX ----------
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: "10mb" })); // 🚀 monte un peu la limite si tu envoies des images
app.use((0, cookie_parser_1.default)());
// ✅ Servir les fichiers statiques (images uploadées)
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "public", "uploads")));
// ✅ CORS dynamique basé sur l’ENV
const allowedOrigins = process.env.NEXT_PUBLIC_FRONTEND_URL?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://restau-frontend.vercel.app",
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
// ---------- HEALTH CHECK ----------
app.get("/api/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get("/", (_req, res) => res.send("✅ API RESTAURANT en ligne"));
// ---------- ROUTES ----------
app.use("/api/auth", auth_1.default);
app.use("/api/dishes", disheRoutes_1.default);
app.use("/api/tables", tableRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/superadmin", superAdminRoutes_1.default);
app.use("/api/dashboard", dashboard_1.default);
// ---------- ERREUR 404 ----------
app.use((_req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});
// ---------- ERREUR GLOBALE ----------
app.use((err, _req, res, _next) => {
    console.error("🔥 Erreur serveur:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
});
exports.default = app;
