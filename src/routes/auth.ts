import { Router } from "express";
import { register, login, logout, me } from "../controllers/authController";
import { authRequired } from "../middleware/auth";

const router : Router =Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authRequired, me);

export default router;
