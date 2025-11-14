import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { CreateMembershipIntentDto } from './dto/create-membership-intent.dto';
import { ListMembershipIntentsDto } from './dto/list-membership-intents.dto';

@Injectable()
export class MembershipIntentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateMembershipIntentDto) {
    const existingIntent = await this.prisma.membershipIntent.findFirst({
      where: {
        email: createDto.email,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingIntent) {
      throw new ConflictException('Já existe uma intenção de participação ativa com este email');
    }

    const existingMember = await this.prisma.member.findUnique({
      where: { email: createDto.email },
    });

    if (existingMember) {
      throw new ConflictException('Este email já está cadastrado como membro');
    }

    const intent = await this.prisma.membershipIntent.create({
      data: createDto,
    });

    console.log(`📧 Email: Intenção recebida para: ${createDto.email}`);
    console.log(`   Oba! Sua intenção foi registrada com sucesso!`);

    return intent;
  }

  async findAll(queryDto: ListMembershipIntentsDto) {
    const { page = 1, limit = 20, status, sort, order, search } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [intents, total] = await Promise.all([
      this.prisma.membershipIntent.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          reviewedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.membershipIntent.count({ where }),
    ]);

    return {
      data: intents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string) {
    const intent = await this.prisma.membershipIntent.findUnique({
      where: { id },
      include: {
        reviewedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!intent) {
      throw new NotFoundException('Intenção de participação não encontrada');
    }

    return intent;
  }

  async approve(id: string, notes?: string) {
    const intent = await this.findOne(id);

    if (intent.status !== 'PENDING') {
      throw new BadRequestException('Apenas intenções pendentes podem ser aprovadas');
    }

    const inviteToken = uuidv4();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

    const updatedIntent = await this.prisma.membershipIntent.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        inviteToken,
        tokenExpiresAt,
      },
    });

    console.log('\n' + '='.repeat(80));
    console.log('📧 Email: CONVITE DE CADASTRO GERADO');
    console.log('='.repeat(80));
    console.log(`👤 Candidato: ${intent.fullName}`);
    console.log(`📨 Email: ${intent.email}`);
    console.log(`🎟️  Token: ${inviteToken}`);
    console.log(`⏰ Válido até: ${tokenExpiresAt.toLocaleString('pt-BR')}`);
    if (notes) {
      console.log(`📝 Observações: ${notes}`);
    }

    return updatedIntent;
  }

  async reject(id: string, reason?: string) {
    const intent = await this.findOne(id);

    if (intent.status !== 'PENDING') {
      throw new BadRequestException('Apenas intenções pendentes podem ser rejeitadas');
    }

    const updatedIntent = await this.prisma.membershipIntent.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    console.log(`📧 Email: Intenção rejeitada para: ${intent.email}`);
    if (reason) {
      console.log(`   Não foi dessa vez... Motivo: ${reason}`);
    }

    return updatedIntent;
  }

  async validateToken(token: string) {
    const intent = await this.prisma.membershipIntent.findUnique({
      where: { inviteToken: token },
    });

    if (!intent) {
      throw new NotFoundException('Token inválido');
    }

    if (intent.status !== 'APPROVED') {
      throw new BadRequestException('Esta intenção não foi aprovada');
    }

    if (!intent.tokenExpiresAt || intent.tokenExpiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    const existingMember = await this.prisma.member.findFirst({
      where: { intentId: intent.id },
    });

    if (existingMember) {
      throw new BadRequestException('Este convite já foi utilizado');
    }

    return intent;
  }

  async completeRegistration(completeDto: CompleteRegistrationDto) {
    const intent = await this.validateToken(completeDto.inviteToken);

    if (intent.email !== completeDto.email) {
      throw new BadRequestException('O email fornecido não corresponde ao convite');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: completeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }

    if (completeDto.cpf) {
      const existingMemberWithCpf = await this.prisma.member.findUnique({
        where: { cpf: completeDto.cpf },
      });

      if (existingMemberWithCpf) {
        throw new ConflictException('Este CPF já está cadastrado');
      }
    }

    const passwordHash = await bcrypt.hash(completeDto.password, 10);

    const result = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: completeDto.email,
          passwordHash,
          role: 'MEMBER',
        },
      });

      const member = await prisma.member.create({
        data: {
          userId: user.id,
          intentId: intent.id,
          fullName: completeDto.fullName,
          email: completeDto.email,
          phone: completeDto.phone,
          cpf: completeDto.cpf,
          birthDate: completeDto.birthDate ? new Date(completeDto.birthDate) : null,
          photoUrl: completeDto.photoUrl,
          company: completeDto.company,
          position: completeDto.position,
          industry: completeDto.industry,
          businessDescription: completeDto.businessDescription,
          website: completeDto.website,
          linkedinUrl: completeDto.linkedinUrl,
          addressStreet: completeDto.address?.street,
          addressNumber: completeDto.address?.number,
          addressComplement: completeDto.address?.complement,
          addressNeighborhood: completeDto.address?.neighborhood,
          addressCity: completeDto.address?.city,
          addressState: completeDto.address?.state,
          addressZipcode: completeDto.address?.zipcode,
          status: 'ACTIVE',
        },
      });

      return { user, member };
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ CADASTRO COMPLETO REALIZADO');
    console.log('='.repeat(80));
    console.log(`👤 Nome: ${completeDto.fullName}`);
    console.log(`📨 Email: ${completeDto.email}`);
    console.log(`🆔 Member ID: ${result.member.id}`);
    console.log(`🎉 Bem-vindo(a) ao grupo!`);
    console.log(`🔐 Credenciais criadas com sucesso`);

    return result;
  }
}
