import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CustomSnackbar from '@components/CustomSnackbar';
import '@testing-library/jest-dom';

describe('CustomSnackbar Component', () => {
  const mockOnClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Snackbar with the correct message and severity when open', () => {
    render(
      <CustomSnackbar
        open={true}
        message="This is a success message"
        severity="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('This is a success message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardSuccess');
  });

  it('does not render the Snackbar when open is false', () => {
    render(
      <CustomSnackbar
        open={false}
        message="This is a hidden message"
        severity="info"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('This is a hidden message')).not.toBeInTheDocument();
  });

  it('calls onClose when the Snackbar is closed', () => {
    render(
      <CustomSnackbar
        open={true}
        message="This is a warning message"
        severity="warning"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
