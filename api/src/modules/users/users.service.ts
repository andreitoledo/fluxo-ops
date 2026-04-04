import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    throw new NotImplementedException(
      'Listagem de usuarios sera implementada no proximo patch.',
    );
  }

  findById(_id: string) {
    throw new NotImplementedException(
      'Busca de usuario por id sera implementada no proximo patch.',
    );
  }

  create(_dto: CreateUserDto) {
    throw new NotImplementedException(
      'Criacao de usuario sera implementada no proximo patch.',
    );
  }

  update(_id: string, _dto: UpdateUserDto) {
    throw new NotImplementedException(
      'Atualizacao de usuario sera implementada no proximo patch.',
    );
  }
}
