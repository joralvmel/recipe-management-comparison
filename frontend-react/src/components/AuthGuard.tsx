import type React from 'react';
import{ useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@context/SnackbarContext';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isSignedIn } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) {
      showSnackbar('You must be logged in to access this page', 'error');
      navigate('/');
    }
  }, [isSignedIn, showSnackbar, navigate]);

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;