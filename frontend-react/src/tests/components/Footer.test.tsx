import { render, screen } from '@testing-library/react';
import Footer from '@components/Footer';
import '@testing-library/jest-dom';

describe('Footer Component', () => {
  it('renders the footer with correct text', () => {
    render(<Footer />);

    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();

    expect(footerElement).toHaveTextContent('© 2025 GastroNest');
  });
});