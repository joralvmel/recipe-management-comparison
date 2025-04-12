import { createContext, useContext, useState } from 'react';
import { loginUser } from '../services/authService';
import type { UserType } from '../types';
import { useSnackbar } from './SnackbarContext';

interface AuthContextType {
  user: (UserType & { token?: string }) | null;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(UserType & { token?: string }) | null>(null);
  const { showSnackbar } = useSnackbar();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser(email, password);
      if (response?.user && response?.token) {
        setUser({ ...response.user, token: response.token });
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
    showSnackbar('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, login, logout }}>
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
