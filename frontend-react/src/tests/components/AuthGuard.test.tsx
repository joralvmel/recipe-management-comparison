import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AuthGuard from '@components/AuthGuard';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@context/SnackbarContext';
import { useNavigate } from 'react-router-dom';

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('AuthGuard Component', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockUseSnackbar = useSnackbar as jest.Mock;
  const mockUseNavigate = useNavigate as jest.Mock;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render children if the user is signed in', () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true });
    mockUseSnackbar.mockReturnValue({ showSnackbar: vi.fn() });
    mockUseNavigate.mockReturnValue(vi.fn());

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should not render children and navigate to the home page if the user is not signed in', () => {
    const showSnackbar = vi.fn();
    const navigate = vi.fn();

    mockUseAuth.mockReturnValue({ isSignedIn: false });
    mockUseSnackbar.mockReturnValue({ showSnackbar });
    mockUseNavigate.mockReturnValue(navigate);

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(showSnackbar).toHaveBeenCalledWith(
      'You must be logged in to access this page',
      'error'
    );
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
