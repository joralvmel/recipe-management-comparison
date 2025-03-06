import { ReviewRepository } from '@infrastructure/repositories/reviewRepository';
import { ReviewModel } from '@infrastructure/repositories/reviewSchema';
import type { Review } from '@domain/entities/Review';

jest.mock('@infrastructure/repositories/reviewSchema');

describe('ReviewRepository', () => {
  let reviewRepository: ReviewRepository;

  beforeEach(() => {
    reviewRepository = new ReviewRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addReview', () => {
    it('should add a review and return the added review', async () => {
      const review: Review = { userId: 'user1', recipeId: 'recipe1', content: 'Great recipe!', rating: 5 };
      const savedReview = { ...review, _id: '1' };
      (ReviewModel.prototype.save as jest.Mock).mockResolvedValue(savedReview);
      (ReviewModel.prototype.toObject as jest.Mock).mockReturnValue(savedReview);

      const result = await reviewRepository.addReview(review);

      expect(ReviewModel).toHaveBeenCalledWith(review);
      expect(result).toEqual(savedReview);
    });
  });

  describe('editReview', () => {
    it('should edit a review and return the updated review', async () => {
      const reviewId = '1';
      const reviewData: Partial<Review> = { content: 'Updated content', rating: 4 };
      const updatedReview = {
        _id: reviewId,
        userId: 'user1',
        recipeId: 'recipe1',
        content: 'Updated content',
        rating: 4,
      };
      (ReviewModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedReview),
      });

      const result = await reviewRepository.editReview(reviewId, reviewData);

      expect(ReviewModel.findByIdAndUpdate).toHaveBeenCalledWith(reviewId, reviewData, { new: true });
      expect(result).toEqual(updatedReview);
    });
  });

  describe('getReviewsByRecipe', () => {
    it('should return a list of reviews for a recipe', async () => {
      const recipeId = 'recipe1';
      const reviews: Review[] = [
        { userId: 'user1', recipeId, content: 'Great recipe!', rating: 5 },
        { userId: 'user2', recipeId, content: 'Not bad', rating: 3 },
      ];
      (ReviewModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(reviews),
      });

      const result = await reviewRepository.getReviewsByRecipe(recipeId);

      expect(ReviewModel.find).toHaveBeenCalledWith({ recipeId });
      expect(result).toEqual(reviews);
    });
  });

  describe('getReviewById', () => {
    it('should return a review by its ID', async () => {
      const reviewId = '1';
      const review: Review = { userId: 'user1', recipeId: 'recipe1', content: 'Great recipe!', rating: 5 };
      (ReviewModel.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(review),
      });

      const result = await reviewRepository.getReviewById(reviewId);

      expect(ReviewModel.findById).toHaveBeenCalledWith(reviewId);
      expect(result).toEqual(review);
    });
  });
});
