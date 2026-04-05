import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    example: '6b2b42fd-fec8-4f21-8f15-4b28a9a0b7ad',
    description: 'Novo cliente do pedido. Permitido apenas em DRAFT.',
  })
  @IsOptional()
  @IsString({ message: 'ClientId deve ser um texto.' })
  clientId?: string;

  @ApiPropertyOptional({
    example: 'Pedido revisado pelo comercial antes da aprovacao financeira',
    description: 'Observacoes internas do pedido',
  })
  @IsOptional()
  @IsString({ message: 'Observacoes internas devem ser um texto.' })
  internalNotes?: string;

  @ApiPropertyOptional({
    example: '2026-04-18T00:00:00.000Z',
    description: 'Nova data prevista de producao',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data prevista de producao invalida.' })
  productionDueDate?: string;

  @ApiPropertyOptional({
    example: '2026-04-23T00:00:00.000Z',
    description: 'Nova data prevista de expedicao',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data prevista de expedicao invalida.' })
  shippingDueDate?: string;
}
