import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@hooks/useLazyLoad', () => ({
  __esModule: true,
  default: vi.fn(),
}));

import Image from '@components/Image';
import useLazyLoad from '@hooks/useLazyLoad';
import placeholderSrc from '@assets/images/placeholder.svg';

describe('Image Component', () => {

  beforeEach(() => {
    (useLazyLoad as jest.Mock).mockImplementation(() => [true, { current: null }]);
  });

  it('renders the placeholder image initially', () => {
    (useLazyLoad as jest.Mock).mockReturnValue([false, { current: null }]);

    render(<Image src="test-image.jpg" alt="Test Image" />);
    const imageElement = screen.getByRole('img', { name: /Test Image/i });

    expect(imageElement).toHaveAttribute('src', placeholderSrc);
  });

  it('renders the correct image when it becomes visible', () => {
    (useLazyLoad as jest.Mock).mockReturnValue([true, { current: null }]);
    render(<Image src="test-image.jpg" alt="Test Image" />);
    const imageElement = screen.getByRole('img', { name: /Test Image/i });
    expect(imageElement).toHaveAttribute('src', 'test-image.jpg');
  });

  it('applies the loading class while the image is loading', () => {
    render(<Image src="test-image.jpg" alt="Test Image" loadingClassName="loading" />);
    const imageElement = screen.getByRole('img', { name: /Test Image/i });
    expect(imageElement).toHaveClass('loading');
  });

  it('renders the placeholder image on error', () => {
    render(<Image src="test-image.jpg" alt="Test Image" />);
    const imageElement = screen.getByRole('img', { name: /Test Image/i });

    fireEvent.error(imageElement);

    expect(imageElement).toHaveAttribute('src', placeholderSrc);
  });

  it('removes the loading class after the image is loaded', () => {
    render(<Image src="test-image.jpg" alt="Test Image" loadingClassName="loading" />);
    const imageElement = screen.getByRole('img', { name: /Test Image/i });

    fireEvent.load(imageElement);

    expect(imageElement).not.toHaveClass('loading');
  });
});