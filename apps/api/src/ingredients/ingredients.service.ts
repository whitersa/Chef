import { Inject, Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Ingredient } from './ingredient.entity';
import { IngredientVersion } from './ingredient-version.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuditService } from '../audit/audit.service';

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
    @InjectRepository(IngredientVersion)
    private ingredientVersionsRepository: Repository<IngredientVersion>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log('IngredientsService: onModuleInit started');
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
        await this.ingredientsRepository.save(this.ingredientsRepository.create(item));
      }
      console.log('Seeded initial ingredients');
    }
    console.log('IngredientsService: onModuleInit completed');
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

    await this.auditService.log('system', 'CREATE', 'Ingredient', saved.id, {
      name: saved.name,
    });
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
    return this.dataSource.manager.transaction(async (manager) => {
      const current = await manager.findOne(Ingredient, { where: { id } });
      if (!current) {
        throw new NotFoundException('Ingredient not found');
      }

      // Create version snapshot
      const version = new IngredientVersion();
      version.ingredient = current;
      version.version = current.version;
      version.name = current.name;
      version.price = current.price;
      version.unit = current.unit;
      version.nutrition = current.nutrition;
      version.changeLog = 'Updated via API';

      await manager.save(IngredientVersion, version);

      // Update
      const updated = manager.merge(Ingredient, current, updateIngredientDto);
      const saved = await manager.save(Ingredient, updated);

      await this.auditService.log('system', 'UPDATE', 'Ingredient', id, {
        version: saved.version,
        changes: Object.keys(updateIngredientDto),
      });

      await this.clearCache();
      return saved;
    });
  }

  async remove(id: string) {
    const result = await this.ingredientsRepository.delete(id);
    await this.auditService.log('system', 'DELETE', 'Ingredient', id, {});
    await this.clearCache();
    return result;
  }

  async getVersions(ingredientId: string) {
    return this.ingredientVersionsRepository.find({
      where: { ingredientId },
      order: { version: 'DESC' },
    });
  }

  async updateStock(id: string, quantityChange: number) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    ingredient.stockQuantity = Number(ingredient.stockQuantity || 0) + Number(quantityChange);

    // We might want to skip versioning for stock updates to avoid bloat,
    // or we can treat it as a regular update. For now, let's just save it.
    // If we want to avoid the transaction overhead of the main update method:
    const saved = await this.ingredientsRepository.save(ingredient);

    // Invalidate cache as stock is part of the list view potentially
    await this.clearCache();

    return saved;
  }
}
