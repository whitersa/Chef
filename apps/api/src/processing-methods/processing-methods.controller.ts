import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ProcessingMethodsService } from './processing-methods.service';

@Controller('processing-methods')
export class ProcessingMethodsController {
  constructor(private readonly service: ProcessingMethodsService) {}

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.service.create(body.name, body.description);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
