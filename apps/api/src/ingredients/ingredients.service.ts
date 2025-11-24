import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from '@chefos/types';

@Injectable()
export class IngredientsService implements OnModuleInit {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async onModuleInit() {
    const count = await this.ingredientsRepository.count();
    if (count === 0) {
      const ingredients = [
        {
          name: '番茄',
          price: 5.0,
          unit: 'kg',
          nutrition: { protein: 0.9, fat: 0.2, carbs: 3.9 },
        },
        {
          name: '鸡蛋',
          price: 10.0,
          unit: 'kg',
          nutrition: { protein: 13, fat: 10, carbs: 1 },
        },
        {
          name: '牛肉',
          price: 80.0,
          unit: 'kg',
          nutrition: { protein: 26, fat: 15, carbs: 0 },
        },
        {
          name: '土豆',
          price: 3.0,
          unit: 'kg',
          nutrition: { protein: 2, fat: 0.1, carbs: 17 },
        },
      ];

      for (const item of ingredients) {
        await this.ingredientsRepository.save(
          this.ingredientsRepository.create(item),
        );
      }
      console.log('Seeded initial ingredients');
    }
  }

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
