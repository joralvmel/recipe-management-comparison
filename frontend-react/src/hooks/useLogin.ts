import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      showSnackbar('All fields are required', 'error');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      showSnackbar('Invalid credentials', 'error');
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
  };
};

export default useLogin;
