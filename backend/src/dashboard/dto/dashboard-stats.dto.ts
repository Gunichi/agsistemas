import { ApiProperty } from '@nestjs/swagger';

export class MembersStatsDto {
  @ApiProperty({ example: 35, description: 'Total de membros' })
  total: number;

  @ApiProperty({ example: 33, description: 'Membros ativos' })
  active: number;

  @ApiProperty({ example: 2, description: 'Membros inativos' })
  inactive: number;

  @ApiProperty({ example: 2, description: 'Novos membros este mês' })
  newThisMonth: number;
}

export class ReferralsStatsDto {
  @ApiProperty({ example: 145, description: 'Total de indicações' })
  total: number;

  @ApiProperty({ example: 23, description: 'Indicações pendentes' })
  pending: number;

  @ApiProperty({ example: 45, description: 'Indicações fechadas' })
  closed: number;

  @ApiProperty({ example: 1250000.0, description: 'Valor total de negócios' })
  totalValue: number;

  @ApiProperty({
    example: { count: 12, value: 150000.0 },
    description: 'Indicações deste mês',
  })
  thisMonth: {
    count: number;
    value: number;
  };
}

export class ThankYouStatsDto {
  @ApiProperty({ example: 45, description: 'Total de agradecimentos' })
  total: number;

  @ApiProperty({ example: 12, description: 'Agradecimentos deste mês' })
  thisMonth: number;

  @ApiProperty({ example: 8, description: 'Agradecimentos esta semana' })
  thisWeek: number;
}

export class MeetingsStatsDto {
  @ApiProperty({ example: 4, description: 'Reuniões este mês' })
  thisMonth: number;

  @ApiProperty({ example: 0.88, description: 'Taxa média de presença' })
  averageAttendance: number;

  @ApiProperty({
    example: { date: '2025-11-22', title: 'Reunião Semanal #43' },
    description: 'Próxima reunião',
  })
  nextMeeting?: {
    date: string;
    title: string;
  };
}

export class DashboardStatsDto {
  @ApiProperty({ type: MembersStatsDto })
  members: MembersStatsDto;

  @ApiProperty({ type: ReferralsStatsDto })
  referrals: ReferralsStatsDto;

  @ApiProperty({ type: ThankYouStatsDto })
  thankYous: ThankYouStatsDto;

  @ApiProperty({ type: MeetingsStatsDto })
  meetings: MeetingsStatsDto;
}
