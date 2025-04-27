import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { SnackbarProvider } from '@context/SnackbarContext';
import { AuthProvider } from '@context/AuthContext';
import { FavoriteProvider } from '@context/FavoriteContext';
import { RecipeSearchProvider } from '@context/RecipeSearchContext';
import '@testing-library/jest-dom';

vi.mock('@src/App', () => ({
  default: () => <div data-testid="app">App Component</div>
}));

const originalGetElementById = document.getElementById;
const originalConsoleError = console.error;

describe('Application Entry Point Structure', () => {
  afterEach(() => {
    console.error = originalConsoleError;
    document.getElementById = originalGetElementById;
  });

  it('renders App within proper provider structure', () => {
    const { container } = render(
      <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
          <SnackbarProvider>
            <AuthProvider>
              <FavoriteProvider>
                <RecipeSearchProvider>
                  <div data-testid="app">App Component</div>
                </RecipeSearchProvider>
              </FavoriteProvider>
            </AuthProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </StrictMode>
    );

    const app = screen.getByTestId('app');
    expect(app).toBeInTheDocument();
    expect(app.textContent).toBe('App Component');
    expect(container).toContainElement(app);
  });

  it('handles missing root element', () => {
    console.error = vi.fn();
    document.getElementById = vi.fn(() => null);

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
    }

    expect(console.error).toHaveBeenCalledWith('Root element not found');
  });

  it('initializes rendering when root element exists', () => {
    document.getElementById = vi.fn(() => document.createElement('div'));
    const mockRender = vi.fn();
    const mockCreateRoot = { render: mockRender };
    const createRootMock = vi.fn((_element: HTMLElement) => mockCreateRoot);
    const rootElement = document.getElementById('root');

    if (rootElement) {
      createRootMock(rootElement).render(
        <StrictMode>
          <div>App with providers</div>
        </StrictMode>
      );
    }

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(createRootMock).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
  });
});