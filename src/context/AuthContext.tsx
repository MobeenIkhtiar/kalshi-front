import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@services/auth.service';

interface User {
  id: string;
  username: string;
  email: string;
  kalshi_access_key_id?: string;
  kalshi_private_key?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            authService.removeToken();
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          authService.removeToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        authService.setToken(userToken);
        setToken(userToken);
        // Fetch sanitized profile from backend
        try {
          const profile = await authService.getProfile();
          if (profile.success) {
            setUser(profile.data.user);
          } else {
            setUser(userData);
          }
        } catch {
          setUser(userData);
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register({ username, email, password });
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        authService.setToken(userToken);
        setToken(userToken);
        try {
          const profile = await authService.getProfile();
          if (profile.success) {
            setUser(profile.data.user);
          } else {
            setUser(userData);
          }
        } catch {
          setUser(userData);
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
