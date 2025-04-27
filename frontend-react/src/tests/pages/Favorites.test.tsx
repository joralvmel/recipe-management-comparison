import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Favorites from '@pages/Favorites';
import '@testing-library/jest-dom';

vi.mock('@components/SearchInput', () => ({
  default: ({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('@components/Cards', () => ({
  default: ({ recipes }: { recipes: { _id: string; title: string }[] }) => (
    <div data-testid="cards">
      {recipes.length > 0
        ? recipes.map((recipe) => (
          <div key={recipe._id} data-testid="card">
            {recipe.title}
          </div>
        ))
        : "No recipes found"}
    </div>
  ),
}));

vi.mock('@components/Pagination', () => ({
  default: ({ context }: { context: { currentPage: number; totalPages: number } }) => (
    <div data-testid="pagination">
      Pagination Component - {context ? 'Active' : 'Inactive'}
    </div>
  ),
}));

vi.mock('@components/Loader', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="loader">{message}</div>
  ),
}));

const mockUseFavoritesSearch = vi.fn();

vi.mock('@hooks/useFavoritesSearch', () => ({
  default: () => mockUseFavoritesSearch(),
}));

vi.mock('@context/FavoriteSearchContext', () => ({
  FavoritesSearchProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="favorites-provider">{children}</div>
  ),
  useFavoritesSearchContext: vi.fn(() => ({
    currentPage: 1,
    totalPages: 3,
  })),
}));

describe('Favorites Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Favorites component', () => {
    mockUseFavoritesSearch.mockReturnValue({
      favoritesSearchQuery: '',
      setFavoritesSearchQuery: vi.fn(),
      paginatedFavorites: [
        { _id: '1', title: 'Recipe 1' },
        { _id: '2', title: 'Recipe 2' },
      ],
      loading: false,
    });

    render(<Favorites />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('cards')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should show the loader when loading is true', () => {
    mockUseFavoritesSearch.mockReturnValue({
      favoritesSearchQuery: '',
      setFavoritesSearchQuery: vi.fn(),
      paginatedFavorites: [],
      loading: true,
    });

    render(<Favorites />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('cards')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('should display favorite recipes in Cards when loading is false', () => {
    mockUseFavoritesSearch.mockReturnValue({
      favoritesSearchQuery: '',
      setFavoritesSearchQuery: vi.fn(),
      paginatedFavorites: [
        { _id: '1', title: 'Recipe 1' },
        { _id: '2', title: 'Recipe 2' },
      ],
      loading: false,
    });

    render(<Favorites />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Recipe 1');
    expect(cards[1]).toHaveTextContent('Recipe 2');
  });

  it('should render the Pagination component with the correct context', () => {
    mockUseFavoritesSearch.mockReturnValue({
      favoritesSearchQuery: '',
      setFavoritesSearchQuery: vi.fn(),
      paginatedFavorites: [
        { _id: '1', title: 'Recipe 1' },
        { _id: '2', title: 'Recipe 2' },
      ],
      loading: false,
    });

    render(<Favorites />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('Pagination Component - Active')).toBeInTheDocument();
  });

  it('should have the correct container class', () => {
    mockUseFavoritesSearch.mockReturnValue({
      favoritesSearchQuery: '',
      setFavoritesSearchQuery: vi.fn(),
      paginatedFavorites: [
        { _id: '1', title: 'Recipe 1' },
        { _id: '2', title: 'Recipe 2' },
      ],
      loading: false,
    });

    render(<Favorites />);
    const container = screen.getByText('Search for Favorite Recipes').closest('.favorites.container');
    expect(container).not.toBeNull();
    expect(container).toHaveClass('favorites container');
  });
});