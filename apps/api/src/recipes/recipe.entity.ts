import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RecipeItem } from './recipe-item.entity';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => RecipeItem, (item) => item.recipe, { cascade: true })
  items: RecipeItem[];
}
