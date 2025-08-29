import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { verifyPassword, hashPassword } from "../services/password";


export async function register(req: Request, res: Response) {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ error: "Cet email est déjà utilisé" });
  }

  const hashed = await hashPassword(motDePasse);

  const user = await prisma.admin.create({
    data: { email, password: hashed, role: "ADMIN" },
  });

  return res.status(201).json({ message: "Utilisateur créé", user: { id: user.id, email: user.email } });
}

export async function login(req: Request, res: Response) {
  const { email, motDePasse } = req.body;

  const user = await prisma.admin.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Identifiants invalides" });

  const valid = await verifyPassword(motDePasse, user.password);
  if (!valid) return res.status(401).json({ error: "Identifiants invalides" });

  console.log("[LOGIN] Utilisateur:", user.email, "Role:", user.role);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // obligatoire en prod (Render utilise HTTPS)
    sameSite: "none", // ⚠️ nécessaire pour cross-domain
    maxAge: 24 * 60 * 60 * 1000,
    path: "/", // optionnel mais plus propre
  });


  return res.json({ message: "Connexion réussie" });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  return res.json({ message: "Déconnecté" });
}

export async function me(req: Request, res: Response) {
  // req.user est défini par middleware/auth.ts
  console.log("[ME] Utilisateur:", (req as any).user?.email, "Role:", (req as any).user?.role);
  return res.json({ user: (req as any).user });
}
