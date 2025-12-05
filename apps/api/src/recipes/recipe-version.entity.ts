import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity({ comment: 'Historical versions of recipes' })
export class RecipeVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  recipeId!: string;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipeId' })
  recipe!: Recipe;

  @Column({ comment: 'Version number of this snapshot' })
  version!: number;

  @Column()
  name!: string;

  @Column('jsonb', { nullable: true })
  steps!: string[];

  @Column('jsonb', { nullable: true })
  preProcessing!: string[];

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  yieldQuantity!: number;

  @Column({ nullable: true })
  yieldUnit!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  laborCost!: number;

  @Column('jsonb', { comment: 'Snapshot of ingredients and sub-recipes' })
  itemsSnapshot!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true, comment: 'Reason for change or commit message' })
  changeLog!: string;
}
