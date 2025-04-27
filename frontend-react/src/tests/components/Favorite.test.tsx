import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Favorite from '@components/Favorite';
import '@testing-library/jest-dom';

const mockUseFavorite = vi.fn();
vi.mock('@hooks/useFavorite', () => ({
  default: (id: string) => mockUseFavorite(id),
}));

describe('Favorite Component', () => {
  const mockId = 'test-id';

  beforeEach(() => {
    mockUseFavorite.mockReturnValue({
      isSignedIn: true,
      isFavorite: false,
      loading: false,
      error: null,
      handleFavoriteChange: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if the user is not signed in', () => {
    mockUseFavorite.mockReturnValueOnce({
      isSignedIn: false,
      isFavorite: false,
      loading: false,
      error: null,
      handleFavoriteChange: vi.fn(),
    });

    render(<Favorite id={mockId} />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders the checkbox when the user is signed in', () => {
    render(<Favorite id={mockId} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
  });

  it('toggles the favorite state when the checkbox is clicked', () => {
    const handleFavoriteChange = vi.fn();
    mockUseFavorite.mockReturnValueOnce({
      isSignedIn: true,
      isFavorite: false,
      loading: false,
      error: null,
      handleFavoriteChange,
    });

    render(<Favorite id={mockId} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleFavoriteChange).toHaveBeenCalledTimes(1);
  });

  it('disables the checkbox and shows a loading indicator when loading', () => {
    mockUseFavorite.mockReturnValueOnce({
      isSignedIn: true,
      isFavorite: false,
      loading: true,
      error: null,
      handleFavoriteChange: vi.fn(),
    });

    render(<Favorite id={mockId} />);

    const checkbox = screen.getByRole('checkbox');
    const loadingIndicator = screen.getByText('Loading...');

    expect(checkbox).toBeDisabled();
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('shows an error message when there is an error', () => {
    const errorMessage = 'An error occurred';
    mockUseFavorite.mockReturnValueOnce({
      isSignedIn: true,
      isFavorite: false,
      loading: false,
      error: errorMessage,
      handleFavoriteChange: vi.fn(),
    });

    render(<Favorite id={mockId} />);

    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });
});
