import type { IAuthRepository } from '../../domain/repositories';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  UserPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ForgotPasswordResponse,
} from '../../domain/entities';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '../../shared/config/api.config';
import { extractErrorMessage } from './error-handler';

export class AuthApi implements IAuthRepository {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getCurrentUser(): Promise<UserPayload> {
    try {
      const response = await apiClient.get<UserPayload>(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async getAllUsers(): Promise<UserPayload[]> {
    try {
      const response = await apiClient.get<UserPayload[]>(API_ENDPOINTS.AUTH.USERS);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data,
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        data,
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}

export const authApi = new AuthApi();
