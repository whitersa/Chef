import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcessingMethodsService } from './processing-methods.service';
import { ProcessingMethod } from './processing-method.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

describe('ProcessingMethodsService', () => {
  let service: ProcessingMethodsService;
  let module: TestingModule;

  const mockRepository = {
    findAndCount: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ProcessingMethodsService,
        {
          provide: getRepositoryToken(ProcessingMethod),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProcessingMethodsService>(ProcessingMethodsService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated processing methods', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const resultData = [{ id: '1', name: 'Chop' }];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([resultData, total]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: resultData,
        meta: {
          total,
          page: 1,
          limit: 10,
        },
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { id: 'DESC' },
      });
    });
  });
});
