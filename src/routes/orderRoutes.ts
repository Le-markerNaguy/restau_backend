import { Router } from "express";
import { 
  createOrder, 
  getAllOrders, 
  updateOrderStatus, 
  cancelOrder,
  updateOrder // 👈 importer la nouvelle fonction
} from "../controllers/ordersController.js";

const router: Router = Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id", updateOrder); // 👈 nouvelle route pour modifier une commande
router.delete("/:id", cancelOrder);

export default router;
