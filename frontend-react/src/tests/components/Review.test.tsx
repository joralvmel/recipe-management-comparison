import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Review from '@components/Review';

const mockUseReview = {
  isEditing: false,
  editedComment: 'This is a test comment.',
  editedRating: 4,
  setEditedComment: vi.fn(),
  setEditedRating: vi.fn(),
  handleEditClick: vi.fn(),
  handleCancelClick: vi.fn(),
  handleSaveClick: vi.fn(),
  userName: 'User-42',
};

vi.mock('@hooks/useReview', () => ({
  __esModule: true,
  default: () => mockUseReview,
}));

vi.mock('@components/StarRating', () => ({
  __esModule: true,
  default: ({ rating, readOnly }: { rating: number; readOnly: boolean }) => (
    <div data-testid="star-rating">
      {readOnly ? `Rating: ${rating}` : 'Editable Star Rating'}
    </div>
  ),
}));

vi.mock('@components/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: string; onClick: () => void }) => (
    <button data-testid="button" onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

describe('Review Component', () => {
  const mockOnSave = vi.fn();
  const props = {
    id: '1',
    userId: '42',
    rating: 4,
    date: '2025-04-21',
    comment: 'This is a test comment.',
    canEdit: true,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the review details correctly', () => {
    render(<Review {...props} />);

    expect(screen.getByText(`User-${props.userId}:`)).toBeInTheDocument();
    expect(screen.getByTestId('star-rating')).toHaveTextContent(`Rating: ${props.rating}`);
    expect(screen.getByText(props.date)).toBeInTheDocument();
    expect(screen.getByText(props.comment)).toBeInTheDocument();
  });

  it('displays an Edit button if the user can edit', () => {
    render(<Review {...props} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('enters edit mode when Edit button is clicked', () => {
    mockUseReview.isEditing = false;

    render(<Review {...props} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockUseReview.handleEditClick).toHaveBeenCalled();
  });

  it('displays Save and Cancel buttons in edit mode', () => {
    mockUseReview.isEditing = true;

    render(<Review {...props} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSave when Save button is clicked', () => {
    mockUseReview.isEditing = true;

    render(<Review {...props} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockUseReview.handleSaveClick).toHaveBeenCalled();
  });

  it('exits edit mode when Cancel button is clicked', () => {
    mockUseReview.isEditing = true;

    render(<Review {...props} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockUseReview.handleCancelClick).toHaveBeenCalled();
  });

  it('displays a textarea in edit mode for editing the comment', () => {
    mockUseReview.isEditing = true;
    mockUseReview.editedComment = 'Updated comment';

    render(<Review {...props} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Updated comment');
  });

  it('updates the comment when typing in the textarea', () => {
    mockUseReview.isEditing = true;

    render(<Review {...props} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New comment' } });

    expect(mockUseReview.setEditedComment).toHaveBeenCalledWith('New comment');
  });
});