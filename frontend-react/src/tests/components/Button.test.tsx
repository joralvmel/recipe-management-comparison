import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Button from '@components/Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  it('should render the Button with the correct text', () => {
    render(
      <Button size="medium" type="primary">
        Click Me
      </Button>
    );
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should apply the correct class names based on the props', () => {
    render(
      <Button size="large" type="secondary" className="custom-class">
        Custom Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /custom button/i });
    expect(button).toHaveClass('secondary-button large-button custom-class');
  });

  it('should call onClick when the button is clicked', () => {
    const handleClick = vi.fn();
    render(
      <Button size="small" type="tertiary" onClick={handleClick}>
        Clickable Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /clickable button/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('should not call onClick when the button is disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button size="medium" type="primary" disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /disabled button/i });
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with the correct HTML type', () => {
    render(
      <Button size="medium" type="primary" htmlType="submit">
        Submit Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /submit button/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should default to type="button" if no htmlType is provided', () => {
    render(
      <Button size="medium" type="primary">
        Default Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /default button/i });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should respect the disabled state', () => {
    render(
      <Button size="medium" type="primary" disabled>
        Disabled Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });
});