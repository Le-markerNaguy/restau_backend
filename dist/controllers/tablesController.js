"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTable = createTable;
exports.getAllTables = getAllTables;
exports.getTableById = getTableById;
exports.updateTable = updateTable;
exports.deleteTable = deleteTable;
exports.regenerateQRCode = regenerateQRCode;
const prisma_1 = require("../prisma");
const prisma_2 = require("../../generated/prisma");
const qr_1 = require("../services/qr");
// ------------------ CREATE ------------------
async function createTable(req, res) {
    try {
        const { number } = req.body;
        if (!number)
            return res.status(400).json({ error: "Le numéro de table est requis" });
        const existingTable = await prisma_1.prisma.table.findUnique({ where: { number: Number(number) } });
        if (existingTable)
            return res.status(400).json({ error: "Une table avec ce numéro existe déjà" });
        const url = (0, qr_1.buildTableUrl)(number);
        const qrCodeDataUrl = await (0, qr_1.generateQrDataUrl)(url);
        const table = await prisma_1.prisma.table.create({
            data: { number: Number(number), qrData: qrCodeDataUrl }, // ✅ on enregistre le QR code en base64
        });
        return res.status(201).json({
            table,
            qrCodeImage: qrCodeDataUrl,
            qrCodeUrl: url
        });
    }
    catch (error) {
        console.error("Erreur création table:", error);
        return res.status(500).json({ error: "Erreur lors de la création de la table" });
    }
}
// ------------------ GET ALL ------------------
async function getAllTables(_req, res) {
    try {
        const tables = await prisma_1.prisma.table.findMany({
            include: {
                orders: {
                    where: { status: { in: [prisma_2.OrderStatus.PENDING, prisma_2.OrderStatus.PREPARING, prisma_2.OrderStatus.READY] } },
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
    }
    catch (error) {
        console.error("Erreur récupération tables:", error);
        return res.status(500).json({ error: "Erreur lors de la récupération des tables" });
    }
}
// ------------------ GET BY ID ------------------
async function getTableById(req, res) {
    try {
        const { id } = req.params;
        const table = await prisma_1.prisma.table.findUnique({ where: { id: Number(id) }, include: { orders: true } });
        if (!table)
            return res.status(404).json({ error: "Table non trouvée" });
        return res.json(table);
    }
    catch (error) {
        console.error("Erreur récupération table:", error);
        return res.status(500).json({ error: "Erreur lors de la récupération de la table" });
    }
}
// ------------------ UPDATE ------------------
async function updateTable(req, res) {
    try {
        const { id } = req.params;
        const { number } = req.body;
        const table = await prisma_1.prisma.table.findUnique({ where: { id: Number(id) } });
        if (!table)
            return res.status(404).json({ error: "Table non trouvée" });
        let updateData = {};
        let qrCodeDataUrl;
        if (number && number !== table.number) {
            const existingTable = await prisma_1.prisma.table.findFirst({
                where: { number: Number(number), NOT: { id: Number(id) } },
            });
            if (existingTable)
                return res.status(400).json({ error: "Une table avec ce numéro existe déjà" });
            const url = (0, qr_1.buildTableUrl)(number);
            qrCodeDataUrl = await (0, qr_1.generateQrDataUrl)(url);
            updateData = { number: Number(number), qrData: qrCodeDataUrl }; // ✅ image QR code
        }
        else {
            updateData = { number: table.number };
        }
        const updatedTable = await prisma_1.prisma.table.update({ where: { id: table.id }, data: updateData });
        return res.json(qrCodeDataUrl
            ? { table: updatedTable, qrCodeImage: qrCodeDataUrl, qrCodeUrl: (0, qr_1.buildTableUrl)(updatedTable.number) }
            : { table: updatedTable });
    }
    catch (error) {
        console.error("Erreur mise à jour table:", error);
        return res.status(500).json({ error: "Erreur lors de la mise à jour de la table" });
    }
}
// ------------------ DELETE ------------------
async function deleteTable(req, res) {
    try {
        const { id } = req.params;
        const ACTIVE_ORDER_STATUSES = [prisma_2.OrderStatus.PENDING, prisma_2.OrderStatus.PREPARING, prisma_2.OrderStatus.READY];
        const table = await prisma_1.prisma.table.findUnique({
            where: { id: Number(id) },
            include: { orders: true },
        });
        if (!table) {
            return res.status(404).json({ error: "Table non trouvée" });
        }
        const activeOrders = table.orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
        if (activeOrders.length > 0) {
            return res.status(400).json({
                error: "Impossible de supprimer une table avec des commandes en cours",
            });
        }
        await prisma_1.prisma.table.delete({ where: { id: Number(id) } });
        return res.json({ message: "Table supprimée avec succès" });
    }
    catch (error) {
        console.error("Erreur suppression table:", error);
        return res.status(500).json({ error: "Erreur lors de la suppression de la table" });
    }
}
// ------------------ REGENERATE QR ------------------
async function regenerateQRCode(req, res) {
    try {
        const { id } = req.params;
        const table = await prisma_1.prisma.table.findUnique({ where: { id: Number(id) } });
        if (!table)
            return res.status(404).json({ error: "Table non trouvée" });
        const url = (0, qr_1.buildTableUrl)(table.number);
        const qrCodeDataUrl = await (0, qr_1.generateQrDataUrl)(url);
        const updatedTable = await prisma_1.prisma.table.update({ where: { id: table.id }, data: { qrData: qrCodeDataUrl } }); // ✅ image
        return res.json({
            table: updatedTable,
            qrCodeImage: qrCodeDataUrl,
            qrCodeUrl: url,
            message: "QR code régénéré avec succès"
        });
    }
    catch (error) {
        console.error("Erreur régénération QR code:", error);
        return res.status(500).json({ error: "Erreur lors de la régénération du QR code" });
    }
}
