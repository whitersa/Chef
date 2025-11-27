import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ select: false, nullable: true }) // Don't return password by default
  password: string;

  @Column()
  role: string; // e.g., 'Head Chef', 'Sous Chef'

  @Column({ default: 'Active' })
  status: string; // 'Active', 'On Leave', 'Terminated'

  @Column()
  hireDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    theme?: 'light' | 'dark';
    density?: 'compact' | 'default' | 'loose';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
