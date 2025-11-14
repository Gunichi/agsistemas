import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum ReferralStatusEnum {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  NEGOTIATING = 'NEGOTIATING',
  CLOSED = 'CLOSED',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export class UpdateReferralStatusDto {
  @ApiProperty({
    enum: ReferralStatusEnum,
    example: 'CONTACTED',
    description: 'Novo status da indicação',
  })
  @IsEnum(ReferralStatusEnum)
  status: ReferralStatusEnum;

  @ApiPropertyOptional({
    example: 'Cliente muito receptivo, reunião agendada',
    description: 'Feedback sobre a mudança de status',
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiPropertyOptional({
    example: 48000.0,
    description: 'Valor fechado (obrigatório quando status = CLOSED)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  closedValue?: number;
}


