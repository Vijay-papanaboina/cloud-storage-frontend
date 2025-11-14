import { api } from "./api";

export interface User {
  id: string;
  username: string;
  email: string;
  active?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null; // null when using cookie-based refresh tokens
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiKey {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  permissions: "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS";
  key?: string; // Only present on creation
}

export interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: 30 | 60 | 90;
  permissions?: "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS";
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data, {
      withCredentials: true, // Required to receive the refresh token cookie
    });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>("/auth/register", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(
      "/auth/logout",
      {},
      {
        withCredentials: true, // Required to send/clear the refresh token cookie
      }
    );
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    // Refresh token is in httpOnly cookie, enable credentials only for refresh
    const response = await api.post<RefreshTokenResponse>(
      "/auth/refresh",
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // API Key management
  createApiKey: async (data: CreateApiKeyRequest): Promise<ApiKey> => {
    const response = await api.post<ApiKey>("/auth/api-keys", data);
    return response.data;
  },

  listApiKeys: async (): Promise<ApiKey[]> => {
    const response = await api.get<ApiKey[]>("/auth/api-keys");
    return response.data;
  },

  getApiKey: async (id: string): Promise<ApiKey> => {
    const response = await api.get<ApiKey>(`/auth/api-keys/${id}`);
    return response.data;
  },

  revokeApiKey: async (id: string): Promise<void> => {
    await api.delete(`/auth/api-keys/${id}`);
  },
};
