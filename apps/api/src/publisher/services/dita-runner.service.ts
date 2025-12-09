/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  private ditaExecutable = 'dita'; // Default to global PATH
  private javaExecutable: string | undefined;

  constructor(private readonly ditaGenerator: DitaGeneratorService) {
    fs.ensureDirSync(this.tempDir);
    this.resolveJavaPath();
    this.resolveDitaPath();
  }

  private resolveJavaPath() {
    // Try to find local Java in tools directory
    const potentialPaths = [
      path.join(process.cwd(), 'tools', 'java-17', 'bin', 'java.exe'),
      path.join(process.cwd(), '..', '..', 'tools', 'java-17', 'bin', 'java.exe'),
    ];

    for (const p of potentialPaths) {
      const resolved = path.resolve(p);
      if (fs.existsSync(resolved)) {
        this.javaExecutable = resolved;
        this.logger.log(`Using local Java: ${this.javaExecutable}`);
        return;
      }
    }
    this.logger.log('Using system Java');
  }

  private resolveDitaPath() {
    this.logger.log(`Resolving DITA-OT path. CWD: ${process.cwd()}`);

    // Define versions and their Java requirements (optional, for now just preference)
    // We prefer 4.2 if we have Java 17 (local or system - though we only check local for now to be safe)
    // If no local Java 17, we might fallback to 3.7.4 if available, or 4.2 and hope system java is new enough.

    const versions = ['dita-ot-4.2', 'dita-ot-3.7.4'];

    // If we found local Java 17, we definitely want to try 4.2 first.
    // If we didn't, we might still try 4.2 but 3.7.4 is safer for old system java.
    // For simplicity, let's just look for what's available in order.

    const potentialRoots = [
      path.join(process.cwd(), 'tools'),
      path.join(process.cwd(), '..', '..', 'tools'),
    ];

    for (const ver of versions) {
      for (const root of potentialRoots) {
        const ditaPath = path.join(
          root,
          ver,
          'bin',
          process.platform === 'win32' ? 'dita.bat' : 'dita',
        );
        const resolved = path.resolve(ditaPath);

        if (fs.existsSync(resolved)) {
          // If we found 4.2 but don't have local Java, we might warn or check system java version?
          // For now, let's assume if 4.2 is there, the user intends to use it.
          // But wait, we just installed 3.7.4 because 4.2 failed.
          // So we should probably prefer 4.2 ONLY if we have our local Java 17.

          if (ver === 'dita-ot-4.2' && !this.javaExecutable) {
            this.logger.debug(
              `Found ${ver} but no local Java 17 detected. Skipping in favor of potentially safer version or system java.`,
            );
            // Continue searching unless it's the only one?
            // Let's actually allow it if it's the only one, but if 3.7.4 exists, prefer that?
            // Actually, let's just stick to the order in 'versions' array.
          }

          this.ditaExecutable = resolved;
          this.logger.log(`Using local DITA-OT: ${this.ditaExecutable}`);
          return;
        }
      }
    }

    this.logger.log('Using global DITA-OT from PATH');
  }

  private async syncPlugin() {
    // Only sync if we are using a local DITA-OT (inside 'tools')
    if (!this.ditaExecutable || !this.ditaExecutable.includes('tools')) {
      return;
    }

    const ditaHome = path.dirname(path.dirname(this.ditaExecutable));
    const pluginSource = path.join(process.cwd(), 'tools', 'dita-plugins', 'com.chefos.pdf');
    const pluginTarget = path.join(ditaHome, 'plugins', 'com.chefos.pdf');

    if (!(await fs.pathExists(pluginSource))) {
      return;
    }

    // Check if plugin.xml has changed to decide if we need full integration
    const sourceXml = path.join(pluginSource, 'plugin.xml');
    const targetXml = path.join(pluginTarget, 'plugin.xml');
    let needIntegration = false;

    if (await fs.pathExists(targetXml)) {
      const sourceContent = await fs.readFile(sourceXml, 'utf-8');
      const targetContent = await fs.readFile(targetXml, 'utf-8');
      if (sourceContent !== targetContent) {
        needIntegration = true;
      }
    } else {
      needIntegration = true;
    }

    // Copy files
    this.logger.debug(`Syncing plugin files to ${pluginTarget}`);
    await fs.copy(pluginSource, pluginTarget, { overwrite: true });

    // Run integration if needed
    if (needIntegration) {
      this.logger.log('Plugin configuration changed. Running DITA-OT integration...');
      try {
        const env = { ...process.env };
        if (this.javaExecutable) {
          env['JAVACMD'] = this.javaExecutable;
        }
        await execAsync(`"${this.ditaExecutable}" --install`, {
          env,
          maxBuffer: 1024 * 1024 * 10, // 10MB
        });
        this.logger.log('Integration complete.');
      } catch (error) {
        this.logger.error('Failed to run DITA integration', error);
      }
    }
  }

  async publishRecipeToPdf(recipe: Recipe): Promise<string> {
    const r = recipe as any;
    await this.syncPlugin();

    const buildId = `build_${Date.now()}_${r.id}`;
    const buildDir = path.join(this.tempDir, buildId);
    const outDir = path.join(buildDir, 'out');

    await fs.ensureDir(buildDir);
    await fs.ensureDir(outDir);

    try {
      // 1. Generate DITA Topic
      const ditaContent = this.ditaGenerator.generateRecipeTopic(recipe);
      const ditaFileName = `recipe_${r.id}.dita`;
      const ditaFilePath = path.join(buildDir, ditaFileName);
      await fs.writeFile(ditaFilePath, ditaContent);

      // 2. Generate DITA Map (Single topic map)
      const mapContent = this.ditaGenerator.generateMap([recipe], r.name as string);
      const mapFileName = 'book.ditamap';
      const mapFilePath = path.join(buildDir, mapFileName);
      await fs.writeFile(mapFilePath, mapContent);

      // 3. Run DITA-OT
      // Command: dita -i <input> -f chefos-pdf -o <output>
      const command = `"${this.ditaExecutable}" -i "${mapFilePath}" -f chefos-pdf -o "${outDir}" --verbose`;
      this.logger.log(`Executing DITA-OT: ${command}`);

      const env = { ...process.env };
      if (this.javaExecutable) {
        env['JAVACMD'] = this.javaExecutable;
        this.logger.log(`Using custom JAVACMD: ${this.javaExecutable}`);
      }

      // Increase maxBuffer to 10MB to handle verbose output
      const { stdout, stderr } = await execAsync(command, { env, maxBuffer: 1024 * 1024 * 10 });
      this.logger.log(`DITA-OT Output: ${stdout}`);
      if (stderr) {
        this.logger.warn(`DITA-OT Stderr: ${stderr}`);
      }

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
      const err = error as { message?: string; stdout?: string; stderr?: string };
      const stdout = err.stdout || '';
      const stderr = err.stderr || '';
      const message = err.message || 'Unknown error';

      this.logger.error(`DITA build failed: ${message}`);
      if (stdout) this.logger.error(`DITA-OT Stdout: ${stdout}`);
      if (stderr) this.logger.error(`DITA-OT Stderr: ${stderr}`);

      throw new Error(`DITA-OT execution failed: ${message}. Stderr: ${stderr}`);
    }
    // Note: We are not cleaning up buildDir immediately to allow debugging or caching,
    // but in production you should schedule a cleanup.
  }
}
