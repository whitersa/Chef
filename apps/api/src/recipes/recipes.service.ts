import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RecipeVersion } from './recipe-version.entity';
import { RecipeCostView } from './recipe-cost-view.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { NutritionDto } from './dto/nutrition.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuditService } from '../audit/audit.service';
import { UnitConversionUtil } from '../common/utils/unit-conversion.util';
import Decimal from 'decimal.js';

@Injectable()
export class RecipesService implements OnModuleInit {
  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(RecipeVersion)
    private recipeVersionsRepository: Repository<RecipeVersion>,
    @InjectRepository(RecipeCostView)
    private recipeCostViewRepository: Repository<RecipeCostView>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log('RecipesService: onModuleInit started');
    const count = await this.recipesRepository.count();
    if (count === 0) {
      const tomato = await this.ingredientsRepository.findOne({
        where: { name: '番茄' },
      });
      const egg = await this.ingredientsRepository.findOne({
        where: { name: '鸡蛋' },
      });

      if (tomato && egg) {
        const recipe = this.recipesRepository.create({
          name: '番茄炒蛋',
          steps: ['切番茄', '打鸡蛋', '炒鸡蛋', '炒番茄', '混合翻炒', '出锅'],
          preProcessing: ['洗番茄', '洗鸡蛋'],
          yieldQuantity: 2,
          yieldUnit: 'portion',
          laborCost: 5.0,
          items: [
            {
              ingredient: tomato,
              quantity: 0.5, // 0.5 kg tomato
              yieldRate: 0.95,
            },
            {
              ingredient: egg,
              quantity: 0.3, // 0.3 kg egg
              yieldRate: 1.0,
            },
          ],
        });

        await this.recipesRepository.save(recipe);
        console.log('Seeded initial recipe: 番茄炒蛋');
      }
    }
    console.log('RecipesService: onModuleInit completed');
  }

  async refreshMaterializedView() {
    await this.dataSource.query('REFRESH MATERIALIZED VIEW "recipe_costs"');
  }

  async create(createRecipeDto: CreateRecipeDto) {
    return this.dataSource.manager.transaction(async (manager) => {
      const recipe = manager.create(Recipe, createRecipeDto);
      const savedRecipe = await manager.save(recipe);

      // Log operation (Note: AuditService uses its own repo, which is outside this transaction unless we pass manager.
      // For strict consistency, AuditService should accept a manager, but for now we log after commit or parallel)
      // Ideally, we should use the same manager.
      // But AuditService.log uses this.repo.save().
      // We'll just await it. If it fails, the transaction might have already committed.
      // For critical audit, it should be in transaction.
      // Let's keep it simple for now.
      await this.auditService.log(
        'system',
        'CREATE',
        'Recipe',
        savedRecipe.id,
        { name: savedRecipe.name },
      );

      return savedRecipe;
    });
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    return this.dataSource.manager.transaction(async (manager) => {
      // 1. Fetch current state with full relations
      const currentRecipe = await manager.findOne(Recipe, {
        where: { id },
        relations: ['items', 'items.ingredient', 'items.childRecipe'],
      });

      if (!currentRecipe) {
        throw new NotFoundException('Recipe not found');
      }

      // 2. Create snapshot of the CURRENT state (before update)
      const version = new RecipeVersion();
      version.recipe = currentRecipe;
      version.version = currentRecipe.version;
      version.name = currentRecipe.name;
      version.steps = currentRecipe.steps;
      version.preProcessing = currentRecipe.preProcessing;
      version.yieldQuantity = currentRecipe.yieldQuantity;
      version.yieldUnit = currentRecipe.yieldUnit;
      version.laborCost = currentRecipe.laborCost;
      version.itemsSnapshot = currentRecipe.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        yieldRate: item.yieldRate,
        ingredient: item.ingredient
          ? {
              id: item.ingredient.id,
              name: item.ingredient.name,
              price: item.ingredient.price,
            }
          : null,
        childRecipe: item.childRecipe
          ? { id: item.childRecipe.id, name: item.childRecipe.name }
          : null,
      }));
      version.changeLog = 'Updated via API';

      await manager.save(RecipeVersion, version);

      // 3. Apply updates
      if (updateRecipeDto.items) {
        await manager.delete('RecipeItem', { recipeId: id });
      }

      const updatedRecipe = manager.merge(
        Recipe,
        currentRecipe,
        updateRecipeDto,
      );
      const saved = await manager.save(Recipe, updatedRecipe);

      // 4. Log Audit
      await this.auditService.log('system', 'UPDATE', 'Recipe', id, {
        version: saved.version,
        changes: Object.keys(updateRecipeDto),
      });

      return saved;
    });
  }

  async getVersions(recipeId: string) {
    return this.recipeVersionsRepository.find({
      where: { recipeId },
      order: { version: 'DESC' },
    });
  }

  async getVersion(versionId: string) {
    return this.recipeVersionsRepository.findOne({
      where: { id: versionId },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, sort, order = 'ASC' } = query;
    const skip = (page - 1) * limit;

    const orderOption: Record<string, 'ASC' | 'DESC'> = {};
    if (sort) {
      orderOption[sort] = order;
    } else {
      orderOption['name'] = 'ASC';
    }

    const [items, total] = await this.recipesRepository.findAndCount({
      where: search ? { name: Like(`%${search}%`) } : {},
      relations: ['items', 'items.ingredient', 'items.childRecipe'],
      skip,
      take: limit,
      order: orderOption,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.recipesRepository.findOne({
      where: { id },
      relations: ['items', 'items.ingredient', 'items.childRecipe'],
    });
  }

  async calculateCost(id: string): Promise<number> {
    const totalCost = await this.calculateCostRecursive(id, new Set());
    return totalCost.toDecimalPlaces(2).toNumber();
  }

  async calculateCostPerPortion(id: string): Promise<number> {
    const recipe = await this.findOne(id);
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const totalCost = await this.calculateCostRecursive(id, new Set());
    const laborCost = new Decimal(recipe.laborCost || 0);
    const totalCostWithLabor = totalCost.plus(laborCost);

    const yieldQuantity = new Decimal(recipe.yieldQuantity || 1);
    if (yieldQuantity.isZero()) {
      throw new Error('Yield quantity cannot be zero');
    }

    return totalCostWithLabor
      .dividedBy(yieldQuantity)
      .toDecimalPlaces(2)
      .toNumber();
  }

  async calculateNutrition(id: string): Promise<NutritionDto> {
    return this.calculateNutritionRecursive(id, new Set());
  }

  private async calculateNutritionRecursive(
    id: string,
    visited: Set<string>,
  ): Promise<NutritionDto> {
    if (visited.has(id)) {
      throw new Error(`Circular dependency detected in recipe: ${id}`);
    }
    visited.add(id);

    const recipe = await this.findOne(id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    let totalWeight = new Decimal(0);
    const totalNutrition = {
      calories: new Decimal(0),
      protein: new Decimal(0),
      fat: new Decimal(0),
      carbs: new Decimal(0),
    };

    for (const item of recipe.items) {
      let itemWeightInGrams = new Decimal(0);
      let itemNutrition = {
        calories: new Decimal(0),
        protein: new Decimal(0),
        fat: new Decimal(0),
        carbs: new Decimal(0),
      };

      if (item.ingredient) {
        // Convert ingredient quantity to grams
        // item.quantity is Net Quantity (what goes into the pot)
        itemWeightInGrams = UnitConversionUtil.toGrams(
          item.quantity,
          item.ingredient.unit,
        );

        if (item.ingredient.nutrition) {
          // Nutrition is per 100g
          const factor = itemWeightInGrams.dividedBy(100);
          const n = item.ingredient.nutrition;
          itemNutrition = {
            calories: new Decimal(n.calories || 0).times(factor),
            protein: new Decimal(n.protein || 0).times(factor),
            fat: new Decimal(n.fat || 0).times(factor),
            carbs: new Decimal(n.carbs || 0).times(factor),
          };
        }
      } else if (item.childRecipe) {
        // Recursive call
        const childStats = await this.calculateNutritionRecursive(
          item.childRecipe.id,
          visited,
        );

        // NEW LOGIC: item.quantity is Number of Batches (e.g. 0.5 batches)
        const batches = new Decimal(item.quantity);

        // Weight = Child Total Weight * Batches
        itemWeightInGrams = new Decimal(childStats.totalWeight).times(batches);

        // Nutrition = Child Total Nutrition * Batches
        itemNutrition = {
          calories: new Decimal(childStats.calories).times(batches),
          protein: new Decimal(childStats.protein).times(batches),
          fat: new Decimal(childStats.fat).times(batches),
          carbs: new Decimal(childStats.carbs).times(batches),
        };
      }

      totalWeight = totalWeight.plus(itemWeightInGrams);
      totalNutrition.calories = totalNutrition.calories.plus(
        itemNutrition.calories,
      );
      totalNutrition.protein = totalNutrition.protein.plus(
        itemNutrition.protein,
      );
      totalNutrition.fat = totalNutrition.fat.plus(itemNutrition.fat);
      totalNutrition.carbs = totalNutrition.carbs.plus(itemNutrition.carbs);
    }

    visited.delete(id);

    return {
      totalWeight: totalWeight.toNumber(),
      calories: totalNutrition.calories.toDecimalPlaces(2).toNumber(),
      protein: totalNutrition.protein.toDecimalPlaces(2).toNumber(),
      fat: totalNutrition.fat.toDecimalPlaces(2).toNumber(),
      carbs: totalNutrition.carbs.toDecimalPlaces(2).toNumber(),
    };
  }

  private async calculateCostRecursive(
    id: string,
    visited: Set<string>,
  ): Promise<Decimal> {
    // 1. 循环依赖检测 (Cycle Detection)
    if (visited.has(id)) {
      throw new Error(`Circular dependency detected in recipe: ${id}`);
    }
    visited.add(id);

    // 2. 获取菜谱及其配方项
    const recipe = await this.findOne(id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    let totalCost = new Decimal(0);

    // 3. 遍历配方项计算成本
    for (const item of recipe.items) {
      let itemCost = new Decimal(0);
      const quantity = new Decimal(item.quantity);
      let yieldRateVal = item.yieldRate;
      if (yieldRateVal === null || yieldRateVal === undefined) {
        yieldRateVal = 1;
      }
      const yieldRate = new Decimal(yieldRateVal);

      if (yieldRate.isZero()) {
        throw new Error(
          `Yield rate cannot be zero for item in recipe: ${recipe.name}`,
        );
      }

      if (item.ingredient) {
        // A. 原材料成本 = 单价 * 数量
        const price = new Decimal(item.ingredient.price);
        itemCost = price.times(quantity);
      } else if (item.childRecipe) {
        // B. 半成品成本 = 递归计算子菜谱成本 * 数量
        const childRecipeCost = await this.calculateCostRecursive(
          item.childRecipe.id,
          visited,
        );
        itemCost = childRecipeCost.times(quantity);
      }

      // C. 计入损耗 (Cost / Yield)
      // 例如：需要 1kg 净肉，出品率 0.8，实际成本 = 1kg成本 / 0.8
      totalCost = totalCost.plus(itemCost.dividedBy(yieldRate));
    }

    // 4. 移除当前节点 (Backtracking)
    visited.delete(id);

    return totalCost;
  }
}
