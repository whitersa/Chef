import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenusService } from './menus.service';
import { Menu } from './menu.entity';

describe('MenusService', () => {
  let service: MenusService;
  let module: TestingModule;

  const mockRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        MenusService,
        {
          provide: getRepositoryToken(Menu),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return sorted menu tree', async () => {
      const root1 = { id: '1', order: 2, children: [] };
      const root2 = {
        id: '2',
        order: 1,
        children: [
          { id: '3', order: 2 },
          { id: '4', order: 1 },
        ],
      };

      mockRepository.find.mockResolvedValue([root2, root1]); // Mock returns unsorted roots if repo doesn't sort (but repo query has order)

      const result = await service.findAll();

      // Service sorts children
      expect(result).toEqual([root2, root1]);
      expect(root2.children[0].id).toBe('4'); // Order 1
      expect(root2.children[1].id).toBe('3'); // Order 2
    });
  });

  describe('onModuleInit', () => {
    it('should seed if count is 0', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.find.mockResolvedValue([]); // For sync/remove
      mockRepository.save.mockResolvedValue({});

      await service.onModuleInit();

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should not seed if count > 0', async () => {
      mockRepository.count.mockResolvedValue(1);

      await service.onModuleInit();

      // Should not call save (except if sync is called, but sync is only called if count === 0)
      // Wait, sync calls find and remove then save.
      // If count > 0, seed() is NOT called.
      // So save should NOT be called.
      // But we need to clear mock calls from beforeEach? No, they are fresh.
      // However, mockRepository.save might have been called in previous tests? No, new instance.
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
