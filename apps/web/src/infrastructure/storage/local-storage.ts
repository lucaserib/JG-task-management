const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export class LocalStorageService {
  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static removeAccessToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setUser(user: any): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser<T = any>(): T | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (!user) return null;
    try {
      return JSON.parse(user) as T;
    } catch {
      return null;
    }
  }

  static removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static clearAuth(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
