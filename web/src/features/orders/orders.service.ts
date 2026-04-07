import { http } from "../../services/http";
import type {
  AddOrderItemsInput,
  CreateOrderInput,
  DecidePaymentInput,
  OrderDetail,
  OrderSummary,
} from "../../types/orders";

export const ordersService = {
  async getAll() {
    const { data } = await http.get<OrderSummary[]>("/orders");
    return data;
  },

  async getById(id: string) {
    const { data } = await http.get<OrderDetail>(`/orders/${id}`);
    return data;
  },

  async create(input: CreateOrderInput) {
    const payload = {
      clientId: input.clientId,
      status: input.status,
      internalNotes: input.internalNotes?.trim() || undefined,
      productionDueDate: input.productionDueDate || undefined,
      shippingDueDate: input.shippingDueDate || undefined,
    };

    const { data } = await http.post<OrderDetail>("/orders", payload);
    return data;
  },

  async addItems(orderId: string, input: AddOrderItemsInput) {
    const payload = {
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    const { data } = await http.post<OrderDetail>(
      `/orders/${orderId}/items`,
      payload,
    );
    return data;
  },

  async approvePayment(
    orderId: string,
    input?: Omit<DecidePaymentInput, "status">,
  ) {
    const payload = {
      status: "APPROVED" as const,
      decisionNote: input?.decisionNote?.trim() || undefined,
    };

    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/payment/approve`,
      payload,
    );

    return data;
  },

  async rejectPayment(
    orderId: string,
    input?: Omit<DecidePaymentInput, "status">,
  ) {
    const payload = {
      status: "REJECTED" as const,
      decisionNote: input?.decisionNote?.trim() || undefined,
    };

    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/payment/reject`,
      payload,
    );

    return data;
  },

  async startProduction(orderId: string) {
    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/production/start`,
    );

    return data;
  },

  async completeProduction(orderId: string) {
    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/production/complete`,
    );

    return data;
  },

  async shipOrder(orderId: string) {
    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/shipping/ship`,
    );

    return data;
  },

  async completeOrder(orderId: string) {
    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/complete`,
    );

    return data;
  },

  async startProduction(orderId: string) {
    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/production/start`,
    );

    return data;
  },

  async completeProduction(orderId: string) {
    const { data } = await http.patch<OrderDetail>(
      `/orders/${orderId}/production/complete`,
    );

    return data;
  },
};
