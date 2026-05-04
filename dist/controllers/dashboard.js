"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const prisma_1 = require("../prisma");
// GET /dashboard
async function getDashboardStats(req, res) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Total des utilisateurs (admins et superadmins)
        const totalUsers = await prisma_1.prisma.admin.count();
        // Total des plats
        const totalDishes = await prisma_1.prisma.dish.count();
        // Total des tables
        const totalTables = await prisma_1.prisma.table.count();
        // Commandes avec items et plats
        const orders = await prisma_1.prisma.order.findMany({
            include: {
                items: { include: { dish: true } } // ✅ inclure les plats
            },
        });
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "PENDING").length;
        // Revenus aujourd'hui
        const todayOrders = orders.filter(o => o.date >= today);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
        // Revenus totaux
        const monthlyRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        // Plats les plus populaires
        const dishStats = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const dishName = item.dish.name || "Plat inconnu";
                if (!dishStats[dishName])
                    dishStats[dishName] = { orderCount: 0, revenue: 0 };
                dishStats[dishName].orderCount += item.quantity;
                dishStats[dishName].revenue += item.quantity * item.dish.price; // ✅ utiliser item.dish.price
            });
        });
        // Transformer en tableau et trier par popularité
        const popularDishes = Object.entries(dishStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 5);
        res.json({
            totalUsers,
            totalDishes,
            totalTables,
            totalOrders,
            pendingOrders,
            todayRevenue,
            monthlyRevenue,
            popularDishes,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors du chargement du dashboard" });
    }
}
