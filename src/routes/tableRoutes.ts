import { Router } from "express";
import { createTable ,deleteTable,getAllTables ,updateTable, regenerateQRCode } from "../controllers/tablesController.js";

const router: Router = Router();
router.post("/", createTable);
router.get("/", getAllTables);
router.patch("/:id", updateTable);
router.delete("/:id", deleteTable);
router.post("/:id/qr", regenerateQRCode);

export default router;
