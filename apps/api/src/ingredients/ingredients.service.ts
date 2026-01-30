import { Inject, Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource, IsNull, ILike } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Ingredient } from './ingredient.entity';
import { IngredientVersion } from './ingredient-version.entity';
import { Category } from '../categories/category.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuditService } from '../audit/audit.service';

interface RedisStore {
  keys: (pattern: string) => Promise<string[]>;
  mdel: (...keys: string[]) => Promise<void>;
  del: (key: string) => Promise<void>;
}

export interface IngredientTreeNode {
  id: string;
  name: string;
  isCategory: boolean;
  fdcId?: string;
  price?: number;
  unit?: string;
  nutrition?: Record<string, any>;
  categoryId?: string;
  children?: IngredientTreeNode[];
}

@Injectable()
export class IngredientsService implements OnModuleInit {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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
          nutrition: {
            Protein: { amount: 0.9, unit: 'g' },
            Fat: { amount: 0.2, unit: 'g' },
            Carbohydrates: { amount: 3.9, unit: 'g' },
          },
        },
        {
          name: '鸡蛋',
          price: 10.0,
          unit: 'kg',
          nutrition: {
            Protein: { amount: 13, unit: 'g' },
            Fat: { amount: 10, unit: 'g' },
            Carbohydrates: { amount: 1, unit: 'g' },
          },
        },
        {
          name: '牛肉',
          price: 80.0,
          unit: 'kg',
          nutrition: {
            Protein: { amount: 26, unit: 'g' },
            Fat: { amount: 15, unit: 'g' },
            Carbohydrates: { amount: 0, unit: 'g' },
          },
        },
        {
          name: '土豆',
          price: 3.0,
          unit: 'kg',
          nutrition: {
            Protein: { amount: 2, unit: 'g' },
            Fat: { amount: 0.1, unit: 'g' },
            Carbohydrates: { amount: 17, unit: 'g' },
          },
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
      // Support multi-sort string like "field1:ASC,field2:DESC"
      if (sort.includes(':') || sort.includes(',')) {
        const sortFields = sort.split(',');
        sortFields.forEach((fieldStr) => {
          const [field, fieldOrder] = fieldStr.split(':');
          if (field) {
            orderOption[field.trim()] = fieldOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          }
        });
      } else {
        orderOption[sort] = order;
      }
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

  async getTree(search?: string) {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.ingredients', 'ingredient')
      .orderBy('category.name', 'ASC')
      .addOrderBy('ingredient.name', 'ASC');

    if (search) {
      // If searching, we also want to filter ingredients
      queryBuilder.where('ingredient.name ILIKE :search', { search: `%${search}%` });
    }

    const categories = await queryBuilder.getMany();

    const result: IngredientTreeNode[] = categories
      .map((cat): IngredientTreeNode | null => {
        const ingredients = cat.ingredients || [];
        if (ingredients.length === 0 && search) return null;

        // --- Smart Sub-grouping Logic ---
        const subGroups = new Map<string, Ingredient[]>();
        const standaloneIngredients: Ingredient[] = [];

        ingredients.forEach((ing) => {
          const nameParts = ing.name.split(/[、,，\s]/);
          const baseName = (nameParts[0] || '')
            .trim()
            .replace(/\(USDA\)$/, '')
            .trim();

          if (baseName && baseName.length > 1) {
            const group = subGroups.get(baseName) || [];
            if (!subGroups.has(baseName)) subGroups.set(baseName, group);
            group.push(ing);
          } else {
            standaloneIngredients.push(ing);
          }
        });

        const children: IngredientTreeNode[] = [];
        subGroups.forEach((items, name) => {
          if (items.length > 1) {
            children.push({
              id: `group-${cat.id}-${name}`,
              name: name,
              isCategory: true,
              children: items.map((i) => ({ ...i, isCategory: false })),
            });
          } else {
            standaloneIngredients.push(...items);
          }
        });

        children.push(...standaloneIngredients.map((i) => ({ ...i, isCategory: false })));
        children.sort((a, b) => (a.isCategory === b.isCategory ? 0 : a.isCategory ? -1 : 1));

        return {
          id: cat.id,
          name: cat.name,
          isCategory: true,
          children: children,
        };
      })
      .filter((c): c is IngredientTreeNode => c !== null);

    // Add "Uncategorized" group for ingredients without a category
    const uncategorizedItems = await this.ingredientsRepository.find({
      where: {
        categoryId: IsNull(),
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
    });

    if (uncategorizedItems.length > 0) {
      result.push({
        id: 'uncategorized',
        name: '未分类 (Orphaned)',
        isCategory: true,
        children: uncategorizedItems.map((i) => ({ ...i, isCategory: false })),
      });
    }

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
