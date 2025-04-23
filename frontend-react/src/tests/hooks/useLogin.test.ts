import type React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useLogin from '@hooks/useLogin';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@context/SnackbarContext';
import { useNavigate } from 'react-router-dom';

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('useLogin', () => {
  const mockLogin = vi.fn();
  const mockShowSnackbar = vi.fn();
  const mockNavigate = vi.fn();
  const mockFocus = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin
    });

    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar
    });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  // Helper to create a mock form event
  const createMockFormEvent = () => {
    const preventDefault = vi.fn();
    return { preventDefault } as unknown as React.FormEvent<HTMLFormElement>;
  };

  it('initializes with empty email and password', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
  });

  it('updates email and password when setters are called', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('password123');
  });

  it('shows error and focuses email input when email is empty', async () => {
    const { result } = renderHook(() => useLogin());

    Object.defineProperty(result.current.emailRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith('Email is required', 'error');
    expect(mockFocus).toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error and focuses email input when email format is invalid', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
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
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error and focuses password input when password is empty', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
    });

    Object.defineProperty(result.current.passwordRef, 'current', {
      value: { focus: mockFocus },
      writable: true
    });

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith('Password is required', 'error');
    expect(mockFocus).toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error when login fails', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('wrongpassword');
    });

    mockLogin.mockResolvedValue(false);

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(mockShowSnackbar).toHaveBeenCalledWith('Invalid email or password', 'error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to home page on successful login', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('correctpassword');
    });

    mockLogin.mockResolvedValue(true);

    const mockEvent = createMockFormEvent();

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'correctpassword');
    expect(mockShowSnackbar).toHaveBeenCalledWith('Login successful', 'success');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('validates email format correctly', async () => {
    const { result } = renderHook(() => useLogin());

    const testValidEmails = async (emails: string[], expectValid: boolean) => {
      for (const email of emails) {
        act(() => {
          result.current.setEmail(email);
          result.current.setPassword('password');
        });

        mockLogin.mockResolvedValue(true);

        const mockEvent = createMockFormEvent();

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        if (expectValid) {
          expect(mockLogin).toHaveBeenCalledWith(email, 'password');
          mockLogin.mockClear();
        } else {
          expect(mockShowSnackbar).toHaveBeenCalledWith('Invalid email format', 'error');
          mockShowSnackbar.mockClear();
        }
      }
    };

    await testValidEmails(['test@example.com', 'user.name@domain.co.uk', 'first-last@domain.org'], true);
    await testValidEmails(['invalid-email', 'test@', '@domain.com', 'test@domain'], false);
  });
});