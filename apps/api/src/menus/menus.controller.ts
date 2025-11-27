import { Controller, Get, Post, Body } from '@nestjs/common';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
  constructor(private readonly service: MenusService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('sync')
  sync() {
    return this.service.sync();
  }
}
