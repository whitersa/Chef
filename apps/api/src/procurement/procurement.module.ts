import { Module } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { RecipesModule } from '../recipes/recipes.module';
import { SalesMenusModule } from '../sales-menus/sales-menus.module';

@Module({
  imports: [RecipesModule, SalesMenusModule],
  controllers: [ProcurementController],
  providers: [ProcurementService],
})
export class ProcurementModule {}
