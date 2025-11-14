import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralStatusDto } from './dto/update-referral-status.dto';
import { ListReferralsDto } from './dto/list-referrals.dto';
import { RequireAuth } from '../common/decorators/auth.decorator';
import { ErrorResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Referrals')
@Controller('referrals')
@RequireAuth()
@ApiSecurity('JWT-auth')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova indicação de negócio',
    description: 'Permite que um membro crie uma indicação para outro membro',
  })
  @ApiResponse({
    status: 201,
    description: 'Indicação criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    type: ErrorResponseDto,
  })
  async create(@Request() req: any, @Body() createDto: CreateReferralDto) {
    const memberId = req.user.memberId;
    const referral = await this.referralsService.create(memberId, createDto);
    return {
      success: true,
      data: referral,
      message: 'Indicação criada com sucesso!',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar indicações',
    description: 'Lista indicações dadas e recebidas pelo membro autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de indicações retornada com sucesso',
  })
  async findAll(@Request() req: any, @Query() queryDto: ListReferralsDto) {
    const memberId = req.user.memberId;
    const result = await this.referralsService.findAll(memberId, queryDto);
    return {
      success: true,
      data: {
        referrals: result.data,
        statistics: result.statistics,
        pagination: result.pagination,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID da indicação' })
  @ApiOperation({
    summary: 'Buscar indicação por ID',
    description: 'Retorna detalhes completos de uma indicação',
  })
  @ApiResponse({
    status: 200,
    description: 'Indicação encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Indicação não encontrada',
    type: ErrorResponseDto,
  })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const memberId = req.user.memberId;
    const referral = await this.referralsService.findOne(memberId, id);
    return {
      success: true,
      data: referral,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Patch(':id/status')
  @ApiParam({ name: 'id', description: 'ID da indicação' })
  @ApiOperation({
    summary: 'Atualizar status da indicação',
    description: 'Permite que o membro que recebeu a indicação atualize o status',
  })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para atualizar',
    type: ErrorResponseDto,
  })
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateReferralStatusDto,
  ) {
    const memberId = req.user.memberId;
    const referral = await this.referralsService.updateStatus(memberId, id, updateDto);
    return {
      success: true,
      data: referral,
      message: 'Status atualizado com sucesso!',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
