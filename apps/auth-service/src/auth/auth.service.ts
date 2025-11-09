import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponse,
  JwtPayload,
  UserPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ForgotPasswordResponse,
} from '@repo/types';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Email or username already exists',
        error: 'Conflict',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const tokens = await this.generateTokens(savedUser);

    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid email or password. Please check your credentials and try again.',
        error: 'Unauthorized',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid email or password. Please check your credentials and try again.',
        error: 'Unauthorized',
      });
    }

    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Session expired. Please login again.',
          error: 'Unauthorized',
        });
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isRefreshTokenValid) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Session expired. Please login again.',
          error: 'Unauthorized',
        });
      }

      const tokens = await this.generateTokens(user);

      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Session expired. Please login again.',
        error: 'Unauthorized',
      });
    }
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getUserById(userId: string): Promise<UserPayload | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  async getUsersByIds(userIds: string[]): Promise<UserPayload[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
    }));
  }

  async getAllUsers(): Promise<UserPayload[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'username'],
      order: { username: 'ASC' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
    }));
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No account found with this email address',
        error: 'Not Found',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.userRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    });

    return {
      message: 'Password reset token generated successfully',
      resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const users = await this.userRepository.find({
      where: {},
      select: ['id', 'email', 'resetPasswordToken', 'resetPasswordExpires'],
    });

    let userToReset: User | null = null;

    for (const user of users) {
      if (user.resetPasswordToken) {
        const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (isTokenValid) {
          userToReset = user;
          break;
        }
      }
    }

    if (!userToReset) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid or expired reset token',
        error: 'Bad Request',
      });
    }

    if (!userToReset.resetPasswordExpires || userToReset.resetPasswordExpires < new Date()) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Reset token has expired. Please request a new one',
        error: 'Bad Request',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userToReset.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }
}
