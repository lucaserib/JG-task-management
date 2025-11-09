import type { IAuthRepository } from '../../domain/repositories';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UserPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ForgotPasswordResponse,
} from '../../domain/entities';
import { authApi } from '../../infrastructure/http';
import { LocalStorageService } from '../../infrastructure/storage/local-storage';
import { socketClient } from '../../infrastructure/websocket/socket-client';

export class AuthService {
  private authRepository: IAuthRepository;

  constructor(authRepository?: IAuthRepository) {
    this.authRepository = authRepository ?? authApi;
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await this.authRepository.login(credentials);

    LocalStorageService.setAccessToken(response.accessToken);
    LocalStorageService.setRefreshToken(response.refreshToken);
    LocalStorageService.setUser(response.user);

    socketClient.connect();

    return response;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.authRepository.register(data);

    LocalStorageService.setAccessToken(response.accessToken);
    LocalStorageService.setRefreshToken(response.refreshToken);
    LocalStorageService.setUser(response.user);

    socketClient.connect();

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      LocalStorageService.clearAuth();
      socketClient.disconnect();
    }
  }

  async getCurrentUser(): Promise<UserPayload | null> {
    try {
      const cachedUser = LocalStorageService.getUser<UserPayload>();
      if (cachedUser) {
        return cachedUser;
      }

      const user = await this.authRepository.getCurrentUser();
      LocalStorageService.setUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return LocalStorageService.isAuthenticated();
  }

  getStoredUser(): UserPayload | null {
    return LocalStorageService.getUser<UserPayload>();
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = LocalStorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.authRepository.refreshToken({ refreshToken });

    LocalStorageService.setAccessToken(response.accessToken);
    LocalStorageService.setRefreshToken(response.refreshToken);
    LocalStorageService.setUser(response.user);

    return response;
  }

  async initialize(): Promise<UserPayload | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const user = await this.getCurrentUser();
      if (user) {
        socketClient.connect();
      }
      return user;
    } catch (error) {
      console.error('Auth initialization error:', error);
      LocalStorageService.clearAuth();
      return null;
    }
  }

  async getAllUsers(): Promise<UserPayload[]> {
    return this.authRepository.getAllUsers();
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    return this.authRepository.forgotPassword(data);
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    return this.authRepository.resetPassword(data);
  }
}

export const authService = new AuthService();
