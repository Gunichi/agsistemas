import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { CreateMembershipIntentDto } from './dto/create-membership-intent.dto';
import { IntentStatusFilter, ListMembershipIntentsDto } from './dto/list-membership-intents.dto';
import { MembershipIntentsService } from './membership-intents.service';

describe('MembershipIntentsService', () => {
  let service: MembershipIntentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    membershipIntent: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipIntentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembershipIntentsService>(MembershipIntentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateMembershipIntentDto = {
      fullName: 'João Silva',
      email: 'joao@example.com',
      phone: '+5511999999999',
      company: 'Empresa XPTO',
      industry: 'Tecnologia',
      motivation: 'Desejo expandir minha rede de contatos profissionais',
    };

    const mockIntent = {
      id: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      status: 'PENDING',
    };

    it('should create a membership intent successfully', async () => {
      mockPrismaService.membershipIntent.findFirst.mockResolvedValue(null);
      mockPrismaService.member.findUnique.mockResolvedValue(null);
      mockPrismaService.membershipIntent.create.mockResolvedValue(mockIntent);

      const result = await service.create(createDto);

      expect(result).toEqual(mockIntent);
      expect(mockPrismaService.membershipIntent.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if intent already exists', async () => {
      mockPrismaService.membershipIntent.findFirst.mockResolvedValue({
        id: 'existing-intent',
        status: 'PENDING',
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if member already exists', async () => {
      mockPrismaService.membershipIntent.findFirst.mockResolvedValue(null);
      mockPrismaService.member.findUnique.mockResolvedValue({ id: 'existing-member' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const mockIntents = [
      {
        id: 'intent-1',
        fullName: 'João Silva',
        email: 'joao@example.com',
        status: 'PENDING',
      },
    ];

    it('should return paginated intents', async () => {
      const queryDto = { page: 1, limit: 20 };
      mockPrismaService.membershipIntent.findMany.mockResolvedValue(mockIntents);
      mockPrismaService.membershipIntent.count.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.currentPage).toBe(1);
      expect(mockPrismaService.membershipIntent.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const queryDto: ListMembershipIntentsDto = {
        page: 1,
        limit: 20,
        status: IntentStatusFilter.PENDING,
      };
      mockPrismaService.membershipIntent.findMany.mockResolvedValue(mockIntents);
      mockPrismaService.membershipIntent.count.mockResolvedValue(1);

      await service.findAll(queryDto);

      expect(mockPrismaService.membershipIntent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockIntent = {
      id: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      status: 'PENDING',
    };

    it('should return an intent', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);

      const result = await service.findOne('intent-id');

      expect(result).toEqual(mockIntent);
      expect(mockPrismaService.membershipIntent.findUnique).toHaveBeenCalledWith({
        where: { id: 'intent-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if intent does not exist', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    const mockIntent = {
      id: 'intent-id',
      status: 'PENDING',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    it('should approve an intent and generate token', async () => {
      const mockUpdatedIntent = {
        ...mockIntent,
        status: 'APPROVED',
        inviteToken: 'generated-token',
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.membershipIntent.update.mockResolvedValue(mockUpdatedIntent);

      const result = await service.approve('intent-id');

      expect(result.status).toBe('APPROVED');
      expect(result.inviteToken).toBeDefined();
      expect(mockPrismaService.membershipIntent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'intent-id' },
          data: expect.objectContaining({
            status: 'APPROVED',
            inviteToken: expect.any(String),
            tokenExpiresAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw BadRequestException if intent is not pending', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        status: 'APPROVED',
      });

      await expect(service.approve('intent-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    const mockIntent = {
      id: 'intent-id',
      status: 'PENDING',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    it('should reject an intent', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.membershipIntent.update.mockResolvedValue({
        ...mockIntent,
        status: 'REJECTED',
        rejectionReason: 'Not suitable',
      });

      const result = await service.reject('intent-id', 'Not suitable');

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReason).toBe('Not suitable');
      expect(mockPrismaService.membershipIntent.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if intent is not pending', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        status: 'REJECTED',
      });

      await expect(service.reject('intent-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateToken', () => {
    const mockIntent = {
      id: 'intent-id',
      status: 'APPROVED',
      inviteToken: 'valid-token',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    it('should validate a valid token', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue(null);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockIntent);
      expect(mockPrismaService.membershipIntent.findUnique).toHaveBeenCalledWith({
        where: { inviteToken: 'valid-token' },
      });
    });

    it('should throw NotFoundException if token is invalid', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(null);

      await expect(service.validateToken('invalid-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if token is expired', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        tokenExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.validateToken('expired-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if intent is not approved', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        status: 'PENDING',
      });

      await expect(service.validateToken('token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token already used', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue({ id: 'existing-member' });

      await expect(service.validateToken('used-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeRegistration', () => {
    const completeDto: CompleteRegistrationDto = {
      inviteToken: 'valid-token',
      email: 'joao@example.com',
      password: 'password123',
      fullName: 'João Silva',
      phone: '+5511999999999',
    };

    const mockIntent = {
      id: 'intent-id',
      status: 'APPROVED',
      inviteToken: 'valid-token',
      email: 'joao@example.com',
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
    };

    it('should complete registration successfully', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          member: {
            create: jest.fn().mockResolvedValue(mockMember),
          },
        };
        return callback(mockPrisma);
      });

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.completeRegistration(completeDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('member');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email does not match', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue({
        ...mockIntent,
        email: 'different@example.com',
      });
      mockPrismaService.member.findFirst.mockResolvedValue(null);

      await expect(service.completeRegistration(completeDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already in use', async () => {
      mockPrismaService.membershipIntent.findUnique.mockResolvedValue(mockIntent);
      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.completeRegistration(completeDto)).rejects.toThrow(ConflictException);
    });
  });
});
