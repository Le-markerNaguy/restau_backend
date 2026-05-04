"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dishesController_1 = require("../controllers/dishesController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// CRUD plats
router.get("/", dishesController_1.getAllDishes);
router.post("/", upload_1.upload.single("image"), dishesController_1.createDish);
router.patch("/:id", upload_1.upload.single("image"), dishesController_1.updateDish);
router.delete("/:id", dishesController_1.deleteDish);
exports.default = router;
