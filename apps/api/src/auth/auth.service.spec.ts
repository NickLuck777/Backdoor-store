import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let configService: { get: jest.Mock };

  const mockUser = {
    id: 1,
    email: 'user@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    phone: null,
    role: 'USER',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ---- register ----

  describe('register()', () => {
    it('creates user with bcrypt-hashed password (hash != plain text)', async () => {
      const plainPassword = 'secret123';
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation(async (data) => ({
        ...mockUser,
        password: data.password,
        email: data.email,
      }));

      await service.register({ email: 'new@example.com', password: plainPassword });

      const createCall = usersService.create.mock.calls[0][0];
      const hashedPassword = createCall.password;

      // Hash must not equal plain password
      expect(hashedPassword).not.toBe(plainPassword);
      // Hash must be a valid bcrypt hash
      const isValidHash = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValidHash).toBe(true);
    });

    it('throws ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'user@example.com', password: 'secret123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('returns accessToken and refreshToken on successful registration', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({ ...mockUser, password: 'hashed' });
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register({ email: 'new@example.com', password: 'secret123' });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('user@example.com');
    });
  });

  // ---- login ----

  describe('login()', () => {
    it('returns accessToken and refreshToken for valid credentials', async () => {
      const plainPassword = 'secret123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const userWithHash = { ...mockUser, password: hashedPassword };

      usersService.findByEmail.mockResolvedValue(userWithHash);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login({ email: 'user@example.com', password: plainPassword });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const userWithHash = { ...mockUser, password: hashedPassword };
      usersService.findByEmail.mockResolvedValue(userWithHash);

      await expect(
        service.login({ email: 'user@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for nonexistent user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---- validateUser ----

  describe('validateUser()', () => {
    it('returns user for valid credentials', async () => {
      const plainPassword = 'secret123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const userWithHash = { ...mockUser, password: hashedPassword };
      usersService.findByEmail.mockResolvedValue(userWithHash);

      const result = await service.validateUser('user@example.com', plainPassword);

      expect(result).not.toBeNull();
      expect(result!.email).toBe('user@example.com');
    });

    it('returns null for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      const userWithHash = { ...mockUser, password: hashedPassword };
      usersService.findByEmail.mockResolvedValue(userWithHash);

      const result = await service.validateUser('user@example.com', 'wrong');

      expect(result).toBeNull();
    });

    it('returns null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'any');

      expect(result).toBeNull();
    });

    it('returns null when user has no password (OAuth user)', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, password: null });

      const result = await service.validateUser('user@example.com', 'any');

      expect(result).toBeNull();
    });
  });
});
