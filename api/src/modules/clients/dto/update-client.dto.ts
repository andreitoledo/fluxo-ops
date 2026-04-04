import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @ApiPropertyOptional({
    example: 'AltSystems',
    description: 'Sistemas sob medida para empresas',
  })
  @IsOptional()
  @IsString({ message: 'Razao social deve ser um texto.' })
  legalName?: string;

  @ApiPropertyOptional({
    example: 'AltSystems',
    description: 'Nome fantasia do cliente',
  })
  @IsOptional()
  @IsString({ message: 'Nome fantasia deve ser um texto.' })
  tradeName?: string;

  @ApiPropertyOptional({
    example: '12345678000199',
    description: 'CPF ou CNPJ do cliente',
  })
  @IsOptional()
  @IsString({ message: 'Documento deve ser um texto.' })
  document?: string;

  @ApiPropertyOptional({
    example: 'contato@altsystems.com',
    description: 'E-mail do cliente',
  })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail invalido.' })
  email?: string;

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Telefone do cliente',
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser um texto.' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'Joao da Silva',
    description: 'Nome do contato principal',
  })
  @IsOptional()
  @IsString({ message: 'Nome do contato deve ser um texto.' })
  contactName?: string;

  @ApiPropertyOptional({
    example: 'Cliente prioritario da operacao',
    description: 'Observacoes internas sobre o cliente',
  })
  @IsOptional()
  @IsString({ message: 'Observacoes devem ser um texto.' })
  notes?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica se o cliente esta ativo',
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso.' })
  isActive?: boolean;
}
