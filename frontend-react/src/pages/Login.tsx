import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import Form from '../components/Form';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';
import '@styles/pages/_login.scss';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      showSnackbar('All fields are required', 'error');
      return;
    }

    showSnackbar('Login successful', 'success');
    login();
    navigate('/');
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit}>
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
        <Button size="medium" type="primary" htmlType="submit">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
