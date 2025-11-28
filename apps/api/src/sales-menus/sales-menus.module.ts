import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesMenusService } from './sales-menus.service';
import { SalesMenusController } from './sales-menus.controller';
import { SalesMenu } from './entities/sales-menu.entity';
import { SalesMenuItem } from './entities/sales-menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesMenu, SalesMenuItem])],
  controllers: [SalesMenusController],
  providers: [SalesMenusService],
})
export class SalesMenusModule {}
