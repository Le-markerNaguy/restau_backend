"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminController_1 = require("../controllers/superAdminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Seul le superadmin peut créer des admins
router.post("/admins", auth_1.authRequired, (0, auth_1.requireRole)("SUPERADMIN"), superAdminController_1.createAdmin);
// Seul le superadmin peut créer des super admins
router.post("/superadmins", auth_1.authRequired, (0, auth_1.requireRole)("SUPERADMIN"), superAdminController_1.createSuperAdmin);
//Afficher les utilisateurs
router.get("/users", auth_1.authRequired, (0, auth_1.requireRole)("SUPERADMIN"), superAdminController_1.getAllUser);
//Supprimer un utilisateur
router.delete("/users/:id", auth_1.authRequired, (0, auth_1.requireRole)("SUPERADMIN"), superAdminController_1.deleteUser);
//Modifier un utilisateur
router.patch("/users/:id", auth_1.authRequired, (0, auth_1.requireRole)("SUPERADMIN"), superAdminController_1.updateUser);
exports.default = router;
