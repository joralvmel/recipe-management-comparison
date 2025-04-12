import type { UserType } from '../types';
import { useState } from 'react';
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      showSnackbar('All fields are required', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match', 'warning');
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
  };
};

export default useRegister;
