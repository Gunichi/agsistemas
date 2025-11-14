import { Test, TestingModule } from '@nestjs/testing';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersDto } from './dto/list-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  let controller: MembersController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: MembersService;

  const mockMembersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateMemberDto = {
      intentId: 'intent-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    const mockMember = {
      id: 'member-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
    };

    it('should create a member and return success response', async () => {
      mockMembersService.create.mockResolvedValue(mockMember);

      const result = await controller.create(createDto);

      expect(result).toMatchObject({
        success: true,
        data: mockMember,
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembersService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const queryDto: ListMembersDto = { page: 1, limit: 20 };

    it('should return paginated members', async () => {
      const mockResult = {
        data: [{ id: 'member-1', fullName: 'João Silva' }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
        },
      };

      mockMembersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto);

      expect(result).toMatchObject({
        success: true,
        data: {
          members: mockResult.data,
          pagination: mockResult.pagination,
        },
        meta: expect.any(Object),
      });
      expect(mockMembersService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    const mockMember = {
      id: 'member-id',
      fullName: 'João Silva',
      email: 'joao@example.com',
      statistics: {
        referralsGiven: 5,
        referralsReceived: 3,
      },
    };

    it('should return a member', async () => {
      mockMembersService.findOne.mockResolvedValue(mockMember);

      const result = await controller.findOne('member-id');

      expect(result).toMatchObject({
        success: true,
        data: mockMember,
        meta: expect.any(Object),
      });
      expect(mockMembersService.findOne).toHaveBeenCalledWith('member-id');
    });
  });

  describe('update', () => {
    const updateDto: UpdateMemberDto = {
      fullName: 'João Silva Updated',
    };

    const mockUpdatedMember = {
      id: 'member-id',
      fullName: 'João Silva Updated',
    };

    it('should update a member', async () => {
      mockMembersService.update.mockResolvedValue(mockUpdatedMember);

      const result = await controller.update('member-id', updateDto);

      expect(result).toMatchObject({
        success: true,
        data: mockUpdatedMember,
        message: expect.any(String),
        meta: expect.any(Object),
      });
      expect(mockMembersService.update).toHaveBeenCalledWith('member-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should inactivate a member', async () => {
      const mockResult = { message: 'Membro inativado com sucesso' };
      mockMembersService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove('member-id');

      expect(result).toMatchObject({
        success: true,
        message: mockResult.message,
        meta: expect.any(Object),
      });
      expect(mockMembersService.remove).toHaveBeenCalledWith('member-id');
    });
  });
});
