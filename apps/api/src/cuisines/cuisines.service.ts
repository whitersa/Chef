import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuisine } from './cuisine.entity';

@Injectable()
export class CuisinesService {
  constructor(
    @InjectRepository(Cuisine)
    private cuisinesRepository: Repository<Cuisine>,
  ) {}

  findAll() {
    return this.cuisinesRepository.find({ relations: ['dishes'] });
  }

  findOne(id: string) {
    return this.cuisinesRepository.findOne({
      where: { id },
      relations: ['dishes'],
    });
  }

  create(cuisine: Partial<Cuisine>) {
    return this.cuisinesRepository.save(cuisine);
  }

  async update(id: string, cuisine: Partial<Cuisine>) {
    await this.cuisinesRepository.update(id, cuisine);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.cuisinesRepository.delete(id);
  }
}
