import { Module } from '@nestjs/common';
import { PublisherController } from './publisher.controller';
import { PluginController } from './controllers/plugin.controller';
import { RecipesModule } from '../recipes/recipes.module';
import { PublisherLibraryModule } from '@chefos/publisher';

@Module({
  imports: [RecipesModule, PublisherLibraryModule],
  controllers: [PublisherController, PluginController],
})
export class PublisherModule {}
