import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Login from '@pages/Login';
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
    <button type="button" data-testid="login-button">{children}</button>
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

const mockUseLogin = vi.fn();

vi.mock('@hooks/useLogin', () => ({
  default: () => mockUseLogin(),
}));

describe('Login Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Login component', () => {
    mockUseLogin.mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      handleSubmit: vi.fn(),
      emailRef: null,
      passwordRef: null,
    });

    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByTestId('email-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('password-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toHaveTextContent('Login');
  });

  it('should call setEmail when the email input changes', () => {
    const setEmail = vi.fn();

    mockUseLogin.mockReturnValue({
      email: '',
      setEmail,
      password: '',
      setPassword: vi.fn(),
      handleSubmit: vi.fn(),
      emailRef: null,
      passwordRef: null,
    });

    render(<Login />);
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(setEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should call setPassword when the password input changes', () => {
    const setPassword = vi.fn();

    mockUseLogin.mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword,
      handleSubmit: vi.fn(),
      emailRef: null,
      passwordRef: null,
    });

    render(<Login />);
    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
    expect(setPassword).toHaveBeenCalledWith('securepassword');
  });

  it('should call handleSubmit when the form is submitted', () => {
    const handleSubmit = vi.fn();

    mockUseLogin.mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      handleSubmit,
      emailRef: null,
      passwordRef: null,
    });

    render(<Login />);
    const form = screen.getByTestId('form');
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
