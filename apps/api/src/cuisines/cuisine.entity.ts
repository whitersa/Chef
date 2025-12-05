import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Dish } from '../dishes/dish.entity';

@Entity({ comment: 'Culinary traditions or styles (e.g., Sichuan, Cantonese)' })
export class Cuisine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, comment: 'Name of the cuisine' })
  name!: string;

  @Column({ type: 'text', nullable: true, comment: 'Description of the cuisine' })
  description!: string;

  @OneToMany(() => Dish, (dish) => dish.cuisine)
  dishes!: Dish[];
}
