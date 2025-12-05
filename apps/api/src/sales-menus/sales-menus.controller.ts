import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SalesMenusService } from './sales-menus.service';
import { CreateSalesMenuDto } from './dto/create-sales-menu.dto';
import { UpdateSalesMenuDto } from './dto/update-sales-menu.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('sales-menus')
export class SalesMenusController {
  constructor(private readonly salesMenusService: SalesMenusService) {}

  @Post()
  create(@Body() createSalesMenuDto: CreateSalesMenuDto) {
    return this.salesMenusService.create(createSalesMenuDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.salesMenusService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesMenusService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesMenuDto: UpdateSalesMenuDto) {
    return this.salesMenusService.update(id, updateSalesMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesMenusService.remove(id);
  }
}
