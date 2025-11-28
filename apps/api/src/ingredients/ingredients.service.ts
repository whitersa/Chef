import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

interface RedisStore {
  keys: (pattern: string) => Promise<string[]>;
  mdel: (...keys: string[]) => Promise<void>;
  del: (key: string) => Promise<void>;
}

@Injectable()
export class IngredientsService implements OnModuleInit {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async clearCache() {
    const store = this.cacheManager.store as unknown as RedisStore;
    if (store.keys) {
      const keys = await store.keys('ingredients_list*');
      if (keys.length > 0) {
        if (store.mdel) {
          await store.mdel(...keys);
        } else if (store.del) {
          // Fallback if mdel is not available, though redis-yet has it
          await Promise.all(keys.map((k: string) => store.del(k)));
        }
      }
    }
  }

  async create(createIngredientDto: CreateIngredientDto) {
    const ingredient = this.ingredientsRepository.create(createIngredientDto);
    const saved = await this.ingredientsRepository.save(ingredient);
    await this.clearCache();
    return saved;
  }

  async findAll(query: PaginationQueryDto) {
    const cacheKey = `ingredients_list:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { page = 1, limit = 10, search, sort, order = 'ASC' } = query;
    const skip = (page - 1) * limit;

    const orderOption: Record<string, 'ASC' | 'DESC'> = {};
    if (sort) {
      orderOption[sort] = order;
    } else {
      orderOption['name'] = 'ASC';
    }

    const [items, total] = await this.ingredientsRepository.findAndCount({
      where: search ? { name: Like(`%${search}%`) } : {},
      skip,
      take: limit,
      order: orderOption,
    });

    const result = {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, 24 * 60 * 60 * 1000); // 1 day
    return result;
  }

  findOne(id: string) {
    return this.ingredientsRepository.findOneBy({ id });
  }

  async update(id: string, updateIngredientDto: Partial<CreateIngredientDto>) {
    const result = await this.ingredientsRepository.update(
      id,
      updateIngredientDto,
    );
    await this.clearCache();
    return result;
  }

  async remove(id: string) {
    const result = await this.ingredientsRepository.delete(id);
    await this.clearCache();
    return result;
  }
}
