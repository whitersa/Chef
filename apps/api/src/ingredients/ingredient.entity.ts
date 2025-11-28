import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ comment: 'Raw ingredients used in recipes' })
export class Ingredient {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the ingredient',
  })
  id: string;

  @Column({ comment: 'Name of the ingredient' })
  name: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    comment: 'Cost price per unit',
  })
  price: number;

  @Column({ comment: 'Unit of measurement (e.g., kg, g, ml)' })
  unit: string;

  @Column('jsonb', {
    nullable: true,
    comment: 'Nutritional information (e.g., protein, carbs)',
  })
  nutrition: Record<string, number>; // e.g., { protein: 10, carbs: 20 }

  @CreateDateColumn({ comment: 'Record creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Record last update timestamp' })
  updatedAt: Date;
}
