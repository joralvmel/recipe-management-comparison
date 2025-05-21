import type { UserType } from '../types';
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '@services/authService';
import { useSnackbar } from '@context//SnackbarContext';

interface AuthContextType {
  user: (UserType & { token?: string }) | null;
  isSignedIn: boolean;
  isLoading: boolean; // Add this line
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(UserType & { token?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored auth data', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser(email, password);
      if (response?.user && response?.token) {
        const userData = { ...response.user, token: response.token };
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error');
      } else {
        showSnackbar('An unexpected error occurred', 'error');
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showSnackbar('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
