import express, { Express } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"

// Routes
import authRoutes from "./routes/auth.js"
import dishesRoutes from "./routes/disheRoutes.js" // ✅ corrigé
import tablesRoutes from "./routes/tableRoutes.js"
import ordersRoutes from "./routes/orderRoutes.js"
import superAdminRoutes from "./routes/superAdminRoutes.js"
import dashboardRoutes from "./routes/dashboard.js"

const app: Express = express()

// ---------- MIDDLEWARES GLOBAUX ----------
app.use(helmet())
app.use(express.json({ limit: "10mb" })) // 🚀 monte un peu la limite si tu envoies des images
app.use(cookieParser())

// ✅ CORS dynamique basé sur l’ENV
const allowedOrigins = (process.env.NEXT_PUBLIC_FRONTEND_URL?.split(",") as string[]) || [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://restau-frontend.vercel.app",
]

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
)

app.use(morgan("dev"))

// ---------- HEALTH CHECK ----------
app.get("/api/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }))
app.get("/", (_req, res) => res.send("✅ API RESTAURANT en ligne"))

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes)
app.use("/api/dishes", dishesRoutes)
app.use("/api/tables", tablesRoutes)
app.use("/api/orders", ordersRoutes)
app.use("/api/superadmin", superAdminRoutes)
app.use("/api/dashboard", dashboardRoutes)

// ---------- ERREUR 404 ----------
app.use((_req, res) => {
  res.status(404).json({ error: "Route non trouvée" })
})

// ---------- ERREUR GLOBALE ----------
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("🔥 Erreur serveur:", err)
  res.status(500).json({ error: "Erreur interne du serveur" })
})

export default app
