import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './ingredient.entity';

describe('IngredientsService', () => {
  let service: IngredientsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    store: {
      keys: jest.fn(),
      mdel: jest.fn(),
      del: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: getRepositoryToken(Ingredient),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached data if available', async () => {
      const query = { page: 1, limit: 10 };
      const cachedData = { data: [], meta: { total: 0 } };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.findAll(query);

      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should fetch from db and cache if not cached', async () => {
      const query = { page: 1, limit: 10 };
      mockCacheManager.get.mockResolvedValue(null);
      const dbResult = [[{ id: '1', name: 'Test' }], 1];
      mockRepository.findAndCount.mockResolvedValue(dbResult);

      const result = (await service.findAll(query)) as { data: any[] };

      expect(result.data).toEqual(dbResult[0]);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create ingredient and clear cache', async () => {
      const dto = { name: 'New', price: 10, unit: 'kg', nutrition: {} };
      const savedEntity = { id: '1', ...dto };

      mockRepository.create.mockReturnValue(savedEntity);
      mockRepository.save.mockResolvedValue(savedEntity);

      // Mock cache clearing logic
      mockCacheManager.store.keys.mockResolvedValue(['ingredients_list:key1']);
      mockCacheManager.store.mdel.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(result).toEqual(savedEntity);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockCacheManager.store.keys).toHaveBeenCalledWith(
        'ingredients_list*',
      );
      expect(mockCacheManager.store.mdel).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update ingredient and clear cache', async () => {
      const id = '1';
      const dto = { price: 20 };
      mockRepository.update.mockResolvedValue({ affected: 1 });

      mockCacheManager.store.keys.mockResolvedValue(['ingredients_list:key1']);

      await service.update(id, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
      expect(mockCacheManager.store.keys).toHaveBeenCalled();
    });
  });
});
