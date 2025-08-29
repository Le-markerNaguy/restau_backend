import { Request, Response } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";

// Creer un admin
export async function createAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { email, password: hashedPassword, role: "ADMIN" },
    });

    return res.status(201).json({ id: admin.id, email: admin.email, role: admin.role });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erreur création admin" });
  }
}

// CREATE SuperAdmin
export async function createSuperAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.admin.create({
      data: { email, password: hashedPassword, role: "SUPERADMIN" },
    });

    return res.status(201).json({ id: superAdmin.id, email: superAdmin.email, role: superAdmin.role });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erreur création super admin" });
  }
}

//Afficher users
export async function getAllUser(req: Request, res: Response) {
  try {
    console.log("[SUPERADMIN] getAllUser appelé")
    console.log("[SUPERADMIN] User dans la requête:", req.user)
    console.log("[SUPERADMIN] Cookies:", req.cookies)
    
    const admin = await prisma.admin.findMany();
    console.log("[SUPERADMIN] Nombre d'utilisateurs trouvés:", admin.length)
    
    return res.json({ users: admin }); // <-- clé "users"
  } catch (error) {
    console.error("Erreur getAllUser:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

//Supprimer un utilisateur
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const user = await prisma.admin.delete({
      where: { id: Number(id) },
    });
    return res.json({ message: "Utilisateur supprimé", user });
  } catch (error) {
    console.error("Erreur deleteUser:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

//Modifier un utilisateur
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { email, role } = req.body;

  try {
    const user = await prisma.admin.update({
      where: { id: Number(id) },
      data: { email, role },
    });
    return res.json({ message: "Utilisateur modifié", user });
  } catch (error) {
    console.error("Erreur updateUser:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}