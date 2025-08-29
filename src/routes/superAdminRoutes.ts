import { Router } from "express";
import { createAdmin , createSuperAdmin, deleteUser, getAllUser, updateUser} from "../controllers/superAdminController.js";
import {  authRequired, requireRole , } from "../middleware/auth.js";

const router: Router = Router();

// Seul le superadmin peut créer des admins
router.post("/admins", authRequired, requireRole("SUPERADMIN"), createAdmin);

// Seul le superadmin peut créer des super admins
router.post("/superadmins", authRequired, requireRole("SUPERADMIN"), createSuperAdmin);

//Afficher les utilisateurs
router.get("/users", authRequired, requireRole("SUPERADMIN"), getAllUser);

//Supprimer un utilisateur
router.delete("/users/:id", authRequired, requireRole("SUPERADMIN"), deleteUser);

//Modifier un utilisateur
router.patch("/users/:id", authRequired, requireRole("SUPERADMIN"), updateUser);

export default router;
