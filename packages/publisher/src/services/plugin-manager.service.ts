import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fs from 'fs-extra';
import * as path from 'path';
import { PluginConfigDto } from '../dtos/plugin-config.dto.js';
import { PluginConfig } from '../entities/plugin-config.entity.js';
import { DEFAULT_THEME_CONFIG, PluginThemeConfig } from '../types/theme.types.js';

@Injectable()
export class PluginManagerService {
  private readonly logger = new Logger(PluginManagerService.name);
  private readonly pluginsRoot: string;

  constructor(
    @InjectRepository(PluginConfig)
    private readonly configRepo: Repository<PluginConfig>,
  ) {
    // Handle different CWD contexts (monorepo root vs app root)
    const possibleRoots = [
      process.cwd(),
      path.join(process.cwd(), '../..'), // If running from apps/api
    ];

    let foundRoot = '';
    for (const root of possibleRoots) {
      const p = path.join(root, 'tools', 'dita-plugins');
      if (fs.existsSync(p)) {
        foundRoot = p;
        break;
      }
    }

    this.pluginsRoot = foundRoot || path.join(process.cwd(), 'tools', 'dita-plugins');
    this.logger.log(`Initialized PluginManagerService with plugins root: ${this.pluginsRoot}`);
  }

  async listPlugins(): Promise<string[]> {
    if (!(await fs.pathExists(this.pluginsRoot))) {
      return [];
    }
    const files = await fs.readdir(this.pluginsRoot, { withFileTypes: true });
    return files.filter((f) => f.isDirectory()).map((f) => f.name);
  }

  private getPluginPath(pluginName: string): string {
    return path.join(this.pluginsRoot, pluginName, 'cfg', 'fo', 'attrs', 'custom.xsl');
  }

  async getConfig(pluginName: string): Promise<PluginConfigDto> {
    const dbConfig = await this.configRepo.findOne({ where: { pluginName } });
    if (dbConfig && dbConfig.themeConfig) {
      // Ensure all fields exist by merging with default
      return {
        ...DEFAULT_THEME_CONFIG,
        ...dbConfig.themeConfig,
        components: {
          ...DEFAULT_THEME_CONFIG.components,
          ...(dbConfig.themeConfig.components || {}),
          cover: {
            ...DEFAULT_THEME_CONFIG.components.cover,
            ...(dbConfig.themeConfig.components?.cover || {}),
          },
          toc: {
            ...DEFAULT_THEME_CONFIG.components.toc,
            ...(dbConfig.themeConfig.components?.toc || {}),
          },
        },
        layout: { ...DEFAULT_THEME_CONFIG.layout, ...(dbConfig.themeConfig.layout || {}) },
        typography: {
          ...DEFAULT_THEME_CONFIG.typography,
          ...(dbConfig.themeConfig.typography || {}),
        },
        palette: { ...DEFAULT_THEME_CONFIG.palette, ...(dbConfig.themeConfig.palette || {}) },
      } as PluginConfigDto;
    }
    return DEFAULT_THEME_CONFIG as PluginConfigDto;
  }

  async saveConfig(pluginName: string, config: PluginConfigDto): Promise<void> {
    let dbConfig = await this.configRepo.findOne({ where: { pluginName } });
    if (!dbConfig) {
      dbConfig = this.configRepo.create({ pluginName });
    }

    dbConfig.themeConfig = config;

    // Handle default cover image if not set
    if (!config.components.cover.image) {
      const defaultCoverPath = path.join(process.cwd(), 'public', 'default-cover.jpg');
      const pluginDir = path.join(this.pluginsRoot, pluginName);
      const artworkDir = path.join(pluginDir, 'cfg', 'common', 'artwork');
      await fs.ensureDir(artworkDir);
      const targetPath = path.join(artworkDir, 'cover.jpg');

      if (await fs.pathExists(defaultCoverPath)) {
        await fs.copy(defaultCoverPath, targetPath, { overwrite: true });
        config.components.cover.image = 'cover.jpg';
        dbConfig.themeConfig.components.cover.image = 'cover.jpg';
      }
    }

    await this.configRepo.save(dbConfig);

    // Generate XSLT
    await this.generateXSLT(pluginName, config);
  }

  private async generateXSLT(pluginName: string, config: PluginThemeConfig) {
    const pluginPath = this.getPluginPath(pluginName);
    await fs.ensureDir(path.dirname(pluginPath));

    // Helper to parse size string to mm number
    const parseSize = (size: string): number => {
      const num = parseFloat(size);
      if (isNaN(num)) return 0;
      if (size.endsWith('in')) return num * 25.4;
      if (size.endsWith('cm')) return num * 10;
      if (size.endsWith('pt')) return num * 0.352778;
      if (size.endsWith('px')) return num * 0.264583;
      return num; // assume mm
    };

    const widthMm = parseSize(config.layout.pageWidth);
    const heightMm = parseSize(config.layout.pageHeight);
    const bleedMm = parseSize(config.layout.bleed || '3mm');

    const finalWidth = `${widthMm + bleedMm * 2}mm`;
    const finalHeight = `${heightMm + bleedMm * 2}mm`;
    const bleedMargin = `${bleedMm}mm`;

    const content = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    version="2.0">

    <!-- Page setup -->
    <xsl:attribute-set name="__force__page__count">
        <xsl:attribute name="force-page-count">auto</xsl:attribute>
    </xsl:attribute-set>

    <!-- Font settings -->
    <xsl:variable name="base-font-family">${config.typography.baseFont}</xsl:variable>
    <xsl:variable name="title-font-family">${config.typography.titleFont}</xsl:variable>
    <xsl:variable name="toc-title">${config.components.toc.title}</xsl:variable>
    
    <!-- Page Size (Includes Bleed) -->
    <xsl:variable name="page-width">${finalWidth}</xsl:variable>
    <xsl:variable name="page-height">${finalHeight}</xsl:variable>
    <xsl:variable name="page-margins">${bleedMargin}</xsl:variable>
    
    <!-- Cover Image -->
    <xsl:variable name="cover-image">file:/<xsl:value-of select="'${path.join(this.pluginsRoot, pluginName, 'cfg', 'common', 'artwork', config.components.cover.image || '').replace(/\\/g, '/')}'"/></xsl:variable>

    <!-- Color Theme Variables -->
    <xsl:variable name="theme-color-title">${config.palette.title}</xsl:variable>
    <xsl:variable name="theme-color-accent">${config.palette.accent}</xsl:variable>
    <xsl:variable name="theme-color-secondary">${config.palette.secondary}</xsl:variable>

    <!-- Hide Cover Title -->
    <xsl:attribute-set name="__frontmatter__title">
        <xsl:attribute name="color">transparent</xsl:attribute>
        <xsl:attribute name="font-size">0pt</xsl:attribute>
    </xsl:attribute-set>
    
    <xsl:attribute-set name="__frontmatter__subtitle">
        <xsl:attribute name="color">transparent</xsl:attribute>
        <xsl:attribute name="font-size">0pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Titles -->
    <xsl:attribute-set name="topic.title">
        <xsl:attribute name="font-family"><xsl:value-of select="$title-font-family" /></xsl:attribute>
        <xsl:attribute name="font-weight">bold</xsl:attribute>
        <xsl:attribute name="color"><xsl:value-of select="$theme-color-title" /></xsl:attribute>
        <xsl:attribute name="border-bottom">2pt solid <xsl:value-of select="$theme-color-accent" /></xsl:attribute>
        <xsl:attribute name="padding-bottom">4pt</xsl:attribute>
        <xsl:attribute name="margin-bottom">12pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Task Body -->
    <xsl:attribute-set name="taskbody">
        <xsl:attribute name="margin-top">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Prereq (Ingredients) -->
    <xsl:attribute-set name="prereq">
        <xsl:attribute name="background-color">#fdf2e9</xsl:attribute>
        <xsl:attribute name="padding">10pt</xsl:attribute>
        <xsl:attribute name="border-left">4pt solid <xsl:value-of select="$theme-color-accent" /></xsl:attribute>
        <xsl:attribute name="margin-bottom">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Context (Preparation) -->
    <xsl:attribute-set name="context">
        <xsl:attribute name="background-color">#f4f6f7</xsl:attribute>
        <xsl:attribute name="padding">10pt</xsl:attribute>
        <xsl:attribute name="border-left">4pt solid <xsl:value-of select="$theme-color-secondary" /></xsl:attribute>
        <xsl:attribute name="margin-bottom">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Steps -->
    <xsl:attribute-set name="steps">
        <xsl:attribute name="margin-top">10pt</xsl:attribute>
    </xsl:attribute-set>

    <xsl:attribute-set name="step">
        <xsl:attribute name="margin-bottom">8pt</xsl:attribute>
    </xsl:attribute-set>

    <xsl:attribute-set name="cmd">
        <xsl:attribute name="font-weight">bold</xsl:attribute>
    </xsl:attribute-set>

</xsl:stylesheet>`;

    await fs.writeFile(pluginPath, content, 'utf-8');
    this.logger.log('Plugin configuration updated in DB and file system');
  }

  async syncConfigFromPlugin(pluginName: string): Promise<PluginConfigDto> {
    const pluginPath = this.getPluginPath(pluginName);
    if (!(await fs.pathExists(pluginPath))) {
      throw new Error(`Plugin configuration file not found at ${pluginPath}`);
    }

    const content = await fs.readFile(pluginPath, 'utf-8');
    const extractVar = (name: string) => {
      const match = content.match(new RegExp(`<xsl:variable name="${name}">(.*?)</xsl:variable>`));
      return match ? match[1] : null;
    };

    const pageWidthRaw = extractVar('page-width');
    const pageHeightRaw = extractVar('page-height');
    const pageMarginsRaw = extractVar('page-margins');
    const baseFont = extractVar('base-font-family');
    const titleFont = extractVar('title-font-family');
    const tocTitle = extractVar('toc-title');
    const titleColor = extractVar('theme-color-title');
    const accentColor = extractVar('theme-color-accent');
    const secondaryColor = extractVar('theme-color-secondary');

    // Reverse calculation for bleed
    // Final = Logical + 2*Bleed
    // Logical = Final - 2*Bleed
    const parseSize = (size: string): number => {
      const num = parseFloat(size);
      if (isNaN(num)) return 0;
      return num; // Assuming mm for simplicity in reverse logic
    };

    const bleedVal = pageMarginsRaw || '3mm';
    const bleedMm = parseSize(bleedVal);
    const widthMm = parseSize(pageWidthRaw || '216mm') - bleedMm * 2;
    const heightMm = parseSize(pageHeightRaw || '303mm') - bleedMm * 2;

    const config: PluginConfigDto = {
      ...DEFAULT_THEME_CONFIG,
      layout: {
        pageWidth: `${widthMm}mm`,
        pageHeight: `${heightMm}mm`,
        bleed: bleedVal,
      },
      typography: {
        baseFont: baseFont || DEFAULT_THEME_CONFIG.typography.baseFont,
        titleFont: titleFont || DEFAULT_THEME_CONFIG.typography.titleFont,
      },
      palette: {
        title: titleColor || DEFAULT_THEME_CONFIG.palette.title,
        accent: accentColor || DEFAULT_THEME_CONFIG.palette.accent,
        secondary: secondaryColor || DEFAULT_THEME_CONFIG.palette.secondary,
      },
      components: {
        ...DEFAULT_THEME_CONFIG.components,
        toc: {
          title: tocTitle || DEFAULT_THEME_CONFIG.components.toc.title,
        },
      },
    };

    // Save to DB
    await this.saveConfig(pluginName, config);
    return config;
  }

  async handleCoverUpload(pluginName: string, file: Express.Multer.File): Promise<{ url: string }> {
    const pluginPath = path.join(this.pluginsRoot, pluginName);
    // Standard DITA-OT artwork location or custom location
    const artworkDir = path.join(pluginPath, 'cfg', 'common', 'artwork');
    await fs.ensureDir(artworkDir);

    const targetFilename = 'cover' + path.extname(file.originalname);
    const targetPath = path.join(artworkDir, targetFilename);

    await fs.move(file.path, targetPath, { overwrite: true });

    // Update DB with filename
    let dbConfig = await this.configRepo.findOne({ where: { pluginName } });
    if (!dbConfig) {
      dbConfig = this.configRepo.create({ pluginName });
    }

    if (!dbConfig.themeConfig) {
      dbConfig.themeConfig = JSON.parse(JSON.stringify(DEFAULT_THEME_CONFIG));
    }

    dbConfig.themeConfig.components.cover.image = targetFilename;
    await this.configRepo.save(dbConfig);

    return { url: targetFilename };
  }
}
