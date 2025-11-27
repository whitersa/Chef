import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Clean up legacy users without username
    await this.userRepository.delete({ username: IsNull() });

    // Check if admin user exists
    const adminUser = await this.userRepository.findOneBy({
      username: 'admin',
    });

    if (!adminUser) {
      console.log('Admin user not found. Seeding database...');

      // Optional: Clear existing users if they are incompatible with new schema
      // await this.userRepository.clear();

      const hashedPassword = await bcrypt.hash('password', 10);
      const users = [
        {
          name: 'Chef John',
          username: 'admin',
          password: hashedPassword,
          role: 'Head Chef',
          status: 'Active',
          hireDate: new Date('2024-01-01'),
        },
        {
          name: 'Sous Chef Mike',
          username: 'mike',
          password: hashedPassword,
          role: 'Sous Chef',
          status: 'Active',
          hireDate: new Date('2024-02-15'),
        },
        {
          name: 'Helper Sarah',
          username: 'sarah',
          password: hashedPassword,
          role: 'Kitchen Porter',
          status: 'On Leave',
          hireDate: new Date('2024-03-01'),
        },
      ];

      for (const userData of users) {
        // Check if user exists by username to avoid duplicates
        const exists = await this.userRepository.findOneBy({
          username: userData.username,
        });
        if (!exists) {
          await this.userRepository.save(this.userRepository.create(userData));
        }
      }
      console.log('Seeded initial users');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    // In a real app, we should hash the password here if it was provided in DTO
    // For now, let's assume default password if not provided or handle it later
    // But CreateUserDto doesn't have password yet.
    // I'll leave it as is for now, assuming seed data is enough for login.
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

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'name', 'role', 'preferences'], // Explicitly select password
    });
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
