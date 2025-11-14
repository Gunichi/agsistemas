import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ListMembersDto } from './dto/list-members.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { Public, RequireApiKey } from '../common/decorators/api-key.decorator';
import { ErrorResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar novo membro',
    description:
      'Cria um cadastro completo de membro após aprovação. Requer token válido de convite.',
  })
  @ApiResponse({
    status: 201,
    description: 'Membro cadastrado com sucesso',
    type: MemberResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou dados incorretos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou CPF já cadastrado',
    type: ErrorResponseDto,
  })
  async create(@Body() createDto: CreateMemberDto) {
    const member = await this.membersService.create(createDto);
    return {
      success: true,
      data: member,
      message: 'Membro cadastrado com sucesso! Bem-vindo ao grupo.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get()
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiOperation({
    summary: 'Listar membros',
    description: 'Lista todos os membros com filtros e paginação (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de membros retornada com sucesso',
  })
  async findAll(@Query() queryDto: ListMembersDto) {
    const result = await this.membersService.findAll(queryDto);
    return {
      success: true,
      data: {
        members: result.data,
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
  @ApiParam({ name: 'id', description: 'ID do membro' })
  @ApiOperation({
    summary: 'Buscar membro por ID',
    description: 'Retorna detalhes completos de um membro incluindo estatísticas (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro encontrado',
    type: MemberResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const member = await this.membersService.findOne(id);
    return {
      success: true,
      data: member,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Patch(':id')
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiParam({ name: 'id', description: 'ID do membro' })
  @ApiOperation({
    summary: 'Atualizar dados do membro',
    description: 'Atualiza informações de um membro (requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado',
    type: ErrorResponseDto,
  })
  async update(@Param('id') id: string, @Body() updateDto: UpdateMemberDto) {
    const member = await this.membersService.update(id, updateDto);
    return {
      success: true,
      data: member,
      message: 'Membro atualizado com sucesso',
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Delete(':id')
  @RequireApiKey()
  @ApiSecurity('API-KEY')
  @ApiParam({ name: 'id', description: 'ID do membro' })
  @ApiOperation({
    summary: 'Inativar membro',
    description: 'Inativa um membro (soft delete - requer API Key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro inativado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string) {
    const result = await this.membersService.remove(id);
    return {
      success: true,
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
