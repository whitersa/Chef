import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ comment: 'Raw ingredients used in recipes' })
export class Ingredient {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the ingredient',
  })
  id!: string;

  @Column({ comment: 'Name of the ingredient' })
  name!: string;

  @Column('decimal', {
    precision: 10,
    scale: 6,
    comment: 'Cost price per unit',
  })
  price!: number;

  @Column({ comment: 'Unit of measurement (e.g., kg, g, ml)' })
  unit!: string;

  @Column('jsonb', {
    nullable: true,
    comment: 'Nutritional information (e.g., protein, carbs)',
  })
  nutrition!: {
    calories?: number;
    protein: number;
    fat: number;
    carbs: number;
  };

  @Column('decimal', {
    precision: 10,
    scale: 3,
    default: 0,
    comment: 'Current stock quantity',
  })
  stockQuantity!: number;

  @Column({
    nullable: true,
    comment: 'Unit for stock (usually same as unit)',
  })
  stockUnit!: string;

  @VersionColumn({
    comment: 'Version number for optimistic locking',
    default: 1,
  })
  version!: number;

  @CreateDateColumn({ comment: 'Record creation timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ comment: 'Record last update timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ comment: 'Deletion timestamp for soft delete' })
  deletedAt!: Date;
}
