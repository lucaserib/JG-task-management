export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPayload;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface UserPayload {
  id: string;
  email: string;
  username: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}
