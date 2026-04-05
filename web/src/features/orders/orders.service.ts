import { http } from "../../services/http";
import type { OrderDetail, OrderSummary } from "../../types/orders";

export async function getOrders() {
  const { data } = await http.get<OrderSummary[]>("/orders");
  return data;
}

export async function getOrderById(id: string) {
  const { data } = await http.get<OrderDetail>(`/orders/${id}`);
  return data;
}
