"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
exports.createSuperAdmin = createSuperAdmin;
exports.getAllUser = getAllUser;
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
const prisma_1 = require("../prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Creer un admin
async function createAdmin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email et mot de passe requis" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma_1.prisma.admin.create({
            data: { email, password: hashedPassword, role: "ADMIN" },
        });
        return res.status(201).json({ id: admin.id, email: admin.email, role: admin.role });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur création admin" });
    }
}
// CREATE SuperAdmin
async function createSuperAdmin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email et mot de passe requis" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const superAdmin = await prisma_1.prisma.admin.create({
            data: { email, password: hashedPassword, role: "SUPERADMIN" },
        });
        return res.status(201).json({ id: superAdmin.id, email: superAdmin.email, role: superAdmin.role });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur création super admin" });
    }
}
//Afficher users
async function getAllUser(req, res) {
    try {
        console.log("[SUPERADMIN] getAllUser appelé");
        console.log("[SUPERADMIN] User dans la requête:", req.user);
        console.log("[SUPERADMIN] Cookies:", req.cookies);
        const admin = await prisma_1.prisma.admin.findMany();
        console.log("[SUPERADMIN] Nombre d'utilisateurs trouvés:", admin.length);
        return res.json({ users: admin }); // <-- clé "users"
    }
    catch (error) {
        console.error("Erreur getAllUser:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
//Supprimer un utilisateur
async function deleteUser(req, res) {
    const { id } = req.params;
    try {
        const user = await prisma_1.prisma.admin.delete({
            where: { id: Number(id) },
        });
        return res.json({ message: "Utilisateur supprimé", user });
    }
    catch (error) {
        console.error("Erreur deleteUser:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
//Modifier un utilisateur
async function updateUser(req, res) {
    const { id } = req.params;
    const { email, role } = req.body;
    try {
        const user = await prisma_1.prisma.admin.update({
            where: { id: Number(id) },
            data: { email, role },
        });
        return res.json({ message: "Utilisateur modifié", user });
    }
    catch (error) {
        console.error("Erreur updateUser:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
