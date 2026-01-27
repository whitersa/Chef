
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsdaService } from './usda.service';
import { Ingredient } from '../../ingredients/ingredient.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Ingredient]),
  ],
  providers: [UsdaService],
  exports: [UsdaService],
})
export class UsdaModule {}
