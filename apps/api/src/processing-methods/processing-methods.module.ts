import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessingMethod } from './processing-method.entity';
import { ProcessingMethodsService } from './processing-methods.service';
import { ProcessingMethodsController } from './processing-methods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessingMethod])],
  controllers: [ProcessingMethodsController],
  providers: [ProcessingMethodsService],
})
export class ProcessingMethodsModule {}
