import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader from '@components/Loader';

describe('Loader Component', () => {
  it('renders the loader with default message and size', () => {
    render(<Loader />);
    const loaderContainer = document.querySelector('.loader-container');
    const loaderMessage = screen.getByText('Loading...');

    expect(loaderContainer).toHaveClass('loader-container loader-medium');
    expect(loaderMessage).toBeInTheDocument();
  });

  it('renders the loader with a custom message', () => {
    render(<Loader message="Please wait..." />);
    const loaderMessage = screen.getByText('Please wait...');

    expect(loaderMessage).toBeInTheDocument();
  });

  it('does not render a message when the message prop is empty', () => {
    render(<Loader message="" />);
    const loaderMessage = screen.queryByText('Loading...');

    expect(loaderMessage).not.toBeInTheDocument();
  });

  it('applies the correct size class when size prop is provided', () => {
    render(<Loader size="large" />);
    const loaderContainer = document.querySelector('.loader-container');

    expect(loaderContainer).toHaveClass('loader-container loader-large');
  });

  it('renders the spinner correctly', () => {
    render(<Loader />);
    const spinner = document.querySelector('.loader-spinner');

    expect(spinner).toBeInTheDocument();
  });
});