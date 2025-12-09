import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ comment: 'Units of measurement' })
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, comment: 'Name of the unit (e.g., Kilogram, Piece)' })
  name!: string;

  @Column({ nullable: true, comment: 'Abbreviation (e.g., kg, pcs)' })
  abbreviation?: string;

  @Column({ nullable: true, comment: 'Description of the unit' })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
