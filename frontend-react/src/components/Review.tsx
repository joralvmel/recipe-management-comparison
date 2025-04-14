import type React from 'react';
import useReview from '../hooks/useReview';
import StarRating from './StarRating';
import Button from './Button';

interface ReviewProps {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  canEdit: boolean;
  onSave: (reviewId: string, rating: number, content: string) => void;
}

const Review: React.FC<ReviewProps> = ({ id, name, rating, date, comment, canEdit, onSave }) => {
  const {
    isEditing,
    editedComment,
    editedRating,
    setEditedComment,
    setEditedRating,
    handleEditClick,
    handleCancelClick,
    handleSaveClick,
  } = useReview({ id, comment, rating, onSave });

  return (
    <div className="review">
      <div className="review-header">
        <div className="rating">
          <label htmlFor={`review-${id}`}>{name}:</label>
          <StarRating
            rating={editedRating}
            name={`review-${id}`}
            readOnly={!isEditing}
            onRatingChange={setEditedRating}
          />
        </div>
        <div className="date-edit">
          {canEdit && (
            !isEditing ? (
              <Button size="small" type="primary" onClick={handleEditClick}>
                Edit
              </Button>
            ) : (
              <>
                <Button size="small" type="primary" onClick={handleSaveClick}>
                  Save
                </Button>
                <Button size="small" type="tertiary" onClick={handleCancelClick}>
                  Cancel
                </Button>
              </>
            )
          )}
          <div className="review-date">{date}</div>
        </div>
      </div>
      {isEditing ? (
        <textarea
          className="input-textarea review-comment-edit"
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
        />
      ) : (
        <p className="review-comment">{comment}</p>
      )}
    </div>
  );
};

export default Review;
