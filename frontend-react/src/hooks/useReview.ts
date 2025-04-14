import { useState, useCallback } from 'react';

interface UseReviewProps {
  id: string;
  comment: string;
  rating: number;
  onSave: (reviewId: string, rating: number, content: string) => void;
}

const useReview = ({ id, comment, rating, onSave }: UseReviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);
  const [editedRating, setEditedRating] = useState(rating);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    setEditedComment(comment);
    setEditedRating(rating);
    setIsEditing(false);
  }, [comment, rating]);

  const handleSaveClick = useCallback(() => {
    onSave(id, editedRating, editedComment);
    setIsEditing(false);
  }, [id, editedRating, editedComment, onSave]);

  return {
    isEditing,
    editedComment,
    editedRating,
    setEditedComment,
    setEditedRating,
    handleEditClick,
    handleCancelClick,
    handleSaveClick,
  };
};

export default useReview;
