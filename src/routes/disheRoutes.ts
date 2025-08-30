import { Router } from "express";
import {
  createDish,
  deleteDish,
  getAllDishes,
  updateDish,
} from "../controllers/dishesController.js";
import { upload } from "../middleware/upload.js";

const router: Router = Router();

// CRUD plats
router.get("/", getAllDishes);
router.post("/", upload.single("image"), createDish);
router.patch("/:id", upload.single("image"), updateDish);
router.delete("/:id", deleteDish);

export default router;
