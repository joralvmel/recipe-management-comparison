import type React from 'react';
import useRegister from '@hooks/useRegister';
import Form from '@components/Form';
import Button from '@components/Button';
import FormGroup from '@components/FormGroup';
import '@styles/pages/_register.scss';

const Register: React.FC = () => {
  const {
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
  } = useRegister();

  return (
    <div className="register">
      <h1>Register</h1>
      <Form onSubmit={handleSubmit} noValidate>
        <FormGroup
          inputType="text"
          label="Username"
          className="input-text"
          id="username"
          value={username}
          ref={usernameRef}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormGroup
          inputType="email"
          label="Email"
          className="input-text"
          id="email"
          value={email}
          ref={emailRef}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormGroup
          inputType="password"
          label="Password"
          className="input-text"
          id="password"
          value={password}
          ref={passwordRef}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormGroup
          inputType="password"
          label="Confirm Password"
          className="input-text"
          id="confirmPassword"
          value={confirmPassword}
          ref={confirmPasswordRef}
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
