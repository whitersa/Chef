import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity({ comment: 'Application navigation menu items' })
export class Menu {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Unique identifier for the menu item',
  })
  id: string;

  @Column({ comment: 'Display title of the menu item' })
  title: string;

  @Column({ nullable: true, comment: 'Navigation path/route' })
  path: string;

  @Column({ nullable: true, comment: 'Icon name for the menu item' })
  icon: string;

  @Column({ default: 0, comment: 'Display order of the menu item' })
  order: number;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];
}
