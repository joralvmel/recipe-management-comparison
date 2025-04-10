import type React from 'react';
import { useState } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);
  const [editedRating, setEditedRating] = useState(rating);

  const handleSaveClick = () => {
    onSave(id, editedRating, editedComment);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setEditedComment(comment);
    setEditedRating(rating);
    setIsEditing(false);
  };

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
            <div className="review-actions">
              {!isEditing ? (
                <Button size="small" type="primary" onClick={handleEditClick}>
                  Edit
                </Button>
              ) : (
                <div>
                  <Button size="small" type="primary" onClick={handleSaveClick}>
                    Save
                  </Button>
                  <Button size="small" type="tertiary" onClick={handleCancelClick}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
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
