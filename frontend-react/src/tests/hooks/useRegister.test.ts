import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import useRegister from '@hooks/useRegister';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '@context/SnackbarContext';
import { registerUser } from '@services/authService';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('@services/authService', () => ({
  registerUser: vi.fn(),
}));

describe('useRegister', () => {
  const mockNavigate = vi.fn();
  const mockShowSnackbar = vi.fn();
  const mockFocus = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useSnackbar as Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });
  });

  const createMockFormEvent = () => {
    const preventDefault = vi.fn();
    return { preventDefault } as unknown as React.FormEvent<HTMLFormElement>;
  };

  it('initializes with empty values', () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.username).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
  });

  it('updates state when setters are called', () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('test@example.com');
      result.current.setPassword('Password1!');
      result.current.setConfirmPassword('Password1!');
    });

    expect(result.current.username).toBe('testuser');
    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('Password1!');
    expect(result.current.confirmPassword).toBe('Password1!');
  });

  it('shows error and focuses username input when username is empty', async () => {
    const { result } = renderHook(() => useRegister());

    Object.defineProperty(result.current.usernameRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith('Username is required', 'error');
    expect(mockFocus).toHaveBeenCalled();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('shows error and focuses email input when email is empty', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
    });

    Object.defineProperty(result.current.emailRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('Email is required', 'error');
    expect(mockFocus).toHaveBeenCalled();
  });

  it('shows error when email format is invalid', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('invalid-email');
    });

    Object.defineProperty(result.current.emailRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('Invalid email format', 'error');
    expect(mockFocus).toHaveBeenCalled();
  });

  it('shows error when password does not meet requirements', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('test@example.com');
      result.current.setPassword('weak');
    });

    Object.defineProperty(result.current.passwordRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character',
      'error'
    );
    expect(mockFocus).toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('test@example.com');
      result.current.setPassword('Password1!');
      result.current.setConfirmPassword('DifferentPassword1!');
    });

    Object.defineProperty(result.current.confirmPasswordRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('Passwords do not match', 'warning');
    expect(mockFocus).toHaveBeenCalled();
  });

  it('successfully registers user with valid inputs', async () => {
    (registerUser as Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('test@example.com');
      result.current.setPassword('Password1!');
      result.current.setConfirmPassword('Password1!');
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(registerUser).toHaveBeenCalledWith({
      name: 'testuser',
      email: 'test@example.com',
      password: 'Password1!'
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith('Registration successful', 'success');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows error when registration fails with Error object', async () => {
    const error = new Error('Email already in use');
    (registerUser as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('test@example.com');
      result.current.setPassword('Password1!');
      result.current.setConfirmPassword('Password1!');
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('Email already in use', 'error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows generic error when registration fails with non-Error object', async () => {
    (registerUser as Mock).mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.setUsername('testuser');
      result.current.setEmail('test@example.com');
      result.current.setPassword('Password1!');
      result.current.setConfirmPassword('Password1!');
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('An unexpected error occurred', 'error');
  });

  it('validates email format correctly', () => {
    const { result } = renderHook(() => useRegister());

    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'first-last@domain.org'
    ];

    const invalidEmails = [
      'invalid-email',
      'test@',
      '@domain.com',
      'test@domain'
    ];

    const mockEvent = createMockFormEvent();

    for (const email of validEmails) {
      act(() => {
        result.current.setUsername('testuser');
        result.current.setEmail(email);
        result.current.setPassword('Password1!');
      });

      expect(() => {
        act(() => {
          result.current.handleSubmit(mockEvent);
        });
      }).not.toThrow();
    }

    for (const email of invalidEmails) {
      mockShowSnackbar.mockClear();

      act(() => {
        result.current.setUsername('testuser');
        result.current.setEmail(email);
      });

      Object.defineProperty(result.current.emailRef, 'current', {
        value: { focus: mockFocus },
        writable: true
      });

      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      expect(mockShowSnackbar).toHaveBeenCalledWith('Invalid email format', 'error');
    }
  });

  it('validates password requirements correctly', () => {
    const { result } = renderHook(() => useRegister());

    const validPasswords = [
      'Password1!',
      'Secure123$',
      'MyP@ssw0rd'
    ];

    const invalidPasswords = [
      'password',
      'Password',
      'password1',
      'Password!',
      'SHORT1!',
    ];

    const mockEvent = createMockFormEvent();

    for (const pwd of validPasswords) {
      mockShowSnackbar.mockClear();

      act(() => {
        result.current.setUsername('testuser');
        result.current.setEmail('test@example.com');
        result.current.setPassword(pwd);
        result.current.setConfirmPassword(pwd);
      });

      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      expect(mockShowSnackbar).not.toHaveBeenCalledWith(
        expect.stringContaining('Password must be'),
        'error'
      );
    }

    for (const pwd of invalidPasswords) {
      mockShowSnackbar.mockClear();

      act(() => {
        result.current.setUsername('testuser');
        result.current.setEmail('test@example.com');
        result.current.setPassword(pwd);
        result.current.setConfirmPassword(pwd);
      });

      Object.defineProperty(result.current.passwordRef, 'current', {
        value: { focus: mockFocus },
        writable: true
      });

      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character',
        'error'
      );
    }
  });
});