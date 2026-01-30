import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsdaService } from './usda.service';
import { Ingredient } from '../../ingredients/ingredient.entity';
import { Category } from '../../categories/category.entity';
import { SyncIssue } from './sync-issue.entity';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Ingredient, Category, SyncIssue]),
    TranslationModule,
  ],
  providers: [UsdaService],
  exports: [UsdaService],
})
export class UsdaModule {}
