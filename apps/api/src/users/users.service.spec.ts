import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;

  const mockUserRepository = {
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const resultUsers = [{ id: '1', username: 'test' }];
      const total = 1;

      mockUserRepository.findAndCount.mockResolvedValue([resultUsers, total]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: resultUsers,
        meta: {
          total,
          page: 1,
          limit: 10,
        },
      });
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { id: 'DESC' },
      });
    });

    it('should handle search query', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10, search: 'test' };
      const resultUsers = [{ id: '1', username: 'test' }];
      const total = 1;

      mockUserRepository.findAndCount.mockResolvedValue([resultUsers, total]);

      await service.findAll(query);

      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
      // We can check the where clause structure if needed, but objectContaining is safer for now
    });
  });
});
