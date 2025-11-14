import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RequireApiKey } from '../common/decorators/api-key.decorator';
import { ErrorResponseDto } from '../common/dto/api-response.dto';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@RequireApiKey()
@ApiSecurity('API-KEY')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas do dashboard',
    description: 'Retorna estatísticas gerais para o painel administrativo (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    type: DashboardStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'API Key inválida',
    type: ErrorResponseDto,
  })
  async getStats() {
    const stats = await this.dashboardService.getStats();
    return {
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
