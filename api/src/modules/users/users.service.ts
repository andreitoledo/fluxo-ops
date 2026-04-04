import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ja existe um usuario cadastrado com este e-mail.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: emailNormalizado,
        passwordHash,
        role: dto.role,
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureUserExists(id);

    if (dto.email) {
      const emailNormalizado = dto.email.trim().toLowerCase();

      const existingUserWithEmail = await this.prisma.user.findFirst({
        where: {
          email: emailNormalizado,
          id: {
            not: id,
          },
        },
      });

      if (existingUserWithEmail) {
        throw new ConflictException(
          'Ja existe outro usuario cadastrado com este e-mail.',
        );
      }
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash,
        role: dto.role,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
  }
}
