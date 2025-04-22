import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Pagination from '@components/Pagination';
import * as usePagination from '@hooks/usePagination';

vi.mock('@components/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) => (
    <button type="button" onClick={() => onClick()} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@components/Dropdown', () => ({
  __esModule: true,
  default: ({
              label,
              options,
              value,
              onChange,
            }: {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <label htmlFor="results-per-page">{label}</label>
      <select
        id="results-per-page"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe('Pagination Component', () => {
  const mockContext = {
    pageNumber: 1,
    setPageNumber: vi.fn(),
    resultsPerPage: 10,
    setResultsPerPage: vi.fn(),
    totalResults: 100,
  };

  const mockPagination = {
    pageNumber: 1,
    totalPages: 10,
    canGoToNextPage: true,
    canGoToPreviousPage: false,
    goToFirstPage: vi.fn(),
    goToPreviousPage: vi.fn(),
    goToNextPage: vi.fn(),
    goToLastPage: vi.fn(),
    resultsPerPage: 10,
    handleResultsPerPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(usePagination, 'default').mockReturnValue(mockPagination);
    vi.clearAllMocks();
  });

  it('renders pagination controls', () => {
    render(<Pagination context={mockContext} />);

    expect(screen.getByText('<<')).toBeInTheDocument();
    expect(screen.getByText('<')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
    expect(screen.getByText('>')).toBeInTheDocument();
    expect(screen.getByText('>>')).toBeInTheDocument();
    expect(screen.getByLabelText('Results per page')).toBeInTheDocument();
  });

  it('disables the previous buttons on the first page', () => {
    render(<Pagination context={mockContext} />);

    const firstPageButton = screen.getByText('<<');
    const previousPageButton = screen.getByText('<');

    expect(firstPageButton).toBeDisabled();
    expect(previousPageButton).toBeDisabled();
  });

  it('disables the next buttons on the last page', () => {
    vi.spyOn(usePagination, 'default').mockReturnValue({
      ...mockPagination,
      pageNumber: 10,
      canGoToNextPage: false,
    });

    render(<Pagination context={mockContext} />);

    const nextPageButton = screen.getByText('>');
    const lastPageButton = screen.getByText('>>');

    expect(nextPageButton).toBeDisabled();
    expect(lastPageButton).toBeDisabled();
  });

  it('calls the appropriate functions when navigation buttons are clicked', () => {
    render(<Pagination context={mockContext} />);

    const nextPageButton = screen.getByText('>');
    fireEvent.click(nextPageButton);

    expect(mockPagination.goToNextPage).toHaveBeenCalledTimes(1);

    const lastPageButton = screen.getByText('>>');
    fireEvent.click(lastPageButton);

    expect(mockPagination.goToLastPage).toHaveBeenCalledTimes(1);
  });

  it('calls the appropriate function when changing results per page', () => {
    render(<Pagination context={mockContext} />);

    const dropdown = screen.getByLabelText('Results per page');
    fireEvent.change(dropdown, { target: { value: '20' } });

    expect(mockPagination.handleResultsPerPageChange).toHaveBeenCalledWith('20');
  });
});