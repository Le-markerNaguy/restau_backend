// types/order.ts
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
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELED";
  createdAt: Date;
  totalAmount: number;
  dailyNumber?: number;
  items: OrderItemDTO[];
}
