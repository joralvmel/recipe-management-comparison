import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@hooks/useHeroSection', () => ({
  __esModule: true,
  default: vi.fn(),
  useHeroSection: vi.fn(),
}));

vi.mock('@components/SearchBar', () => ({
  __esModule: true,
  default: ({
              placeholder,
              value,
              onChange,
              onSearch,
            }: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
  }) => (
    <div>
      <input
        data-testid="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      <button type="button" data-testid="search-button" onClick={onSearch}>
        Search
      </button>
    </div>
  ),
}));

vi.mock('@components/Image', () => ({
  __esModule: true,
  default: ({
              src,
              alt,
              className,
            }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    <img data-testid="image" className={className} src={src} alt={alt} />
  ),
}));

import HeroSection from '@components/HeroSection';
import { useAuth } from '@context/AuthContext';
import useHeroSection from '@hooks/useHeroSection';

describe('HeroSection Component', () => {
  const mockSetTypedQuery = vi.fn();
  const mockHandleSearch = vi.fn();
  const mockUseHeroSection = {
    typedQuery: '',
    setTypedQuery: mockSetTypedQuery,
    handleSearch: mockHandleSearch,
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'John Doe' },
    });

    (useHeroSection as jest.Mock).mockReturnValue(mockUseHeroSection);
  });

  it('renders the welcome message with the user\'s name', () => {
    const userName = 'John';
    render(<HeroSection />);
    const welcomeMessage = screen.getByText((_, element) => {
      const hasText = (node: Element) => node.textContent?.trim() === `Welcome ${userName} to GastroNest`;
      if (!element) {
        throw new Error('Element is null or undefined');
      }
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element?.children ?? []).every(
        (child) => !hasText(child)
      );
      return elementHasText && childrenDontHaveText;
    });
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('renders the welcome message without the user\'s name when no user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<HeroSection />);
    const welcomeMessage = screen.getByRole('heading', { name: /Welcome to Gastro Nest/i });
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('renders the Image component with the correct attributes', () => {
    render(<HeroSection />);
    const imageElement = screen.getByTestId('image');
    expect(imageElement).toHaveAttribute('src', expect.stringContaining('logo.png'));
    expect(imageElement).toHaveAttribute('alt', 'logo');
    expect(imageElement).toHaveClass('app-logo');
  });

  it('interacts correctly with the SearchBar', () => {
    render(<HeroSection />);

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');

    fireEvent.change(searchInput, { target: { value: 'pasta' } });
    expect(mockSetTypedQuery).toHaveBeenCalledWith('pasta');

    fireEvent.click(searchButton);
    expect(mockHandleSearch).toHaveBeenCalled();
  });
});