import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import dishesRoutes from "./routes/disheRoutes.js"; // ⚡ corrige le nom : pas "disheRoutes"
import tablesRoutes from "./routes/tableRoutes.js";
import ordersRoutes from "./routes/orderRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

const app: Express = express();

// Middlewares globaux
app.use(helmet());
app.use(express.json({ limit: "5mb" })); // ⚡ augmenté un peu car tu passes potentiellement des images en base64
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://restau-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("✅ API RESTAURANT en ligne"));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/superadmin", superAdminRoutes);

export default app;
