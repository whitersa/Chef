import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessingMethod } from './processing-method.entity';

@Injectable()
export class ProcessingMethodsService {
  constructor(
    @InjectRepository(ProcessingMethod)
    private repo: Repository<ProcessingMethod>,
  ) {}

  create(name: string, description?: string) {
    return this.repo.save({ name, description });
  }

  findAll() {
    return this.repo.find();
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
