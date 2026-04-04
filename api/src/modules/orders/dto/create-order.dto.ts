import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: '6b2b42fd-fec8-4f21-8f15-4b28a9a0b7ad',
    description: 'ID do cliente vinculado ao pedido',
  })
  @IsString({ message: 'ClientId deve ser um texto.' })
  clientId: string;

  @ApiPropertyOptional({
    enum: [OrderStatus.DRAFT, OrderStatus.WAITING_PAYMENT],
    example: OrderStatus.DRAFT,
    description: 'Status inicial permitido para o pedido',
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Status inicial invalido.' })
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 'Pedido iniciado pelo time comercial',
    description: 'Observacoes internas do pedido',
  })
  @IsOptional()
  @IsString({ message: 'Observacoes internas devem ser um texto.' })
  internalNotes?: string;

  @ApiPropertyOptional({
    example: '2026-04-15T00:00:00.000Z',
    description: 'Data prevista de producao',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data prevista de producao invalida.' })
  productionDueDate?: string;

  @ApiPropertyOptional({
    example: '2026-04-20T00:00:00.000Z',
    description: 'Data prevista de expedicao',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data prevista de expedicao invalida.' })
  shippingDueDate?: string;
}
