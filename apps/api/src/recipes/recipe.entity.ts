import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  VersionColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecipeItem } from './recipe-item.entity';
import { Dish } from '../dishes/dish.entity';

@Entity({ comment: 'Recipes containing instructions and ingredients' })
export class Recipe {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the recipe',
  })
  id!: string;

  @Column({ nullable: true, comment: 'ID of the parent dish' })
  dishId!: string;

  @ManyToOne(() => Dish, (dish) => dish.recipes, { nullable: true })
  @JoinColumn({ name: 'dishId' })
  dish!: Dish;

  @Column({ default: 'Standard', comment: 'Variation name (e.g., Spicy, Homestyle)' })
  variantName!: string;

  @Column({ comment: 'Name of the recipe (can be auto-generated from Dish + Variant)' })
  name!: string;

  @Column('jsonb', {
    nullable: true,
    comment: 'Step-by-step cooking instructions',
  })
  steps!: string[];

  @Column('jsonb', {
    nullable: true,
    comment: 'Pre-processing steps required before cooking',
  })
  preProcessing!: string[];

  @Column('decimal', {
    precision: 10,
    scale: 4,
    default: 1,
    comment: 'Quantity produced by this recipe (e.g., 4 portions, 2 kg)',
  })
  yieldQuantity!: number;

  @Column({
    default: 'portion',
    comment: 'Unit of the yield (e.g., portion, kg, l)',
  })
  yieldUnit!: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Estimated labor cost for this recipe',
  })
  laborCost!: number;

  @VersionColumn({
    comment: 'Version number for optimistic locking',
    default: 1,
  })
  version!: number;

  @OneToMany(() => RecipeItem, (item) => item.recipe, { cascade: true })
  items!: RecipeItem[];

  @DeleteDateColumn({ comment: 'Deletion timestamp for soft delete' })
  deletedAt!: Date;
}
