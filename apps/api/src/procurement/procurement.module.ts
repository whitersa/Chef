import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { RecipesModule } from '../recipes/recipes.module';
import { SalesMenusModule } from '../sales-menus/sales-menus.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { Procurement } from './procurement.entity';
import { ProcurementItem } from './procurement-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Procurement, ProcurementItem]),
    RecipesModule,
    SalesMenusModule,
    IngredientsModule,
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService],
})
export class ProcurementModule {}
