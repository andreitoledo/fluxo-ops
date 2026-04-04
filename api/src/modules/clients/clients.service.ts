import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    throw new NotImplementedException(
      'Listagem de clientes sera implementada no proximo patch.',
    );
  }

  findById(_id: string) {
    throw new NotImplementedException(
      'Busca de cliente por id sera implementada no proximo patch.',
    );
  }

  create(_dto: CreateClientDto) {
    throw new NotImplementedException(
      'Criacao de cliente sera implementada no proximo patch.',
    );
  }

  update(_id: string, _dto: UpdateClientDto) {
    throw new NotImplementedException(
      'Atualizacao de cliente sera implementada no proximo patch.',
    );
  }
}
