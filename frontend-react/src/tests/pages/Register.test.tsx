import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Register from '@pages/Register';
import '@testing-library/jest-dom';

vi.mock('@components/Form', () => ({
  default: ({ onSubmit, children }: { onSubmit: (e: React.FormEvent) => void; children: React.ReactNode }) => (
    <form data-testid="form" onSubmit={onSubmit}>
      {children}
    </form>
  ),
}));

vi.mock('@components/Button', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <button type="button" data-testid="register-button">{children}</button>
  ),
}));

vi.mock('@components/FormGroup', () => ({
  default: ({
              inputType,
              label,
              id,
              value,
              onChange,
            }: {
    inputType: string;
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div data-testid={`${id}-form-group`}>
      <label htmlFor={id}>{label}</label>
      <input
        type={inputType}
        id={id}
        value={value}
        onChange={onChange}
        data-testid={`${id}-input`}
      />
    </div>
  ),
}));

const mockUseRegister = vi.fn();

vi.mock('@hooks/useRegister', () => ({
  default: () => mockUseRegister(),
}));

describe('Register Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Register component', () => {
    mockUseRegister.mockReturnValue({
      username: '',
      setUsername: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      handleSubmit: vi.fn(),
      usernameRef: null,
      emailRef: null,
      passwordRef: null,
      confirmPasswordRef: null,
    });

    render(<Register />);
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByTestId('username-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('email-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('password-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toHaveTextContent('Register');
  });

  it('should call setUsername when the username input changes', () => {
    const setUsername = vi.fn();

    mockUseRegister.mockReturnValue({
      username: '',
      setUsername,
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      handleSubmit: vi.fn(),
      usernameRef: null,
      emailRef: null,
      passwordRef: null,
      confirmPasswordRef: null,
    });

    render(<Register />);
    const usernameInput = screen.getByTestId('username-input');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(setUsername).toHaveBeenCalledWith('testuser');
  });

  it('should call setEmail when the email input changes', () => {
    const setEmail = vi.fn();

    mockUseRegister.mockReturnValue({
      username: '',
      setUsername: vi.fn(),
      email: '',
      setEmail,
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      handleSubmit: vi.fn(),
      usernameRef: null,
      emailRef: null,
      passwordRef: null,
      confirmPasswordRef: null,
    });

    render(<Register />);
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(setEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should call setPassword when the password input changes', () => {
    const setPassword = vi.fn();

    mockUseRegister.mockReturnValue({
      username: '',
      setUsername: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword,
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      handleSubmit: vi.fn(),
      usernameRef: null,
      emailRef: null,
      passwordRef: null,
      confirmPasswordRef: null,
    });

    render(<Register />);
    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
    expect(setPassword).toHaveBeenCalledWith('securepassword');
  });

  it('should call setConfirmPassword when the confirm password input changes', () => {
    const setConfirmPassword = vi.fn();

    mockUseRegister.mockReturnValue({
      username: '',
      setUsername: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword,
      handleSubmit: vi.fn(),
      usernameRef: null,
      emailRef: null,
      passwordRef: null,
      confirmPasswordRef: null,
    });

    render(<Register />);
    const confirmPasswordInput = screen.getByTestId('confirmPassword-input');
    fireEvent.change(confirmPasswordInput, { target: { value: 'securepassword' } });
    expect(setConfirmPassword).toHaveBeenCalledWith('securepassword');
  });

  it('should call handleSubmit when the form is submitted', () => {
    const handleSubmit = vi.fn();

    mockUseRegister.mockReturnValue({
      username: '',
      setUsername: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      handleSubmit,
      usernameRef: null,
      emailRef: null,
      passwordRef: null,
      confirmPasswordRef: null,
    });

    render(<Register />);
    const form = screen.getByTestId('form');
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
