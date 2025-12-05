import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { OperationLog } from './operation-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let module: TestingModule;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(OperationLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save a log entry', async () => {
      const logData = {
        userId: 'user-1',
        action: 'CREATE',
        resource: 'Recipe',
        resourceId: 'recipe-1',
        details: { name: 'Test' },
      };
      const savedLog = { id: '1', ...logData };

      mockRepository.create.mockReturnValue(savedLog);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.log(
        logData.userId,
        logData.action,
        logData.resource,
        logData.resourceId,
        logData.details,
      );

      expect(result).toEqual(savedLog);
      expect(mockRepository.create).toHaveBeenCalledWith(logData);
      expect(mockRepository.save).toHaveBeenCalledWith(savedLog);
    });
  });

  describe('findAll', () => {
    it('should return logs', async () => {
      const logs = [{ id: '1', action: 'CREATE' }];
      mockRepository.find.mockResolvedValue(logs);

      const result = await service.findAll('Recipe', 'recipe-1');

      expect(result).toEqual(logs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { resource: 'Recipe', resourceId: 'recipe-1' },
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });
  });
});
