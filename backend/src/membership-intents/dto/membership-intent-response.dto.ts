import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MembershipIntentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  fullName: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  email: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Empresa XPTO Ltda' })
  company?: string;

  @ApiPropertyOptional({ example: 'Tecnologia' })
  industry?: string;

  @ApiPropertyOptional({ example: 'Desejo expandir minha rede...' })
  motivation?: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;

  @ApiPropertyOptional({ example: 'uuid' })
  reviewedById?: string;

  @ApiPropertyOptional({ example: '2025-11-11T11:00:00Z' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ example: 'Segmento já representado' })
  rejectionReason?: string;

  @ApiPropertyOptional({ example: 'abc123token' })
  inviteToken?: string;

  @ApiPropertyOptional({ example: '2025-11-18T11:00:00Z' })
  tokenExpiresAt?: Date;

  @ApiProperty({ example: '2025-11-11T10:30:00Z' })
  createdAt: Date;
}
