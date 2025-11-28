import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

@Entity({ comment: 'Items (ingredients or sub-recipes) included in a recipe' })
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the recipe item',
  })
  id: string;

  @Column('decimal', { precision: 10, scale: 2, comment: 'Quantity required' })
  quantity: number;

  // 出品率 (例如 0.8 代表损耗 20%)
  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 1.0,
    comment: 'Yield rate (e.g., 0.8 means 20% loss)',
  })
  yieldRate: number;

  @Column({ nullable: true, comment: 'ID of the parent recipe' })
  recipeId: string;

  // 属于哪个父菜谱
  @ManyToOne(() => Recipe, (recipe) => recipe.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @Column({ nullable: true, comment: 'ID of the ingredient (if applicable)' })
  ingredientId: string;

  // 选项 A: 这是一个原材料 (Ingredient)
  @ManyToOne(() => Ingredient, { nullable: true })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @Column({ nullable: true, comment: 'ID of the child recipe (if applicable)' })
  childRecipeId: string;

  // 选项 B: 这是一个半成品 (Sub-Recipe)
  @ManyToOne(() => Recipe, { nullable: true })
  @JoinColumn({ name: 'childRecipeId' })
  childRecipe: Recipe;
}
