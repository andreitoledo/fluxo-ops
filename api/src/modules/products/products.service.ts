import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const skuNormalizado = dto.sku.trim().toUpperCase();

    const existingProduct = await this.prisma.product.findUnique({
      where: {
        sku: skuNormalizado,
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        'Ja existe um produto cadastrado com este SKU.',
      );
    }

    return this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        sku: skuNormalizado,
        description: dto.description?.trim() || null,
        basePrice: dto.basePrice,
        productionLeadTimeDays: dto.productionLeadTimeDays ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureProductExists(id);

    if (dto.sku) {
      const skuNormalizado = dto.sku.trim().toUpperCase();

      const existingProductWithSku = await this.prisma.product.findFirst({
        where: {
          sku: skuNormalizado,
          id: {
            not: id,
          },
        },
      });

      if (existingProductWithSku) {
        throw new ConflictException(
          'Ja existe outro produto cadastrado com este SKU.',
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        sku: dto.sku?.trim().toUpperCase(),
        description:
          dto.description !== undefined
            ? dto.description.trim() || null
            : undefined,
        basePrice: dto.basePrice,
        productionLeadTimeDays:
          dto.productionLeadTimeDays !== undefined
            ? dto.productionLeadTimeDays
            : undefined,
        isActive: dto.isActive,
      },
    });
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return product;
  }
}
