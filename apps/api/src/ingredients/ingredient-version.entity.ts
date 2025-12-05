import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity({ comment: 'Historical versions of ingredients' })
export class IngredientVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ingredientId!: string;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient!: Ingredient;

  @Column({ comment: 'Version number of this snapshot' })
  version!: number;

  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 6 })
  price!: number;

  @Column()
  unit!: string;

  @Column('jsonb', { nullable: true })
  nutrition: any;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true, comment: 'Reason for change' })
  changeLog!: string;
}
