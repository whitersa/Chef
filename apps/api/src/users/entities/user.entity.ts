import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ comment: 'System users including chefs and staff' })
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: 'Unique identifier for the user' })
  id: string;

  @Column({ comment: 'Full name of the user' })
  name: string;

  @Column({
    unique: true,
    nullable: true,
    comment: 'Unique username for login',
  })
  username: string;

  @Column({ select: false, nullable: true, comment: 'Hashed password' })
  password: string;

  @Column({ comment: 'User role (e.g., Head Chef, Sous Chef)' })
  role: string; // e.g., 'Head Chef', 'Sous Chef'

  @Column({
    default: 'Active',
    comment: 'Current status of the user (Active, On Leave, Terminated)',
  })
  status: string; // 'Active', 'On Leave', 'Terminated'

  @Column({ comment: 'Date when the user was hired' })
  hireDate: Date;

  @Column({ type: 'jsonb', nullable: true, comment: 'User UI preferences' })
  preferences: {
    theme?: 'light' | 'dark';
    density?: 'compact' | 'default' | 'loose';
  };

  @CreateDateColumn({ comment: 'Record creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Record last update timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: 'Deletion timestamp for soft delete' })
  deletedAt: Date;
}
