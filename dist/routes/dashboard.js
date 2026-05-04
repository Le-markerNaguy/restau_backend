"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dashboard.ts
const express_1 = require("express");
const dashboard_1 = require("../controllers/dashboard");
const router = (0, express_1.Router)();
router.get("/dashboard", dashboard_1.getDashboardStats);
exports.default = router;
