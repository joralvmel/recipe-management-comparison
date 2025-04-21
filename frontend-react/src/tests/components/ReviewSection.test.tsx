import type { ReviewType } from '@src/types';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ReviewSection from '@components/ReviewSection';
import '@testing-library/jest-dom';
import { useAuth } from '@context/AuthContext';

type AuthContextType = ReturnType<typeof useAuth>;

vi.mock('@components/ReviewForm', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (rating: number, content: string) => void }) => (
    <div data-testid="review-form">
      <button
        type="button"
        onClick={() => onSubmit(5, 'Great recipe!')}
        data-testid="submit-review"
      >
        Submit Review
      </button>
    </div>
  ),
}));

vi.mock('@components/ReviewList', () => ({
  __esModule: true,
  default: ({
              reviews,
              onSave,
            }: {
    reviews: ReviewType[];
    onSave: (id: string, rating: number, content: string) => void;
  }) => (
    <div data-testid="review-list">
      {reviews.map((r) => (
        <div key={r._id} data-testid="review">
          <p>{`ID: ${r._id}`}</p>
          <p>{`Content: ${r.content}`}</p>
          <button
            type="button"
            onClick={() => onSave(r._id, 4, 'Updated review')}
            data-testid="save-review"
          >
            Save Review
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@components/Loader', () => ({
  __esModule: true,
  default: ({ message }: { message: string }) => (
    <div data-testid="loader">{message}</div>
  ),
}));

const mockUseReviews = vi.fn();
vi.mock('@hooks/useReviews', () => ({
  useReviews: (recipeId: string) => mockUseReviews(recipeId),
}));

vi.mock('@context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: vi.fn(),
}));

describe('<ReviewSection />', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loader and empty list when loading is true', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: {
        id: 'user1',
        token: 'mock-token',
        email: 'user1@example.com',
        name: 'User One',
        password: 'mock-password',
      },
      isSignedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockUseReviews.mockReturnValue({
      reviews: [],
      loading: true,
      addNewReview: vi.fn(),
      updateExistingReview: vi.fn(),
    });

    render(<ReviewSection recipeId="1" />);

    expect(screen.getByTestId('loader')).toHaveTextContent('Loading reviews...');
    expect(screen.getByTestId('review-list')).toBeEmptyDOMElement();
    expect(screen.getByTestId('review-form')).toBeInTheDocument();
  });

  it('renders ReviewForm if signed in and user has not yet reviewed', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: {
        id: 'user1',
        token: 'mock-token',
        email: 'user1@example.com',
        name: 'User One',
        password: 'mock-password',
      },
      isSignedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockUseReviews.mockReturnValue({
      reviews: [
        { _id: '2', userId: 'user2', recipeId: 'recipe1', rating: 4, content: 'Good!' },
      ],
      loading: false,
      addNewReview: vi.fn(),
      updateExistingReview: vi.fn(),
    });

    render(<ReviewSection recipeId="1" />);
    expect(screen.getByTestId('review-form')).toBeInTheDocument();
  });

  it('does not render ReviewForm if user already reviewed', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: {
        id: 'user1',
        token: 'mock-token',
        email: 'user1@example.com',
        name: 'User One',
        password: 'mock-password',
      },
      isSignedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockUseReviews.mockReturnValue({
      reviews: [
        { _id: '1', userId: 'user1', recipeId: 'recipe1', rating: 5, content: 'Amazing!' },
      ],
      loading: false,
      addNewReview: vi.fn(),
      updateExistingReview: vi.fn(),
    });

    render(<ReviewSection recipeId="1" />);
    expect(screen.queryByTestId('review-form')).not.toBeInTheDocument();
  });

  it('renders all reviews in ReviewList', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: {
        id: 'user1',
        token: 'mock-token',
        email: 'user1@example.com',
        name: 'User One',
        password: 'mock-password',
      },
      isSignedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockUseReviews.mockReturnValue({
      reviews: [
        { _id: '1', userId: 'user1', recipeId: 'recipe1', rating: 5, content: 'Amazing!' },
        { _id: '2', userId: 'user2', recipeId: 'recipe1', rating: 4, content: 'Good!' },
      ],
      loading: false,
      addNewReview: vi.fn(),
      updateExistingReview: vi.fn(),
    });

    render(<ReviewSection recipeId="1" />);
    const items = screen.getAllByTestId('review');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('ID: 1');
    expect(items[1]).toHaveTextContent('ID: 2');
  });

  it('calls addNewReview on submit', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: {
        id: 'user1',
        token: 'mock-token',
        email: 'user1@example.com',
        name: 'User One',
        password: 'mock-password',
      },
      isSignedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    const addNew = vi.fn();
    mockUseReviews.mockReturnValue({
      reviews: [],
      loading: false,
      addNewReview: addNew,
      updateExistingReview: vi.fn(),
    });

    render(<ReviewSection recipeId="1" />);
    fireEvent.click(screen.getByTestId('submit-review'));
    expect(addNew).toHaveBeenCalledWith(5, 'Great recipe!', 'Bearer mock-token');
  });

  it('calls updateExistingReview on save', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: {
        id: 'user1',
        token: 'mock-token',
        email: 'user1@example.com',
        name: 'User One',
        password: 'mock-password',
      },
      isSignedIn: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    const update = vi.fn();
    mockUseReviews.mockReturnValue({
      reviews: [
        { _id: '1', userId: 'user1', recipeId: 'recipe1', rating: 5, content: 'Amazing!' },
      ],
      loading: false,
      addNewReview: vi.fn(),
      updateExistingReview: update,
    });

    render(<ReviewSection recipeId="1" />);
    fireEvent.click(screen.getByTestId('save-review'));
    expect(update).toHaveBeenCalledWith('1', 4, 'Updated review', 'Bearer mock-token');
  });

  it('renders nothing if not signed in and no reviews', () => {
    (useAuth as jest.Mock<AuthContextType>).mockReturnValue({
      user: null,
      isSignedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockUseReviews.mockReturnValue({
      reviews: [],
      loading: false,
      addNewReview: vi.fn(),
      updateExistingReview: vi.fn(),
    });

    const { container } = render(<ReviewSection recipeId="1" />);
    expect(container.firstChild).toBeNull();
  });
});