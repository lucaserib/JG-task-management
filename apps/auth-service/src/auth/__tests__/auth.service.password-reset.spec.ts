import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { ForgotPasswordDto, ResetPasswordDto } from '@repo/types';
import { mockUser, createMockRepository, createMockJwtService } from './test-helpers';

jest.mock('bcrypt');

describe('AuthService - Password Reset', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

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

    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should generate reset token for valid email', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedResetToken');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('resetToken');
      expect(result.resetToken).toBeTruthy();
      expect(typeof result.resetToken).toBe('string');
      if (result.resetToken) {
        expect(result.resetToken.length).toBeGreaterThan(0);
      }

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: forgotPasswordDto.email },
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          resetPasswordToken: 'hashedResetToken',
          resetPasswordExpires: expect.any(Date),
        })
      );
    });

    it('should set token expiration to 1 hour from now', async () => {
      const beforeTime = new Date();
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedResetToken');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.forgotPassword(forgotPasswordDto);

      const updateCall = (mockUserRepository.update as jest.Mock).mock.calls[0][1];
      const expirationTime = updateCall.resetPasswordExpires;
      const afterTime = new Date();

      const expectedExpiration = new Date(beforeTime.getTime() + 60 * 60 * 1000);
      const timeDiff = Math.abs(expirationTime.getTime() - expectedExpiration.getTime());

      expect(timeDiff).toBeLessThan(1000);
    });

    it('should throw not found exception when email does not exist', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(RpcException);

      try {
        await service.forgotPassword(forgotPasswordDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(error.error.message).toBe('No account found with this email address');
      }
    });

    it('should hash the reset token before storing', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedResetToken');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.forgotPassword(forgotPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          resetPasswordToken: 'hashedResetToken',
        })
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'resetToken123',
      newPassword: 'NewPassword123',
    };

    it('should successfully reset password with valid token', async () => {
      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: 'hashedResetToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      (mockUserRepository.find as jest.Mock).mockResolvedValue([userWithResetToken]);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce('newHashedPassword');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        message: 'Password has been reset successfully',
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userWithResetToken.id,
        expect.objectContaining({
          password: 'newHashedPassword',
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        })
      );
    });

    it('should hash the new password', async () => {
      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: 'hashedResetToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      (mockUserRepository.find as jest.Mock).mockResolvedValue([userWithResetToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.resetPassword(resetPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.newPassword, 10);
    });

    it('should invalidate reset token after use', async () => {
      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: 'hashedResetToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      (mockUserRepository.find as jest.Mock).mockResolvedValue([userWithResetToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.resetPassword(resetPasswordDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userWithResetToken.id,
        expect.objectContaining({
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        })
      );
    });

    it('should throw bad request exception when token is invalid', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue([]);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(RpcException);

      try {
        await service.resetPassword(resetPasswordDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(error.error.message).toBe('Invalid or expired reset token');
      }
    });

    it('should throw bad request exception when token is expired', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        resetPasswordToken: 'hashedResetToken',
        resetPasswordExpires: new Date(Date.now() - 3600000),
      };

      (mockUserRepository.find as jest.Mock).mockResolvedValue([userWithExpiredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(RpcException);

      try {
        await service.resetPassword(resetPasswordDto);
      } catch (error: any) {
        expect(error.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(error.error.message).toContain('expired');
      }
    });

    it('should verify token hash matches', async () => {
      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: 'hashedResetToken',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };

      (mockUserRepository.find as jest.Mock).mockResolvedValue([userWithResetToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (mockUserRepository.update as jest.Mock).mockResolvedValue(undefined);

      await service.resetPassword(resetPasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        resetPasswordDto.token,
        userWithResetToken.resetPasswordToken
      );
    });
  });
});
