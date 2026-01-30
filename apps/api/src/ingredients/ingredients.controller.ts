import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsdaService } from '../integrations/usda/usda.service';
import { Observable, map } from 'rxjs';

@Controller('ingredients')
export class IngredientsController {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly usdaService: UsdaService,
  ) {}

  @Post('sync/usda')
  async syncUsda(@Query('page') page?: number) {
    return this.usdaService.syncIngredients(page ? Number(page) : 1);
  }

  @Post('sync/usda/full')
  async fullSyncUsda() {
    return this.usdaService.startFullSync();
  }

  @Post('sync/usda/stop')
  async stopSyncUsda() {
    return this.usdaService.stopSync();
  }

  @Get('sync/usda/status')
  getSyncStatus() {
    return this.usdaService.getSyncStatus();
  }

  @Get('sync/usda/issues')
  async getSyncIssues() {
    return this.usdaService.getSyncIssues();
  }

  @Post('sync/usda/reset')
  async resetSyncData() {
    return this.usdaService.resetSyncData();
  }

  @Sse('sync/usda/events')
  syncEvents(): Observable<any> {
    return this.usdaService.getSyncStatusObservable().pipe(
      map((data) => {
        // 显式序列化以确保数据一致性
        return { data: JSON.stringify(data) };
      }),
    );
  }

  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.ingredientsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.ingredientsService.getVersions(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredientDto: Partial<CreateIngredientDto>) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
}
