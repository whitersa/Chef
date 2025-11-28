import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { Ingredient } from './ingredient.entity';
import { IngredientVersion } from './ingredient-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, IngredientVersion])],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
