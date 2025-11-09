import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  UserPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ForgotPasswordResponse,
} from '../entities';

export interface IAuthRepository {
  login(credentials: LoginDto): Promise<AuthResponse>;

  register(data: RegisterDto): Promise<AuthResponse>;

  refreshToken(data: RefreshTokenDto): Promise<AuthResponse>;

  logout(): Promise<void>;

  getCurrentUser(): Promise<UserPayload>;

  getAllUsers(): Promise<UserPayload[]>;

  forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponse>;

  resetPassword(data: ResetPasswordDto): Promise<{ message: string }>;
}
