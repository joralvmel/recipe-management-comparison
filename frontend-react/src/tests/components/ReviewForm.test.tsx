import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import ReviewForm from '@components/ReviewForm';

const mockUseReviewForm = {
  rating: 0,
  comment: '',
  error: '',
  loading: false,
  handleRatingChange: vi.fn(),
  handleCommentChange: vi.fn(),
  handleSubmit: vi.fn((e) => e.preventDefault()),
};

vi.mock('@hooks/useReviewForm', () => ({
  __esModule: true,
  default: () => mockUseReviewForm,
}));

vi.mock('@components/StarRating', () => ({
  __esModule: true,
  default: ({ onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => (
    <div data-testid="star-rating">
      <button type="button" onClick={() => onRatingChange(1)}>1 Star</button>
      <button type="button" onClick={() => onRatingChange(2)}>2 Stars</button>
      <button type="button" onClick={() => onRatingChange(3)}>3 Stars</button>
    </div>
  ),
}));

vi.mock('@components/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }: { children: string; onClick?: () => void; disabled?: boolean }) => (
    <button data-testid="button" type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe('ReviewForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the review form correctly', () => {
    render(<ReviewForm recipeId="1" onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Leave a Review')).toBeInTheDocument();
    expect(screen.getByText('Rating:')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your review here...')).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });

  it('allows the user to change the rating', () => {
    render(<ReviewForm recipeId="1" onSubmit={mockOnSubmit} />);

    const starRating = screen.getByTestId('star-rating');
    const oneStarButton = starRating.querySelector('button:nth-child(1)');
    if (oneStarButton) {
      fireEvent.click(oneStarButton);
    } else {
      throw new Error('One star button not found');
    }

    expect(mockUseReviewForm.handleRatingChange).toHaveBeenCalledWith(1);
  });

  it('allows the user to type a comment', () => {
    render(<ReviewForm recipeId="1" onSubmit={mockOnSubmit} />);

    const commentTextarea = screen.getByPlaceholderText('Write your review here...');
    fireEvent.change(commentTextarea, { target: { value: 'Great recipe!' } });

    expect(mockUseReviewForm.handleCommentChange).toHaveBeenCalledWith(expect.anything());
  });

  it('displays an error message if an error occurs', () => {
    mockUseReviewForm.error = 'An error occurred.';

    render(<ReviewForm recipeId="1" onSubmit={mockOnSubmit} />);

    expect(screen.getByText('An error occurred.')).toBeInTheDocument();
  });

  it('disables the submit button and shows "Submitting..." when loading', () => {
    mockUseReviewForm.loading = true;

    render(<ReviewForm recipeId="1" onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('Submitting...');
    expect(submitButton).toBeDisabled();
  });

  it('calls handleSubmit when the form is submitted', () => {
    render(<ReviewForm recipeId="1" onSubmit={mockOnSubmit} />);

    const form = document.querySelector('.review-form');
    if (!form) {
      throw new Error('Form not found');
    }
    fireEvent.submit(form);

    expect(mockUseReviewForm.handleSubmit).toHaveBeenCalled();
  });
});