import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './dish.entity';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dish])],
  providers: [DishesService],
  controllers: [DishesController],
  exports: [DishesService],
})
export class DishesModule {}
