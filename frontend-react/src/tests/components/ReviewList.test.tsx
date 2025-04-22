import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import ReviewList from '@components/ReviewList';

vi.mock('@components/Review', () => ({
  default: vi.fn(({ id, userId, rating, date, comment, canEdit, onSave }) => (
    <div data-testid="review" data-key={id}>
      <p>{`ID: ${id}`}</p>
      <p>{`User ID: ${userId}`}</p>
      <p>{`Rating: ${rating}`}</p>
      <p>{`Date: ${date}`}</p>
      <p>{`Comment: ${comment}`}</p>
      {canEdit && (
        <button type="button" onClick={() => onSave(id, rating, 'Updated Comment')} data-testid="edit-button">
          Save
        </button>
      )}
    </div>
  )),
}));

vi.mock('@hooks/useLazyLoad', () => ({
  default: vi.fn(() => [true, { current: null }]),
}));

describe('ReviewList Component', () => {
  const mockOnSave = vi.fn();
  const mockReviews = Array.from({ length: 3 }, (_, i) => ({
    _id: `${i + 1}`,
    userId: `user${i % 2 + 1}`,
    recipeId: 'recipe1',
    rating: 5 - i,
    createdAt: `2025-04-0${i + 1}T10:00:00Z`,
    content: `Review ${i + 1}`,
  }));

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all reviews directly without lazy loading if reviews <= 5', () => {
    render(<ReviewList reviews={mockReviews} currentUserId="user1" onSave={mockOnSave} />);

    const reviews = screen.getAllByTestId('review');
    expect(reviews).toHaveLength(mockReviews.length);

    mockReviews.forEach((review, index) => {
      expect(reviews[index]).toHaveTextContent(`ID: ${review._id}`);
      expect(reviews[index]).toHaveTextContent(`User ID: ${review.userId}`);
      expect(reviews[index]).toHaveTextContent(`Rating: ${review.rating}`);
      expect(reviews[index]).toHaveTextContent(`Date: ${new Date(review.createdAt).toLocaleDateString()}`);
      expect(reviews[index]).toHaveTextContent(`Comment: ${review.content}`);
    });
  });

  it('renders reviews with lazy loading if reviews > 5', () => {
    const largeMockReviews = Array.from({ length: 6 }, (_, i) => ({
      _id: `${i + 1}`,
      userId: `user${i + 1}`,
      recipeId: 'recipe1',
      rating: 5 - (i % 5),
      createdAt: `2025-04-0${i + 1}T10:00:00Z`,
      content: `Review ${i + 1}`,
    }));

    render(<ReviewList reviews={largeMockReviews} currentUserId="user1" onSave={mockOnSave} />);

    const reviews = screen.getAllByTestId('review');
    expect(reviews).toHaveLength(largeMockReviews.length);

    largeMockReviews.forEach((review, index) => {
      expect(reviews[index]).toHaveTextContent(`ID: ${review._id}`);
      expect(reviews[index]).toHaveTextContent(`User ID: ${review.userId}`);
      expect(reviews[index]).toHaveTextContent(`Rating: ${review.rating}`);
      expect(reviews[index]).toHaveTextContent(`Date: ${new Date(review.createdAt).toLocaleDateString()}`);
      expect(reviews[index]).toHaveTextContent(`Comment: ${review.content}`);
    });
  });

  it('calls onSave when save button is clicked for an editable review', () => {
    render(<ReviewList reviews={mockReviews} currentUserId="user1" onSave={mockOnSave} />);

    const saveButtons = screen.getAllByTestId('edit-button');
    expect(saveButtons).toHaveLength(2);

    fireEvent.click(saveButtons[0]);
    expect(mockOnSave).toHaveBeenCalledWith('1', 5, 'Updated Comment');
  });
});