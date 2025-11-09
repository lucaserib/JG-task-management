import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponse,
  UserPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ForgotPasswordResponse,
} from '@repo/types';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'refresh' })
  async refresh(
    @Payload() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return this.authService.refresh(refreshTokenDto);
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() data: { userId: string }): Promise<UserPayload | null> {
    return this.authService.getUserById(data.userId);
  }

  @MessagePattern({ cmd: 'get_users_by_ids' })
  async getUsersByIds(
    @Payload() data: { userIds: string[] },
  ): Promise<UserPayload[]> {
    return this.authService.getUsersByIds(data.userIds);
  }

  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(): Promise<UserPayload[]> {
    return this.authService.getAllUsers();
  }

  @MessagePattern({ cmd: 'forgot_password' })
  async forgotPassword(
    @Payload() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(
    @Payload() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
