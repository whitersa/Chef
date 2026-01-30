import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sync_issues')
export class SyncIssue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fdcId!: string;

  @Column({ nullable: true })
  foodDescription?: string;

  @Column('text')
  errorMessage!: string;

  @Column('jsonb', { nullable: true })
  rawData?: any;

  @CreateDateColumn()
  createdAt!: Date;
}
