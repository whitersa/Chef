import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ingredient } from '../ingredients/ingredient.entity';

@Entity({ comment: 'Categories for grouping ingredients' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: 'Name of the category', unique: true })
  name!: string;

  @Column({ nullable: true, comment: 'Original English name from USDA', unique: true })
  originalName?: string;

  @Column({ nullable: true, comment: 'Description of the category' })
  description?: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @OneToMany(() => Ingredient, (ingredient) => ingredient.category)
  ingredients?: Ingredient[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
