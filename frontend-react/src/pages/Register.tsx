import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';
import { userData } from '../data/userData';
import Form from '../components/Form';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';
import '@styles/pages/_register.scss';

const Register: React.FC = () => {
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

  return (
    <div className="register">
      <h1>Register</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          inputType="text"
          label="Username"
          className="input-text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormGroup
          inputType="email"
          label="Email"
          className="input-text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormGroup
          inputType="password"
          label="Password"
          className="input-text"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormGroup
          inputType="password"
          label="Confirm Password"
          className="input-text"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button size="medium" type="primary" htmlType="submit">
          Register
        </Button>
      </Form>
    </div>
  );
};

export default Register;
