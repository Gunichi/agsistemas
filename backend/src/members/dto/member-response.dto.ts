import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MemberStatsDto {
  @ApiProperty({ example: 15 })
  referralsGiven: number;

  @ApiProperty({ example: 10 })
  referralsReceived: number;

  @ApiProperty({ example: 4 })
  businessClosed: number;

  @ApiProperty({ example: 250000.0 })
  totalBusinessValue: number;

  @ApiProperty({ example: 45 })
  meetingsAttended: number;

  @ApiProperty({ example: 0.95 })
  attendanceRate: number;

  @ApiProperty({ example: 28 })
  oneOnOneMeetings: number;
}

export class MemberResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  fullName: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  email: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  phone?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  cpf?: string;

  @ApiPropertyOptional({ example: '1985-05-20' })
  birthDate?: Date;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photo.jpg' })
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'Empresa XPTO Ltda' })
  company?: string;

  @ApiPropertyOptional({ example: 'Diretor Comercial' })
  position?: string;

  @ApiPropertyOptional({ example: 'Tecnologia' })
  industry?: string;

  @ApiPropertyOptional({ example: 'Soluções em software...' })
  businessDescription?: string;

  @ApiPropertyOptional({ example: 'https://empresa.com' })
  website?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/joao' })
  linkedinUrl?: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  status: string;

  @ApiProperty({ example: '2025-01-15' })
  membershipStartDate: Date;

  @ApiPropertyOptional({ example: null })
  membershipEndDate?: Date;

  @ApiProperty({ example: '2025-11-11T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-11T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: MemberStatsDto })
  statistics?: MemberStatsDto;
}
