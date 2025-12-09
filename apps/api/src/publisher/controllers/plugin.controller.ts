import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { PluginManagerService } from '../services/plugin-manager.service';
import { PluginConfigDto } from '../dtos/plugin-config.dto';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginManager: PluginManagerService) {}

  @Get()
  async listPlugins() {
    return this.pluginManager.listPlugins();
  }

  @Get(':name/config')
  async getConfig(@Param('name') name: string) {
    return this.pluginManager.getConfig(name);
  }

  @Put(':name/config')
  async updateConfig(@Param('name') name: string, @Body() config: PluginConfigDto) {
    await this.pluginManager.saveConfig(name, config);
    return { message: 'Configuration updated successfully' };
  }
}
