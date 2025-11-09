import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { AuthResponse, UserPayload, ForgotPasswordResponse } from '@repo/types';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authService: ClientProxy) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      return await firstValueFrom(this.authService.send({ cmd: 'register' }, registerDto));
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || HttpStatus.BAD_REQUEST;
      const message = error?.message || 'Registration failed';
      throw new HttpException(message, statusCode);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    try {
      return await firstValueFrom(this.authService.send({ cmd: 'login' }, loginDto));
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || HttpStatus.UNAUTHORIZED;
      const message = error?.message || 'Login failed';
      throw new HttpException(message, statusCode);
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      return await firstValueFrom(this.authService.send({ cmd: 'refresh' }, refreshTokenDto));
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || HttpStatus.UNAUTHORIZED;
      const message = error?.message || 'Token refresh failed';
      throw new HttpException(message, statusCode);
    }
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [Object],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers(): Promise<UserPayload[]> {
    try {
      return await firstValueFrom(this.authService.send({ cmd: 'get_all_users' }, {}));
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error?.message || 'Failed to get users';
      throw new HttpException(message, statusCode);
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset token generated',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    try {
      return await firstValueFrom(
        this.authService.send({ cmd: 'forgot_password' }, forgotPasswordDto),
      );
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || HttpStatus.BAD_REQUEST;
      const message = error?.message || 'Failed to process password reset request';
      throw new HttpException(message, statusCode);
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      return await firstValueFrom(
        this.authService.send({ cmd: 'reset_password' }, resetPasswordDto),
      );
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || HttpStatus.BAD_REQUEST;
      const message = error?.message || 'Failed to reset password';
      throw new HttpException(message, statusCode);
    }
  }
}
