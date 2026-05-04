"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authRequired(req, res, next) {
    console.log("[AUTH MIDDLEWARE] Cookies reçus:", req.cookies);
    const token = req.cookies?.token; // On lit le cookie
    if (!token) {
        console.log("[AUTH MIDDLEWARE] Aucun token trouvé dans les cookies.");
        return res.status(401).json({ error: "Non authentifié" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (e) {
        console.log("[AUTH MIDDLEWARE] Token invalide ou erreur JWT:", e);
        return res.status(401).json({ error: "Token invalide" });
    }
}
// Middleware to require a specific admin role
function requireRole(role) {
    return (req, res, next) => {
        // @ts-ignore
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        next();
    };
}
