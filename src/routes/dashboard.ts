// src/routes/dashboard.ts
import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard";

const router = Router();

router.get("/dashboard", getDashboardStats);

export default router;
