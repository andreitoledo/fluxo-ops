import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Nome deve ser um texto.' })
  name: string;

  @IsString({ message: 'SKU deve ser um texto.' })
  sku: string;

  @IsOptional()
  @IsString({ message: 'Descricao deve ser um texto.' })
  description?: string;

  @IsNumber({}, { message: 'Preco base deve ser numerico.' })
  @Min(0, { message: 'Preco base nao pode ser negativo.' })
  basePrice: number;

  @IsOptional()
  @IsNumber({}, { message: 'Prazo padrao deve ser numerico.' })
  @Min(0, { message: 'Prazo padrao nao pode ser negativo.' })
  productionLeadTimeDays?: number;

  @IsOptional()
  isActive?: boolean;
}
