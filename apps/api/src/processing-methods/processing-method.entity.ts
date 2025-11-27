import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProcessingMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
