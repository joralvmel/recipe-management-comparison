import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Logo from '@components/Logo';

describe('Logo Component', () => {
  it('renders the logo container', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    const logoContainer = screen.getByRole('link');
    expect(logoContainer).toBeInTheDocument();
  });

  it('links to the homepage', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders the logo image with correct attributes', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    const logoImage = screen.getByAltText('logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('logo.png'));
  });

  it('renders the primary and secondary text', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    const primaryText = screen.getByText('Gastro');
    const secondaryText = screen.getByText('Nest');

    expect(primaryText).toBeInTheDocument();
    expect(secondaryText).toBeInTheDocument();
  });
});