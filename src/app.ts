
import express, { Express } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import dishesRoutes from "./routes/disheRoutes.js";
import tablesRoutes from "./routes/tableRoutes.js";
import ordersRoutes from "./routes/orderRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";



const app: Express = express();

// Sert le dossier public (et donc public/uploads) pour les images
app.use("/uploads", express.static(path.join(process.cwd(),  "public/uploads")));
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors({
  origin: (process.env.FRONTEND_URL?.split(",") as string[]) || "*",
  credentials: true,
}));
app.use(morgan("dev"));


app.get("/api/health", (_req, res) => res.json({ ok: true }));


app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/superadmin", superAdminRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;
