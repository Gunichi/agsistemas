import { Test, TestingModule } from '@nestjs/testing';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { CreateMembershipIntentDto } from './dto/create-membership-intent.dto';
import {
  ApproveMembershipIntentDto,
  RejectMembershipIntentDto,
} from './dto/review-membership-intent.dto';
import { MembershipIntentsController } from './membership-intents.controller';
import { MembershipIntentsService } from './membership-intents.service';

describe('MembershipIntentsController', () => {
  let controller: MembershipIntentsController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: MembershipIntentsService;

  const mockMembershipIntentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    validateToken: jest.fn(),
    completeRegistration: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipIntentsController],
      providers: [
        {
          provide: MembershipIntentsService,
          useValue: mockMembershipIntentsService,
        },
      ],
    }).compile();

    controller = module.get<MembershipIntentsController>(MembershipIntentsController);
    service = module.get<MembershipIntentsService>(MembershipIntentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateMembershipIntentDto = {
      fullName: 'João Silva',
      email: 'joao@example.com',
      motivation: 'Desejo expandir minha rede de contatos profissionais',
    };

    const mockIntent = {
      id: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      status: 'PENDING',
    };

    it('should create an intent and return success response', async () => {
      mockMembershipIntentsService.create.mockResolvedValue(mockIntent);

      const result = await controller.create(createDto);

      expect(result).toMatchObject({
        success: true,
        data: mockIntent,
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembershipIntentsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated intents', async () => {
      const queryDto = { page: 1, limit: 20 };
      const mockResult = {
        data: [{ id: 'intent-1', fullName: 'João Silva' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
        },
      };

      mockMembershipIntentsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto);

      expect(result).toMatchObject({
        success: true,
        data: {
          intents: mockResult.data,
          pagination: mockResult.pagination,
        },
        meta: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    const mockIntent = {
      id: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    it('should return an intent', async () => {
      mockMembershipIntentsService.findOne.mockResolvedValue(mockIntent);

      const result = await controller.findOne('intent-id');

      expect(result).toMatchObject({
        success: true,
        data: mockIntent,
        meta: expect.any(Object),
      });
    });
  });

  describe('approve', () => {
    const approveDto: ApproveMembershipIntentDto = {
      notes: 'Approved with notes',
    };

    const mockApprovedIntent = {
      id: 'intent-id',
      status: 'APPROVED',
      reviewedAt: new Date(),
      inviteToken: 'generated-token',
      tokenExpiresAt: new Date(),
    };

    it('should approve an intent', async () => {
      mockMembershipIntentsService.approve.mockResolvedValue(mockApprovedIntent);

      const result = await controller.approve('intent-id', approveDto);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'intent-id',
          status: 'APPROVED',
        }),
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembershipIntentsService.approve).toHaveBeenCalledWith(
        'intent-id',
        approveDto.notes,
      );
    });
  });

  describe('reject', () => {
    const rejectDto: RejectMembershipIntentDto = {
      reason: 'Not suitable',
    };

    const mockRejectedIntent = {
      id: 'intent-id',
      status: 'REJECTED',
      reviewedAt: new Date(),
      rejectionReason: 'Not suitable',
    };

    it('should reject an intent', async () => {
      mockMembershipIntentsService.reject.mockResolvedValue(mockRejectedIntent);

      const result = await controller.reject('intent-id', rejectDto);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'intent-id',
          status: 'REJECTED',
        }),
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembershipIntentsService.reject).toHaveBeenCalledWith(
        'intent-id',
        rejectDto.reason,
      );
    });
  });

  describe('validateToken', () => {
    const mockIntent = {
      id: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    it('should validate a token', async () => {
      mockMembershipIntentsService.validateToken.mockResolvedValue(mockIntent);

      const result = await controller.validateToken('valid-token');

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          valid: true,
          intent: expect.any(Object),
        }),
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembershipIntentsService.validateToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('completeRegistration', () => {
    const completeDto: CompleteRegistrationDto = {
      inviteToken: 'valid-token',
      email: 'joao@example.com',
      password: 'password123',
      fullName: 'João Silva',
    };

    const mockResult = {
      user: {
        id: 'user-id',
        email: 'joao@example.com',
      },
      member: {
        id: 'member-id',
        email: 'joao@example.com',
        fullName: 'João Silva',
      },
    };

    it('should complete registration', async () => {
      mockMembershipIntentsService.completeRegistration.mockResolvedValue(mockResult);

      const result = await controller.completeRegistration(completeDto);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          userId: 'user-id',
          memberId: 'member-id',
        }),
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembershipIntentsService.completeRegistration).toHaveBeenCalledWith(completeDto);
    });
  });
});
