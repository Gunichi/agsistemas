import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalReferrals,
      pendingReferrals,
      closedReferrals,
      referralsThisMonth,
      totalReferralValue,
      referralsValueThisMonth,
      totalThankYous,
      thankYousThisMonth,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'ACTIVE' } }),
      this.prisma.member.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),

      this.prisma.businessReferral.count(),
      this.prisma.businessReferral.count({ where: { status: 'PENDING' } }),
      this.prisma.businessReferral.count({ where: { status: 'CLOSED' } }),
      this.prisma.businessReferral.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
      this.prisma.businessReferral.aggregate({
        where: { status: 'CLOSED' },
        _sum: { closedValue: true },
      }),
      this.prisma.businessReferral.aggregate({
        where: {
          status: 'CLOSED',
          closedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        _sum: { closedValue: true },
      }),

      this.prisma.thankYou.count(),
      this.prisma.thankYou.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
    ]);

    const useMockData = totalMembers === 0;

    if (useMockData) {
      return this.getMockStats();
    }

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
        newThisMonth: newMembersThisMonth,
      },
      referrals: {
        total: totalReferrals,
        pending: pendingReferrals,
        closed: closedReferrals,
        totalValue: Number(totalReferralValue._sum.closedValue || 0),
        thisMonth: {
          count: referralsThisMonth,
          value: Number(referralsValueThisMonth._sum.closedValue || 0),
        },
      },
      thankYous: {
        total: totalThankYous,
        thisMonth: thankYousThisMonth,
        thisWeek: Math.floor(thankYousThisMonth * 0.3),
      },
      meetings: {
        thisMonth: 4,
        averageAttendance: 0.88,
        nextMeeting: {
          date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          title: 'Próxima Reunião Semanal',
        },
      },
    };
  }

  private getMockStats() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      members: {
        total: 35,
        active: 33,
        inactive: 2,
        newThisMonth: 2,
      },
      referrals: {
        total: 145,
        pending: 23,
        closed: 45,
        totalValue: 1250000.0,
        thisMonth: {
          count: 12,
          value: 150000.0,
        },
      },
      thankYous: {
        total: 87,
        thisMonth: 12,
        thisWeek: 4,
      },
      meetings: {
        thisMonth: 4,
        averageAttendance: 0.88,
        nextMeeting: {
          date: nextWeek.toISOString().split('T')[0],
          title: 'Reunião Semanal #43',
        },
      },
    };
  }
}
