import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Administrador',
    description: 'Nome do usuario',
  })
  @IsString({ message: 'Nome deve ser um texto.' })
  name: string;

  @ApiProperty({
    example: 'admin@fluxoops.local',
    description: 'E-mail do usuario',
  })
  @IsEmail({}, { message: 'E-mail invalido.' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuario',
  })
  @IsString({ message: 'Senha deve ser um texto.' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres.' })
  password: string;

  @ApiProperty({
    example: UserRole.ADMIN,
    enum: UserRole,
    description: 'Perfil do usuario',
  })
  @IsEnum(UserRole, { message: 'Perfil invalido.' })
  role: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o usuario esta ativo',
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso.' })
  isActive?: boolean;
}
