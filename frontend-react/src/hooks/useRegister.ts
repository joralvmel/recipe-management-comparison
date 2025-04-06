import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';
import { userData } from '../data/userData';

const useRegister = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      showSnackbar('All fields are required', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match', 'warning');
      return;
    }

    const existingUser = userData.find((user) => user.email === email);
    if (existingUser) {
      showSnackbar('User already exists', 'error');
      return;
    }

    showSnackbar('Registration successful', 'success');
    navigate('/login');
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