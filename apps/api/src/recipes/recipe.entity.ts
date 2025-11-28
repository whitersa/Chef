import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { RecipeItem } from './recipe-item.entity';

@Entity({ comment: 'Recipes containing instructions and ingredients' })
export class Recipe {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the recipe',
  })
  id: string;

  @Column({ comment: 'Name of the recipe' })
  name: string;

  @Column('jsonb', {
    nullable: true,
    comment: 'Step-by-step cooking instructions',
  })
  steps: string[];

  @Column('jsonb', {
    nullable: true,
    comment: 'Pre-processing steps required before cooking',
  })
  preProcessing: string[];

  @VersionColumn({ comment: 'Version number for optimistic locking' })
  version: number;

  @OneToMany(() => RecipeItem, (item) => item.recipe, { cascade: true })
  items: RecipeItem[];
}
