import type { AuditLogEntry, OrderStatus, OrderSummary } from "./orders";

export interface DashboardKpis {
  totalOrders: number;
  totalRevenue: string;
  waitingPaymentCount: number;
  inProductionCount: number;
  readyToShipCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface DashboardStatusCount {
  status: OrderStatus;
  count: number;
}

export interface DashboardOverview {
  generatedAt: string;
  kpis: DashboardKpis;
  ordersByStatus: DashboardStatusCount[];
  overdue: {
    production: OrderSummary[];
    shipping: OrderSummary[];
  };
  queues: {
    production: OrderSummary[];
    shipping: OrderSummary[];
  };
  recentAuditLogs: Array<
    AuditLogEntry & {
      order?: {
        id: string;
        orderNumber: string;
        status: OrderStatus;
      } | null;
    }
  >;
}
