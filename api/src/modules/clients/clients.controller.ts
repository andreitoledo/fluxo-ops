import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Clients')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.OPERATIONS, UserRole.FINANCIAL)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Listar clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @Get()
  async findAll() {
    return this.clientsService.findAll();
  }

  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Cliente nao encontrado.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @ApiOperation({ summary: 'Criar cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({
    status: 409,
    description: 'Ja existe cliente com o mesmo documento.',
  })
  @Post()
  async create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Cliente nao encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Ja existe outro cliente com o mesmo documento.',
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }
}
