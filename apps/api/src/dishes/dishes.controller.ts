import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { Dish } from './dish.entity';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  findAll() {
    return this.dishesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  @Post()
  create(@Body() dish: Partial<Dish>) {
    return this.dishesService.create(dish);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dish: Partial<Dish>) {
    return this.dishesService.update(id, dish);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishesService.remove(id);
  }
}
