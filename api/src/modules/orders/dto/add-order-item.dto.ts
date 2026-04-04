import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddOrderItemDto {
  @ApiProperty({
    example: '9d2b1c40-17f9-4d4e-a7be-46f7d0c1d8b8',
    description: 'ID do produto',
  })
  @IsString({ message: 'ProductId deve ser um texto.' })
  productId: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade do item',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantidade deve ser numerica.' })
  @Min(1, { message: 'Quantidade deve ser no minimo 1.' })
  quantity: number;

  @ApiPropertyOptional({
    example: 49.9,
    description:
      'Preco unitario do item. Se nao informado, usa o preco base atual do produto.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Preco unitario deve ser numerico.' })
  @Min(0, { message: 'Preco unitario nao pode ser negativo.' })
  unitPrice?: number;
}
