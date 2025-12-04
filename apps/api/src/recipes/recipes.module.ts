import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { RecipeVersion } from './recipe-version.entity';
import { RecipeCostView } from './recipe-cost-view.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeItem,
      RecipeVersion,
      RecipeCostView,
      Ingredient,
    ]),
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
