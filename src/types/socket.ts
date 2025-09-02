// Types des événements Socket.IO entre le serveur et les clients admin
import { Dish, Order, OrderItem, Table, } from "../../generated/prisma";



export type OrderItemWithDish = OrderItem & { dish: Dish };
export type OrderWithRelations = Order & { table: Table; items: OrderItemWithDish[] };


export interface ServerToClientEvents {
    "order:new": (order: OrderWithRelations) => void;
    "order:status": (order: Order) => void;
    "order:update": (order: Order) => void
}


export interface ClientToServerEvents {
    "admin:join": () => void;
}


export interface InterServerEvents { }
export interface SocketData { email?: string; adminId?: number }
