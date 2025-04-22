import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Navbar from '@components/Navbar';
import * as useMobileMenu from '@hooks/useMobileMenu';

vi.mock('@components/Logo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@components/NavLinks', () => ({
  __esModule: true,
  default: ({ isMobile, closeMenu }: { isMobile?: boolean; closeMenu?: () => void }) => (
    <div data-testid="nav-links" data-mobile={isMobile}>
      NavLinks
      {isMobile && <button type="button" onClick={closeMenu}>Close</button>}
    </div>
  ),
}));

describe('Navbar Component', () => {
  it('renders the Logo component', () => {
    render(<Navbar />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders the NavLinks component', () => {
    render(<Navbar />);
    const navLinks = screen.getAllByTestId('nav-links');

    const desktopNavLinks = navLinks.find((el) => !el.hasAttribute('data-mobile'));
    expect(desktopNavLinks).toBeInTheDocument();
    expect(desktopNavLinks).not.toHaveAttribute('data-mobile', 'true');
  });

  it('renders the mobile menu and toggles its visibility', () => {
    const toggleMobileMenu = vi.fn();
    const closeMobileMenu = vi.fn();
    const mockUseMobileMenu = vi.spyOn(useMobileMenu, 'default').mockReturnValue({
      isMobileMenuOpen: false,
      toggleMobileMenu,
      closeMobileMenu,
      mobileMenuRef: { current: null },
    });

    const { rerender } = render(<Navbar />);

    const menuIcon = screen.getByText('☰');
    expect(menuIcon).toBeInTheDocument();

    fireEvent.click(menuIcon);
    expect(toggleMobileMenu).toHaveBeenCalledTimes(1);

    mockUseMobileMenu.mockReturnValueOnce({
      isMobileMenuOpen: true,
      toggleMobileMenu,
      closeMobileMenu,
      mobileMenuRef: { current: null },
    });

    rerender(<Navbar />);

    const navLinks = screen.getAllByText('NavLinks');
    const mobileNavLinks = navLinks.find((el) => el.closest('.mobile-menu'));

    expect(mobileNavLinks).toBeInTheDocument();
    expect(mobileNavLinks?.closest('.mobile-menu')).toHaveClass('open');
  });

  it('closes the mobile menu when the close button is clicked', () => {
    const closeMobileMenu = vi.fn();
    vi.spyOn(useMobileMenu, 'default').mockReturnValue({
      isMobileMenuOpen: true,
      toggleMobileMenu: vi.fn(),
      closeMobileMenu,
      mobileMenuRef: { current: null },
    });

    render(<Navbar />);

    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('toggles the mobile menu with the "Enter" key', () => {
    const toggleMobileMenu = vi.fn();
    vi.spyOn(useMobileMenu, 'default').mockReturnValue({
      isMobileMenuOpen: false,
      toggleMobileMenu,
      closeMobileMenu: vi.fn(),
      mobileMenuRef: { current: null },
    });

    render(<Navbar />);

    const menuIcon = screen.getByText('☰');
    fireEvent.keyUp(menuIcon, { key: 'Enter' });
    expect(toggleMobileMenu).toHaveBeenCalledTimes(1);
  });
});