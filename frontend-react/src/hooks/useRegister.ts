import type { UserType } from '../types';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';
import { registerUser } from '../services/authService';

const useRegister = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const usernameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username) {
      showSnackbar('Username is required', 'error');
      usernameRef.current?.focus();
      return;
    }

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

    if (!validatePassword(password)) {
      showSnackbar(
        'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character',
        'error'
      );
      passwordRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match', 'warning');
      confirmPasswordRef.current?.focus();
      return;
    }

    try {
      const userData: UserType = {
        name: username,
        email,
        password,
      };

      await registerUser(userData);
      showSnackbar('Registration successful', 'success');
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error');
      } else {
        showSnackbar('An unexpected error occurred', 'error');
      }
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    usernameRef,
    emailRef,
    passwordRef,
    confirmPasswordRef,
  };
};

export default useRegister;
