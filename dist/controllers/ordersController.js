"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.cancelOrder = cancelOrder;
exports.updateOrder = updateOrder;
exports.getAllOrders = getAllOrders;
const prisma_1 = require("../prisma");
const websocket_1 = require("../websocket");
const prisma_2 = require("../../generated/prisma");
// Mapper Prisma → DTO (frontend friendly)
function formatOrder(order) {
    return {
        id: order.id,
        tableNumber: order.table.number,
        customerName: order.nom ?? null,
        status: order.status,
        createdAt: order.createdAt,
        totalAmount: order.total,
        dailyNumber: order.dailyNumber,
        items: order.items.map(it => ({
            dishName: it.dish.name,
            price: it.dish.price,
            quantity: it.quantity,
            subtotal: it.dish.price * it.quantity,
        })),
    };
}
// 📌 Création d’une commande (support tableId OU numéro de table depuis QR code)
async function createOrder(req, res) {
    try {
        const { tableId, tableNumber, plats, nom } = req.body;
        if ((!tableId && !tableNumber) || !plats?.length) {
            return res.status(400).json({ error: "Paramètres manquants (tableId ou tableNumber requis)" });
        }
        // ✅ Récupération de la table
        let table = null;
        if (tableId) {
            table = await prisma_1.prisma.table.findUnique({ where: { id: Number(tableId) } });
        }
        else if (tableNumber) {
            table = await prisma_1.prisma.table.findUnique({ where: { number: Number(tableNumber) } });
        }
        if (!table) {
            return res.status(400).json({ error: "Table inexistante" });
        }
        // ✅ Vérifier que les plats sont valides et disponibles
        const dishIds = plats.map(p => p.platId);
        const dishes = await prisma_1.prisma.dish.findMany({
            where: { id: { in: dishIds }, available: true },
        });
        if (dishes.length !== dishIds.length) {
            return res.status(400).json({ error: "Plats invalides ou indisponibles" });
        }
        // ✅ Calcul du total
        const total = plats.reduce((sum, p) => {
            const dish = dishes.find(d => d.id === p.platId);
            return sum + (dish ? dish.price * p.quantite : 0);
        }, 0);
        // ✅ Création transactionnelle de la commande
        const prismaOrder = await prisma_1.prisma.$transaction(async (tx) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const countToday = await tx.order.count({
                where: { date: { gte: today } },
            });
            return tx.order.create({
                data: {
                    tableId: table.id,
                    nom: nom ?? "",
                    status: prisma_2.OrderStatus.PENDING,
                    total,
                    date: new Date(),
                    dailyNumber: countToday + 1,
                    items: {
                        create: plats.map(p => ({ dishId: p.platId, quantity: p.quantite })),
                    },
                },
                include: { table: true, items: { include: { dish: true } } },
            });
        });
        const orderDTO = formatOrder(prismaOrder);
        // 📡 Notification aux admins
        (0, websocket_1.getIo)().to("admins").emit("order:new", orderDTO);
        return res.status(201).json({ message: "Commande créée", order: orderDTO });
    }
    catch (err) {
        console.error("❌ Erreur création commande :", err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
// 📌 Mise à jour du statut
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!Object.values(prisma_2.OrderStatus).includes(status))
            return res.status(400).json({ error: "Statut invalide" });
        const prismaOrder = await prisma_1.prisma.order.update({
            where: { id: Number(id) },
            data: { status: status },
            include: { table: true, items: { include: { dish: true } } },
        });
        const orderDTO = formatOrder(prismaOrder);
        (0, websocket_1.getIo)().to("admins").emit("order:status", orderDTO);
        return res.json({ message: `Statut mis à jour en ${status}`, order: orderDTO });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
// 📌 Annulation de commande
async function cancelOrder(req, res) {
    try {
        const { id } = req.params;
        const prismaOrder = await prisma_1.prisma.order.update({
            where: { id: Number(id) },
            data: { status: prisma_2.OrderStatus.CANCELED },
            include: { table: true, items: { include: { dish: true } } },
        });
        const orderDTO = formatOrder(prismaOrder);
        (0, websocket_1.getIo)().to("admins").emit("order:status", orderDTO);
        return res.json({ message: "Commande annulée", order: orderDTO });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
// 📌 Mise à jour complète d’une commande
async function updateOrder(req, res) {
    try {
        const { id } = req.params;
        const { nom, plats, notes } = req.body;
        const existingOrder = await prisma_1.prisma.order.findUnique({
            where: { id: Number(id) },
            include: { items: true },
        });
        if (!existingOrder)
            return res.status(404).json({ error: "Commande introuvable" });
        let total = existingOrder.total;
        let itemsUpdate = undefined;
        if (plats?.length) {
            const dishIds = plats.map(p => p.platId);
            const dishes = await prisma_1.prisma.dish.findMany({
                where: { id: { in: dishIds }, available: true },
            });
            if (dishes.length !== dishIds.length)
                return res.status(400).json({ error: "Plats invalides ou indisponibles" });
            total = plats.reduce((sum, p) => {
                const dish = dishes.find(d => d.id === p.platId);
                return sum + (dish ? dish.price * p.quantite : 0);
            }, 0);
            itemsUpdate = {
                deleteMany: {},
                create: plats.map(p => ({ dishId: p.platId, quantity: p.quantite })),
            };
        }
        const prismaOrder = await prisma_1.prisma.order.update({
            where: { id: Number(id) },
            data: { nom, total, ...(itemsUpdate ? { items: itemsUpdate } : {}) },
            include: { table: true, items: { include: { dish: true } } },
        });
        const orderDTO = formatOrder(prismaOrder);
        (0, websocket_1.getIo)().to("admins").emit("order:update", orderDTO);
        return res.json({ message: "Commande mise à jour", order: orderDTO });
    }
    catch (err) {
        console.error("❌ Erreur update commande :", err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
// 📌 Récupération des commandes actives
async function getAllOrders(req, res) {
    try {
        const prismaOrders = await prisma_1.prisma.order.findMany({
            where: { status: { in: [prisma_2.OrderStatus.PENDING, prisma_2.OrderStatus.PREPARING, prisma_2.OrderStatus.READY] } },
            include: { table: true, items: { include: { dish: true } } },
        });
        const ordersDTO = prismaOrders.map(formatOrder);
        return res.json(ordersDTO);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
