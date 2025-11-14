import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum MemberStatusFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class ListMembersDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: MemberStatusFilter,
    description: 'Filtrar por status',
  })
  @IsEnum(MemberStatusFilter)
  @IsOptional()
  status?: MemberStatusFilter;

  @ApiPropertyOptional({
    description: 'Filtrar por indústria/setor',
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Buscar por nome ou empresa',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
