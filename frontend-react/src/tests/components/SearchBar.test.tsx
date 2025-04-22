import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '@components/SearchBar';
import '@testing-library/jest-dom';

vi.mock('@components/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

vi.mock('@components/Input', () => ({
  __esModule: true,
  default: ({
              inputType,
              className,
              id,
              placeholder,
              value,
              onChange,
              onKeyDown,
            }: {
    inputType: string;
    className: string;
    id: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }) => (
    <input
      data-testid="input"
      type={inputType}
      className={className}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const originalModule = await vi.importActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe('<SearchBar />', () => {
  const mockOnChange = vi.fn();
  const mockOnSearch = vi.fn();
  const mockHandleReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and buttons correctly', () => {
    render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" />
      </MemoryRouter>
    );

    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Search here');
    expect(screen.getAllByTestId('button')).toHaveLength(2);
  });

  it('handles input change', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" value="" onChange={mockOnChange} />
      </MemoryRouter>
    );

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'test query' } });

    rerender(
      <MemoryRouter>
        <SearchBar placeholder="Search here" value="test query" onChange={mockOnChange} />
      </MemoryRouter>
    );

    expect(mockOnChange).toHaveBeenCalledWith('test query');
    expect(input).toHaveValue('test query');
  });

  it('triggers search on button click', () => {
    render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const searchButton = screen.getAllByTestId('button')[0];
    fireEvent.click(searchButton);
    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('navigates to /search when onSearch is not provided', () => {
    render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" />
      </MemoryRouter>
    );

    const searchButton = screen.getAllByTestId('button')[0];
    fireEvent.click(searchButton);
    expect(mockNavigate).toHaveBeenCalledWith('/search');
  });

  it('triggers search on Enter key press', () => {
    render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" onSearch={mockOnSearch} />
      </MemoryRouter>
    );

    const input = screen.getByTestId('input');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('renders reset button and calls handleReset when clicked', () => {
    render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" handleReset={mockHandleReset} />
      </MemoryRouter>
    );

    const resetButton = screen.getAllByTestId('button')[1];
    fireEvent.click(resetButton);
    expect(mockHandleReset).toHaveBeenCalled();
  });

  it('does not render reset button when resetSearch is false', () => {
    render(
      <MemoryRouter>
        <SearchBar placeholder="Search here" resetSearch={false} />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('button')).toHaveLength(1);
  });
});