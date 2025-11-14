import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ListMembersDto } from './dto/list-members.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateMemberDto) {
    const intent = await this.prisma.membershipIntent.findUnique({
      where: { id: createDto.intentId },
    });

    if (!intent) {
      throw new NotFoundException('Intenção de participação não encontrada');
    }

    if (intent.status !== 'APPROVED') {
      throw new BadRequestException('Intenção não foi aprovada');
    }

    if (!intent.tokenExpiresAt || intent.tokenExpiresAt < new Date()) {
      throw new BadRequestException('Token de convite expirado');
    }

    const existingMember = await this.prisma.member.findFirst({
      where: { intentId: intent.id },
    });

    if (existingMember) {
      throw new ConflictException('Este convite já foi utilizado');
    }

    const emailExists = await this.prisma.member.findUnique({
      where: { email: createDto.email },
    });

    if (emailExists) {
      throw new ConflictException('Email já cadastrado');
    }

    if (createDto.cpf) {
      const cpfExists = await this.prisma.member.findUnique({
        where: { cpf: createDto.cpf },
      });

      if (cpfExists) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const passwordHash = await bcrypt.hash('temp123456', 10);
    const user = await this.prisma.user.create({
      data: {
        email: createDto.email,
        passwordHash,
        role: 'MEMBER',
      },
    });

    const memberData: any = {
      userId: user.id,
      intentId: intent.id,
      fullName: createDto.fullName,
      email: createDto.email,
      phone: createDto.phone,
      cpf: createDto.cpf,
      birthDate: createDto.birthDate ? new Date(createDto.birthDate) : undefined,
      photoUrl: createDto.photoUrl,
      company: createDto.company,
      position: createDto.position,
      industry: createDto.industry,
      businessDescription: createDto.businessDescription,
      website: createDto.website,
      linkedinUrl: createDto.linkedinUrl,
    };

    if (createDto.address) {
      memberData.addressStreet = createDto.address.street;
      memberData.addressNumber = createDto.address.number;
      memberData.addressComplement = createDto.address.complement;
      memberData.addressNeighborhood = createDto.address.neighborhood;
      memberData.addressCity = createDto.address.city;
      memberData.addressState = createDto.address.state;
      memberData.addressZipcode = createDto.address.zipcode;
    }

    const member = await this.prisma.member.create({
      data: memberData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`📧 Email: Bem-vindo ao grupo: ${createDto.email}`);
    console.log(`   Nome: ${createDto.fullName}`);

    return member;
  }

  async findAll(queryDto: ListMembersDto) {
    const { page = 1, limit = 20, status, industry, search } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          company: true,
          position: true,
          industry: true,
          photoUrl: true,
          status: true,
          membershipStartDate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              referralsGiven: true,
              referralsReceived: true,
              meetingAttendances: true,
            },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const closedReferrals = await this.prisma.businessReferral.count({
          where: {
            referredToId: member.id,
            status: 'CLOSED',
          },
        });

        const totalValue = await this.prisma.businessReferral.aggregate({
          where: {
            referredToId: member.id,
            status: 'CLOSED',
          },
          _sum: {
            closedValue: true,
          },
        });

        return {
          ...member,
          stats: {
            referralsGiven: member._count.referralsGiven,
            referralsReceived: member._count.referralsReceived,
            businessClosed: closedReferrals,
            totalValue: Number(totalValue._sum.closedValue || 0),
          },
        };
      }),
    );

    return {
      data: membersWithStats.map(({ ...member }) => member),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    const [
      referralsGiven,
      referralsReceived,
      closedReferrals,
      totalValue,
      meetingsAttended,
      totalMeetings,
      oneOnOneMeetings,
    ] = await Promise.all([
      this.prisma.businessReferral.count({
        where: { referrerId: id },
      }),
      this.prisma.businessReferral.count({
        where: { referredToId: id },
      }),
      this.prisma.businessReferral.count({
        where: {
          referredToId: id,
          status: 'CLOSED',
        },
      }),
      this.prisma.businessReferral.aggregate({
        where: {
          referredToId: id,
          status: 'CLOSED',
        },
        _sum: {
          closedValue: true,
        },
      }),
      this.prisma.meetingAttendance.count({
        where: {
          memberId: id,
          status: { in: ['PRESENT', 'LATE'] },
        },
      }),
      this.prisma.meetingAttendance.count({
        where: { memberId: id },
      }),
      this.prisma.oneOnOneMeeting.count({
        where: {
          OR: [{ member1Id: id }, { member2Id: id }],
          status: 'COMPLETED',
        },
      }),
    ]);

    const statistics = {
      referralsGiven,
      referralsReceived,
      businessClosed: closedReferrals,
      totalBusinessValue: Number(totalValue._sum.closedValue || 0),
      meetingsAttended,
      attendanceRate: totalMeetings > 0 ? meetingsAttended / totalMeetings : 0,
      oneOnOneMeetings,
    };

    return {
      ...member,
      statistics,
    };
  }

  async update(id: string, updateDto: UpdateMemberDto) {
    await this.findOne(id);

    if (updateDto.cpf) {
      const cpfExists = await this.prisma.member.findFirst({
        where: {
          cpf: updateDto.cpf,
          NOT: { id },
        },
      });

      if (cpfExists) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const updateData: any = { ...updateDto };

    if (updateDto.birthDate) {
      updateData.birthDate = new Date(updateDto.birthDate);
    }

    if (updateDto.address) {
      updateData.addressStreet = updateDto.address.street;
      updateData.addressNumber = updateDto.address.number;
      updateData.addressComplement = updateDto.address.complement;
      updateData.addressNeighborhood = updateDto.address.neighborhood;
      updateData.addressCity = updateDto.address.city;
      updateData.addressState = updateDto.address.state;
      updateData.addressZipcode = updateDto.address.zipcode;
      delete updateData.address;
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: updateData,
    });

    return member;
  }

  async remove(id: string) {
    const member = await this.findOne(id);

    await this.prisma.member.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        membershipEndDate: new Date(),
      },
    });

    console.log(`📧 Email: Membro inativado: ${member.email}`);

    return { message: 'Membro inativado com sucesso' };
  }
}
