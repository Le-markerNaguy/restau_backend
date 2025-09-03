import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { OrderStatus } from "../../generated/prisma";
import { buildTableUrl, generateQrDataUrl } from "../services/qr";

// ------------------ CREATE ------------------
export async function createTable(req: Request, res: Response) {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: "Le numéro de table est requis" });

    const existingTable = await prisma.table.findUnique({ where: { number: Number(number) } });
    if (existingTable) return res.status(400).json({ error: "Une table avec ce numéro existe déjà" });

    const url = buildTableUrl(number);
    const qrCodeDataUrl = await generateQrDataUrl(url);

    const table = await prisma.table.create({
      data: { number: Number(number), qrData: qrCodeDataUrl }, // ✅ on enregistre le QR code en base64
    });

    return res.status(201).json({ 
      table, 
      qrCodeImage: qrCodeDataUrl, 
      qrCodeUrl: url 
    });
  } catch (error) {
    console.error("Erreur création table:", error);
    return res.status(500).json({ error: "Erreur lors de la création de la table" });
  }
}

// ------------------ GET ALL ------------------
export async function getAllTables(_req: Request, res: Response) {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: { status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY] } },
          orderBy: { createdAt: "desc" },
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
            status: table.orders[0].status,
          }
        : undefined,
    }));

    return res.json(formattedTables);
  } catch (error) {
    console.error("Erreur récupération tables:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des tables" });
  }
}

// ------------------ GET BY ID ------------------
export async function getTableById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({ where: { id: Number(id) }, include: { orders: true } });

    if (!table) return res.status(404).json({ error: "Table non trouvée" });

    return res.json(table);
  } catch (error) {
    console.error("Erreur récupération table:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération de la table" });
  }
}

// ------------------ UPDATE ------------------
export async function updateTable(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { number } = req.body;

    const table = await prisma.table.findUnique({ where: { id: Number(id) } });
    if (!table) return res.status(404).json({ error: "Table non trouvée" });

    let updateData: { number?: number; qrData?: string } = {};
    let qrCodeDataUrl: string | undefined;

    if (number && number !== table.number) {
      const existingTable = await prisma.table.findFirst({
        where: { number: Number(number), NOT: { id: Number(id) } },
      });
      if (existingTable) return res.status(400).json({ error: "Une table avec ce numéro existe déjà" });

      const url = buildTableUrl(number);
      qrCodeDataUrl = await generateQrDataUrl(url);
      updateData = { number: Number(number), qrData: qrCodeDataUrl }; // ✅ image QR code
    } else {
      updateData = { number: table.number };
    }

    const updatedTable = await prisma.table.update({ where: { id: table.id }, data: updateData });

    return res.json(
      qrCodeDataUrl
        ? { table: updatedTable, qrCodeImage: qrCodeDataUrl, qrCodeUrl: buildTableUrl(updatedTable.number) }
        : { table: updatedTable }
    );
  } catch (error) {
    console.error("Erreur mise à jour table:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour de la table" });
  }
}

// ------------------ DELETE ------------------
export async function deleteTable(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const ACTIVE_ORDER_STATUSES = [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY] as const;

    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: { orders: true },
    });

    if (!table) {
      return res.status(404).json({ error: "Table non trouvée" });
    }

    const activeOrders = table.orders.filter((order) =>
      (ACTIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(order.status)
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

// ------------------ REGENERATE QR ------------------
export async function regenerateQRCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({ where: { id: Number(id) } });
    if (!table) return res.status(404).json({ error: "Table non trouvée" });

    const url = buildTableUrl(table.number);
    const qrCodeDataUrl = await generateQrDataUrl(url);

    const updatedTable = await prisma.table.update({ where: { id: table.id }, data: { qrData: qrCodeDataUrl } }); // ✅ image

    return res.json({ 
      table: updatedTable, 
      qrCodeImage: qrCodeDataUrl, 
      qrCodeUrl: url, 
      message: "QR code régénéré avec succès" 
    });
  } catch (error) {
    console.error("Erreur régénération QR code:", error);
    return res.status(500).json({ error: "Erreur lors de la régénération du QR code" });
  }
}
