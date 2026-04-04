import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha invalidos.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inativo.');
    }

    const senhaValida = await bcrypt.compare(dto.password, user.passwordHash);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha invalidos.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
}
