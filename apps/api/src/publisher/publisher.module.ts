import { Module } from '@nestjs/common';
import { PublisherController } from './publisher.controller';
import { DitaGeneratorService } from './services/dita-generator.service';
import { DitaRunnerService } from './services/dita-runner.service';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [RecipesModule],
  controllers: [PublisherController],
  providers: [DitaGeneratorService, DitaRunnerService],
})
export class PublisherModule {}
