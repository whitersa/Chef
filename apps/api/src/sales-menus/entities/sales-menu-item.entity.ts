import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesMenu } from './sales-menu.entity';
import { Recipe } from '../../recipes/recipe.entity';

@Entity({ comment: 'Items listed on a sales menu' })
export class SalesMenuItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  menuId!: string;

  @ManyToOne(() => SalesMenu, (menu) => menu.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu!: SalesMenu;

  @Column({ nullable: true })
  recipeId!: string;

  @ManyToOne(() => Recipe, { nullable: true })
  @JoinColumn({ name: 'recipeId' })
  recipe!: Recipe;

  @Column({ comment: 'Display name on the menu (defaults to recipe name)' })
  name!: string;

  @Column('decimal', { precision: 10, scale: 2, comment: 'Selling price' })
  price!: number;

  @Column({ nullable: true, comment: 'Category (e.g., Starter, Main)' })
  category!: string;

  @Column({ default: 0 })
  order!: number;
}
