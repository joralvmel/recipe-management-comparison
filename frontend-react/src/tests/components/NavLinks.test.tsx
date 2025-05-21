import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import NavLinks from '@components/NavLinks';
import * as AuthContext from '@context/AuthContext';

describe('NavLinks Component', () => {
  const mockCloseMenu = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isSignedIn: false,
      isLoading: false,
      logout: mockLogout,
      user: null,
      login: vi.fn(),
    });
    mockCloseMenu.mockClear();
    mockLogout.mockClear();
  });

  it('renders navigation links for signed-out users', () => {
    render(
      <BrowserRouter>
        <NavLinks />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders navigation links for signed-in users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoading: false,
      logout: mockLogout,
      user: {
        id: '123',
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      },
      login: vi.fn(),
    });

    render(
      <BrowserRouter>
        <NavLinks />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls the closeMenu function when a link is clicked (mobile menu)', () => {
    render(
      <BrowserRouter>
        <NavLinks isMobile closeMenu={mockCloseMenu} />
      </BrowserRouter>
    );

    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(mockCloseMenu).toHaveBeenCalledTimes(1);
  });

  it('does not call the closeMenu function when a link is clicked (desktop navigation)', () => {
    render(
      <BrowserRouter>
        <NavLinks />
      </BrowserRouter>
    );

    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(mockCloseMenu).not.toHaveBeenCalled();
  });

  it('calls logout and closeMenu when the Logout link is clicked', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isSignedIn: true,
      isLoading: false,
      logout: mockLogout,
      user: {
        id: '123',
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
      },
      login: vi.fn(),
    });

    render(
      <BrowserRouter>
        <NavLinks isMobile closeMenu={mockCloseMenu} />
      </BrowserRouter>
    );

    const logoutLink = screen.getByText('Logout');
    fireEvent.click(logoutLink);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockCloseMenu).toHaveBeenCalledTimes(1);
  });
});
