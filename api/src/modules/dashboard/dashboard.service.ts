import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();

    const [
      totalOrders,
      totalRevenueAggregate,
      waitingPaymentCount,
      inProductionCount,
      readyToShipCount,
      completedCount,
      groupedByStatus,
      productionQueue,
      shippingQueue,
      recentAuditLogs,
      overdueProductionOrders,
      overdueShippingOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.order.count({
        where: {
          status: OrderStatus.WAITING_PAYMENT,
        },
      }),
      this.prisma.order.count({
        where: {
          status: OrderStatus.IN_PRODUCTION,
        },
      }),
      this.prisma.order.count({
        where: {
          status: OrderStatus.READY_TO_SHIP,
        },
      }),
      this.prisma.order.count({
        where: {
          status: OrderStatus.COMPLETED,
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      this.prisma.order.findMany({
        where: {
          status: {
            in: [OrderStatus.PAYMENT_APPROVED, OrderStatus.IN_PRODUCTION],
          },
        },
        orderBy: [{ productionDueDate: 'asc' }, { createdAt: 'asc' }],
        take: 10,
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              isActive: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.order.findMany({
        where: {
          status: OrderStatus.READY_TO_SHIP,
        },
        orderBy: [{ shippingDueDate: 'asc' }, { createdAt: 'asc' }],
        take: 10,
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              isActive: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.auditLog.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 8,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.order.findMany({
        where: {
          productionDueDate: {
            lt: now,
          },
          status: {
            in: [
              OrderStatus.DRAFT,
              OrderStatus.WAITING_PAYMENT,
              OrderStatus.PAYMENT_APPROVED,
              OrderStatus.IN_PRODUCTION,
            ],
          },
        },
        orderBy: [{ productionDueDate: 'asc' }, { createdAt: 'asc' }],
        take: 10,
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              isActive: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.order.findMany({
        where: {
          shippingDueDate: {
            lt: now,
          },
          status: {
            in: [
              OrderStatus.DRAFT,
              OrderStatus.WAITING_PAYMENT,
              OrderStatus.PAYMENT_APPROVED,
              OrderStatus.IN_PRODUCTION,
              OrderStatus.READY_TO_SHIP,
            ],
          },
        },
        orderBy: [{ shippingDueDate: 'asc' }, { createdAt: 'asc' }],
        take: 10,
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              isActive: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
    ]);

    const statusMap = new Map<OrderStatus, number>(
      groupedByStatus.map((entry) => [entry.status, entry._count.status]),
    );

    const ordersByStatus = [
      OrderStatus.DRAFT,
      OrderStatus.WAITING_PAYMENT,
      OrderStatus.PAYMENT_APPROVED,
      OrderStatus.IN_PRODUCTION,
      OrderStatus.READY_TO_SHIP,
      OrderStatus.SHIPPED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELED,
    ].map((status) => ({
      status,
      count: statusMap.get(status) ?? 0,
    }));

    return {
      generatedAt: now.toISOString(),
      kpis: {
        totalOrders,
        totalRevenue: this.toSerializableDecimal(
          totalRevenueAggregate._sum.totalAmount,
        ),
        waitingPaymentCount,
        inProductionCount,
        readyToShipCount,
        completedCount,
        overdueCount:
          overdueProductionOrders.length + overdueShippingOrders.length,
      },
      ordersByStatus,
      overdue: {
        production: overdueProductionOrders,
        shipping: overdueShippingOrders,
      },
      queues: {
        production: productionQueue,
        shipping: shippingQueue,
      },
      recentAuditLogs,
    };
  }

  private toSerializableDecimal(value: Prisma.Decimal | null | undefined) {
    return (value ?? new Prisma.Decimal(0)).toString();
  }
}
