import type React from 'react';
import useLogin from '../hooks/useLogin';
import Form from '../components/Form';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';
import '@styles/pages/_login.scss';

const Login: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    emailRef,
    passwordRef,
  } = useLogin();

  return (
    <div className="login">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit} noValidate>
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
        <Button size="medium" type="primary" htmlType="submit">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
