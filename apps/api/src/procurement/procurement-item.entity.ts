import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Procurement } from './procurement.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

@Entity()
export class ProcurementItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Procurement, (procurement) => procurement.items, {
    onDelete: 'CASCADE',
  })
  procurement!: Procurement;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingredientId' })
  ingredient!: Ingredient;

  @Column('decimal', { precision: 10, scale: 3 })
  quantity!: number;

  @Column()
  unit!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost!: number;
}
