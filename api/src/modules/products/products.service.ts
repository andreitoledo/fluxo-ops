import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    throw new NotImplementedException(
      'Listagem de produtos sera implementada no proximo patch.',
    );
  }

  findById(_id: string) {
    throw new NotImplementedException(
      'Busca de produto por id sera implementada no proximo patch.',
    );
  }

  create(_dto: CreateProductDto) {
    throw new NotImplementedException(
      'Criacao de produto sera implementada no proximo patch.',
    );
  }

  update(_id: string, _dto: UpdateProductDto) {
    throw new NotImplementedException(
      'Atualizacao de produto sera implementada no proximo patch.',
    );
  }
}
