import type React from 'react';
import '@styles/pages/_login.scss';
import Form from '../components/Form';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';

const Login: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup inputType="email" label="Email" type="text" id="email" required />
        <FormGroup inputType="password" label="Password" type="text" id="password" required />
        <Button size="medium" type="primary">Login</Button>
      </Form>
    </div>
  );
};

export default Login;