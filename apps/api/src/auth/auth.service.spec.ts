import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  const mockUsersService = {
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: '1', username: 'test', password: hashedPassword };

      mockUsersService.findByUsername.mockResolvedValue(user);

      const result = await service.validateUser('test', password);

      expect(result).toEqual({ id: '1', username: 'test' });
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      const result = await service.validateUser('test', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: '1', username: 'test', password: hashedPassword };

      mockUsersService.findByUsername.mockResolvedValue(user);

      const result = await service.validateUser('test', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', () => {
      const user = {
        id: '1',
        username: 'test',
        name: 'Test',
        role: 'Admin',
        status: 'Active',
        hireDate: new Date(),
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      const token = 'jwt-token';
      mockJwtService.sign.mockReturnValue(token);

      const result = service.login(user);

      expect(result).toEqual({
        access_token: token,
        user: user,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
    });
  });
});
