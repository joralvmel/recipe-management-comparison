import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ServingsFilter from '@components/ServingsFilter';
import '@testing-library/jest-dom';

vi.mock('@components/Button', () => ({
  __esModule: true,
  default: ({
              children,
              onClick,
              className,
            }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button data-testid={className} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

describe('<ServingsFilter />', () => {
  const mockOnServingsChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial servings value', () => {
    render(<ServingsFilter servings={4} onServingsChange={mockOnServingsChange} />);

    const label = screen.getByText(/Servings:/i);
    expect(label).toBeInTheDocument();

    const input = screen.getByRole('spinbutton', { name: /servings/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(4);

    const decrementButton = screen.getByTestId('decrement');
    const incrementButton = screen.getByTestId('increment');
    expect(decrementButton).toBeInTheDocument();
    expect(incrementButton).toBeInTheDocument();
  });

  it('increments the servings value when increment button is clicked', () => {
    render(<ServingsFilter servings={4} onServingsChange={mockOnServingsChange} />);

    const incrementButton = screen.getByTestId('increment');
    fireEvent.click(incrementButton);

    expect(mockOnServingsChange).toHaveBeenCalledWith(5);
    expect(mockOnServingsChange).toHaveBeenCalledTimes(1);
  });

  it('decrements the servings value when decrement button is clicked', () => {
    render(<ServingsFilter servings={4} onServingsChange={mockOnServingsChange} />);

    const decrementButton = screen.getByTestId('decrement');
    fireEvent.click(decrementButton);

    expect(mockOnServingsChange).toHaveBeenCalledWith(3);
    expect(mockOnServingsChange).toHaveBeenCalledTimes(1);
  });

  it('does not decrement the servings below 1', () => {
    render(<ServingsFilter servings={1} onServingsChange={mockOnServingsChange} />);

    const decrementButton = screen.getByTestId('decrement');
    fireEvent.click(decrementButton);

    expect(mockOnServingsChange).not.toHaveBeenCalled();
  });

  it('calls onServingsChange when input value is changed', () => {
    render(<ServingsFilter servings={4} onServingsChange={mockOnServingsChange} />);

    const input = screen.getByRole('spinbutton', { name: /servings/i });
    fireEvent.change(input, { target: { value: '6' } });

    expect(mockOnServingsChange).toHaveBeenCalledWith(6);
    expect(mockOnServingsChange).toHaveBeenCalledTimes(1);
  });
});