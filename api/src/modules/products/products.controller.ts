import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.OPERATIONS, UserRole.PRODUCTION)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Listar produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Produto nao encontrado.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @ApiOperation({ summary: 'Criar produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({
    status: 409,
    description: 'Ja existe produto com o mesmo SKU.',
  })
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Produto nao encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Ja existe outro produto com o mesmo SKU.',
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }
}
