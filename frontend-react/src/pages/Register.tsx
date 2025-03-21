import type React from 'react';
import '@styles/pages/_register.scss';
import Form from '../components/Form';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';

const Register: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="register">
      <h1>Register</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup label="Username" type="text" id="username" required />
        <FormGroup label="Email" type="text" id="email" required />
        <FormGroup label="Password" type="text" id="password" required />
        <Button size="medium" type="primary">Register</Button>
      </Form>
    </div>
  );
};

export default Register;
