import type { OrderDTO } from "./order"; // ton DTO frontend

export interface ServerToClientEvents {
    "order:new": (order: OrderDTO) => void;
    "order:status": (order: OrderDTO) => void;
    "order:update": (order: OrderDTO) => void;
}

export interface ClientToServerEvents {
    "admin:join": () => void;
}

export interface InterServerEvents { }
export interface SocketData { email?: string; adminId?: number }
