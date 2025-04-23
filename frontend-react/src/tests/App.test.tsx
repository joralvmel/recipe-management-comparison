import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '@src/App';

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: () => <div data-testid="route">Route</div>
}));

vi.mock('@context/SnackbarContext', () => ({
  useSnackbar: () => ({
    snackbar: { open: false, message: '', severity: 'info' },
    closeSnackbar: vi.fn()
  })
}));

vi.mock('@components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('@components/CustomSnackbar', () => ({
  default: () => <div data-testid="snackbar">Snackbar</div>
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: () => () => <div>Lazy Component</div>,
    Suspense: ({ children }: { children: React.ReactNode }) => <div data-testid="suspense">{children}</div>
  };
});

describe('App Component Structure', () => {
  it('renders the main structural components', () => {
    render(<App />);

    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('suspense')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('snackbar')).toBeInTheDocument();
  });
});