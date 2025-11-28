import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe } from './recipe.entity';
import { CreateRecipeDto } from '@chefos/types';
import Decimal from 'decimal.js';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    private dataSource: DataSource,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    return this.dataSource.manager.transaction(async (manager) => {
      // Example of transactional logic:
      // 1. Save the recipe (and cascade items)
      const recipe = await manager.save(Recipe, createRecipeDto);

      // 2. Future: Deduct inventory, log audit, etc.
      // if (somethingFails) throw new Error('Rollback');

      return recipe;
    });
  }

  findAll() {
    return this.recipesRepository.find({
      relations: ['items', 'items.ingredient', 'items.childRecipe'],
    });
  }

  findOne(id: string) {
    return this.recipesRepository.findOne({
      where: { id },
      relations: ['items', 'items.ingredient', 'items.childRecipe'],
    });
  }

  async calculateCost(
    id: string,
    visited: Set<string> = new Set(),
  ): Promise<number> {
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
      const yieldRate = new Decimal(item.yieldRate || 1);

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
        const childRecipeCost = await this.calculateCost(
          item.childRecipe.id,
          visited,
        );
        itemCost = new Decimal(childRecipeCost).times(quantity);
      }

      // C. 计入损耗 (Cost / Yield)
      // 例如：需要 1kg 净肉，出品率 0.8，实际成本 = 1kg成本 / 0.8
      totalCost = totalCost.plus(itemCost.dividedBy(yieldRate));
    }

    // 4. 移除当前节点 (Backtracking)
    visited.delete(id);

    return totalCost.toDecimalPlaces(2).toNumber();
  }
}
