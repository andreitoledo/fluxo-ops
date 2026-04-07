import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { DecidePaymentDto } from './dto/decide-payment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.OPERATIONS, UserRole.FINANCIAL)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(
    UserRole.ADMIN,
    UserRole.OPERATIONS,
    UserRole.FINANCIAL,
    UserRole.PRODUCTION,
  )
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Roles(
    UserRole.ADMIN,
    UserRole.OPERATIONS,
    UserRole.FINANCIAL,
    UserRole.PRODUCTION,
  )
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @ApiOperation({ summary: 'Criar pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados invalidos para criacao.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Cliente nao encontrado.' })
  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Atualizar cabecalho do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Cabecalho do pedido atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados invalidos para atualizacao.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({
    status: 404,
    description: 'Pedido ou cliente nao encontrado.',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Aprovar ou reprovar pagamento do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Decisao de pagamento registrada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido nao permite decisao financeira.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/payment')
  async decidePayment(
    @Param('id') id: string,
    @Body() dto: DecidePaymentDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.decidePayment(id, dto, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCIAL)
  @ApiOperation({ summary: 'Aprovar pagamento do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento aprovado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Pedido nao permite aprovacao.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/payment/approve')
  async approvePayment(
    @Param('id') id: string,
    @Body() dto: DecidePaymentDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.approvePayment(id, dto, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCIAL)
  @ApiOperation({ summary: 'Rejeitar pagamento do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento rejeitado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Pedido nao permite rejeicao.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/payment/reject')
  async rejectPayment(
    @Param('id') id: string,
    @Body() dto: DecidePaymentDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.rejectPayment(id, dto, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @ApiOperation({ summary: 'Iniciar producao do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Producao iniciada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido nao permite inicio de producao.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/production/start')
  async startProduction(
    @Param('id') id: string,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.startProduction(id, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.PRODUCTION)
  @ApiOperation({ summary: 'Concluir producao do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Producao concluida com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido nao permite conclusao de producao.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/production/complete')
  async completeProduction(
    @Param('id') id: string,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.completeProduction(id, req.user);
  }

  @ApiOperation({ summary: 'Adicionar itens ao pedido' })
  @ApiResponse({
    status: 201,
    description: 'Itens adicionados e total do pedido recalculado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados invalidos para os itens.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({
    status: 404,
    description: 'Pedido ou produto nao encontrado.',
  })
  @Post(':id/items')
  async addItems(
    @Param('id') id: string,
    @Body() dto: AddOrderItemsDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.addItems(id, dto, req.user);
  }
  @ApiOperation({ summary: 'Atualizar item do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Item do pedido atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados invalidos para atualizacao.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido ou item nao encontrado.' })
  @Patch(':id/items/:itemId')
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.updateItem(id, itemId, dto, req.user);
  }

  @ApiOperation({ summary: 'Remover item do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Item removido e total do pedido recalculado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Pedido nao permite alteracao.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido ou item nao encontrado.' })
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.removeItem(id, itemId, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Expedir pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido expedido com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido nao permite expedicao.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/shipping/ship')
  async shipOrder(
    @Param('id') id: string,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.shipOrder(id, req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Concluir pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido concluido com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido nao permite conclusao.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  @Patch(':id/complete')
  async completeOrder(
    @Param('id') id: string,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.completeOrder(id, req.user);
  }
}
