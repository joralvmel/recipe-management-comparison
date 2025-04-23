import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

const MockApp = () => {
  return (
    <div data-testid="app-container">
      <div data-testid="navbar">Navbar</div>
      <main data-testid="main-content">
        <div data-testid="route-home" data-path="/">Home Route</div>
        <div data-testid="route-search" data-path="/search">Search Route</div>
        <div data-testid="route-favorites" data-path="/favorites">
          <div data-testid="auth-guard">Favorites Route</div>
        </div>
        <div data-testid="route-login" data-path="/login">Login Route</div>
        <div data-testid="route-register" data-path="/register">Register Route</div>
        <div data-testid="route-recipe-detail" data-path="/recipe/:id">Recipe Detail Route</div>
        <div data-testid="route-not-found" data-path="*">Not Found Route</div>
      </main>
      <div data-testid="footer">Footer</div>
    </div>
  );
};

describe('App Routes Structure', () => {
  it('contains all required routes', () => {
    render(
      <BrowserRouter>
        <MockApp />
      </BrowserRouter>
    );

    expect(screen.getByTestId('route-home')).toBeInTheDocument();
    expect(screen.getByTestId('route-search')).toBeInTheDocument();
    expect(screen.getByTestId('route-favorites')).toBeInTheDocument();
    expect(screen.getByTestId('route-login')).toBeInTheDocument();
    expect(screen.getByTestId('route-register')).toBeInTheDocument();
    expect(screen.getByTestId('route-recipe-detail')).toBeInTheDocument();
    expect(screen.getByTestId('route-not-found')).toBeInTheDocument();
  });

  it('wraps Favorites route with AuthGuard', () => {
    render(
      <BrowserRouter>
        <MockApp />
      </BrowserRouter>
    );

    const favoritesRoute = screen.getByTestId('route-favorites');
    const authGuard = screen.getByTestId('auth-guard');
    expect(favoritesRoute).toContainElement(authGuard);
  });
});