import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import StarRating from '@components/StarRating';
import '@testing-library/jest-dom';

describe('<StarRating />', () => {
  const mockOnRatingChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the correct number of stars', () => {
    render(<StarRating rating={3} maxRating={5} name="rating" />);

    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  it('renders the correct number of filled stars based on the rating', () => {
    render(<StarRating rating={3} maxRating={5} name="rating" />);

    const filledStars = screen.getAllByText('★').filter((star) =>
      star.classList.contains('filled')
    );
    expect(filledStars).toHaveLength(3);
  });

  it('calls onRatingChange when a star is clicked (editable mode)', () => {
    render(
      <StarRating
        rating={3}
        maxRating={5}
        name="rating"
        onRatingChange={mockOnRatingChange}
      />
    );

    const stars = screen.getAllByText('★');
    fireEvent.click(stars[1]);

    expect(mockOnRatingChange).toHaveBeenCalledWith(4);
    expect(mockOnRatingChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onRatingChange when in read-only mode', () => {
    render(
      <StarRating
        rating={3}
        maxRating={5}
        name="rating"
        onRatingChange={mockOnRatingChange}
        readOnly={true}
      />
    );

    const stars = screen.getAllByText('★');
    fireEvent.click(stars[1]);

    expect(mockOnRatingChange).not.toHaveBeenCalled();
  });

  it('calls onRatingChange when a star is activated via keyboard (editable mode)', () => {
    render(
      <StarRating
        rating={3}
        maxRating={5}
        name="rating"
        onRatingChange={mockOnRatingChange}
      />
    );

    const stars = screen.getAllByText('★');
    fireEvent.keyUp(stars[2], { key: 'Enter', code: 'Enter' });

    expect(mockOnRatingChange).toHaveBeenCalledWith(3);
    fireEvent.keyUp(stars[1], { key: ' ' });
    expect(mockOnRatingChange).toHaveBeenCalledWith(4);
  });

  it('renders correct classes for stars (descending order)', () => {
    render(<StarRating rating={2} maxRating={5} name="rating" />);

    const stars = screen.getAllByText('★');
    expect(stars[0]).toHaveClass('star');
    expect(stars[0]).not.toHaveClass('filled');
    expect(stars[1]).toHaveClass('star');
    expect(stars[1]).not.toHaveClass('filled');
    expect(stars[2]).toHaveClass('star');
    expect(stars[2]).not.toHaveClass('filled');
    expect(stars[3]).toHaveClass('star', 'filled');
    expect(stars[4]).toHaveClass('star', 'filled');
  });

  it('renders with default maxRating of 5 when not provided', () => {
    render(<StarRating rating={3} name="rating" />);

    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });
});