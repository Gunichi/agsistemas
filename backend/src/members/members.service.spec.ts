import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersDto, MemberStatusFilter } from './dto/list-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let service: MembersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaServPice: PrismaService;

  const mockPrismaService = {
    membershipIntent: {
      findUnique: jest.fn(),
    },
    member: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      create: jest.fn(),
    },
    businessReferral: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    meetingAttendance: {
      count: jest.fn(),
    },
    oneOnOneMeeting: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateMemberDto = {
      intentId: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      phone: '+5511999999999',
      cpf: '123.456.789-00',
      birthDate: '1990-01-01',
      company: 'Empresa XPTO',
      position: 'Diretor',
      industry: 'Tecnologia',
    };

    const mockIntent = {
      id: 'intent-id',
      status: 'APPROVED',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const mockUser = {
      id: 'user-id',
      email: 'joao@example.com',
      role: 'MEMBER',
    };

    const mockMember = {
      id: 'member-id',
      userId: 'user-id',
      intentId: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      user: mockUser,
    };

    it('should create a member successfully', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.member.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.member.create.mockResolvedValue(mockMember);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.create(createDto);

      expect(result).toEqual(mockMember);
      expect(mockPrismaService.membershipIntent.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.intentId },
      });
      expect(mockPrismaService.member.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.member.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if intent does not exist', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.membershipIntent.findUnique).toHaveBeenCalled();
    });

    it('should throw BadRequestException if intent is not approved', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        status: 'PENDING',
      });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is expired', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        tokenExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if intent already used', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue({ id: 'existing-member' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.member.findUnique.mockResolvedValue({ id: 'existing-member' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if CPF already exists', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.member.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'existing-member' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const mockMembers = [
      {
        id: 'member-1',
        fullName: 'João Silva',
        email: 'joao@example.com',
        _count: {
          referralsGiven: 5,
          referralsReceived: 3,
          meetingAttendances: 10,
        },
      },
    ];

    it('should return paginated members', async () => {
      const queryDto = { page: 1, limit: 20 };
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);
      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.count.mockResolvedValue(2);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: 10000 },
      });

      const result = await service.findAll(queryDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(1);
      expect(mockPrismaService.member.findMany).toHaveBeenCalled();
      expect(mockPrismaService.member.count).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const queryDto: ListMembersDto = { page: 1, limit: 20, status: MemberStatusFilter.ACTIVE };
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);
      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.count.mockResolvedValue(0);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: null },
      });

      await service.findAll(queryDto);

      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });

    it('should filter by search term', async () => {
      const queryDto = { page: 1, limit: 20, search: 'João' };
      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);
      mockPrismaService.member.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.count.mockResolvedValue(0);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: null },
      });

      await service.findAll(queryDto);

      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([{ fullName: { contains: 'João', mode: 'insensitive' } }]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockMember = {
      id: 'member-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      user: {
        id: 'user-id',
        email: 'joao@example.com',
        role: 'MEMBER',
      },
    };

    it('should return a member with statistics', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.businessReferral.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: 50000 },
      });
      mockPrismaService.meetingAttendance.count.mockResolvedValueOnce(10).mockResolvedValueOnce(12);
      mockPrismaService.oneOnOneMeeting.count.mockResolvedValue(4);

      const result = await service.findOne('member-id');

      expect(result).toHaveProperty('statistics');
      expect(result.statistics.referralsGiven).toBe(5);
      expect(result.statistics.referralsReceived).toBe(3);
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if member does not exist', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateMemberDto = {
      fullName: 'João Silva Updated',
      company: 'New Company',
    };

    const mockMember = {
      id: 'member-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    it('should update a member successfully', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.member.update.mockResolvedValue({
        ...mockMember,
        ...updateDto,
      });

      const result = await service.update('member-id', updateDto);

      expect(result).toMatchObject(updateDto);
      expect(mockPrismaService.member.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if CPF already exists', async () => {
      const updateDtoWithCpf: UpdateMemberDto = {
        cpf: '123.456.789-00',
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.member.findFirst.mockResolvedValue({ id: 'other-member' });

      await expect(service.update('member-id', updateDtoWithCpf)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    const mockMember = {
      id: 'member-id',
      email: 'joao@example.com',
      status: 'ACTIVE',
    };

    it('should inactivate a member', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.member.update.mockResolvedValue({
        ...mockMember,
        status: 'INACTIVE',
      });

      const result = await service.remove('member-id');

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { id: 'member-id' },
        data: {
          status: 'INACTIVE',
          membershipEndDate: expect.any(Date),
        },
      });
    });
  });
});
