import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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

  @OneToMany(() => RecipeItem, (item) => item.recipe, { cascade: true })
  items: RecipeItem[];
}
