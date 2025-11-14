import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralStatusDto } from './dto/update-referral-status.dto';
import { ListReferralsDto, ReferralTypeFilter } from './dto/list-referrals.dto';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async create(referrerId: string, createDto: CreateReferralDto) {
    const referrer = await this.prisma.member.findUnique({
      where: { id: referrerId },
    });

    if (!referrer || referrer.status !== 'ACTIVE') {
      throw new ForbiddenException('Apenas membros ativos podem criar indicações');
    }

    const referredTo = await this.prisma.member.findUnique({
      where: { id: createDto.referredToId },
    });

    if (!referredTo || referredTo.status !== 'ACTIVE') {
      throw new BadRequestException('Membro destinatário não encontrado ou inativo');
    }

    if (referrerId === createDto.referredToId) {
      throw new BadRequestException('Você não pode criar uma indicação para si mesmo');
    }

    const referral = await this.prisma.businessReferral.create({
      data: {
        referrerId,
        referredToId: createDto.referredToId,
        clientName: createDto.clientName,
        clientPhone: createDto.clientPhone,
        clientEmail: createDto.clientEmail,
        description: createDto.description,
        estimatedValue: createDto.estimatedValue,
      },
      include: {
        referrer: {
          select: {
            id: true,
            fullName: true,
            company: true,
            photoUrl: true,
          },
        },
        referredTo: {
          select: {
            id: true,
            fullName: true,
            company: true,
            photoUrl: true,
          },
        },
      },
    });

    await this.prisma.referralStatusHistory.create({
      data: {
        referralId: referral.id,
        fromStatus: null,
        toStatus: 'PENDING',
        changedBy: referrer.userId,
      },
    });

    console.log(`📧 Email: Nova indicação para: ${referredTo.email}`);
    console.log(`   De: ${referrer.fullName}`);
    console.log(`   Cliente: ${createDto.clientName}`);

    return referral;
  }

  async findAll(memberId: string, queryDto: ListReferralsDto) {
    const { page = 1, limit = 20, status, type, search } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type === ReferralTypeFilter.GIVEN) {
      where.referrerId = memberId;
    } else if (type === ReferralTypeFilter.RECEIVED) {
      where.referredToId = memberId;
    } else {
      where.OR = [{ referrerId: memberId }, { referredToId: memberId }];
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.clientName = { contains: search, mode: 'insensitive' };
    }

    const [referrals, total] = await Promise.all([
      this.prisma.businessReferral.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          referrer: {
            select: {
              id: true,
              fullName: true,
              company: true,
              photoUrl: true,
            },
          },
          referredTo: {
            select: {
              id: true,
              fullName: true,
              company: true,
              photoUrl: true,
            },
          },
        },
      }),
      this.prisma.businessReferral.count({ where }),
    ]);

    const statistics = await this.calculateStatistics(memberId);

    return {
      data: referrals,
      statistics,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(memberId: string, referralId: string) {
    const referral = await this.prisma.businessReferral.findUnique({
      where: { id: referralId },
      include: {
        referrer: {
          select: {
            id: true,
            fullName: true,
            company: true,
            position: true,
            photoUrl: true,
            email: true,
            phone: true,
          },
        },
        referredTo: {
          select: {
            id: true,
            fullName: true,
            company: true,
            position: true,
            photoUrl: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!referral) {
      throw new NotFoundException('Indicação não encontrada');
    }

    if (referral.referrerId !== memberId && referral.referredToId !== memberId) {
      throw new ForbiddenException('Você não tem permissão para visualizar esta indicação');
    }

    return referral;
  }

  async updateStatus(memberId: string, referralId: string, updateDto: UpdateReferralStatusDto) {
    const referral = await this.findOne(memberId, referralId);

    if (referral.referredToId !== memberId) {
      throw new ForbiddenException(
        'Apenas o membro que recebeu a indicação pode atualizar o status',
      );
    }

    if (updateDto.status === 'CLOSED' && !updateDto.closedValue) {
      throw new BadRequestException('O valor fechado é obrigatório quando o status é CLOSED');
    }

    const oldStatus = referral.status;

    const updatedReferral = await this.prisma.businessReferral.update({
      where: { id: referralId },
      data: {
        status: updateDto.status,
        feedback: updateDto.feedback,
        closedValue: updateDto.closedValue,
        closedAt: updateDto.status === 'CLOSED' ? new Date() : undefined,
      },
      include: {
        referrer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        referredTo: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    await this.prisma.referralStatusHistory.create({
      data: {
        referralId,
        fromStatus: oldStatus,
        toStatus: updateDto.status,
        changedBy: member.userId,
        notes: updateDto.feedback,
      },
    });

    console.log(`📧 Email: Status de indicação atualizado`);
    console.log(`   Para: ${updatedReferral.referrer.email}`);
    console.log(`   Indicação: ${updatedReferral.clientName}`);
    console.log(`   Novo status: ${updateDto.status}`);

    return updatedReferral;
  }

  async calculateStatistics(memberId: string) {
    const [totalGiven, totalReceived, pendingReceived, closedReceived, totalValueClosed] =
      await Promise.all([
        this.prisma.businessReferral.count({
          where: { referrerId: memberId },
        }),
        this.prisma.businessReferral.count({
          where: { referredToId: memberId },
        }),
        this.prisma.businessReferral.count({
          where: {
            referredToId: memberId,
            status: 'PENDING',
          },
        }),
        this.prisma.businessReferral.count({
          where: {
            referredToId: memberId,
            status: 'CLOSED',
          },
        }),
        this.prisma.businessReferral.aggregate({
          where: {
            referredToId: memberId,
            status: 'CLOSED',
          },
          _sum: {
            closedValue: true,
          },
        }),
      ]);

    return {
      totalGiven,
      totalReceived,
      pendingReceived,
      closedReceived,
      totalValueClosed: Number(totalValueClosed._sum.closedValue || 0),
    };
  }
}
