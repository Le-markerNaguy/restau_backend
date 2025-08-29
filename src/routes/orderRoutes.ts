import { Router } from "express";
import { createOrder , getAllOrders , updateOrderStatus ,cancelOrder} from "../controllers/ordersController";

const router: Router = Router();
router.post("/", createOrder);
router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", cancelOrder);

export default router;
