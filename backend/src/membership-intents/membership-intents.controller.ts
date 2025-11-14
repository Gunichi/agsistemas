import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public, RequireApiKey } from '../common/decorators/api-key.decorator';
import { ErrorResponseDto } from '../common/dto/api-response.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { CreateMembershipIntentDto } from './dto/create-membership-intent.dto';
import { ListMembershipIntentsDto } from './dto/list-membership-intents.dto';
import { MembershipIntentResponseDto } from './dto/membership-intent-response.dto';
import {
  ApproveMembershipIntentDto,
  RejectMembershipIntentDto,
} from './dto/review-membership-intent.dto';
import { MembershipIntentsService } from './membership-intents.service';

@ApiTags('Membership Intents')
@Controller('membership-intents')
export class MembershipIntentsController {
  constructor(private readonly membershipIntentsService: MembershipIntentsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova intenção de participação',
    description: 'Endpoint público para que candidatos manifestem interesse em participar do grupo',
  })
  @ApiResponse({
    status: 201,
    description: 'Intenção criada com sucesso',
    type: MembershipIntentResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    type: ErrorResponseDto,
  })
  async create(@Body() createDto: CreateMembershipIntentDto) {
    const intent = await this.membershipIntentsService.create(createDto);
    return {
      success: true,
      data: intent,
      message: 'Sua intenção foi registrada com sucesso! Entraremos em contato em breve.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get()
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiOperation({
    summary: 'Listar intenções de participação',
    description: 'Lista todas as intenções com filtros e paginação (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de intenções retornada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'API Key inválida',
    type: ErrorResponseDto,
  })
  async findAll(@Query() queryDto: ListMembershipIntentsDto) {
    const result = await this.membershipIntentsService.findAll(queryDto);
    return {
      success: true,
      data: {
        intents: result.data,
        pagination: result.pagination,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiParam({ name: 'id', description: 'ID da intenção' })
  @ApiOperation({
    summary: 'Buscar intenção por ID',
    description: 'Retorna detalhes de uma intenção específica (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Intenção encontrada',
    type: MembershipIntentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Intenção não encontrada',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const intent = await this.membershipIntentsService.findOne(id);
    return {
      success: true,
      data: intent,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Patch(':id/approve')
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiParam({ name: 'id', description: 'ID da intenção' })
  @ApiOperation({
    summary: 'Aprovar intenção de participação',
    description:
      'Aprova uma intenção e gera token de convite para cadastro completo (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Intenção aprovada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Intenção não pode ser aprovada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Intenção não encontrada',
    type: ErrorResponseDto,
  })
  async approve(@Param('id') id: string, @Body() approveDto: ApproveMembershipIntentDto) {
    const intent = await this.membershipIntentsService.approve(id, approveDto.notes);
    return {
      success: true,
      data: {
        id: intent.id,
        status: intent.status,
        reviewedAt: intent.reviewedAt,
        inviteToken: intent.inviteToken,
        tokenExpiresAt: intent.tokenExpiresAt,
      },
      message: 'Intenção aprovada. Email de confirmação enviado ao candidato.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Patch(':id/reject')
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiParam({ name: 'id', description: 'ID da intenção' })
  @ApiOperation({
    summary: 'Rejeitar intenção de participação',
    description: 'Rejeita uma intenção de participação (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Intenção rejeitada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Intenção não pode ser rejeitada',
    type: ErrorResponseDto,
  })
  async reject(@Param('id') id: string, @Body() rejectDto: RejectMembershipIntentDto) {
    const intent = await this.membershipIntentsService.reject(id, rejectDto.reason);
    return {
      success: true,
      data: {
        id: intent.id,
        status: intent.status,
        reviewedAt: intent.reviewedAt,
        rejectionReason: intent.rejectionReason,
      },
      message: 'Intenção rejeitada.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('validate-token/:token')
  @Public()
  @ApiParam({ name: 'token', description: 'Token de convite' })
  @ApiOperation({
    summary: 'Validar token de convite',
    description: 'Verifica se um token de convite é válido',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou expirado',
    type: ErrorResponseDto,
  })
  async validateToken(@Param('token') token: string) {
    const intent = await this.membershipIntentsService.validateToken(token);
    return {
      success: true,
      data: {
        valid: true,
        intent: {
          id: intent.id,
          fullName: intent.fullName,
          email: intent.email,
        },
      },
      message: 'Token válido',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post('complete-registration')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Completar cadastro com token de convite',
    description: 'Endpoint público para completar o cadastro após aprovação da intenção',
  })
  @ApiResponse({
    status: 201,
    description: 'Cadastro completo realizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou dados incorretos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    type: ErrorResponseDto,
  })
  async completeRegistration(@Body() completeDto: CompleteRegistrationDto) {
    const result = await this.membershipIntentsService.completeRegistration(completeDto);
    return {
      success: true,
      data: {
        userId: result.user.id,
        memberId: result.member.id,
        email: result.member.email,
        fullName: result.member.fullName,
      },
      message: 'Cadastro completo realizado com sucesso! Bem-vindo(a) ao grupo.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
