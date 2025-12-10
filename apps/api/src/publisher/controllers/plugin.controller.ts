import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
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

  @Post(':name/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // We need to find the plugin path dynamically, but multer needs a sync path.
          // For now, we'll upload to a temp dir and move it in the service,
          // or we can try to resolve the path here if we know the structure.
          // Let's use a temp dir for safety.
          const tempDir = path.join(process.cwd(), 'temp', 'uploads');
          fs.ensureDirSync(tempDir);
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  async uploadCover(@Param('name') name: string, @UploadedFile() file: Express.Multer.File) {
    return this.pluginManager.handleCoverUpload(name, file);
  }
}
