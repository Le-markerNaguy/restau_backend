import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { getIo } from "../websocket.js";
import type { OrderDTO } from "../types/order";
import { OrderStatus, Prisma } from "../../generated/prisma";

// ⚡ Type Prisma complet avec relations
type OrderWithRelations = Prisma.OrderGetPayload<{
  include: { table: true; items: { include: { dish: true } } };
}>;

// ✅ Mapper Prisma → DTO (frontend friendly)
function formatOrder(order: OrderWithRelations): OrderDTO {
  return {
    id: order.id,
    tableNumber: order.table.number,
    customerName: order.nom,
    status: order.status,
    createdAt: order.createdAt,
    totalAmount: order.total,
    dailyNumber: order.dailyNumber,
    items: order.items.map((it) => ({
      dishName: it.dish.name,
      price: it.dish.price,
      quantity: it.quantity,
      subtotal: it.dish.price * it.quantity,
    })),
  };
}

// 📌 Création d’une commande (version sécurisée avec transaction)
export async function createOrder(req: Request, res: Response) {
  try {
    const { tableId, plats, nom } = req.body as {
      tableId: number;
      plats: { platId: number; quantite: number }[];
      nom?: string;
    };

    if (!tableId || !plats?.length) {
      return res.status(400).json({ error: "Paramètres manquants" });
    }

    // Vérifier si la table existe
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      return res.status(400).json({ error: "Table inexistante" });
    }

    // Vérifier que les plats existent et sont dispos
    const dishIds = plats.map((p) => p.platId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds }, available: true },
    });
    if (dishes.length !== dishIds.length) {
      return res.status(400).json({ error: "Plats invalides ou indisponibles" });
    }

    // Calculer le total
    const total = plats.reduce((sum, p) => {
      const dish = dishes.find((d) => d.id === p.platId);
      return sum + (dish ? dish.price * p.quantite : 0);
    }, 0);

    // Début de transaction
    const prismaOrder = await prisma.$transaction(async (tx) => {
      // 📌 Calcul du numéro du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const countToday = await tx.order.count({
        where: { date: { gte: today } },
      });

      // Création de la commande
      return tx.order.create({
        data: {
          tableId,
          nom: nom ?? "",
          status: OrderStatus.PENDING,
          total,
          date: new Date(),
          dailyNumber: countToday + 1, // ⚡ sécurisé
          items: {
            create: plats.map((p) => ({
              dishId: p.platId,
              quantity: p.quantite,
            })),
          },
        },
        include: { table: true, items: { include: { dish: true } } },
      });
    });

    // Mapper DTO
    const orderDTO = formatOrder(prismaOrder);

    // 🚀 Notifier les admins en temps réel
    getIo().to("admins").emit("order:new", prismaOrder);

    return res
      .status(201)
      .json({ message: "Commande créée avec succès 🎉", order: orderDTO });
  } catch (err) {
    console.error("❌ Erreur création commande :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}


// 📌 Mise à jour du statut
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const prismaOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status as OrderStatus },
      include: { table: true, items: { include: { dish: true } } },
    });

    const orderDTO = formatOrder(prismaOrder);
    getIo().to("admins").emit("order:status", prismaOrder);

    return res.json({ message: `Statut mis à jour en ${status}`, order: orderDTO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// 📌 Annulation de commande
export async function cancelOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const prismaOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: OrderStatus.CANCELED },
      include: { table: true, items: { include: { dish: true } } },
    });

    const orderDTO = formatOrder(prismaOrder);
    getIo().to("admins").emit("order:status", prismaOrder);

    return res.json({ message: "Commande annulée ❌", order: orderDTO });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// 📌 Récupération des commandes actives
export async function getAllOrders(req: Request, res: Response) {
  try {
    const prismaOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
        },
      },
      include: { table: true, items: { include: { dish: true } } },
    });

    const ordersDTO = prismaOrders.map(formatOrder);
    return res.json(ordersDTO);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
// 📌 Mise à jour complète d’une commande
export async function updateOrder(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { nom, plats, notes } = req.body as {
      nom?: string
      plats?: { platId: number; quantite: number }[]
      notes?: string
    }

    // Vérifier si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    })
    if (!existingOrder) {
      return res.status(404).json({ error: "Commande introuvable" })
    }

    // ⚡ Si plats envoyés → recalcul du total
    let total = existingOrder.total
    let itemsUpdate: any = undefined

    if (plats && plats.length > 0) {
      const dishIds = plats.map((p) => p.platId)
      const dishes = await prisma.dish.findMany({
        where: { id: { in: dishIds }, available: true },
      })

      if (dishes.length !== dishIds.length) {
        return res.status(400).json({ error: "Plats invalides ou indisponibles" })
      }

      total = plats.reduce((sum, p) => {
        const dish = dishes.find((d) => d.id === p.platId)
        return sum + (dish ? dish.price * p.quantite : 0)
      }, 0)

      // ⚡ On supprime les anciens items et on recrée
      itemsUpdate = {
        deleteMany: {},
        create: plats.map((p) => ({
          dishId: p.platId,
          quantity: p.quantite,
        })),
      }
    }

    const prismaOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        nom,
        dailyNumber: existingOrder.dailyNumber,
        total,
        ...(itemsUpdate ? { items: itemsUpdate } : {}),
      },
      include: { table: true, items: { include: { dish: true } } },
    })

    const orderDTO = formatOrder(prismaOrder)

    // 🚀 Émettre un event temps réel
    getIo().to("admins").emit("order:update", prismaOrder)

    return res.json({ message: "Commande mise à jour ✅", order: orderDTO })
  } catch (err) {
    console.error("❌ Erreur update commande :", err)
    return res.status(500).json({ error: "Erreur serveur" })
  }
}
