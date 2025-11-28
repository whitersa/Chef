import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class OperationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  action: string; // CREATE, UPDATE, DELETE

  @Column()
  resource: string; // Recipe, Ingredient

  @Column()
  resourceId: string;

  @Column('jsonb', { nullable: true })
  details: any;

  @CreateDateColumn()
  createdAt: Date;
}
