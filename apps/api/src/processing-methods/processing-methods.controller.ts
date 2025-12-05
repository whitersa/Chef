import { Controller, Get, Post, Body, Delete, Param, Query } from '@nestjs/common';
import { ProcessingMethodsService } from './processing-methods.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('processing-methods')
export class ProcessingMethodsController {
  constructor(private readonly service: ProcessingMethodsService) {}

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.service.create(body.name, body.description);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
