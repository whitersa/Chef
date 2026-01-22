import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Recipe } from '@chefos/types';
import { DitaGeneratorService } from './dita-generator.service.js';

const execAsync = promisify(exec);

@Injectable()
export class DitaRunnerService {
  private readonly logger = new Logger(DitaRunnerService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp', 'dita-builds');
  private ditaExecutable = 'dita'; // Default to global PATH
  private javaExecutable: string | undefined;

  constructor(
    private readonly ditaGenerator: DitaGeneratorService,
    private readonly configService: ConfigService,
  ) {
    fs.ensureDirSync(this.tempDir);
    this.resolveJavaPath();
    this.resolveDitaPath();
  }

  private resolveJavaPath() {
    // 1. Try environment variable from ConfigService
    const envJava = this.configService.get<string>('JAVA_HOME');
    if (envJava) {
      const javaBin = process.platform === 'win32' ? 'bin/java.exe' : 'bin/java';
      const resolved = path.resolve(envJava, javaBin);
      if (fs.existsSync(resolved)) {
        this.javaExecutable = resolved;
        this.logger.log(`Using Java from config (JAVA_HOME): ${this.javaExecutable}`);
        return;
      }
    }

    // 2. Try to find local Java in tools directory
    const javaBin = process.platform === 'win32' ? 'java.exe' : 'java';
    const potentialPaths = [
      path.join(process.cwd(), 'tools', 'java-17', 'bin', javaBin),
      path.join(process.cwd(), '..', '..', 'tools', 'java-17', 'bin', javaBin),
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

    // 1. Try environment variable from ConfigService
    const envDita = this.configService.get<string>('DITA_OT_PATH');
    if (envDita) {
      const ditaBin = process.platform === 'win32' ? 'bin/dita.bat' : 'bin/dita';
      const resolved = path.resolve(envDita, ditaBin);
      if (fs.existsSync(resolved)) {
        this.ditaExecutable = resolved;
        this.logger.log(`Using DITA-OT from config (DITA_OT_PATH): ${this.ditaExecutable}`);
        this.ensureExecutablePermission();
        return;
      }
    }

    // We only support DITA-OT 4.2 now
    const versions = ['dita-ot-4.2'];

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
          if (ver === 'dita-ot-4.2' && !this.javaExecutable) {
            this.logger.warn(
              `Found ${ver} but no local Java 17 detected. Ensure system Java is version 17 or higher.`,
            );
          }

          this.ditaExecutable = resolved;
          this.logger.log(`Using local DITA-OT: ${this.ditaExecutable}`);
          this.ensureExecutablePermission();
          return;
        }
      }
    }

    this.logger.log('Using global DITA-OT from PATH');
  }

  private ensureExecutablePermission() {
    // Ensure executable permission on Linux/macOS
    if (process.platform !== 'win32' && this.ditaExecutable) {
      try {
        fs.chmodSync(this.ditaExecutable, '755');
      } catch (e) {
        this.logger.warn(
          `Failed to set executable permission for DITA-OT: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  }

  private async syncPlugin() {
    if (!this.ditaExecutable) {
      return;
    }

    // Resolve tools directory relative to CWD or Monorepo Root
    let toolsDir = path.join(process.cwd(), 'tools');
    if (!fs.existsSync(toolsDir)) {
      toolsDir = path.join(process.cwd(), '..', '..', 'tools');
    }

    const pluginSource = path.join(toolsDir, 'dita-plugins', 'com.chefos.pdf');

    // If source doesn't exist (e.g. in Docker production without volume), we can't sync
    if (!(await fs.pathExists(pluginSource))) {
      this.logger.debug(`Plugin source not found at ${pluginSource}, skipping sync.`);
      return;
    }

    const ditaHome = path.dirname(path.dirname(this.ditaExecutable));
    const pluginTarget = path.join(ditaHome, 'plugins', 'com.chefos.pdf');

    // Check if plugin.xml OR custom.xsl has changed to decide if we need full integration
    const sourceXml = path.join(pluginSource, 'plugin.xml');
    const targetXml = path.join(pluginTarget, 'plugin.xml');
    const sourceCustom = path.join(pluginSource, 'cfg', 'fo', 'attrs', 'custom.xsl');
    const targetCustom = path.join(pluginTarget, 'cfg', 'fo', 'attrs', 'custom.xsl');

    let needIntegration = false;

    if (await fs.pathExists(targetXml)) {
      const sourceContent = await fs.readFile(sourceXml, 'utf-8');
      const targetContent = await fs.readFile(targetXml, 'utf-8');
      if (sourceContent !== targetContent) {
        needIntegration = true;
        this.logger.log('plugin.xml changed, integration required');
      }
    } else {
      needIntegration = true;
      this.logger.log('plugin.xml missing, integration required');
    }

    // Check custom.xsl changes (optional, but good for debugging)
    if (
      !needIntegration &&
      (await fs.pathExists(targetCustom)) &&
      (await fs.pathExists(sourceCustom))
    ) {
      const sourceCustomContent = await fs.readFile(sourceCustom, 'utf-8');
      const targetCustomContent = await fs.readFile(targetCustom, 'utf-8');
      if (sourceCustomContent !== targetCustomContent) {
        this.logger.log('custom.xsl changed, syncing files...');
      }
    }

    // Copy files
    try {
      this.logger.debug(`Syncing plugin files from ${pluginSource} to ${pluginTarget}`);
      await fs.copy(pluginSource, pluginTarget, { overwrite: true });
    } catch (err) {
      this.logger.error(
        `Failed to sync plugin files: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // Run integration if needed
    if (needIntegration) {
      this.logger.log('Plugin configuration changed. Running DITA-OT integration...');
      try {
        const env = { ...process.env };
        if (this.javaExecutable) {
          env['JAVACMD'] = this.javaExecutable;
        }
        // Use --force to ensure clean integration
        await execAsync(`"${this.ditaExecutable}" --install --force`, {
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
    await this.syncPlugin();

    const buildId = `build_${Date.now()}_${recipe.id}`;
    const buildDir = path.join(this.tempDir, buildId);
    const outDir = path.join(buildDir, 'out');

    await fs.ensureDir(buildDir);
    await fs.ensureDir(outDir);

    try {
      // 1. Generate DITA Topics (Duplicate for testing multiple pages/TOC)
      const recipes: Recipe[] = [];
      const chapter1Recipes: Recipe[] = [];
      const chapter2Recipes: Recipe[] = [];

      // Create 5 copies of the recipe to simulate a larger book
      for (let i = 1; i <= 5; i++) {
        // Clone the recipe and modify ID and Name
        const clonedRecipe = {
          ...recipe,
          id: `${recipe.id}_${i}`,
          name: `${recipe.name} - Variation ${i}`,
        };
        recipes.push(clonedRecipe);

        if (i <= 3) {
          chapter1Recipes.push(clonedRecipe);
        } else {
          chapter2Recipes.push(clonedRecipe);
        }

        // Calculate Nutrition & Generate Chart
        const nutrition = this.calculateNutrition(clonedRecipe);
        let chartFileName: string | undefined;
        if (nutrition) {
          const svgContent = this.generatePieChartSvg(nutrition);
          chartFileName = `nutrition_${clonedRecipe.id}.svg`;
          await fs.writeFile(path.join(buildDir, chartFileName), svgContent);
        }

        const ditaContent = this.ditaGenerator.generateRecipeTopic(clonedRecipe, chartFileName);
        const ditaFileName = `recipe_${clonedRecipe.id}.dita`;
        const ditaFilePath = path.join(buildDir, ditaFileName);
        await fs.writeFile(ditaFilePath, ditaContent);
      }

      // 2. Generate DITA Map (Multi-topic map)
      const chapters = [
        { title: 'Chapter 1: First Course', recipes: chapter1Recipes },
        { title: 'Chapter 2: Second Course', recipes: chapter2Recipes },
      ];
      const mapContent = this.ditaGenerator.generateBookMap(chapters, `${recipe.name} Collection`);
      const mapFileName = 'book.ditamap';
      const mapFilePath = path.join(buildDir, mapFileName);
      await fs.writeFile(mapFilePath, mapContent);

      // 3. Run DITA-OT
      // Command: dita -i <input> -f chefos-pdf -o <output> -Dargs.fo.userconfig=<config>
      // We explicitly point to the fop.xconf that our plugin will generate in the output directory.
      // Note: The plugin's build.xml is responsible for copying the template to this location.
      const fopConfigPath = path.join(outDir, 'fop.xconf');
      const command = `"${this.ditaExecutable}" -i "${mapFilePath}" -f chefos-pdf -o "${outDir}" -Dargs.fo.userconfig="${fopConfigPath}" --verbose`;
      this.logger.log(`Executing DITA-OT: ${command}`);

      const env = { ...process.env };
      if (this.javaExecutable) {
        env['JAVACMD'] = this.javaExecutable;
        this.logger.log(`Using custom JAVACMD: ${this.javaExecutable}`);
      }

      // Optimize Java Heap Memory for large books (hundreds of recipes)
      // DITA-OT/FOP can be memory intensive.
      // -Xmx2048m: Allow up to 2GB RAM (Prevent OutOfMemoryError)
      if (!env['ANT_OPTS']) {
        env['ANT_OPTS'] = '-Xmx2048m -Xms512m';
        this.logger.log(`Setting ANT_OPTS for memory optimization: ${env['ANT_OPTS']}`);
      }

      // Increase maxBuffer to 10MB to handle verbose output
      const { stdout, stderr } = await execAsync(command, { env, maxBuffer: 1024 * 1024 * 10 });

      // FORCE LOG TO CONSOLE FOR DEBUGGING (Truncated)
      console.log('--- DITA-OT STDOUT (Truncated 2000 chars) ---');
      console.log(stdout.slice(0, 2000));
      if (stdout.length > 2000) console.log('... (output truncated)');

      console.log('--- DITA-OT STDERR ---');
      console.log(stderr);
      console.log('----------------------');

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

  private calculateNutrition(recipe: Recipe) {
    const total = { protein: 0, fat: 0, carbs: 0 };
    let hasData = false;

    recipe.items?.forEach((item) => {
      if (item.ingredient?.nutrition) {
        const qty = item.quantity;
        total.protein += (item.ingredient.nutrition.protein || 0) * qty;
        total.fat += (item.ingredient.nutrition.fat || 0) * qty;
        total.carbs += (item.ingredient.nutrition.carbs || 0) * qty;
        hasData = true;
      }
    });

    return hasData ? total : null;
  }

  private generatePieChartSvg(data: { protein: number; fat: number; carbs: number }): string {
    // 1. Fix Math: Calculate rounded values first to ensure sum matches display
    const roundedData = {
      protein: Math.round(data.protein),
      fat: Math.round(data.fat),
      carbs: Math.round(data.carbs),
    };
    const total = roundedData.protein + roundedData.fat + roundedData.carbs;
    if (total === 0) return '';

    const width = 450;
    const height = 300;
    const outerRadius = 80;
    const innerRadius = 50;
    const cx = width / 2;
    const cy = height / 2;

    // 2. Fix Visuals: Use Filled Path with Stroke Join Rounding
    // This allows for controlled corner radius (not full semi-circles) and clean gaps.
    const cornerRadius = 4; // Small rounded corners
    const strokeWidth = cornerRadius * 2; // Stroke width to create the rounding
    const gapDegrees = 8; // Visible gap between slices

    // Adjust radii for the stroke expansion (stroke extends half-width outward/inward)
    const drawOuterRadius = outerRadius - cornerRadius;
    const drawInnerRadius = innerRadius + cornerRadius;

    // Modern Palette with Gradients
    const colors = {
      protein: { start: '#34D399', end: '#059669', id: 'grad-protein' }, // Emerald
      fat: { start: '#FBBF24', end: '#D97706', id: 'grad-fat' }, // Amber
      carbs: { start: '#60A5FA', end: '#2563EB', id: 'grad-carbs' }, // Blue
    };

    let startAngle = 0;
    const slices = Object.entries(roundedData).map(([key, value]) => {
      const angle = (value / total) * 360;

      // Handle full circle case or very small slices
      const isFullCircle = angle >= 359.9;
      const effectiveGap = isFullCircle ? 0 : gapDegrees;

      // Adjust start/end angles to account for gap
      const currentStartAngle = startAngle + effectiveGap / 2;
      const currentEndAngle = startAngle + angle - effectiveGap / 2;

      // Convert to radians (SVG uses 0 at 3 o'clock, we want 12 o'clock so -90)
      const rStart = (Math.PI * (currentStartAngle - 90)) / 180;
      const rEnd = (Math.PI * (currentEndAngle - 90)) / 180;

      // Outer arc points
      const x1 = cx + drawOuterRadius * Math.cos(rStart);
      const y1 = cy + drawOuterRadius * Math.sin(rStart);
      const x2 = cx + drawOuterRadius * Math.cos(rEnd);
      const y2 = cy + drawOuterRadius * Math.sin(rEnd);

      // Inner arc points
      const x3 = cx + drawInnerRadius * Math.cos(rEnd);
      const y3 = cy + drawInnerRadius * Math.sin(rEnd);
      const x4 = cx + drawInnerRadius * Math.cos(rStart);
      const y4 = cy + drawInnerRadius * Math.sin(rStart);

      const largeArcFlag = currentEndAngle - currentStartAngle > 180 ? 1 : 0;

      // Closed Path: Outer Arc -> Line to Inner -> Inner Arc (Reverse) -> Close
      const pathData = [
        `M ${x1} ${y1}`,
        `A ${drawOuterRadius} ${drawOuterRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${drawInnerRadius} ${drawInnerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');

      // Label position
      const midAngle = startAngle + angle / 2;
      const rMid = (Math.PI * (midAngle - 90)) / 180;
      const labelRadius = outerRadius + 30;
      const lx = cx + labelRadius * Math.cos(rMid);
      const ly = cy + labelRadius * Math.sin(rMid);

      const anchor = lx > cx ? 'start' : 'end';

      startAngle += angle;

      return {
        path: pathData,
        colorId: colors[key as keyof typeof colors].id,
        baseColor: colors[key as keyof typeof colors].end,
        label: `${key.charAt(0).toUpperCase() + key.slice(1)}`,
        value: `${value}g`,
        lx,
        ly,
        anchor,
      };
    });

    // Increase resolution for better rasterization quality (4x)
    const scaleFactor = 4;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scaleFactor}" height="${height * scaleFactor}" viewBox="0 0 ${width} ${height}" shape-rendering="geometricPrecision">`;

    // Defs for gradients
    svg += `
    <defs>
      <linearGradient id="grad-protein" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.protein.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.protein.end};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="grad-fat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.fat.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.fat.end};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="grad-carbs" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.carbs.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.carbs.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    `;

    svg += `<rect width="100%" height="100%" fill="white"/>`; // Background

    // 1. Draw Shadow Layer (Vector based)
    // Use stroke-linejoin="round" to round the corners of the filled shape
    slices.forEach((slice) => {
      svg += `<path d="${slice.path}" fill="#000000" fill-opacity="0.2" stroke="#000000" stroke-opacity="0.2" stroke-width="${strokeWidth}" stroke-linejoin="round" transform="translate(3, 3)" />`;
    });

    // 2. Draw Main Slices
    // Fill with gradient, and stroke with gradient to create rounded corners
    slices.forEach((slice) => {
      svg += `<path d="${slice.path}" fill="url(#${slice.colorId})" stroke="url(#${slice.colorId})" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
    });

    // Center Text (Total)
    svg += `<text x="${cx}" y="${cy - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888" font-weight="bold">TOTAL</text>`;
    svg += `<text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">${total}g</text>`;

    // Labels
    slices.forEach((slice) => {
      svg += `<text x="${slice.lx}" y="${slice.ly}" text-anchor="${slice.anchor}" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">
        <tspan font-weight="bold" fill="${slice.baseColor}">${slice.label}</tspan> ${slice.value}
      </text>`;
    });

    svg += `<text x="${cx}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#2c3e50">Nutrition Facts</text>`;
    svg += `</svg>`;
    return svg;
  }
}
