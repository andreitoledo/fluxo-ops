import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(
  UserRole.ADMIN,
  UserRole.OPERATIONS,
  UserRole.FINANCIAL,
  UserRole.PRODUCTION,
)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Obter visão operacional do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Resumo operacional retornado com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Nao autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissao.' })
  @Get('overview')
  async getOverview() {
    return this.dashboardService.getOverview();
  }
}
