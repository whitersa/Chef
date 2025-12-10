import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DitaGeneratorService } from './services/dita-generator.service.js';
import { DitaRunnerService } from './services/dita-runner.service.js';
import { PluginManagerService } from './services/plugin-manager.service.js';
import { PluginConfig } from './entities/plugin-config.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([PluginConfig])],
  providers: [DitaGeneratorService, DitaRunnerService, PluginManagerService],
  exports: [DitaGeneratorService, DitaRunnerService, PluginManagerService, TypeOrmModule],
})
export class PublisherLibraryModule {}
