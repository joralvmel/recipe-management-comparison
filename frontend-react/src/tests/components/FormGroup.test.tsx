import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

vi.mock('@components/Input', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        { type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
        ref: React.Ref<HTMLInputElement>
      ) => <input data-testid="mock-input" ref={ref} type={type} {...props} />
    ),
  };
});

import FormGroup from '@components/FormGroup';

interface TestFormGroupProps extends React.ComponentPropsWithoutRef<typeof FormGroup> {
  type?: string;
}

describe('FormGroup Component', () => {
  it('renders the label and input correctly', () => {
    render(<FormGroup label="Test Label" id="test-input" type="text" /> as React.ReactElement<TestFormGroupProps>);

    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', 'test-input');

    const inputElement = screen.getByTestId('mock-input');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('id', 'test-input');
    expect(inputElement).toHaveAttribute('type', 'text');
  });

  it('passes additional props to the Input component', () => {
    render(
      <FormGroup
        label="Test Label"
        id="test-input"
        type="password"
        placeholder="Enter your password"
      /> as React.ReactElement<TestFormGroupProps>
    );

    const inputElement = screen.getByTestId('mock-input');
    expect(inputElement).toHaveAttribute('type', 'password');
    expect(inputElement).toHaveAttribute('placeholder', 'Enter your password');
  });

  it('forwards the ref to the Input component', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <FormGroup label="Test Label" id="test-input" ref={ref} /> as React.ReactElement<TestFormGroupProps>
    );

    const inputElement = screen.getByTestId('mock-input');
    expect(ref.current).toBe(inputElement);
  });
});