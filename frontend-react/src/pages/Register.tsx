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
        <FormGroup inputType="text" label="Username" className="input-text" id="username" required />
        <FormGroup inputType="email" label="Email" className="input-text" id="email" required />
        <FormGroup inputType="password" label="Password" className="input-text" id="password" required />
        <FormGroup inputType="password" label="Confirm Password" className="input-text" id="confirmPassword" required />
        <Button size="medium" type="primary">Register</Button>
      </Form>
    </div>
  );
};

export default Register;
