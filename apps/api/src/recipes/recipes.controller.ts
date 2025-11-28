import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.recipesService.getVersions(id);
  }

  @Get('versions/:versionId')
  getVersion(@Param('versionId') versionId: string) {
    return this.recipesService.getVersion(versionId);
  }

  @Get(':id/cost')
  getCost(@Param('id') id: string) {
    return this.recipesService.calculateCost(id);
  }

  @Get(':id/nutrition')
  getNutrition(@Param('id') id: string) {
    return this.recipesService.calculateNutrition(id);
  }
}
