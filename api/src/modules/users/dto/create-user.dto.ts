import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString({ message: 'Nome deve ser um texto.' })
  name: string;

  @IsEmail({}, { message: 'E-mail invalido.' })
  email: string;

  @IsString({ message: 'Senha deve ser um texto.' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres.' })
  password: string;

  @IsEnum(UserRole, { message: 'Perfil invalido.' })
  role: UserRole;

  @IsOptional()
  isActive?: boolean;
}