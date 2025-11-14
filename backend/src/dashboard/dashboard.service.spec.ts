import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    member: {
      count: jest.fn(),
    },
    businessReferral: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    thankYou: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return real stats when members exist', async () => {
      mockPrismaService.member.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(45)
        .mockResolvedValueOnce(5);
      mockPrismaService.businessReferral.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(10);
      mockPrismaService.businessReferral.aggregate
        .mockResolvedValueOnce({ _sum: { closedValue: 500000 } })
        .mockResolvedValueOnce({ _sum: { closedValue: 50000 } });
      mockPrismaService.thankYou.count.mockResolvedValueOnce(200).mockResolvedValueOnce(15);

      const result = await service.getStats();

      expect(result).toHaveProperty('members');
      expect(result).toHaveProperty('referrals');
      expect(result).toHaveProperty('thankYous');
      expect(result).toHaveProperty('meetings');
      expect(result.members.total).toBe(50);
      expect(result.members.active).toBe(45);
      expect(result.referrals.total).toBe(100);
      expect(mockPrismaService.member.count).toHaveBeenCalled();
    });

    it('should return mock stats when no members exist', async () => {
      mockPrismaService.member.count.mockResolvedValue(0);

      const result = await service.getStats();

      expect(result).toHaveProperty('members');
      expect(result).toHaveProperty('referrals');
      expect(result).toHaveProperty('thankYous');
      expect(result).toHaveProperty('meetings');
      expect(result.members.total).toBe(35);
      expect(result.members.active).toBe(33);
      expect(result.referrals.total).toBe(145);
      expect(mockPrismaService.member.count).toHaveBeenCalledTimes(3);
    });

    it('should calculate new members this month correctly', async () => {
      mockPrismaService.member.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(45)
        .mockResolvedValueOnce(3);
      mockPrismaService.businessReferral.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(5);
      mockPrismaService.businessReferral.aggregate
        .mockResolvedValueOnce({ _sum: { closedValue: 500000 } })
        .mockResolvedValueOnce({ _sum: { closedValue: 25000 } });
      mockPrismaService.thankYou.count.mockResolvedValueOnce(200).mockResolvedValueOnce(8);

      const result = await service.getStats();

      expect(result.members.newThisMonth).toBe(3);
      expect(mockPrismaService.member.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should include meetings data', async () => {
      mockPrismaService.member.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(45)
        .mockResolvedValueOnce(5);
      mockPrismaService.businessReferral.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(10);
      mockPrismaService.businessReferral.aggregate
        .mockResolvedValueOnce({ _sum: { closedValue: 500000 } })
        .mockResolvedValueOnce({ _sum: { closedValue: 50000 } });
      mockPrismaService.thankYou.count.mockResolvedValueOnce(200).mockResolvedValueOnce(15);

      const result = await service.getStats();

      expect(result.meetings).toHaveProperty('thisMonth');
      expect(result.meetings).toHaveProperty('averageAttendance');
      expect(result.meetings).toHaveProperty('nextMeeting');
      expect(result.meetings.nextMeeting).toHaveProperty('date');
      expect(result.meetings.nextMeeting).toHaveProperty('title');
    });
  });
});
