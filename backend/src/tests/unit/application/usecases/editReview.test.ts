import { editReview } from '@application/usecases/editReview';
import { ReviewServicePort } from '@domain/ports/reviewServicePort';
import { Review } from '@domain/entities/Review';

describe('editReview Use Case', () => {
  let reviewServiceMock: jest.Mocked<ReviewServicePort>;
  let useCase: editReview;

  beforeEach(() => {
    reviewServiceMock = {
      editReview: jest.fn(),
      addReview: jest.fn(),
      removeReview: jest.fn(),
      getReviewsByUser: jest.fn(),
      getReviewsByRecipe: jest.fn(),
    } as unknown as jest.Mocked<ReviewServicePort>;

    useCase = new editReview(reviewServiceMock);
  });

  it('should call editReview on the reviewService with correct parameters', async () => {
    const userId = 'user123';
    const reviewId = 'review456';
    const reviewData = { rating: 4, content: 'Updated review content' };

    await useCase.execute(userId, reviewId, reviewData);

    expect(reviewServiceMock.editReview).toHaveBeenCalledWith(userId, reviewId, reviewData);
  });

  it('should return the result from reviewService.editReview', async () => {
    const userId = 'user123';
    const reviewId = 'review456';
    const reviewData = { rating: 4, content: 'Updated review content' };
    const expectedResult: Review = {
      id: reviewId,
      userId,
      recipeId: 'recipe789',
      rating: 4,
      content: 'Updated review content',
    };

    reviewServiceMock.editReview.mockResolvedValue(expectedResult);

    const result = await useCase.execute(userId, reviewId, reviewData);

    expect(result).toEqual(expectedResult);
  });
});
