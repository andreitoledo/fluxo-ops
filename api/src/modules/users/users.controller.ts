import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Buscar usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Usuario nao encontrado.' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Criar usuario' })
  @ApiResponse({ status: 201, description: 'Usuario criado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({
    status: 409,
    description: 'Ja existe usuario com o mesmo e-mail.',
  })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Atualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario atualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @ApiResponse({ status: 404, description: 'Usuario nao encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Ja existe outro usuario com o mesmo e-mail.',
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
