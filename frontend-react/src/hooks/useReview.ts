import { useState, useCallback, useEffect } from 'react';
import { fetchUserById } from '../services/authService';

interface UseReviewProps {
  id: string;
  userId: string;
  comment: string;
  rating: number;
  onSave: (reviewId: string, rating: number, content: string) => void;
}

const useReview = ({ id, userId, comment, rating, onSave }: UseReviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);
  const [editedRating, setEditedRating] = useState(rating);
  const [userName, setUserName] = useState<string>('Loading...');

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

  useEffect(() => {
    const fetchName = async () => {
      try {
        const user = await fetchUserById(userId);
        setUserName(user.name);
      } catch (error) {
        console.error('Failed to fetch user name:', error);
        setUserName('Unknown');
      }
    };

    fetchName();
  }, [userId]);

  return {
    isEditing,
    editedComment,
    editedRating,
    setEditedComment,
    setEditedRating,
    handleEditClick,
    handleCancelClick,
    handleSaveClick,
    userName,
  };
};

export default useReview;
