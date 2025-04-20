import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';
import Filters from '@components/Filters';
import '@testing-library/jest-dom';

interface DropdownProps {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  handleReset?: () => void;
}

const dropdownProps: DropdownProps[] = [];
vi.mock('@components/Dropdown', () => ({
  default: (props: DropdownProps) => {
    dropdownProps.push(props);
    return <div data-testid="mock-dropdown">{props.label}</div>;
  },
}));

vi.mock('@components/SearchBar', () => ({
  default: ({ placeholder, value, onChange, handleReset }: SearchBarProps) => (
    <input
      data-testid="mock-searchbar"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleReset?.();
      }}
    />
  ),
}));

describe('Filters Component', () => {
  const mockFilters = [
    {
      label: 'Category',
      id: 'category',
      options: [
        { value: 'all', label: 'All' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'main', label: 'Main Course' },
      ],
    },
    {
      label: 'Difficulty',
      id: 'difficulty',
      options: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' },
      ],
    },
  ];

  const mockFilterValues = {
    category: 'dessert',
    difficulty: 'medium',
  };

  const mockOnFiltersChange = vi.fn();
  const mockOnSearchQueryChange = vi.fn();
  const mockHandleReset = vi.fn();

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<Router>{ui}</Router>);

  beforeEach(() => {
    dropdownProps.length = 0;
    vi.clearAllMocks();
  });

  it('renders one Dropdown per filter with correct labels', () => {
    renderWithRouter(
      <Filters
        filters={mockFilters}
        filterValues={mockFilterValues}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const dropdowns = screen.getAllByTestId('mock-dropdown');
    expect(dropdowns).toHaveLength(mockFilters.length);
    expect(dropdowns[0]).toHaveTextContent('Category');
    expect(dropdowns[1]).toHaveTextContent('Difficulty');
  });

  it('passes correct props to Dropdown and calls onFiltersChange', () => {
    renderWithRouter(
      <Filters
        filters={mockFilters}
        filterValues={mockFilterValues}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(dropdownProps).toHaveLength(2);

    const [catProps, diffProps] = dropdownProps;

    expect(catProps).toMatchObject({
      id: 'category',
      label: 'Category',
      options: mockFilters[0].options,
      value: 'dessert',
    });
    expect(typeof catProps.onChange).toBe('function');

    catProps.onChange('main');
    expect(mockOnFiltersChange).toHaveBeenCalledWith('category', 'main');

    expect(diffProps).toMatchObject({
      id: 'difficulty',
      label: 'Difficulty',
      options: mockFilters[1].options,
      value: 'medium',
    });
    diffProps.onChange('hard');
    expect(mockOnFiltersChange).toHaveBeenCalledWith('difficulty', 'hard');
  });

  it('renders the SearchBar correctly', () => {
    renderWithRouter(
      <Filters
        filters={mockFilters}
        filterValues={mockFilterValues}
        searchQuery="test"
        onSearchQueryChange={mockOnSearchQueryChange}
      />
    );

    const searchBar = screen.getByTestId('mock-searchbar') as HTMLInputElement;
    expect(searchBar).toBeInTheDocument();
    expect(searchBar).toHaveValue('test');
  });

  it('handles changes in the search query', () => {
    renderWithRouter(
      <Filters
        filters={mockFilters}
        filterValues={mockFilterValues}
        searchQuery=""
        onSearchQueryChange={mockOnSearchQueryChange}
      />
    );

    const searchBar = screen.getByTestId('mock-searchbar');
    fireEvent.change(searchBar, { target: { value: 'new query' } });

    expect(mockOnSearchQueryChange).toHaveBeenCalledWith('new query');
  });

  it('handles the reset functionality (Escape key)', () => {
    renderWithRouter(
      <Filters
        filters={mockFilters}
        filterValues={mockFilterValues}
        handleReset={mockHandleReset}
      />
    );

    const searchBar = screen.getByTestId('mock-searchbar');
    fireEvent.keyDown(searchBar, { key: 'Escape', code: 'Escape' });

    expect(mockHandleReset).toHaveBeenCalledTimes(1);
  });
});