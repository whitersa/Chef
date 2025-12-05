import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CuisinesService } from './cuisines.service';
import { Cuisine } from './cuisine.entity';

@Controller('cuisines')
export class CuisinesController {
  constructor(private readonly cuisinesService: CuisinesService) {}

  @Get()
  findAll() {
    return this.cuisinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuisinesService.findOne(id);
  }

  @Post()
  create(@Body() cuisine: Partial<Cuisine>) {
    return this.cuisinesService.create(cuisine);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() cuisine: Partial<Cuisine>) {
    return this.cuisinesService.update(id, cuisine);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cuisinesService.remove(id);
  }
}
