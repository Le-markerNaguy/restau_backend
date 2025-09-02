import { getIo } from "./websocket";
import type { OrderDTO } from "./types/order";

// Émettre une nouvelle commande aux admins
export function emitOrderNew(orderDTO: OrderDTO) {
  getIo().to("admins").emit("order:new", orderDTO);
}

// Émettre un changement de statut
export function emitOrderStatus(orderDTO: OrderDTO) {
  getIo().to("admins").emit("order:status", orderDTO);
}

// Émettre une mise à jour complète
export function emitOrderUpdate(orderDTO: OrderDTO) {
  getIo().to("admins").emit("order:update", orderDTO);
}
