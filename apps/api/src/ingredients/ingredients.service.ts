import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from '@chefos/types';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  create(createIngredientDto: CreateIngredientDto) {
    const ingredient = this.ingredientsRepository.create(createIngredientDto);
    return this.ingredientsRepository.save(ingredient);
  }

  findAll() {
    return this.ingredientsRepository.find();
  }

  findOne(id: string) {
    return this.ingredientsRepository.findOneBy({ id });
  }

  update(id: string, updateIngredientDto: Partial<CreateIngredientDto>) {
    return this.ingredientsRepository.update(id, updateIngredientDto);
  }

  remove(id: string) {
    return this.ingredientsRepository.delete(id);
  }
}
