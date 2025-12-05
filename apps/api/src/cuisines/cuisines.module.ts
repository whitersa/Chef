import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuisine } from './cuisine.entity';
import { CuisinesService } from './cuisines.service';
import { CuisinesController } from './cuisines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cuisine])],
  providers: [CuisinesService],
  controllers: [CuisinesController],
  exports: [CuisinesService],
})
export class CuisinesModule {}
