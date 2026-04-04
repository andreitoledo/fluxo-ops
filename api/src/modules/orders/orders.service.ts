import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';

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
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado.');
    }

    return order;
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
