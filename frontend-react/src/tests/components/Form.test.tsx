import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Form from '@components/Form';
import '@testing-library/jest-dom';

describe('Form Component', () => {
  const mockOnSubmit = vi.fn();

  it('renders the Form with children', () => {
    const { container } = render(
      <Form onSubmit={mockOnSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );

    const formElement = container.querySelector('form');
    const buttonElement = screen.getByRole('button', { name: /submit/i });
    expect(formElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  it('calls onSubmit when the form is submitted', () => {
    const { container } = render(
      <Form onSubmit={mockOnSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );

    const formElement = container.querySelector('form');
    if (formElement) {
      fireEvent.submit(formElement);
    } else {
      throw new Error('Form element not found');
    }

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('applies the noValidate attribute correctly', () => {
    const { container } = render(
      <Form onSubmit={mockOnSubmit} noValidate>
        <button type="submit">Submit</button>
      </Form>
    );

    const formElement = container.querySelector('form');
    expect(formElement).toHaveAttribute('novalidate');
  });

  it('does not apply the noValidate attribute by default', () => {
    const { container } = render(
      <Form onSubmit={mockOnSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );

    const formElement = container.querySelector('form');
    expect(formElement).not.toHaveAttribute('novalidate');
  });
});