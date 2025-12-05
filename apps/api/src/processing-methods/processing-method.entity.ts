import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';

@Entity({
  comment: 'Methods used for processing ingredients (e.g., Chopping, Boiling)',
})
export class ProcessingMethod {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the processing method',
  })
  id!: string;

  @Column({ comment: 'Name of the processing method' })
  name!: string;

  @Column({
    nullable: true,
    comment: 'Description of the processing technique',
  })
  description!: string;

  @DeleteDateColumn({ comment: 'Deletion timestamp for soft delete' })
  deletedAt!: Date;
}
