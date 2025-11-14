import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ReferralStatusEnum } from './update-referral-status.dto';

export enum ReferralTypeFilter {
  GIVEN = 'given',
  RECEIVED = 'received',
  ALL = 'all',
}

export class ListReferralsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: ReferralStatusEnum,
    description: 'Filtrar por status',
  })
  @IsEnum(ReferralStatusEnum)
  @IsOptional()
  status?: ReferralStatusEnum;

  @ApiPropertyOptional({
    enum: ReferralTypeFilter,
    default: ReferralTypeFilter.ALL,
    description: 'Tipo de indicação (dadas, recebidas ou todas)',
  })
  @IsEnum(ReferralTypeFilter)
  @IsOptional()
  type?: ReferralTypeFilter = ReferralTypeFilter.ALL;

  @ApiPropertyOptional({
    description: 'Buscar por nome do cliente',
  })
  @IsString()
  @IsOptional()
  search?: string;
}


