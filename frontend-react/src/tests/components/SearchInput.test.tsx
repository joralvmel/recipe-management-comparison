import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SearchInput from '@components/SearchInput';
import '@testing-library/jest-dom';

vi.mock('@components/Input', () => ({
  __esModule: true,
  default: ({
              inputType,
              className,
              id,
              placeholder,
              value,
              onChange,
            }: {
    inputType: string;
    className: string;
    id: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input
      data-testid="input"
      type={inputType}
      className={className}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

describe('<SearchInput />', () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with correct props', () => {
    render(<SearchInput placeholder="Search favorites" value="" onChange={mockOnChange} />);

    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search favorites');
    expect(input).toHaveValue('');
  });

  it('calls onChange handler when input value changes', () => {
    render(<SearchInput placeholder="Search favorites" value="" onChange={mockOnChange} />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(mockOnChange).toHaveBeenCalledWith('test query');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders input with the provided value', () => {
    render(<SearchInput placeholder="Search favorites" value="initial value" onChange={mockOnChange} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveValue('initial value');
  });
});