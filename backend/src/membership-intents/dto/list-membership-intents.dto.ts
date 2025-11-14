import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum IntentStatusFilter {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SortField {
  CREATED_AT = 'createdAt',
  FULL_NAME = 'fullName',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListMembershipIntentsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: IntentStatusFilter,
    description: 'Filtrar por status',
  })
  @IsEnum(IntentStatusFilter)
  @IsOptional()
  status?: IntentStatusFilter;

  @ApiPropertyOptional({
    enum: SortField,
    default: SortField.CREATED_AT,
    description: 'Campo para ordenação',
  })
  @IsEnum(SortField)
  @IsOptional()
  sort?: SortField = SortField.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.DESC,
    description: 'Ordem de ordenação',
  })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Buscar por nome ou email',
  })
  @IsString()
  @IsOptional()
  search?: string;
}


