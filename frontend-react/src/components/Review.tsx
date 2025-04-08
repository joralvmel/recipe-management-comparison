import type React from 'react';
import { useState } from 'react';
import StarRating from './StarRating';
import Button from './Button';

interface ReviewProps {
  name: string;
  rating: number;
  date: string;
  comment: string;
  canEdit: boolean;
}

const Review: React.FC<ReviewProps> = ({ name, rating, date, comment, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);
  const [editedRating, setEditedRating] = useState(rating);
  const [currentComment, setCurrentComment] = useState(comment);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleEditClick = () => {
    if (isEditing) {
      setCurrentComment(editedComment);
      setCurrentRating(editedRating);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelClick = () => {
    setEditedComment(currentComment);
    setEditedRating(currentRating);
    setIsEditing(false);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedComment(e.target.value);
  };

  const handleRatingChange = (newRating: number) => {
    setEditedRating(newRating);
  };

  return (
    <div className="review">
      <div className="review-header">
        <div className="rating">
          <label htmlFor={`review-${name}`}>{name}:</label>
          <StarRating rating={editedRating} name={name} readOnly={!isEditing} onRatingChange={handleRatingChange} />
        </div>
        <div className="date-edit">
          {canEdit && (
            <>
              <Button size="small" type={isEditing ? 'primary' : 'secondary'} onClick={handleEditClick}>
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              {isEditing && (
                <Button size="small" type="tertiary" onClick={handleCancelClick}>
                  Cancel
                </Button>
              )}
            </>
          )}
          <div className="review-date">{date}</div>
        </div>
      </div>
      {isEditing ? (
        <textarea
          className="input-textarea review-comment-edit"
          value={editedComment}
          onChange={handleCommentChange}
        />
      ) : (
        <p className="review-comment">{currentComment}</p>
      )}
    </div>
  );
};

export default Review;
