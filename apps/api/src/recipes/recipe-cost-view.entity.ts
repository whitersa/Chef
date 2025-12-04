import { ViewEntity, ViewColumn, DataSource } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('r.id', 'recipeId')
      .addSelect('r.name', 'recipeName')
      .addSelect('SUM(ri.quantity * i.price)', 'totalCost')
      .from(Recipe, 'r')
      .innerJoin(RecipeItem, 'ri', 'r.id = ri.recipeId')
      .innerJoin(Ingredient, 'i', 'ri.ingredientId = i.id')
      .where('r.deletedAt IS NULL')
      .groupBy('r.id')
      .addGroupBy('r.name'),
  materialized: true,
  name: 'recipe_costs',
})
export class RecipeCostView {
  @ViewColumn()
  recipeId: string;

  @ViewColumn()
  recipeName: string;

  @ViewColumn()
  totalCost: number;
}
