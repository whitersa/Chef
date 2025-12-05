import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipesService } from '../recipes/recipes.service';
import { SalesMenusService } from '../sales-menus/sales-menus.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { Ingredient } from '../ingredients/ingredient.entity';
import { CreateProcurementListDto } from './dto/create-procurement-list.dto';
import { Procurement, ProcurementStatus } from './procurement.entity';
import { ProcurementItem } from './procurement-item.entity';
import Decimal from 'decimal.js';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(Procurement)
    private procurementRepository: Repository<Procurement>,
    @InjectRepository(ProcurementItem)
    private procurementItemRepository: Repository<ProcurementItem>,
    private recipesService: RecipesService,
    private salesMenusService: SalesMenusService,
    private ingredientsService: IngredientsService,
  ) {}

  async create(dto: CreateProcurementListDto) {
    const items = await this.generateList(dto);

    const procurement = new Procurement();
    procurement.status = ProcurementStatus.PENDING;
    procurement.totalPrice = items.reduce((sum, item) => sum + item.estimatedCost, 0);

    const procurementItems = items.map((item) => {
      const pi = new ProcurementItem();
      pi.ingredient = { id: item.ingredientId } as Ingredient;
      pi.quantity = item.quantity;
      pi.unit = item.unit;
      pi.cost = item.estimatedCost;
      return pi;
    });

    procurement.items = procurementItems;

    return this.procurementRepository.save(procurement);
  }

  async findAll() {
    return this.procurementRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.ingredient'],
    });
  }

  async findOne(id: string) {
    return this.procurementRepository.findOne({
      where: { id },
      relations: ['items', 'items.ingredient'],
    });
  }

  async updateStatus(id: string, status: ProcurementStatus) {
    const procurement = await this.findOne(id);
    if (!procurement) throw new NotFoundException('Procurement not found');

    if (procurement.status === ProcurementStatus.COMPLETED) {
      throw new BadRequestException('Cannot change status of completed procurement');
    }

    if (status === ProcurementStatus.COMPLETED) {
      // Update stock
      for (const item of procurement.items) {
        await this.ingredientsService.updateStock(item.ingredient.id, item.quantity);
      }
    }

    procurement.status = status;
    return this.procurementRepository.save(procurement);
  }

  async generateList(dto: CreateProcurementListDto) {
    try {
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
            new Set(),
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
                  new Set(),
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
    } catch (error) {
      console.error(
        'Error in generateList:',
        error instanceof Error ? error.message : error,
        error instanceof Error ? error.stack : '',
      );
      throw error;
    }
  }

  private async processRecipe(
    recipeId: string,
    multiplier: Decimal,
    map: Map<string, { name: string; quantity: Decimal; unit: string; cost: Decimal }>,
    visited: Set<string>,
  ) {
    try {
      if (visited.has(recipeId)) {
        console.warn(`Circular dependency detected for recipe ${recipeId}, skipping.`);
        return;
      }
      visited.add(recipeId);

      const recipe = await this.recipesService.findOne(recipeId);
      if (!recipe) {
        console.warn(`Recipe ${recipeId} not found, skipping.`);
        visited.delete(recipeId);
        return;
      }

      if (!recipe.items) {
        visited.delete(recipeId);
        return;
      }

      for (const item of recipe.items) {
        const itemQuantity = new Decimal(item.quantity || 0).times(multiplier);

        // Calculate Gross Quantity needed (Net / Yield)
        // If yieldRate is 0.8, and we need 1kg Net, we need to buy 1.25kg Gross.
        let yieldRate = new Decimal(item.yieldRate || 1);
        if (yieldRate.isZero()) {
          yieldRate = new Decimal(1);
        }
        const grossQuantity = itemQuantity.dividedBy(yieldRate);

        if (item.ingredient) {
          const existing = map.get(item.ingredient.id);
          const cost = new Decimal(item.ingredient.price || 0).times(grossQuantity);

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
            visited,
          );
        }
      }

      visited.delete(recipeId);
    } catch (error) {
      console.error(
        `Error processing recipe ${recipeId}:`,
        error instanceof Error ? error.message : error,
      );
      throw error; // Re-throw to let the controller handle it (or global filter)
    }
  }
}
