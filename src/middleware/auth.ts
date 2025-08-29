import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  console.log("[AUTH MIDDLEWARE] Cookies reçus:", req.cookies);
  const token = req.cookies?.token; // On lit le cookie
  if (!token) {
    console.log("[AUTH MIDDLEWARE] Aucun token trouvé dans les cookies.");
    return res.status(401).json({ error: "Non authentifié" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = payload;
    next();
  } catch (e) {
    console.log("[AUTH MIDDLEWARE] Token invalide ou erreur JWT:", e);
    return res.status(401).json({ error: "Token invalide" });
  }
}

// Middleware to require a specific admin role
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}

