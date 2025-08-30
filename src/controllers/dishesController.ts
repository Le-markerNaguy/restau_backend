import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { supabase } from "../supabaseClient";

// Étendre Request pour inclure file de Multer
type MulterRequest = Request & { file?: Express.Multer.File };

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
    const mreq = req as MulterRequest;
    const { name, description, price, category, available } = req.body;

    if (!name || !price || isNaN(Number(price))) {
      return res.status(400).json({ error: "Nom et prix sont requis" });
    }

    let finalImageUrl: string | null = null;

    // Upload image sur Supabase si présente
    if (mreq.file) {
      const fileName = `${Date.now()}-${mreq.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads") // ton bucket Supabase
        .upload(fileName, mreq.file.buffer, {
          contentType: mreq.file.mimetype,
          upsert: true, // 🔥 évite les erreurs de doublon
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
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
    const mreq = req as MulterRequest;
    const { id } = req.params;
    const { name, description, price, category, available } = req.body;

    const existing = await prisma.dish.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Plat non trouvé" });

    let finalImageUrl = existing.imageUrl;

    // Upload nouvelle image si fournie
    if (mreq.file) {
      const fileName = `${Date.now()}-${mreq.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, mreq.file.buffer, {
          contentType: mreq.file.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
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

    // 🔥 Supprimer l'image associée dans Supabase si elle existe
    if (existing.imageUrl) {
      const fileName = existing.imageUrl.split("/").pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from("uploads")
          .remove([fileName]);
        if (deleteError) console.warn("⚠️ Impossible de supprimer le fichier Supabase:", deleteError.message);
      }
    }

    await prisma.dish.delete({ where: { id: Number(id) } });
    return res.json({ message: "Plat supprimé" });
  } catch (error) {
    console.error("Erreur deleteDish:", error);
    return res.status(500).json({ error: "Impossible de supprimer le plat" });
  }
}
