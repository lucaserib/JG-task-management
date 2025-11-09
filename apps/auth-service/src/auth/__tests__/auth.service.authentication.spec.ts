import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { RegisterDto, LoginDto, RefreshTokenDto } from '@repo/types';
import { mockUser, createMockRepository, createMockJwtService } from './test-helpers';

jest.mock('bcrypt');

describe('AuthService - Authentication', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = createMockRepository();
  const mockJwtService = createMockJwtService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'Password123',
    };

    it('should successfully register a new user', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (mockUserRepository.create as jest.Mock).mockReturnValue(mockUser);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('accessToken123')
        .mockResolvedValueOnce('refreshToken123');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'accessToken123',
        refreshToken: 'refreshToken123',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw conflict exception when email or username already exists', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(RpcException);

      try {
        await service.register(registerDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.CONFLICT);
        expect(error.error.message).toBe('Email or username already exists');
      }
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should successfully login a user with valid credentials', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('accessToken123')
        .mockResolvedValueOnce('refreshToken123');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'accessToken123',
        refreshToken: 'refreshToken123',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw unauthorized exception when user not found', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(RpcException);

      try {
        await service.login(loginDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.error.message).toContain('Invalid email or password');
      }
    });

    it('should throw unauthorized exception when password is invalid', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(RpcException);

      try {
        await service.login(loginDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.error.message).toContain('Invalid email or password');
      }
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refreshToken123',
    };

    it('should successfully refresh tokens with valid refresh token', async () => {
      const hashedRefreshToken = 'hashedRefreshToken123';
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: hashedRefreshToken,
      };

      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedRefreshToken');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.refresh(refreshTokenDto);

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
      });
      expect(mockJwtService.verifyAsync).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        hashedRefreshToken
      );
    });

    it('should throw unauthorized exception when refresh token is invalid', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(RpcException);

      try {
        await service.refresh(refreshTokenDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw unauthorized exception when user not found', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: mockUser.id,
      });
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(RpcException);
    });

    it('should throw unauthorized exception when refresh token does not match', async () => {
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'hashedRefreshToken123',
      };

      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: mockUser.id,
      });
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(RpcException);
    });
  });
});
