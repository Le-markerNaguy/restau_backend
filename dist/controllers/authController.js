"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.me = me;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const password_1 = require("../services/password");
async function register(req, res) {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const exists = await prisma_1.prisma.admin.findUnique({ where: { email } });
    if (exists) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }
    const hashed = await (0, password_1.hashPassword)(motDePasse);
    const user = await prisma_1.prisma.admin.create({
        data: { email, password: hashed, role: "ADMIN" },
    });
    return res.status(201).json({ message: "Utilisateur créé", user: { id: user.id, email: user.email } });
}
async function login(req, res) {
    try {
        const email = req.body?.email;
        const motDePasse = (req.body?.motDePasse ?? req.body?.password);
        if (!email?.trim() || !motDePasse) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("[LOGIN] JWT_SECRET non défini");
            return res.status(500).json({ error: "Erreur de configuration serveur" });
        }
        const user = await prisma_1.prisma.admin.findUnique({ where: { email: email.trim() } });
        if (!user)
            return res.status(401).json({ error: "Identifiants invalides" });
        const valid = await (0, password_1.verifyPassword)(motDePasse, user.password);
        if (!valid)
            return res.status(401).json({ error: "Identifiants invalides" });
        console.log("[LOGIN] Utilisateur:", user.email, "Role:", user.role);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // obligatoire en prod (Render utilise HTTPS)
            sameSite: "none", // ⚠️ nécessaire pour cross-domain
            maxAge: 24 * 60 * 60 * 1000,
            path: "/", // optionnel mais plus propre
        });
        return res.json({ message: "Connexion réussie" });
    }
    catch (err) {
        console.error("[LOGIN] Erreur:", err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
async function logout(_req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/" // ⚠️ surtout important !
    });
    return res.json({ message: "Déconnecté" });
}
async function me(req, res) {
    // req.user est défini par middleware/auth.ts
    console.log("[ME] Utilisateur:", req.user?.email, "Role:", req.user?.role);
    return res.json({ user: req.user });
}
