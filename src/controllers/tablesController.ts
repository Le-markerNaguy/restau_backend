import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { buildTableUrl, generateQrDataUrl } from "../services/qr";
import { OrderStatus } from "../../generated/prisma"; // ✅ Import de l'enum Prisma

// 📌 Créer une table
export async function createTable(req: Request, res: Response) {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: "Le numéro de table est requis" });
    }

    const existingTable = await prisma.table.findUnique({
      where: { number: Number(number) },
    });

    if (existingTable) {
      return res.status(400).json({ error: "Une table avec ce numéro existe déjà" });
    }

    let table = await prisma.table.create({
      data: { number: Number(number), qrData: "" },
    });

    // Génération du QR code
    const url = buildTableUrl(table.number);
    const qrCodeDataUrl = await generateQrDataUrl(url);

    table = await prisma.table.update({
      where: { id: table.id },
      data: { qrData: qrCodeDataUrl },
    });

    return res.status(201).json({ table, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error("Erreur création table:", error);
    return res.status(500).json({ error: "Erreur lors de la création de la table" });
  }
}

// 📌 Afficher toutes les tables
export async function getAllTables(_req: Request, res: Response) {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            status: {
              in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY], // ✅ Enum typé
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const formattedTables = tables.map((table) => ({
      ...table,
      currentOrder: table.orders[0]
        ? {
          id: table.orders[0].id,
          totalAmount: table.orders[0].total,
          createdAt: table.orders[0].createdAt,
        }
        : undefined,
    }));

    // ✅ Retourne directement le tableau
    return res.json(formattedTables);
  } catch (error) {
    console.error("Erreur récupération tables:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des tables" });
  }
}

// 📌 Afficher une table par ID
export async function getTableById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: { orders: true }, // ✅ inclure les commandes
    });

    if (!table) {
      return res.status(404).json({ error: "Table non trouvée" });
    }

    return res.json(table);
  } catch (error) {
    console.error("Erreur récupération table:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération de la table" });
  }
}

// 📌 Mettre à jour une table
export async function updateTable(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { number } = req.body;

    let table = await prisma.table.findUnique({
      where: { id: Number(id) },
    });

    if (!table) {
      return res.status(404).json({ error: "Table non trouvée" });
    }

    // Vérifier si le nouveau numéro existe déjà (sauf cette table)
    if (number && number !== table.number) {
      const existingTable = await prisma.table.findFirst({
        where: {
          number: Number(number),
          NOT: { id: Number(id) }, // ✅ findFirst accepte NOT
        },
      });

      if (existingTable) {
        return res.status(400).json({ error: "Une table avec ce numéro existe déjà" });
      }
    }

    // Mise à jour
    table = await prisma.table.update({
      where: { id: Number(id) },
      data: { number: Number(number) },
    });

    // Regénérer le QR code si le numéro change
    if (number && number !== table.number) {
      const url = buildTableUrl(table.number);
      const qrCodeDataUrl = await generateQrDataUrl(url);

      table = await prisma.table.update({
        where: { id: table.id },
        data: { qrData: qrCodeDataUrl },
      });
    }

    return res.json({ table });
  } catch (error) {
    console.error("Erreur mise à jour table:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour de la table" });
  }
}

// 📌 Supprimer une table
export async function deleteTable(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PREPARING,
      OrderStatus.READY
    ];
    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: { orders: true }, // ✅ inclure commandes
    });

    if (!table) {
      return res.status(404).json({ error: "Table non trouvée" });
    }

    // Vérifier commandes actives
  const activeOrders = table.orders.filter(order =>
  ACTIVE_ORDER_STATUSES.includes(order.status)
);

    if (activeOrders.length > 0) {
      return res.status(400).json({
        error: "Impossible de supprimer une table avec des commandes en cours",
      });
    }

    await prisma.table.delete({ where: { id: Number(id) } });

    return res.json({ message: "Table supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression table:", error);
    return res.status(500).json({ error: "Erreur lors de la suppression de la table" });
  }
}

// 📌 Régénérer QR Code
export async function regenerateQRCode(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({ where: { id: Number(id) } });

    if (!table) {
      return res.status(404).json({ error: "Table non trouvée" });
    }

    const url = buildTableUrl(table.number);
    const qrCodeDataUrl = await generateQrDataUrl(url);

    const updatedTable = await prisma.table.update({
      where: { id: Number(id) },
      data: { qrData: qrCodeDataUrl },
    });

    return res.json({
      table: updatedTable,
      qrCode: qrCodeDataUrl,
      message: "QR code régénéré avec succès",
    });
  } catch (error) {
    console.error("Erreur régénération QR code:", error);
    return res.status(500).json({ error: "Erreur lors de la régénération du QR code" });
  }
}
