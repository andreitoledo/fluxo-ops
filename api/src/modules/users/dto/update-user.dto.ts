import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Administrador',
    description: 'Nome do usuario',
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto.' })
  name?: string;

  @ApiPropertyOptional({
    example: 'admin@fluxoops.local',
    description: 'E-mail do usuario',
  })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail invalido.' })
  email?: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'Senha do usuario',
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser um texto.' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres.' })
  password?: string;

  @ApiPropertyOptional({
    example: UserRole.ADMIN,
    enum: UserRole,
    description: 'Perfil do usuario',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Perfil invalido.' })
  role?: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o usuario esta ativo',
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso.' })
  isActive?: boolean;
}
