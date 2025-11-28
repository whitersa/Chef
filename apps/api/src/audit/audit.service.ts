import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { OperationLog } from './operation-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(OperationLog)
    private repo: Repository<OperationLog>,
  ) {}

  async log(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details?: Record<string, any>,
  ) {
    const log = this.repo.create({
      userId,
      action,
      resource,
      resourceId,
      details,
    });
    return this.repo.save(log);
  }

  async findAll(resource?: string, resourceId?: string) {
    const where: FindOptionsWhere<OperationLog> = {};
    if (resource) where.resource = resource;
    if (resourceId) where.resourceId = resourceId;

    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100, // Limit to last 100 logs for now
    });
  }
}
