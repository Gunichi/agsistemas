import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: DashboardService;

  const mockDashboardService = {
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    const mockStats = {
      members: {
        total: 50,
        active: 45,
        inactive: 5,
        newThisMonth: 3,
      },
      referrals: {
        total: 100,
        pending: 20,
        closed: 30,
        totalValue: 500000,
        thisMonth: {
          count: 10,
          value: 50000,
        },
      },
      thankYous: {
        total: 200,
        thisMonth: 15,
        thisWeek: 5,
      },
      meetings: {
        thisMonth: 4,
        averageAttendance: 0.88,
        nextMeeting: {
          date: '2024-01-15',
          title: 'Próxima Reunião Semanal',
        },
      },
    };

    it('should return dashboard stats', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toMatchObject({
        success: true,
        data: mockStats,
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
      expect(mockDashboardService.getStats).toHaveBeenCalled();
    });
  });
});
