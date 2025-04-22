import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import Dropdown from '@components/Dropdown';
import '@testing-library/jest-dom';

const mockUseDropdown = vi.fn();
vi.mock('@hooks/useDropdown.ts', () => ({
  default: () => mockUseDropdown(),
}));

describe('Dropdown Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockUseDropdown.mockReturnValue({
      isOpen: false,
      toggleDropdown: vi.fn(),
      dropdownRef: { current: null },
      selectedValue: 'option1',
      handleOptionClick: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dropdown with a default value', () => {
    render(
      <Dropdown
        label="Test Dropdown"
        id="test-dropdown"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens the dropdown and displays options on click', () => {
    const toggleDropdown = vi.fn();
    mockUseDropdown.mockReturnValueOnce({
      isOpen: true,
      toggleDropdown,
      dropdownRef: { current: null },
      selectedValue: 'option1',
      handleOptionClick: vi.fn(),
    });

    render(
      <Dropdown
        label="Test Dropdown"
        id="test-dropdown"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const trigger = screen
      .getAllByText('Option 1')
      .find(el => el.closest('.select-trigger'));
    if (!trigger) throw new Error('Dropdown trigger element not found');
    fireEvent.click(trigger);

    const list = screen.getByRole('list');
    for (const opt of mockOptions) {
      expect(within(list).getByText(opt.label)).toBeInTheDocument();
    }

    expect(toggleDropdown).toHaveBeenCalled();
  });

  it('selects an option and calls onChange callback', () => {
    const handleOptionClick = vi.fn();
    mockUseDropdown.mockReturnValueOnce({
      isOpen: true,
      toggleDropdown: vi.fn(),
      dropdownRef: { current: null },
      selectedValue: 'option1',
      handleOptionClick,
    });

    render(
      <Dropdown
        label="Test Dropdown"
        id="test-dropdown"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const optionEl = screen.getByText('Option 2');
    fireEvent.click(optionEl);

    expect(handleOptionClick).toHaveBeenCalledWith(mockOptions[1]);
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  it('closes the dropdown after selecting an option', () => {
    const toggleDropdown = vi.fn();
    mockUseDropdown.mockReturnValueOnce({
      isOpen: true,
      toggleDropdown,
      dropdownRef: { current: null },
      selectedValue: 'option1',
      handleOptionClick: vi.fn(),
    });

    render(
      <Dropdown
        label="Test Dropdown"
        id="test-dropdown"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText('Option 2'));
    expect(toggleDropdown).toHaveBeenCalled();
  });

  it('handles keyboard interactions', () => {
    const handleOptionClick = vi.fn();
    mockUseDropdown.mockReturnValueOnce({
      isOpen: true,
      toggleDropdown: vi.fn(),
      dropdownRef: { current: null },
      selectedValue: 'option1',
      handleOptionClick,
    });

    render(
      <Dropdown
        label="Test Dropdown"
        id="test-dropdown"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const optionEl = screen.getByText('Option 2');
    fireEvent.keyUp(optionEl, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(handleOptionClick).toHaveBeenCalledWith(mockOptions[1]);
    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });
});
