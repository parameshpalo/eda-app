import axios from "axios";

const API_BASE_URL = "http://localhost:8000";
// const API_BASE_URL = "https://eda-app-068n.onrender.com";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get token (defined before interceptor)
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Add auth token interceptor
authApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: UserResponse;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await authApi.post<AuthResponse>("/login", credentials);
  return data;
};

export const signup = async (userData: SignupData): Promise<UserResponse> => {
  const { data } = await authApi.post<UserResponse>("/signup", userData);
  return data;
};

// Export getAuthToken for use in other files
export { getAuthToken };

export const setAuthToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const getCurrentUser = async (): Promise<UserResponse | null> => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    
    const { data } = await authApi.get<UserResponse>("/me");
    return data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const googleLogin = async (token: string, role?: string): Promise<AuthResponse> => {
  const { data } = await authApi.post<AuthResponse>("/auth/google", { token, role: role || "user" });
  return data;
};

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type: string;
              theme: string;
              size: string;
              text: string;
              shape: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

