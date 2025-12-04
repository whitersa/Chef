import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProcessingMethod } from './processing-method.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ProcessingMethodsService {
  constructor(
    @InjectRepository(ProcessingMethod)
    private repo: Repository<ProcessingMethod>,
  ) {}

  create(name: string, description?: string) {
    return this.repo.save({ name, description });
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? [{ name: Like(`%${search}%`) }, { description: Like(`%${search}%`) }]
      : {};

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
