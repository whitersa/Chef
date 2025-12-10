import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ comment: 'Configuration for DITA-OT plugins' })
export class PluginConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, comment: 'Name of the plugin (e.g., com.chefos.pdf)' })
  pluginName!: string;

  @Column({ default: 'Serif', comment: 'Base font family for body text' })
  baseFontFamily!: string;

  @Column({ default: 'Sans', comment: 'Font family for titles' })
  titleFontFamily!: string;

  @Column({ default: '#2c3e50', comment: 'Color for titles' })
  titleColor!: string;

  @Column({ default: '#e67e22', comment: 'Accent color for borders and highlights' })
  accentColor!: string;

  @Column({ default: '#3498db', comment: 'Secondary color for context boxes' })
  secondaryColor!: string;

  @Column({ default: '210mm', comment: 'Page width (e.g., 210mm)' })
  pageWidth!: string;

  @Column({ default: '297mm', comment: 'Page height (e.g., 297mm)' })
  pageHeight!: string;

  @Column({ nullable: true, comment: 'Filename of the cover image' })
  coverImage?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
