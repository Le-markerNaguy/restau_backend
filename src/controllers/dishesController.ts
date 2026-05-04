import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { uploadImageToSupabase, deleteImageFromSupabase } from "../services/supabaseStorage";

// ========================
// 📌 Récupérer tous les plats
// ========================
export async function getAllDishes(_req: Request, res: Response) {
  try {
    const dishes = await prisma.dish.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(dishes);
  } catch (error) {
    console.error("Erreur getAllDishes:", error);
    return res.status(500).json({ error: "Impossible de récupérer les plats" });
  }
}

// ========================
// 📌 Créer un plat
// ========================
export async function createDish(req: Request, res: Response) {
  try {
    const { name, description, price, category, available, imageUrl } = req.body;

    if (!name || !price || isNaN(Number(price))) {
      return res.status(400).json({ error: "Nom et prix sont requis" });
    }

    // Priorité : fichier uploadé > URL fournie en body
    let finalImageUrl: string | null = null;
    if (req.file) {
      finalImageUrl = await uploadImageToSupabase(req.file);
    } else if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
      finalImageUrl = imageUrl.trim();
    }

    const dish = await prisma.dish.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        category,
        available:
          available === undefined
            ? true
            : available === "true" || available === true,
        imageUrl: finalImageUrl,
      },
    });

    return res.status(201).json(dish);
  } catch (error) {
    console.error("Erreur createDish:", error);
    return res.status(500).json({ error: "Impossible de créer le plat" });
  }
}

// ========================
// 📌 Mettre à jour un plat
// ========================
export async function updateDish(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, price, category, available, imageUrl } = req.body;

    const existing = await prisma.dish.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Plat non trouvé" });

    let finalImageUrl = existing.imageUrl;

    // Si un nouveau fichier est uploadé
    if (req.file) {
      finalImageUrl = await uploadImageToSupabase(req.file);
      // Supprimer l'ancienne image
      if (existing.imageUrl) {
        await deleteImageFromSupabase(existing.imageUrl);
      }
    } else if (imageUrl !== undefined) {
      // Sinon, utiliser l'URL fournie en body si elle existe
      const newImageUrl =
        typeof imageUrl === "string" && imageUrl.trim().length > 0 ? imageUrl.trim() : null;
      
      // Si l'URL change, supprimer l'ancienne
      if (newImageUrl !== existing.imageUrl && existing.imageUrl) {
        await deleteImageFromSupabase(existing.imageUrl);
      }
      
      finalImageUrl = newImageUrl;
    }

    const dish = await prisma.dish.update({
      where: { id: Number(id) },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        price: price ? parseFloat(price) : existing.price,
        category: category ?? existing.category,
        available:
          available === undefined
            ? existing.available
            : available === "true" || available === true,
        imageUrl: finalImageUrl,
      },
    });

    return res.json(dish);
  } catch (error) {
    console.error("Erreur updateDish:", error);
    return res.status(500).json({ error: "Impossible de mettre à jour le plat" });
  }
}

// ========================
// 📌 Supprimer un plat
// ========================
export async function deleteDish(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.dish.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Plat non trouvé" });

    // Supprimer l'image de Supabase Storage
    if (existing.imageUrl) {
      await deleteImageFromSupabase(existing.imageUrl);
    }

    await prisma.dish.delete({ where: { id: Number(id) } });
    return res.json({ message: "Plat supprimé" });
  } catch (error) {
    console.error("Erreur deleteDish:", error);
    return res.status(500).json({ error: "Impossible de supprimer le plat" });
  }
}
