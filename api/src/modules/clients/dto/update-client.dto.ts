import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString({ message: 'Razao social deve ser um texto.' })
  legalName?: string;

  @IsOptional()
  @IsString({ message: 'Nome fantasia deve ser um texto.' })
  tradeName?: string;

  @IsOptional()
  @IsString({ message: 'Documento deve ser um texto.' })
  document?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail invalido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser um texto.' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Nome do contato deve ser um texto.' })
  contactName?: string;

  @IsOptional()
  @IsString({ message: 'Observacoes devem ser um texto.' })
  notes?: string;

  @IsOptional()
  isActive?: boolean;
}
