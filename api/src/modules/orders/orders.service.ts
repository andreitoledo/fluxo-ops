import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DecidePaymentDto } from './dto/decide-payment.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
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
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
            document: true,
            email: true,
            phone: true,
            contactName: true,
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
        items: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado.');
    }

    return order;
  }

  async create(dto: CreateOrderDto, authenticatedUser: AuthenticatedUser) {
    const initialStatus = dto.status ?? OrderStatus.DRAFT;

    this.assertAllowedInitialStatus(initialStatus);

    return this.prisma.$transaction(async (tx) => {
      await this.ensureClientExistsAndActive(tx, dto.clientId);
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const orderNumber = await this.generateOrderNumber(tx);

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          clientId: dto.clientId,
          status: initialStatus,
          paymentStatus: 'PENDING',
          totalAmount: 0,
          internalNotes: this.normalizeOptionalText(dto.internalNotes),
          productionDueDate: dto.productionDueDate
            ? new Date(dto.productionDueDate)
            : null,
          shippingDueDate: dto.shippingDueDate
            ? new Date(dto.shippingDueDate)
            : null,
          createdByUserId: authenticatedUser.sub,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: {
          id: createdOrder.id,
        },
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    });
  }

  async update(
    orderId: string,
    dto: UpdateOrderDto,
    authenticatedUser: AuthenticatedUser,
  ) {
    if (
      dto.clientId === undefined &&
      dto.internalNotes === undefined &&
      dto.productionDueDate === undefined &&
      dto.shippingDueDate === undefined
    ) {
      throw new BadRequestException(
        'Informe ao menos um campo de cabecalho para atualizar o pedido.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const order = await this.ensureOrderExists(tx, orderId);

      this.assertOrderAllowsHeaderChanges(order.status);

      if (dto.clientId !== undefined) {
        this.assertClientChangeAllowed(order.status);
        await this.ensureClientExistsAndActive(tx, dto.clientId);
      }

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          clientId: dto.clientId,
          internalNotes:
            dto.internalNotes !== undefined
              ? this.normalizeOptionalText(dto.internalNotes)
              : undefined,
          productionDueDate:
            dto.productionDueDate !== undefined
              ? new Date(dto.productionDueDate)
              : undefined,
          shippingDueDate:
            dto.shippingDueDate !== undefined
              ? new Date(dto.shippingDueDate)
              : undefined,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              email: true,
              phone: true,
              contactName: true,
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async approvePayment(
    orderId: string,
    dto: DecidePaymentDto,
    authenticatedUser: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const order = await this.ensureOrderExists(tx, orderId);

      this.assertOrderAllowsPaymentDecision(order.status);
      this.assertPaymentApprovalAllowed(order.paymentStatus);

      await tx.paymentApproval.upsert({
        where: {
          orderId: order.id,
        },
        update: {
          status: PaymentStatus.APPROVED,
          approvedByUserId: authenticatedUser.sub,
          decisionNote: this.normalizeOptionalText(dto.decisionNote),
          approvedAt: new Date(),
        },
        create: {
          orderId: order.id,
          status: PaymentStatus.APPROVED,
          approvedByUserId: authenticatedUser.sub,
          decisionNote: this.normalizeOptionalText(dto.decisionNote),
          approvedAt: new Date(),
        },
      });

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: PaymentStatus.APPROVED,
          status: OrderStatus.PAYMENT_APPROVED,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              email: true,
              phone: true,
              contactName: true,
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  isActive: true,
                },
              },
            },
          },
          paymentApproval: true,
        },
      });
    });
  }

  async rejectPayment(
    orderId: string,
    dto: DecidePaymentDto,
    authenticatedUser: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const order = await this.ensureOrderExists(tx, orderId);

      this.assertOrderAllowsPaymentDecision(order.status);
      this.assertPaymentRejectionAllowed(order.paymentStatus);

      const nextOrderStatus =
        order.status === OrderStatus.PAYMENT_APPROVED
          ? OrderStatus.WAITING_PAYMENT
          : order.status;

      await tx.paymentApproval.upsert({
        where: {
          orderId: order.id,
        },
        update: {
          status: PaymentStatus.REJECTED,
          approvedByUserId: authenticatedUser.sub,
          decisionNote: this.normalizeOptionalText(dto.decisionNote),
          approvedAt: new Date(),
        },
        create: {
          orderId: order.id,
          status: PaymentStatus.REJECTED,
          approvedByUserId: authenticatedUser.sub,
          decisionNote: this.normalizeOptionalText(dto.decisionNote),
          approvedAt: new Date(),
        },
      });

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: PaymentStatus.REJECTED,
          status: nextOrderStatus,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },
        include: {
          client: {
            select: {
              id: true,
              legalName: true,
              tradeName: true,
              document: true,
              email: true,
              phone: true,
              contactName: true,
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  isActive: true,
                },
              },
            },
          },
          paymentApproval: true,
        },
      });
    });
  }

  async addItems(
    orderId: string,
    dto: AddOrderItemsDto,
    authenticatedUser: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const order = await this.ensureOrderExists(tx, orderId);

      this.assertOrderAllowsItemChanges(order.status);

      for (const item of dto.items) {
        const product = await this.ensureProductExistsAndActive(
          tx,
          item.productId,
        );

        const unitPrice = new Prisma.Decimal(
          item.unitPrice ?? product.basePrice.toNumber(),
        );

        const subtotal = unitPrice.mul(item.quantity);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            productNameSnapshot: product.name,
            unitPrice,
            quantity: item.quantity,
            subtotal,
          },
        });
      }

      await this.recalculateOrderTotal(tx, order.id);

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async updateItem(
    orderId: string,
    itemId: string,
    dto: UpdateOrderItemDto,
    authenticatedUser: AuthenticatedUser,
  ) {
    if (dto.quantity === undefined && dto.unitPrice === undefined) {
      throw new BadRequestException(
        'Informe ao menos quantity ou unitPrice para atualizar o item.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const order = await this.ensureOrderExists(tx, orderId);

      this.assertOrderAllowsItemChanges(order.status);

      const orderItem = await this.ensureOrderItemExists(tx, order.id, itemId);

      const quantity = dto.quantity ?? orderItem.quantity;
      const unitPrice =
        dto.unitPrice !== undefined
          ? new Prisma.Decimal(dto.unitPrice)
          : orderItem.unitPrice;

      const subtotal = unitPrice.mul(quantity);

      await tx.orderItem.update({
        where: {
          id: orderItem.id,
        },
        data: {
          quantity,
          unitPrice,
          subtotal,
        },
      });

      await this.recalculateOrderTotal(tx, order.id);

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async removeItem(
    orderId: string,
    itemId: string,
    authenticatedUser: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureUserExistsAndActive(tx, authenticatedUser.sub);

      const order = await this.ensureOrderExists(tx, orderId);

      this.assertOrderAllowsItemChanges(order.status);

      const orderItem = await this.ensureOrderItemExists(tx, order.id, itemId);

      await tx.orderItem.delete({
        where: {
          id: orderItem.id,
        },
      });

      await this.recalculateOrderTotal(tx, order.id);

      return tx.order.findUniqueOrThrow({
        where: {
          id: order.id,
        },
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
          items: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    });
  }

  private async recalculateOrderTotal(
    tx: Prisma.TransactionClient,
    orderId: string,
  ) {
    const aggregate = await tx.orderItem.aggregate({
      where: {
        orderId,
      },
      _sum: {
        subtotal: true,
      },
    });

    const totalAmount = aggregate._sum.subtotal ?? new Prisma.Decimal(0);

    await tx.order.update({
      where: { id: orderId },
      data: {
        totalAmount,
      },
    });
  }

  private assertAllowedInitialStatus(status: OrderStatus) {
    const allowedStatuses: OrderStatus[] = [
      OrderStatus.DRAFT,
      OrderStatus.WAITING_PAYMENT,
    ];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        'Pedido so pode ser criado com status DRAFT ou WAITING_PAYMENT.',
      );
    }
  }

  private assertOrderAllowsItemChanges(status: OrderStatus) {
    const editableStatuses: OrderStatus[] = [
      OrderStatus.DRAFT,
      OrderStatus.WAITING_PAYMENT,
    ];

    if (!editableStatuses.includes(status)) {
      throw new BadRequestException(
        'Nao e permitido adicionar itens para pedidos fora de DRAFT ou WAITING_PAYMENT.',
      );
    }
  }

  private assertOrderAllowsHeaderChanges(status: OrderStatus) {
    const editableStatuses: OrderStatus[] = [
      OrderStatus.DRAFT,
      OrderStatus.WAITING_PAYMENT,
    ];

    if (!editableStatuses.includes(status)) {
      throw new BadRequestException(
        'Nao e permitido alterar o cabecalho para pedidos fora de DRAFT ou WAITING_PAYMENT.',
      );
    }
  }

  private assertClientChangeAllowed(status: OrderStatus) {
    if (status !== OrderStatus.DRAFT) {
      throw new BadRequestException(
        'A troca de cliente e permitida apenas para pedidos em DRAFT.',
      );
    }
  }

  private assertOrderAllowsPaymentDecision(status: OrderStatus) {
    const blockedStatuses: OrderStatus[] = [
      OrderStatus.CANCELED,
      OrderStatus.COMPLETED,
      OrderStatus.SHIPPED,
    ];

    if (blockedStatuses.includes(status)) {
      throw new BadRequestException(
        'Nao e permitido decidir pagamento para pedidos cancelados, expedidos ou concluidos.',
      );
    }
  }

  private assertPaymentApprovalAllowed(paymentStatus: PaymentStatus) {
    if (paymentStatus === PaymentStatus.APPROVED) {
      throw new BadRequestException(
        'O pagamento deste pedido ja foi aprovado.',
      );
    }
  }

  private assertPaymentRejectionAllowed(paymentStatus: PaymentStatus) {
    if (paymentStatus === PaymentStatus.REJECTED) {
      throw new BadRequestException(
        'O pagamento deste pedido ja foi rejeitado.',
      );
    }
  }

  private async ensureClientExistsAndActive(
    tx: Prisma.TransactionClient,
    clientId: string,
  ) {
    const client = await tx.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado.');
    }

    if (!client.isActive) {
      throw new BadRequestException(
        'Cliente inativo nao pode receber pedidos.',
      );
    }

    return client;
  }

  private async ensureUserExistsAndActive(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario criador nao encontrado.');
    }

    if (!user.isActive) {
      throw new BadRequestException('Usuario inativo nao pode operar pedidos.');
    }

    return user;
  }

  private async ensureOrderExists(
    tx: Prisma.TransactionClient,
    orderId: string,
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado.');
    }

    return order;
  }

  private async ensureOrderItemExists(
    tx: Prisma.TransactionClient,
    orderId: string,
    itemId: string,
  ) {
    const orderItem = await tx.orderItem.findFirst({
      where: {
        id: itemId,
        orderId,
      },
      select: {
        id: true,
        orderId: true,
        quantity: true,
        unitPrice: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Item do pedido nao encontrado.');
    }

    return orderItem;
  }

  private async ensureProductExistsAndActive(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        basePrice: true,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    if (!product.isActive) {
      throw new BadRequestException(
        'Produto inativo nao pode ser usado no pedido.',
      );
    }

    return product;
  }

  private normalizeOptionalText(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();

    return normalized.length ? normalized : null;
  }

  private async generateOrderNumber(tx: Prisma.TransactionClient) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const timestamp = new Date()
        .toISOString()
        .replace(/\D/g, '')
        .slice(0, 14);

      const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();

      const candidate = `PED-${timestamp}-${randomSuffix}`;

      const existingOrder = await tx.order.findUnique({
        where: {
          orderNumber: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existingOrder) {
        return candidate;
      }
    }

    throw new InternalServerErrorException(
      'Nao foi possivel gerar um numero de pedido unico.',
    );
  }
}
