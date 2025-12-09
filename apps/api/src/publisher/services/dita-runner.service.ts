import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Recipe } from '@chefos/types';
import { DitaGeneratorService } from './dita-generator.service';

const execAsync = promisify(exec);

@Injectable()
export class DitaRunnerService {
  private readonly logger = new Logger(DitaRunnerService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp', 'dita-builds');

  constructor(private readonly ditaGenerator: DitaGeneratorService) {
    fs.ensureDirSync(this.tempDir);
  }

  async publishRecipeToPdf(recipe: Recipe): Promise<string> {
    const buildId = `build_${Date.now()}_${recipe.id}`;
    const buildDir = path.join(this.tempDir, buildId);
    const outDir = path.join(buildDir, 'out');

    await fs.ensureDir(buildDir);
    await fs.ensureDir(outDir);

    try {
      // 1. Generate DITA Topic
      const ditaContent = this.ditaGenerator.generateRecipeTopic(recipe);
      const ditaFileName = `recipe_${recipe.id}.dita`;
      const ditaFilePath = path.join(buildDir, ditaFileName);
      await fs.writeFile(ditaFilePath, ditaContent);

      // 2. Generate DITA Map (Single topic map)
      const mapContent = this.ditaGenerator.generateMap([recipe], recipe.name);
      const mapFileName = 'book.ditamap';
      const mapFilePath = path.join(buildDir, mapFileName);
      await fs.writeFile(mapFilePath, mapContent);

      // 3. Run DITA-OT
      // Command: dita -i <input> -f pdf -o <output>
      const command = `dita -i "${mapFilePath}" -f pdf -o "${outDir}"`;
      this.logger.log(`Executing DITA-OT: ${command}`);

      await execAsync(command);

      // 4. Find result
      const pdfPath = path.join(outDir, 'book.pdf'); // Default output name usually matches map name or is configurable
      if (await fs.pathExists(pdfPath)) {
        return pdfPath;
      } else {
        // Sometimes DITA-OT names it differently, check dir
        const files = await fs.readdir(outDir);
        const pdfFile = files.find((f) => f.endsWith('.pdf'));
        if (pdfFile) return path.join(outDir, pdfFile);
        throw new Error('PDF file not found in output directory');
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`DITA build failed: ${err.message}`, err.stack);
      throw err;
    }
    // Note: We are not cleaning up buildDir immediately to allow debugging or caching,
    // but in production you should schedule a cleanup.
  }
}
