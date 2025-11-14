import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ListReferralsDto, ReferralTypeFilter } from './dto/list-referrals.dto';
import { ReferralStatusEnum, UpdateReferralStatusDto } from './dto/update-referral-status.dto';
import { ReferralsService } from './referrals.service';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    member: {
      findUnique: jest.fn(),
    },
    businessReferral: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
    },
    referralStatusHistory: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const referrerId = 'referrer-id';
    const createDto: CreateReferralDto = {
      referredToId: 'referred-to-id',
      clientName: 'Cliente XYZ',
      clientPhone: '+5511999999999',
      clientEmail: 'cliente@example.com',
      description: 'Cliente em busca de consultoria em gestão de projetos',
      estimatedValue: 50000,
    };

    const mockReferrer = {
      id: 'referrer-id',
      status: 'ACTIVE',
      userId: 'user-id',
      fullName: 'João Silva',
    };

    const mockReferredTo = {
      id: 'referred-to-id',
      status: 'ACTIVE',
      email: 'referred@example.com',
    };

    const mockReferral = {
      id: 'referral-id',
      referrerId: 'referrer-id',
      referredToId: 'referred-to-id',
      clientName: 'Cliente XYZ',
      status: 'PENDING',
      referrer: {
        id: 'referrer-id',
        fullName: 'João Silva',
      },
      referredTo: {
        id: 'referred-to-id',
        fullName: 'Maria Santos',
      },
    };

    it('should create a referral successfully', async () => {
      mockPrismaService.member.findUnique
        .mockResolvedValueOnce(mockReferrer)
        .mockResolvedValueOnce(mockReferredTo);
      mockPrismaService.businessReferral.create.mockResolvedValue(mockReferral);
      mockPrismaService.referralStatusHistory.create.mockResolvedValue({});

      const result = await service.create(referrerId, createDto);

      expect(result).toEqual(mockReferral);
      expect(mockPrismaService.businessReferral.create).toHaveBeenCalled();
      expect(mockPrismaService.referralStatusHistory.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if referrer is not active', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue({
        ...mockReferrer,
        status: 'INACTIVE',
      });

      await expect(service.create(referrerId, createDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if referredTo is not active', async () => {
      mockPrismaService.member.findUnique
        .mockResolvedValueOnce(mockReferrer)
        .mockResolvedValueOnce({
          ...mockReferredTo,
          status: 'INACTIVE',
        });

      await expect(service.create(referrerId, createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if referrer and referredTo are the same', async () => {
      mockPrismaService.member.findUnique
        .mockResolvedValueOnce(mockReferrer)
        .mockResolvedValueOnce(mockReferrer);

      const sameMemberDto = {
        ...createDto,
        referredToId: referrerId,
      };

      await expect(service.create(referrerId, sameMemberDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const memberId = 'member-id';
    const queryDto: ListReferralsDto = { page: 1, limit: 20 };

    const mockReferrals = [
      {
        id: 'referral-1',
        clientName: 'Cliente XYZ',
        referrer: { id: 'referrer-id', fullName: 'João Silva' },
        referredTo: { id: 'referred-to-id', fullName: 'Maria Santos' },
      },
    ];

    it('should return paginated referrals', async () => {
      mockPrismaService.businessReferral.findMany.mockResolvedValue(mockReferrals);
      mockPrismaService.businessReferral.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: 10000 },
      });

      const result = await service.findAll(memberId, queryDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('pagination');
      expect(mockPrismaService.businessReferral.findMany).toHaveBeenCalled();
    });

    it('should filter by type GIVEN', async () => {
      const queryDtoWithType: ListReferralsDto = {
        ...queryDto,
        type: ReferralTypeFilter.GIVEN,
      };

      mockPrismaService.businessReferral.findMany.mockResolvedValue(mockReferrals);
      mockPrismaService.businessReferral.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: null },
      });

      await service.findAll(memberId, queryDtoWithType);

      expect(mockPrismaService.businessReferral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ referrerId: memberId }),
        }),
      );
    });

    it('should filter by type RECEIVED', async () => {
      const queryDtoWithType: ListReferralsDto = {
        ...queryDto,
        type: ReferralTypeFilter.RECEIVED,
      };

      mockPrismaService.businessReferral.findMany.mockResolvedValue(mockReferrals);
      mockPrismaService.businessReferral.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: null },
      });

      await service.findAll(memberId, queryDtoWithType);

      expect(mockPrismaService.businessReferral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ referredToId: memberId }),
        }),
      );
    });

    it('should filter by status', async () => {
      const queryDtoWithStatus: ListReferralsDto = {
        ...queryDto,
        status: ReferralStatusEnum.PENDING,
      };

      mockPrismaService.businessReferral.findMany.mockResolvedValue(mockReferrals);
      mockPrismaService.businessReferral.count.mockResolvedValue(1);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: null },
      });

      await service.findAll(memberId, queryDtoWithStatus);

      expect(mockPrismaService.businessReferral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const memberId = 'member-id';
    const referralId = 'referral-id';

    const mockReferral = {
      id: referralId,
      referrerId: 'referrer-id',
      referredToId: memberId,
      clientName: 'Cliente XYZ',
      referrer: {
        id: 'referrer-id',
        fullName: 'João Silva',
      },
      referredTo: {
        id: memberId,
        fullName: 'Maria Santos',
      },
    };

    it('should return a referral', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue(mockReferral);

      const result = await service.findOne(memberId, referralId);

      expect(result).toEqual(mockReferral);
      expect(mockPrismaService.businessReferral.findUnique).toHaveBeenCalledWith({
        where: { id: referralId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if referral does not exist', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue(null);

      await expect(service.findOne(memberId, referralId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if member is not related to referral', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue({
        ...mockReferral,
        referrerId: 'other-referrer',
        referredToId: 'other-referred',
      });

      await expect(service.findOne(memberId, referralId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    const memberId = 'member-id';
    const referralId = 'referral-id';

    const mockReferral = {
      id: referralId,
      referrerId: 'referrer-id',
      referredToId: memberId,
      status: 'PENDING',
      clientName: 'Cliente XYZ',
    };

    const mockMember = {
      id: memberId,
      userId: 'user-id',
    };

    const updateDto: UpdateReferralStatusDto = {
      status: ReferralStatusEnum.CONTACTED,
      feedback: 'Em contato com o cliente',
    };

    it('should update referral status successfully', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue(mockReferral);
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.businessReferral.update.mockResolvedValue({
        ...mockReferral,
        status: ReferralStatusEnum.CONTACTED,
        referrer: {
          id: 'referrer-id',
          fullName: 'João Silva',
          email: 'referrer@example.com',
        },
        referredTo: {
          id: memberId,
          fullName: 'Maria Santos',
        },
      });
      mockPrismaService.referralStatusHistory.create.mockResolvedValue({});

      const result = await service.updateStatus(memberId, referralId, updateDto);

      expect(result.status).toBe(ReferralStatusEnum.CONTACTED);
      expect(mockPrismaService.businessReferral.update).toHaveBeenCalled();
      expect(mockPrismaService.referralStatusHistory.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if member is not the referredTo', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue({
        ...mockReferral,
        referredToId: 'other-member',
      });

      await expect(service.updateStatus(memberId, referralId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if CLOSED status without closedValue', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue(mockReferral);

      const closedDto: UpdateReferralStatusDto = {
        status: ReferralStatusEnum.CLOSED,
      };

      await expect(service.updateStatus(memberId, referralId, closedDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update status to CLOSED with closedValue', async () => {
      mockPrismaService.businessReferral.findUnique.mockResolvedValue(mockReferral);
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.businessReferral.update.mockResolvedValue({
        ...mockReferral,
        status: ReferralStatusEnum.CLOSED,
        closedValue: 50000,
        referrer: {
          id: 'referrer-id',
          fullName: 'João Silva',
          email: 'referrer@example.com',
        },
        referredTo: {
          id: memberId,
          fullName: 'Maria Santos',
        },
      });
      mockPrismaService.referralStatusHistory.create.mockResolvedValue({});

      const closedDto: UpdateReferralStatusDto = {
        status: ReferralStatusEnum.CLOSED,
        closedValue: 50000,
      };

      const result = await service.updateStatus(memberId, referralId, closedDto);

      expect(result.status).toBe(ReferralStatusEnum.CLOSED);
      expect(mockPrismaService.businessReferral.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ReferralStatusEnum.CLOSED,
            closedValue: 50000,
            closedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('calculateStatistics', () => {
    const memberId = 'member-id';

    it('should calculate statistics correctly', async () => {
      mockPrismaService.businessReferral.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);
      mockPrismaService.businessReferral.aggregate.mockResolvedValue({
        _sum: { closedValue: 100000 },
      });

      const result = await service.calculateStatistics(memberId);

      expect(result).toMatchObject({
        totalGiven: 10,
        totalReceived: 5,
        pendingReceived: 3,
        closedReceived: 2,
        totalValueClosed: 100000,
      });
    });
  });
});
