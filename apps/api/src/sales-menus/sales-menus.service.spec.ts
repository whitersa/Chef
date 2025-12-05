import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalesMenusService } from './sales-menus.service';
import { SalesMenu } from './entities/sales-menu.entity';
import { ObjectLiteral, Repository } from 'typeorm';

const mockSalesMenuRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
});

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('SalesMenusService', () => {
  let service: SalesMenusService;
  let repository: MockRepository<SalesMenu>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesMenusService,
        {
          provide: getRepositoryToken(SalesMenu),
          useFactory: mockSalesMenuRepository,
        },
      ],
    }).compile();

    service = module.get<SalesMenusService>(SalesMenusService);
    repository = module.get<MockRepository<SalesMenu>>(getRepositoryToken(SalesMenu));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a sales menu', async () => {
      const createDto = { name: 'Lunch Menu' };
      const expectedMenu = { id: 'uuid', ...createDto };

      repository.create!.mockReturnValue(expectedMenu);
      repository.save!.mockResolvedValue(expectedMenu);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedMenu);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(expectedMenu);
    });
  });

  describe('findAll', () => {
    it('should return an array of sales menus', async () => {
      const expectedMenus = [{ id: 'uuid', name: 'Lunch Menu' }];
      const total = 1;
      // Mock findAndCount instead of find
      repository.findAndCount = jest.fn().mockResolvedValue([expectedMenus, total]);

      const result = await service.findAll({});
      expect(result).toEqual({
        data: expectedMenus,
        meta: {
          total,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: ['items', 'items.recipe'],
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        where: {},
      });
    });
  });
});
