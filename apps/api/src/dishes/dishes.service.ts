import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './dish.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private dishesRepository: Repository<Dish>,
  ) {}

  findAll() {
    return this.dishesRepository.find({ relations: ['cuisine', 'recipes'] });
  }

  findOne(id: string) {
    return this.dishesRepository.findOne({
      where: { id },
      relations: ['cuisine', 'recipes'],
    });
  }

  create(dish: Partial<Dish>) {
    return this.dishesRepository.save(dish);
  }

  async update(id: string, dish: Partial<Dish>) {
    await this.dishesRepository.update(id, dish);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.dishesRepository.delete(id);
  }
}
