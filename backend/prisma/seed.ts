import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  await prisma.auditLog.deleteMany();
  await prisma.thankYou.deleteMany();
  await prisma.referralStatusHistory.deleteMany();
  await prisma.businessReferral.deleteMany();
  await prisma.oneOnOneMeeting.deleteMany();
  await prisma.paymentReminder.deleteMany();
  await prisma.monthlyFee.deleteMany();
  await prisma.meetingAttendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.member.deleteMany();
  await prisma.membershipIntent.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@networking.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin criado:', admin.email);

  const intents = await Promise.all([
    prisma.membershipIntent.create({
      data: {
        fullName: 'Maria Santos',
        email: 'maria@consultoria.com',
        phone: '+5511988888888',
        company: 'Consultoria ABC',
        industry: 'Consultoria',
        motivation:
          'Tenho 15 anos de experiência em consultoria empresarial e gostaria de expandir minha rede de contatos para gerar novas oportunidades de negócio.',
        status: 'PENDING',
      },
    }),
    prisma.membershipIntent.create({
      data: {
        fullName: 'Pedro Oliveira',
        email: 'pedro@tech.com',
        phone: '+5511977777777',
        company: 'TechSolutions',
        industry: 'Tecnologia',
        motivation:
          'Minha empresa atua com desenvolvimento de software e busco parcerias estratégicas através de networking qualificado.',
        status: 'PENDING',
      },
    }),
    prisma.membershipIntent.create({
      data: {
        fullName: 'Ana Costa',
        email: 'ana@marketing.com',
        phone: '+5511966666666',
        company: 'Marketing Pro',
        industry: 'Marketing',
        motivation:
          'Sou especialista em marketing digital e acredito que o networking é fundamental para crescimento de negócios.',
        status: 'APPROVED',
        reviewedAt: new Date(),
        inviteToken: 'sample-token-123',
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.membershipIntent.create({
      data: {
        fullName: 'Carlos Ferreira',
        email: 'carlos@financas.com',
        phone: '+5511955555555',
        company: 'Finanças & Cia',
        industry: 'Financeiro',
        motivation: 'Motivação muito curta.',
        status: 'REJECTED',
        reviewedAt: new Date(),
        rejectionReason: 'Motivação insuficiente',
      },
    }),
  ]);

  const memberUser1 = await prisma.user.create({
    data: {
      email: 'joao@empresa.com',
      passwordHash: await bcrypt.hash('senha123', 10),
      role: 'MEMBER',
    },
  });

  const member1 = await prisma.member.create({
    data: {
      userId: memberUser1.id,
      fullName: 'João Silva',
      email: 'joao@empresa.com',
      phone: '+5511999999999',
      cpf: '123.456.789-00',
      birthDate: new Date('1985-05-20'),
      company: 'Empresa XPTO Ltda',
      position: 'Diretor Comercial',
      industry: 'Tecnologia',
      businessDescription: 'Soluções em software para gestão empresarial',
      website: 'https://empresa-xpto.com',
      linkedinUrl: 'https://linkedin.com/in/joaosilva',
      addressCity: 'São Paulo',
      addressState: 'SP',
      status: 'ACTIVE',
    },
  });

  const memberUser2 = await prisma.user.create({
    data: {
      email: 'lucia@advocacia.com',
      passwordHash: await bcrypt.hash('senha123', 10),
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.member.create({
    data: {
      userId: memberUser2.id,
      fullName: 'Lúcia Mendes',
      email: 'lucia@advocacia.com',
      phone: '+5511988887777',
      cpf: '987.654.321-00',
      company: 'Mendes Advocacia',
      position: 'Advogada Sócia',
      industry: 'Jurídico',
      businessDescription: 'Advocacia empresarial e direito corporativo',
      addressCity: 'São Paulo',
      addressState: 'SP',
      status: 'ACTIVE',
    },
  });

  const meeting = await prisma.meeting.create({
    data: {
      title: 'Reunião Semanal #1',
      description: 'Primeira reunião do grupo de networking',
      meetingDate: new Date('2025-11-15'),
      meetingTime: new Date('2025-11-15T08:00:00'),
      location: 'Hotel Plaza - Sala Executiva',
      meetingType: 'REGULAR',
      status: 'SCHEDULED',
    },
  });

  const referral = await prisma.businessReferral.create({
    data: {
      referrerId: member1.id,
      referredToId: member2.id,
      clientName: 'Empresa Cliente ABC',
      clientEmail: 'contato@cliente-abc.com',
      clientPhone: '+5511977776666',
      description:
        'Cliente precisa de consultoria jurídica para regularização de empresa. Possui interesse em contratar advogado especializado.',
      estimatedValue: 15000,
      status: 'PENDING',
    },
  });

  const announcement = await prisma.announcement.create({
    data: {
      title: 'Bem-vindo!',
      content: 'Teste de mensagem de aviso',
      authorId: admin.id,
      priority: 'HIGH',
      isPublished: true,
      publishedAt: new Date(),
      targetAudience: 'all',
    },
  });

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
