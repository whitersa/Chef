import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Get(':id/cost')
  getCost(@Param('id') id: string) {
    return this.recipesService.calculateCost(id);
  }
}
