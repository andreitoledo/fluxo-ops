import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Camiseta Promocional',
    description: 'Nome do produto',
  })
  @IsString({ message: 'Nome deve ser um texto.' })
  name: string;

  @ApiProperty({
    example: 'CAM-001',
    description: 'SKU ou codigo interno do produto',
  })
  @IsString({ message: 'SKU deve ser um texto.' })
  sku: string;

  @ApiPropertyOptional({
    example: 'Camiseta branca personalizada tamanho G',
    description: 'Descricao opcional do produto',
  })
  @IsOptional()
  @IsString({ message: 'Descricao deve ser um texto.' })
  description?: string;

  @ApiProperty({
    example: 49.9,
    description: 'Preco base do produto',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Preco base deve ser numerico.' })
  @Min(0, { message: 'Preco base nao pode ser negativo.' })
  basePrice: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Prazo padrao de producao em dias',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Prazo padrao deve ser numerico.' })
  @Min(0, { message: 'Prazo padrao nao pode ser negativo.' })
  productionLeadTimeDays?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o produto esta ativo',
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso.' })
  isActive?: boolean;
}
