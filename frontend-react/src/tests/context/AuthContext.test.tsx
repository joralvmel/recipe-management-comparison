import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { loginUser } from '@services/authService';
import '@testing-library/jest-dom';

vi.mock('@services/authService', () => ({
  loginUser: vi.fn(),
}));

const mockShowSnackbar = vi.fn();
vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

describe('AuthContext', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null user and isSignedIn false', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
  });

  it('successfully logs in a user', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const mockToken = 'mock-token';
    (loginUser as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginSuccess = false;
    await act(async () => {
      loginSuccess = await result.current.login('john@example.com', 'password123');
    });

    expect(loginSuccess).toBe(true);
    expect(result.current.user).toEqual({ ...mockUser, token: mockToken });
    expect(result.current.isSignedIn).toBe(true);
    expect(loginUser).toHaveBeenCalledWith('john@example.com', 'password123');
  });

  it('handles failed login', async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({ user: null, token: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginSuccess = true;
    await act(async () => {
      loginSuccess = await result.current.login('john@example.com', 'wrong-password');
    });

    expect(loginSuccess).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    (loginUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginSuccess = true;
    await act(async () => {
      loginSuccess = await result.current.login('john@example.com', 'password123');
    });

    expect(loginSuccess).toBe(false);
    expect(result.current.user).toBeNull();
    expect(mockShowSnackbar).toHaveBeenCalledWith(errorMessage, 'error');
  });

  it('handles unexpected login error', async () => {
    (loginUser as jest.Mock).mockRejectedValueOnce('Unexpected error');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginSuccess = true;
    await act(async () => {
      loginSuccess = await result.current.login('john@example.com', 'password123');
    });

    expect(loginSuccess).toBe(false);
    expect(mockShowSnackbar).toHaveBeenCalledWith('An unexpected error occurred', 'error');
  });

  it('logs out a user', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const mockToken = 'mock-token';
    (loginUser as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginSuccess = false;
    await act(async () => {
      loginSuccess = await result.current.login('john@example.com', 'password123');
    });

    expect(loginSuccess).toBe(true);
    expect(result.current.isSignedIn).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
    expect(mockShowSnackbar).toHaveBeenCalledWith('Logged out successfully', 'info');
  });

  it('throws an error when useAuth is used outside of AuthProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});