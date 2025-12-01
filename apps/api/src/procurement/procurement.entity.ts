import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProcurementItem } from './procurement-item.entity';

export enum ProcurementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Procurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProcurementStatus,
    default: ProcurementStatus.PENDING,
  })
  status: ProcurementStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @OneToMany(() => ProcurementItem, (item) => item.procurement, {
    cascade: true,
  })
  items: ProcurementItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
