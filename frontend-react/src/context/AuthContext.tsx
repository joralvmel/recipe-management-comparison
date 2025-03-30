import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isSignedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(true);

  const login = () => setIsSignedIn(true);
  const logout = () => setIsSignedIn(false);

  return (
    <AuthContext.Provider value={{ isSignedIn, login, logout }}>
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
