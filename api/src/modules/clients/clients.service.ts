import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        legalName: 'asc',
      },
    });
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado.');
    }

    return client;
  }

  async create(dto: CreateClientDto) {
    const documentoNormalizado = dto.document.trim();

    const existingClient = await this.prisma.client.findUnique({
      where: {
        document: documentoNormalizado,
      },
    });

    if (existingClient) {
      throw new ConflictException(
        'Ja existe um cliente cadastrado com este documento.',
      );
    }

    return this.prisma.client.create({
      data: {
        legalName: dto.legalName.trim(),
        tradeName: dto.tradeName?.trim() || null,
        document: documentoNormalizado,
        email: dto.email?.trim().toLowerCase() || null,
        phone: dto.phone?.trim() || null,
        contactName: dto.contactName?.trim() || null,
        notes: dto.notes?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.ensureClientExists(id);

    if (dto.document) {
      const documentoNormalizado = dto.document.trim();

      const existingClientWithDocument = await this.prisma.client.findFirst({
        where: {
          document: documentoNormalizado,
          id: {
            not: id,
          },
        },
      });

      if (existingClientWithDocument) {
        throw new ConflictException(
          'Ja existe outro cliente cadastrado com este documento.',
        );
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        legalName: dto.legalName?.trim(),
        tradeName:
          dto.tradeName !== undefined
            ? dto.tradeName.trim() || null
            : undefined,
        document: dto.document?.trim(),
        email:
          dto.email !== undefined
            ? dto.email.trim().toLowerCase() || null
            : undefined,
        phone: dto.phone !== undefined ? dto.phone.trim() || null : undefined,
        contactName:
          dto.contactName !== undefined
            ? dto.contactName.trim() || null
            : undefined,
        notes: dto.notes !== undefined ? dto.notes.trim() || null : undefined,
        isActive: dto.isActive,
      },
    });
  }

  private async ensureClientExists(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado.');
    }

    return client;
  }
}
