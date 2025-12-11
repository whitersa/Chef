import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DEFAULT_THEME_CONFIG } from '../types/theme.types.js';
import type { PluginThemeConfig } from '../types/theme.types.js';

@Entity({ comment: 'Configuration for DITA-OT plugins' })
export class PluginConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, comment: 'Name of the plugin (e.g., com.chefos.pdf)' })
  pluginName!: string;

  @Column({
    type: 'jsonb',
    default: DEFAULT_THEME_CONFIG,
    comment: 'Structured theme configuration',
  })
  themeConfig!: PluginThemeConfig;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
