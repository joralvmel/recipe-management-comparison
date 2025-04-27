import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Search from '@pages/Search';
import '@testing-library/jest-dom';

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  label: string;
  id: string;
  options: FilterOption[];
}

vi.mock('@components/Filters', () => ({
  default: ({
              searchQuery,
              onSearchQueryChange,
              onSearch,
              handleReset,
            }: {
    filters: Filter[];
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onFiltersChange: (id: string, value: string) => void;
    onSearch: () => void;
    handleReset: () => void;
    filterValues: Record<string, string>;
  }) => (
    <div data-testid="filters">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
      <button data-testid="search-button" onClick={onSearch} type="button">
        Search
      </button>
      <button data-testid="reset-button" onClick={handleReset} type="button">
        Reset
      </button>
    </div>
  ),
}));

vi.mock('@components/Cards', () => ({
  default: ({ recipes }: { recipes: { _id: string; title: string }[] }) => (
    <div data-testid="cards">
      {recipes.map((recipe) => (
        <div key={recipe._id} data-testid="card">
          {recipe.title}
        </div>
      ))}
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

const mockUseSearch = vi.fn();
vi.mock('@hooks/useSearch', () => ({
  default: () => mockUseSearch(),
}));

const mockUseRecipeSearch = vi.fn();
vi.mock('@context/RecipeSearchContext', () => ({
  useRecipeSearch: () => mockUseRecipeSearch(),
}));

describe('Search Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Search component', () => {
    mockUseSearch.mockReturnValue({
      typedQuery: '',
      setTypedQuery: vi.fn(),
      typedFilters: {},
      setTypedFilters: vi.fn(),
      handleSearch: vi.fn(),
      handleReset: vi.fn(),
      paginatedCards: [],
      filterOptions: [],
      loading: false,
    });

    mockUseRecipeSearch.mockReturnValue({
      currentPage: 1,
      totalPages: 3,
    });

    render(<Search />);
    expect(screen.getByText('Search for Recipes')).toBeInTheDocument();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('cards')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should show the loader when loading is true', () => {
    mockUseSearch.mockReturnValue({
      typedQuery: '',
      setTypedQuery: vi.fn(),
      typedFilters: {},
      setTypedFilters: vi.fn(),
      handleSearch: vi.fn(),
      handleReset: vi.fn(),
      paginatedCards: [],
      filterOptions: [],
      loading: true,
    });

    render(<Search />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('cards')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('should update the search input and call onSearchQueryChange', () => {
    const setTypedQuery = vi.fn();

    mockUseSearch.mockReturnValue({
      typedQuery: '',
      setTypedQuery,
      typedFilters: {},
      setTypedFilters: vi.fn(),
      handleSearch: vi.fn(),
      handleReset: vi.fn(),
      paginatedCards: [],
      filterOptions: [],
      loading: false,
    });

    render(<Search />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'New Query' } });
    expect(setTypedQuery).toHaveBeenCalledWith('New Query');
  });

  it('should call handleSearch when the search button is clicked', () => {
    const handleSearch = vi.fn();

    mockUseSearch.mockReturnValue({
      typedQuery: '',
      setTypedQuery: vi.fn(),
      typedFilters: {},
      setTypedFilters: vi.fn(),
      handleSearch,
      handleReset: vi.fn(),
      paginatedCards: [],
      filterOptions: [],
      loading: false,
    });

    render(<Search />);
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);
    expect(handleSearch).toHaveBeenCalled();
  });

  it('should call handleReset when the reset button is clicked', () => {
    const handleReset = vi.fn();

    mockUseSearch.mockReturnValue({
      typedQuery: '',
      setTypedQuery: vi.fn(),
      typedFilters: {},
      setTypedFilters: vi.fn(),
      handleSearch: vi.fn(),
      handleReset,
      paginatedCards: [],
      filterOptions: [],
      loading: false,
    });

    render(<Search />);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalled();
  });
});
