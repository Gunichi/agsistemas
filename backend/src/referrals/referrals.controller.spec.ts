import { Test, TestingModule } from '@nestjs/testing';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ListReferralsDto } from './dto/list-referrals.dto';
import { ReferralStatusEnum, UpdateReferralStatusDto } from './dto/update-referral-status.dto';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';

describe('ReferralsController', () => {
  let controller: ReferralsController;
  let service: ReferralsService;

  const mockReferralsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockRequest = {
    user: {
      memberId: 'member-id',
      userId: 'user-id',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralsController],
      providers: [
        {
          provide: ReferralsService,
          useValue: mockReferralsService,
        },
      ],
    }).compile();

    controller = module.get<ReferralsController>(ReferralsController);
    service = module.get<ReferralsService>(ReferralsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateReferralDto = {
      referredToId: 'referred-to-id',
      clientName: 'Cliente XYZ',
      description: 'Cliente em busca de consultoria em gestão de projetos',
    };

    const mockReferral = {
      id: 'referral-id',
      referrerId: 'member-id',
      referredToId: 'referred-to-id',
      clientName: 'Cliente XYZ',
      status: 'PENDING',
    };

    it('should create a referral and return success response', async () => {
      mockReferralsService.create.mockResolvedValue(mockReferral);

      const result = await controller.create(mockRequest as any, createDto);

      expect(result).toMatchObject({
        success: true,
        data: mockReferral,
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockReferralsService.create).toHaveBeenCalledWith('member-id', createDto);
    });
  });

  describe('findAll', () => {
    const queryDto: ListReferralsDto = { page: 1, limit: 20 };

    it('should return paginated referrals with statistics', async () => {
      const mockResult = {
        data: [{ id: 'referral-1', clientName: 'Cliente XYZ' }],
        statistics: {
          totalGiven: 10,
          totalReceived: 5,
          pendingReceived: 3,
          closedReceived: 2,
          totalValueClosed: 100000,
        },
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
        },
      };

      mockReferralsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockRequest as any, queryDto);

      expect(result).toMatchObject({
        success: true,
        data: {
          referrals: mockResult.data,
          statistics: mockResult.statistics,
          pagination: mockResult.pagination,
        },
        meta: expect.any(Object),
      });
      expect(mockReferralsService.findAll).toHaveBeenCalledWith('member-id', queryDto);
    });
  });

  describe('findOne', () => {
    const mockReferral = {
      id: 'referral-id',
      clientName: 'Cliente XYZ',
      referrer: { id: 'referrer-id', fullName: 'João Silva' },
      referredTo: { id: 'member-id', fullName: 'Maria Santos' },
    };

    it('should return a referral', async () => {
      mockReferralsService.findOne.mockResolvedValue(mockReferral);

      const result = await controller.findOne(mockRequest as any, 'referral-id');

      expect(result).toMatchObject({
        success: true,
        data: mockReferral,
        meta: expect.any(Object),
      });
      expect(mockReferralsService.findOne).toHaveBeenCalledWith('member-id', 'referral-id');
    });
  });

  describe('updateStatus', () => {
    const updateDto: UpdateReferralStatusDto = {
      status: ReferralStatusEnum.CONTACTED,
      feedback: 'Em contato com o cliente',
    };

    const mockUpdatedReferral = {
      id: 'referral-id',
      status: ReferralStatusEnum.CONTACTED,
      feedback: 'Em contato com o cliente',
    };

    it('should update referral status', async () => {
      mockReferralsService.updateStatus.mockResolvedValue(mockUpdatedReferral);

      const result = await controller.updateStatus(mockRequest as any, 'referral-id', updateDto);

      expect(result).toMatchObject({
        success: true,
        data: mockUpdatedReferral,
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockReferralsService.updateStatus).toHaveBeenCalledWith(
        'member-id',
        'referral-id',
        updateDto,
      );
    });
  });
});
