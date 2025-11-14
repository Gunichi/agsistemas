import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveMembershipIntentDto {
  @ApiPropertyOptional({
    example: 'Perfil adequado ao grupo',
    description: 'Observações sobre a aprovação',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class RejectMembershipIntentDto {
  @ApiPropertyOptional({
    example: 'Segmento de negócio já representado no grupo',
    description: 'Motivo da rejeição',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
