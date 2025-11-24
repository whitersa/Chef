import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeItem])],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
