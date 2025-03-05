import { ReviewService } from '@application/services/reviewService';
import { ReviewRepository } from '@infrastructure/repositories/reviewRepository';
import { Review } from '@domain/entities/Review';
import { ForbiddenError, ResourceAlreadyExistsError, ResourceNotFoundError } from '@shared/errors/customErrors';
import { ReviewInterface } from '@application/interfaces/reviewInterface';

jest.mock('@infrastructure/repositories/reviewRepository');

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let reviewRepository: jest.Mocked<ReviewRepository>;

  beforeEach(() => {
    reviewRepository = new ReviewRepository() as jest.Mocked<ReviewRepository>;
    reviewService = new ReviewService();
    (reviewService as unknown as ReviewInterface).reviewRepository = reviewRepository;
  });

  describe('addReview', () => {
    it('should add a review successfully', async () => {
      reviewRepository.getReviewsByRecipe.mockResolvedValue([]);
      reviewRepository.addReview.mockResolvedValue(new Review('user1', 'recipe1', 5, 'Great recipe!'));

      const result = await reviewService.addReview('user1', 'recipe1', 5, 'Great recipe!');

      expect(result).toEqual(new Review('user1', 'recipe1', 5, 'Great recipe!'));
      expect(reviewRepository.addReview).toHaveBeenCalledWith(new Review('user1', 'recipe1', 5, 'Great recipe!'));
    });

    it('should throw ResourceAlreadyExistsError if review already exists', async () => {
      reviewRepository.getReviewsByRecipe.mockResolvedValue([new Review('user1', 'recipe1', 5, 'Great recipe!')]);

      await expect(reviewService.addReview('user1', 'recipe1', 5, 'Great recipe!')).rejects.toThrow(
        ResourceAlreadyExistsError,
      );
    });
  });

  describe('editReview', () => {
    it('should edit a review successfully', async () => {
      const existingReview = new Review('user1', 'recipe1', 5, 'Great recipe!');
      reviewRepository.getReviewById.mockResolvedValue(existingReview);
      reviewRepository.editReview.mockResolvedValue(new Review('user1', 'recipe1', 4, 'Good recipe!'));

      const result = await reviewService.editReview('user1', 'review1', { rating: 4, content: 'Good recipe!' });

      expect(result).toEqual(new Review('user1', 'recipe1', 4, 'Good recipe!'));
      expect(reviewRepository.editReview).toHaveBeenCalledWith('review1', { rating: 4, content: 'Good recipe!' });
    });

    it('should throw ResourceNotFoundError if review does not exist', async () => {
      reviewRepository.getReviewById.mockResolvedValue(null);

      await expect(
        reviewService.editReview('user1', 'review1', { rating: 4, content: 'Good recipe!' }),
      ).rejects.toThrow(ResourceNotFoundError);
    });

    it('should throw ForbiddenError if user is not authorized to edit the review', async () => {
      const existingReview = new Review('user2', 'recipe1', 5, 'Great recipe!');
      reviewRepository.getReviewById.mockResolvedValue(existingReview);

      await expect(
        reviewService.editReview('user1', 'review1', { rating: 4, content: 'Good recipe!' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getReviewsByRecipe', () => {
    it('should return reviews for a recipe', async () => {
      const reviews = [new Review('user1', 'recipe1', 5, 'Great recipe!'), new Review('user2', 'recipe1', 4, 'Good recipe!')];
      reviewRepository.getReviewsByRecipe.mockResolvedValue(reviews);

      const result = await reviewService.getReviewsByRecipe('recipe1');

      expect(result).toEqual(reviews);
      expect(reviewRepository.getReviewsByRecipe).toHaveBeenCalledWith('recipe1');
    });
  });
});
