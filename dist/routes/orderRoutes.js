"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ordersController_1 = require("../controllers/ordersController");
const router = (0, express_1.Router)();
router.post("/", ordersController_1.createOrder);
router.get("/", ordersController_1.getAllOrders);
router.patch("/:id/status", ordersController_1.updateOrderStatus);
router.patch("/:id", ordersController_1.updateOrder); // 👈 nouvelle route pour modifier une commande
router.delete("/:id", ordersController_1.cancelOrder);
router.post("/table/:tableNumber", ordersController_1.createOrder);
exports.default = router;
