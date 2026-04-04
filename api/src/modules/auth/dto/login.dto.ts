import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
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
}