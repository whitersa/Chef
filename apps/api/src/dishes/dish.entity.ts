import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Cuisine } from '../cuisines/cuisine.entity';
import { Recipe } from '../recipes/recipe.entity';

@Entity({
  comment: 'Abstract dishes (e.g., Kung Pao Chicken) that can have multiple recipe variations',
})
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: 'Name of the dish' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ nullable: true })
  cuisineId!: string;

  @ManyToOne(() => Cuisine, (cuisine) => cuisine.dishes, { nullable: true })
  @JoinColumn({ name: 'cuisineId' })
  cuisine!: Cuisine;

  @OneToMany(() => Recipe, (recipe) => recipe.dish)
  recipes!: Recipe[];
}
