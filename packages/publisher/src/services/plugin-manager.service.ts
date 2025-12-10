import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fs from 'fs-extra';
import * as path from 'path';
import { create } from 'xmlbuilder2';
import { PluginConfigDto } from '../dtos/plugin-config.dto.js';
import { PluginConfig } from '../entities/plugin-config.entity.js';
import { XslDoc, XslStylesheet, XslAttributeSet, XslVariable } from '../types/xslt.types.js';

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
    // 1. Try to get from DB
    const dbConfig = await this.configRepo.findOne({ where: { pluginName } });
    if (dbConfig) {
      return {
        baseFontFamily: dbConfig.baseFontFamily,
        titleFontFamily: dbConfig.titleFontFamily,
        titleColor: dbConfig.titleColor,
        accentColor: dbConfig.accentColor,
        secondaryColor: dbConfig.secondaryColor,
        pageWidth: dbConfig.pageWidth,
        pageHeight: dbConfig.pageHeight,
        coverImage: dbConfig.coverImage,
      };
    }

    // 2. Fallback: Try to parse from file (Migration path)
    this.logger.log(`No DB config for ${pluginName}, falling back to file parsing`);
    const pluginPath = this.getPluginPath(pluginName);
    if (!(await fs.pathExists(pluginPath))) {
      // Return defaults if file also missing
      return {
        baseFontFamily: 'Serif',
        titleFontFamily: 'Sans',
        titleColor: '#2c3e50',
        accentColor: '#e67e22',
        secondaryColor: '#3498db',
        pageWidth: '297mm',
        pageHeight: '210mm',
      };
    }

    const content = await fs.readFile(pluginPath, 'utf-8');

    try {
      const doc = create(content).toObject() as unknown as XslDoc;
      const stylesheet = doc['xsl:stylesheet'];

      // Helper to extract all elements of a certain type from the mixed content structure
      const getElements = <T>(tagName: string): T[] => {
        const elements: T[] = [];
        // Handle mixed content array (comments + elements)
        const children = Array.isArray(stylesheet['#']) ? stylesheet['#'] : [stylesheet];

        children?.forEach((child: unknown) => {
          if (child && typeof child === 'object' && tagName in child) {
            const typedChild = child as Record<string, unknown>;
            const items = Array.isArray(typedChild[tagName])
              ? typedChild[tagName]
              : [typedChild[tagName]];
            elements.push(...(items as T[]));
          }
        });

        // Also handle case where they are direct properties (if no mixed content)
        if (tagName in stylesheet) {
          const val = stylesheet[tagName as keyof XslStylesheet] as unknown;
          const items = Array.isArray(val) ? val : [val];
          elements.push(...(items as T[]));
        }

        return elements;
      };

      const allAttributeSets = getElements<XslAttributeSet>('xsl:attribute-set');
      const allVariables = getElements<XslVariable>('xsl:variable');

      // Helper to find variable value
      const getVar = (name: string, defaultVal: string) => {
        const found = allVariables.find((v) => v['@name'] === name);
        return found ? found['#'] : defaultVal;
      };

      // Helper to find attribute value in a specific attribute-set
      const getAttr = (setName: string, attrName: string, defaultVal: string, regex?: RegExp) => {
        const set = allAttributeSets.find((s) => s['@name'] === setName);
        if (!set) return defaultVal;

        const attrs = set['xsl:attribute'];
        if (!attrs) return defaultVal;
        const attrList = Array.isArray(attrs) ? attrs : [attrs];
        const attr = attrList.find((a) => a['@name'] === attrName);

        if (!attr) return defaultVal;
        const val = attr['#'];

        if (regex) {
          const match = val.match(regex);
          return match && match[1] ? match[1] : defaultVal;
        }
        return val;
      };

      // Try to find new variable names first (if already migrated manually)
      const titleColorVar = getVar('theme-color-title', '');
      const accentColorVar = getVar('theme-color-accent', '');
      const secondaryColorVar = getVar('theme-color-secondary', '');
      const pageWidthVar = getVar('page-width', '210mm');
      const pageHeightVar = getVar('page-height', '297mm');

      const config = {
        baseFontFamily: getVar('base-font-family', 'Serif'),
        titleFontFamily: getVar('title-font-family', 'Sans'),
        titleColor: titleColorVar || getAttr('topic.title', 'color', '#2c3e50'),
        accentColor:
          accentColorVar || getAttr('topic.title', 'border-bottom', '#e67e22', /2pt solid (.+)/),
        secondaryColor:
          secondaryColorVar || getAttr('context', 'border-left', '#3498db', /4pt solid (.+)/),
        pageWidth: pageWidthVar,
        pageHeight: pageHeightVar,
      };

      // Auto-save to DB to complete migration
      await this.saveConfig(pluginName, config);
      return config;
    } catch (e) {
      this.logger.error(`Failed to parse XML config for ${pluginName}`, e);
      throw new Error(
        `Failed to parse configuration file: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  async saveConfig(pluginName: string, config: PluginConfigDto): Promise<void> {
    // 1. Save to DB
    let dbConfig = await this.configRepo.findOne({ where: { pluginName } });
    if (!dbConfig) {
      dbConfig = this.configRepo.create({ pluginName });
    }

    dbConfig.baseFontFamily = config.baseFontFamily;
    dbConfig.titleFontFamily = config.titleFontFamily;
    dbConfig.titleColor = config.titleColor;
    dbConfig.accentColor = config.accentColor;
    dbConfig.secondaryColor = config.secondaryColor;
    dbConfig.pageWidth = config.pageWidth;
    dbConfig.pageHeight = config.pageHeight;
    dbConfig.coverImage = config.coverImage;

    // Handle default cover image if not set
    if (!config.coverImage) {
      const defaultCoverPath = path.join(process.cwd(), 'public', 'default-cover.jpg');
      const pluginDir = path.join(this.pluginsRoot, pluginName);
      const artworkDir = path.join(pluginDir, 'cfg', 'common', 'artwork');
      await fs.ensureDir(artworkDir);
      const targetPath = path.join(artworkDir, 'cover.jpg');

      if (await fs.pathExists(defaultCoverPath)) {
        await fs.copy(defaultCoverPath, targetPath, { overwrite: true });
        config.coverImage = 'cover.jpg';
        dbConfig.coverImage = 'cover.jpg';
      }
    }

    await this.configRepo.save(dbConfig);

    // 2. Generate XSLT file
    const pluginPath = this.getPluginPath(pluginName);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(pluginPath));

    const content = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    version="2.0">

    <!-- Page setup -->
    <xsl:attribute-set name="__force__page__count">
        <xsl:attribute name="force-page-count">auto</xsl:attribute>
    </xsl:attribute-set>

    <!-- Font settings -->
    <xsl:variable name="base-font-family">${config.baseFontFamily}</xsl:variable>
    <xsl:variable name="title-font-family">${config.titleFontFamily}</xsl:variable>
    
    <!-- Page Size -->
    <xsl:variable name="page-width">${config.pageWidth || '297mm'}</xsl:variable>
    <xsl:variable name="page-height">${config.pageHeight || '210mm'}</xsl:variable>
    
    <!-- Cover Image -->
    <xsl:variable name="cover-image">file:/<xsl:value-of select="'${path.join(this.pluginsRoot, pluginName, 'cfg', 'common', 'artwork', config.coverImage || '').replace(/\\/g, '/')}'"/></xsl:variable>

    <!-- Color Theme Variables -->
    <xsl:variable name="theme-color-title">${config.titleColor}</xsl:variable>
    <xsl:variable name="theme-color-accent">${config.accentColor}</xsl:variable>
    <xsl:variable name="theme-color-secondary">${config.secondaryColor}</xsl:variable>

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
    dbConfig.coverImage = targetFilename;
    await this.configRepo.save(dbConfig);

    return { url: targetFilename };
  }
}
