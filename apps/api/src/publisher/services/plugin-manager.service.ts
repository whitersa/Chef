import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PluginConfigDto } from '../dtos/plugin-config.dto';

@Injectable()
export class PluginManagerService {
  private readonly logger = new Logger(PluginManagerService.name);
  private readonly pluginPath = path.join(
    process.cwd(),
    'tools',
    'dita-plugins',
    'com.chefos.pdf',
    'cfg',
    'fo',
    'attrs',
    'custom.xsl',
  );

  async getConfig(): Promise<PluginConfigDto> {
    if (!(await fs.pathExists(this.pluginPath))) {
      throw new Error('Plugin configuration file not found');
    }

    const content = await fs.readFile(this.pluginPath, 'utf-8');

    // Simple regex extraction (robust enough for this specific file structure)
    const extract = (pattern: RegExp, defaultVal: string): string => {
      const match = content.match(pattern);
      return match && match[1] ? match[1] : defaultVal;
    };

    return {
      baseFontFamily: extract(
        /<xsl:variable name="base-font-family">(.+?)<\/xsl:variable>/,
        'Serif',
      ),
      titleFontFamily: extract(
        /<xsl:variable name="title-font-family">(.+?)<\/xsl:variable>/,
        'Sans',
      ),
      titleColor: extract(/<xsl:attribute name="color">(.+?)<\/xsl:attribute>/, '#2c3e50'),
      accentColor: extract(
        /<xsl:attribute name="border-bottom">2pt solid (.+?)<\/xsl:attribute>/,
        '#e67e22',
      ),
      secondaryColor: extract(
        /<xsl:attribute name="border-left">4pt solid (.+?)<\/xsl:attribute>/,
        '#3498db',
      ),
    };
  }

  async saveConfig(config: PluginConfigDto): Promise<void> {
    // We generate the file from a template to ensure consistency
    // Note: We calculate lighter background colors based on the accent/secondary colors
    // For simplicity, we'll just use fixed light variants or the same color with opacity if we were using CSS,
    // but for XSL-FO we need hex. Let's just keep the backgrounds static or derive them if we had a color util.
    // For now, we'll keep the backgrounds hardcoded or use the user's input if we expanded the DTO.
    // To keep it simple, we will use the provided colors.

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

    <!-- Titles -->
    <xsl:attribute-set name="topic.title">
        <xsl:attribute name="font-family"><xsl:value-of select="$title-font-family" /></xsl:attribute>
        <xsl:attribute name="font-weight">bold</xsl:attribute>
        <xsl:attribute name="color">${config.titleColor}</xsl:attribute>
        <xsl:attribute name="border-bottom">2pt solid ${config.accentColor}</xsl:attribute>
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
        <xsl:attribute name="border-left">4pt solid ${config.accentColor}</xsl:attribute>
        <xsl:attribute name="margin-bottom">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Context (Preparation) -->
    <xsl:attribute-set name="context">
        <xsl:attribute name="background-color">#f4f6f7</xsl:attribute>
        <xsl:attribute name="padding">10pt</xsl:attribute>
        <xsl:attribute name="border-left">4pt solid ${config.secondaryColor}</xsl:attribute>
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

    await fs.writeFile(this.pluginPath, content, 'utf-8');
    this.logger.log('Plugin configuration updated');
  }
}
