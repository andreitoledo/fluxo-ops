import type { UserRole } from "./auth";

export type OrderStatus =
  | "DRAFT"
  | "WAITING_PAYMENT"
  | "PAYMENT_APPROVED"
  | "IN_PRODUCTION"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELED";

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OrderClientSummary {
  id: string;
  legalName: string;
  tradeName?: string | null;
  document: string;
  email?: string | null;
  phone?: string | null;
  contactName?: string | null;
  isActive: boolean;
}

export interface OrderUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ProductSummary {
  id: string;
  name: string;
  sku: string;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
  createdAt: string;
  updatedAt: string;
  product?: ProductSummary;
}

export interface PaymentApproval {
  id: string;
  orderId: string;
  status: PaymentStatus;
  approvedByUserId?: string | null;
  decisionNote?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  clientId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: string;
  productionStartedAt?: string | null;
  productionCompletedAt?: string | null;
  shippedAt?: string | null;
  completedAt?: string | null;
  productionDueDate?: string | null;
  shippingDueDate?: string | null;
  internalNotes?: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    legalName: string;
    tradeName?: string | null;
    document: string;
    isActive: boolean;
  };
  createdByUser: OrderUserSummary;
  _count?: {
    items: number;
  };
}

export interface OrderDetail extends OrderSummary {
  client: OrderClientSummary;
  items: OrderItem[];
  paymentApproval?: PaymentApproval | null;
}

export interface CreateOrderDto {
  clientId: string;
  status?: OrderStatus;
  productionDueDate?: string;
  shippingDueDate?: string;
  internalNotes?: string;
}
export interface CreateOrderInput {
  clientId: string;
  status?: OrderStatus;
  internalNotes?: string;
  productionDueDate?: string;
  shippingDueDate?: string;
}

export interface AddOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface AddOrderItemsInput {
  items: AddOrderItemInput[];
}
