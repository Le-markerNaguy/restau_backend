import { Router } from "express";
import { createDish, deleteDish, getAllDishes, updateDish , } from "../controllers/dishesController";
import { upload } from "../middleware/upload";


const router: Router = Router();

// PLATS CRUD
router.get("/", getAllDishes);
router.post("/", upload.single("image"), createDish);
router.patch("/:id", upload.single("image"), updateDish);
router.delete("/:id", deleteDish);


export default router;
