import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@context/SnackbarContext';

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { login } = useAuth();

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      showSnackbar('Email is required', 'error');
      emailRef.current?.focus();
      return;
    }

    if (!validateEmail(email)) {
      showSnackbar('Invalid email format', 'error');
      emailRef.current?.focus();
      return;
    }

    if (!password) {
      showSnackbar('Password is required', 'error');
      passwordRef.current?.focus();
      return;
    }

    const success = await login(email, password);
    if (!success) {
      showSnackbar('Invalid email or password', 'error');
      return;
    }

    showSnackbar('Login successful', 'success');
    navigate('/');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    emailRef,
    passwordRef,
  };
};

export default useLogin;
