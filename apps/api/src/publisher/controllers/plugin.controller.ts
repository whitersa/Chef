import { Controller, Get, Put, Body } from '@nestjs/common';
import { PluginManagerService } from '../services/plugin-manager.service';
import { PluginConfigDto } from '../dtos/plugin-config.dto';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginManager: PluginManagerService) {}

  @Get('config')
  async getConfig() {
    return this.pluginManager.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() config: PluginConfigDto) {
    await this.pluginManager.saveConfig(config);
    return { message: 'Configuration updated successfully' };
  }
}
