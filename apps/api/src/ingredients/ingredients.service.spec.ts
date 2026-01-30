import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './ingredient.entity';
import { IngredientVersion } from './ingredient-version.entity';
import { Category } from '../categories/category.entity';
import { AuditService } from '../audit/audit.service';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let module: TestingModule;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
  };

  const mockVersionRepository = {
    save: jest.fn(),
    find: jest.fn(),
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

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockDataSource = {
    manager: {
      transaction: jest.fn((cb: (repo: typeof mockRepository) => unknown) => cb(mockRepository)),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: getRepositoryToken(Ingredient),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(IngredientVersion),
          useValue: mockVersionRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
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
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'system',
        'CREATE',
        'Ingredient',
        savedEntity.id,
        expect.any(Object),
      );
      expect(mockCacheManager.store.keys).toHaveBeenCalledWith('ingredients_list*');
      expect(mockCacheManager.store.mdel).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update ingredient and clear cache', async () => {
      const id = '1';
      const dto = { price: 20 };
      const currentEntity = {
        id,
        name: 'Old',
        price: 10,
        version: 1,
        unit: 'kg',
      };
      const updatedEntity = { ...currentEntity, ...dto, version: 2 };

      // Mock transaction manager behavior
      mockRepository.findOne.mockResolvedValue(currentEntity);
      mockRepository.merge.mockReturnValue(updatedEntity);
      mockRepository.save.mockResolvedValue(updatedEntity);

      mockCacheManager.store.keys.mockResolvedValue(['ingredients_list:key1']);

      await service.update(id, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith(Ingredient, {
        where: { id },
      });
      expect(mockRepository.save).toHaveBeenCalled(); // Called for version and update
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'system',
        'UPDATE',
        'Ingredient',
        id,
        expect.any(Object),
      );
      expect(mockCacheManager.store.keys).toHaveBeenCalled();
    });
  });
});
