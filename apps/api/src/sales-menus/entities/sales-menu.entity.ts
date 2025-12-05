import { Entity, Column, PrimaryGeneratedColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { SalesMenuItem } from './sales-menu-item.entity';

@Entity({ comment: 'Restaurant sales menus (e.g., Lunch, Dinner)' })
export class SalesMenu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: true })
  active!: boolean;

  @OneToMany(() => SalesMenuItem, (item) => item.menu, { cascade: true })
  items!: SalesMenuItem[];

  @DeleteDateColumn({ comment: 'Deletion timestamp for soft delete' })
  deletedAt!: Date;
}
