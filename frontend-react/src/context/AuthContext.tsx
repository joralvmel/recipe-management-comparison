import type { ReactNode } from 'react';
import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { userData, type User } from '../data/userData';

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    if (password !== "123") {
      return false;
    }
    const foundUser = userData.find((user) => user.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isSignedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isSignedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
