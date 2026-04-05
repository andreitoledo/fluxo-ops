import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateOrderItemDto {
  @ApiPropertyOptional({
    example: 12,
    description: 'Nova quantidade do item',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantidade deve ser numerica.' })
  @Min(1, { message: 'Quantidade deve ser no minimo 1.' })
  quantity?: number;

  @ApiPropertyOptional({
    example: 59.9,
    description: 'Novo preco unitario do item',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Preco unitario deve ser numerico.' })
  @Min(0, { message: 'Preco unitario nao pode ser negativo.' })
  unitPrice?: number;
}
