import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Input from '@components/Input';

describe('Input Component', () => {
  it('renders with default type "text" if no inputType is provided', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('type', 'text');
  });

  it('renders with the correct type when inputType is provided', () => {
    render(<Input inputType="email" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('type', 'email');
  });

  it('applies the correct className when provided', () => {
    render(<Input className="custom-class" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('custom-class');
  });

  it('renders with the correct placeholder when provided', () => {
    render(<Input placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText('Enter text');
    expect(inputElement).toBeInTheDocument();
  });

  it('renders with the correct id when provided', () => {
    render(<Input id="test-id" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('id', 'test-id');
  });

  it('renders with the correct value when provided', () => {
    const mockOnChange = vi.fn();
    render(<Input value="test value" onChange={mockOnChange} />);
    const inputElement = screen.getByDisplayValue('test value');
    expect(inputElement).toBeInTheDocument();
  });
  it('calls the onChange handler when the value changes', () => {
    const mockOnChange = vi.fn();
    render(<Input onChange={mockOnChange} />);
    const inputElement = screen.getByRole('textbox');

    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls the onKeyDown handler when a key is pressed', () => {
    const mockOnKeyDown = vi.fn();
    render(<Input onKeyDown={mockOnKeyDown} />);
    const inputElement = screen.getByRole('textbox');

    fireEvent.keyDown(inputElement, { key: 'Enter' });
    expect(mockOnKeyDown).toHaveBeenCalledTimes(1);
  });

  it('renders as required when the required prop is true', () => {
    render(<Input required />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeRequired();
  });

  it('forwards a ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});