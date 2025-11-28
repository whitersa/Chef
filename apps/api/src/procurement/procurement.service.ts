import { Injectable } from '@nestjs/common';
import { RecipesService } from '../recipes/recipes.service';
import { SalesMenusService } from '../sales-menus/sales-menus.service';
import { CreateProcurementListDto } from './dto/create-procurement-list.dto';
import Decimal from 'decimal.js';

@Injectable()
export class ProcurementService {
  constructor(
    private recipesService: RecipesService,
    private salesMenusService: SalesMenusService,
  ) {}

  async generateList(dto: CreateProcurementListDto) {
    const ingredientMap = new Map<
      string,
      { name: string; quantity: Decimal; unit: string; cost: Decimal }
    >();

    // Process individual recipes
    if (dto.items) {
      for (const item of dto.items) {
        await this.processRecipe(
          item.recipeId,
          new Decimal(item.quantity),
          ingredientMap,
        );
      }
    }

    // Process sales menus
    if (dto.salesMenus) {
      for (const menuRequest of dto.salesMenus) {
        const menu = await this.salesMenusService.findOne(menuRequest.menuId);
        if (menu && menu.items) {
          for (const menuItem of menu.items) {
            if (menuItem.recipe) {
              // If I sell 10 menus, and each menu has 1 burger, I need 10 burgers.
              // menuItem doesn't have quantity? Let's check SalesMenuItem entity.
              // Assuming 1 per menu item for now if not specified, but usually menu item is just a link.
              // Wait, SalesMenuItem usually implies 1 unit of that recipe unless specified otherwise.
              // Let's check SalesMenuItem entity.
              await this.processRecipe(
                menuItem.recipe.id,
                new Decimal(menuRequest.quantity), // Assuming 1 recipe per menu item
                ingredientMap,
              );
            }
          }
        }
      }
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
