import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { Ingredient } from './ingredient.entity';
import { IngredientVersion } from './ingredient-version.entity';
import { UsdaModule } from '../integrations/usda/usda.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, IngredientVersion]), UsdaModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
