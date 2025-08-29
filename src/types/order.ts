import { OrderStatus } from "../../generated/prisma";

export interface OrderItemDTO {
  dishName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDTO {
  id: number;
  tableNumber: number;
  customerName: string | null;
  status: OrderStatus;
  createdAt: Date;
  totalAmount: number;
  dailyNumber: number | null;
  items: OrderItemDTO[];
}
