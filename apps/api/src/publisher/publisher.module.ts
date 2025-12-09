import { Module } from '@nestjs/common';
import { PublisherController } from './publisher.controller';
import { PluginController } from './controllers/plugin.controller';
import { DitaGeneratorService } from './services/dita-generator.service';
import { DitaRunnerService } from './services/dita-runner.service';
import { PluginManagerService } from './services/plugin-manager.service';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [RecipesModule],
  controllers: [PublisherController, PluginController],
  providers: [DitaGeneratorService, DitaRunnerService, PluginManagerService],
})
export class PublisherModule {}
