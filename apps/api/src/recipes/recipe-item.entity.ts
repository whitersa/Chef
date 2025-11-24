import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

@Entity()
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  // 出品率 (例如 0.8 代表损耗 20%)
  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  yieldRate: number;

  // 属于哪个父菜谱
  @ManyToOne(() => Recipe, (recipe) => recipe.items, { onDelete: 'CASCADE' })
  recipe: Recipe;

  // 选项 A: 这是一个原材料 (Ingredient)
  @ManyToOne(() => Ingredient, { nullable: true })
  ingredient: Ingredient;

  // 选项 B: 这是一个半成品 (Sub-Recipe)
  @ManyToOne(() => Recipe, { nullable: true })
  childRecipe: Recipe;
}
