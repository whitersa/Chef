import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const users = [
        {
          name: 'Chef John',
          role: 'Head Chef',
          status: 'Active',
          hireDate: new Date('2024-01-01'),
        },
        {
          name: 'Sous Chef Mike',
          role: 'Sous Chef',
          status: 'Active',
          hireDate: new Date('2024-02-15'),
        },
        {
          name: 'Helper Sarah',
          role: 'Kitchen Porter',
          status: 'On Leave',
          hireDate: new Date('2024-03-01'),
        },
      ];

      for (const user of users) {
        await this.userRepository.save(this.userRepository.create(user));
      }
      console.log('Seeded initial users');
    }
  }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
