import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { RecipeVersion } from './recipe-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeItem, RecipeVersion])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
