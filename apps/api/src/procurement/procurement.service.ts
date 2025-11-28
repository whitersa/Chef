import { Injectable } from '@nestjs/common';
import { RecipesService } from '../recipes/recipes.service';
import { CreateProcurementListDto } from './dto/create-procurement-list.dto';
import Decimal from 'decimal.js';

@Injectable()
export class ProcurementService {
  constructor(private recipesService: RecipesService) {}

  async generateList(dto: CreateProcurementListDto) {
    const ingredientMap = new Map<
      string,
      { name: string; quantity: Decimal; unit: string; cost: Decimal }
    >();

    for (const item of dto.items) {
      await this.processRecipe(
        item.recipeId,
        new Decimal(item.quantity),
        ingredientMap,
      );
    }

    // Convert map to array
    return Array.from(ingredientMap.entries()).map(([id, item]) => ({
      ingredientId: id,
      name: item.name,
      quantity: item.quantity.toNumber(),
      unit: item.unit,
      estimatedCost: item.cost.toDecimalPlaces(2).toNumber(),
    }));
  }

  private async processRecipe(
    recipeId: string,
    multiplier: Decimal,
    map: Map<
      string,
      { name: string; quantity: Decimal; unit: string; cost: Decimal }
    >,
  ) {
    const recipe = await this.recipesService.findOne(recipeId);
    if (!recipe) return; // Or throw error

    for (const item of recipe.items) {
      const itemQuantity = new Decimal(item.quantity).times(multiplier);

      // Calculate Gross Quantity needed (Net / Yield)
      // If yieldRate is 0.8, and we need 1kg Net, we need to buy 1.25kg Gross.
      const yieldRate = new Decimal(item.yieldRate || 1);
      const grossQuantity = itemQuantity.dividedBy(yieldRate);

      if (item.ingredient) {
        const existing = map.get(item.ingredient.id);
        const cost = new Decimal(item.ingredient.price).times(grossQuantity);

        if (existing) {
          existing.quantity = existing.quantity.plus(grossQuantity);
          existing.cost = existing.cost.plus(cost);
        } else {
          map.set(item.ingredient.id, {
            name: item.ingredient.name,
            quantity: grossQuantity,
            unit: item.ingredient.unit,
            cost: cost,
          });
        }
      } else if (item.childRecipe) {
        // Recursive call for sub-recipes
        await this.processRecipe(
          item.childRecipe.id,
          itemQuantity, // This is batches * multiplier
          map,
        );
      }
    }
  }
}
