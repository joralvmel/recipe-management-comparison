import { addReview } from '@application/usecases/addReview';
import type { ReviewServicePort } from '@domain/ports/reviewServicePort';
import type { Review } from '@domain/entities/Review';

describe('addReview Use Case', () => {
  let reviewServiceMock: jest.Mocked<ReviewServicePort>;
  let useCase: addReview;

  beforeEach(() => {
    reviewServiceMock = {
      addReview: jest.fn(),
      removeReview: jest.fn(),
      getReviewsByUser: jest.fn(),
      editReview: jest.fn(),
      getReviewsByRecipe: jest.fn(),
    } as unknown as jest.Mocked<ReviewServicePort>;

    useCase = new addReview(reviewServiceMock);
  });

  it('should call addReview on the reviewService with correct parameters', async () => {
    const userId = 'user123';
    const recipeId = 'recipe456';
    const rating = 5;
    const content = 'Great recipe!';

    await useCase.execute(userId, recipeId, rating, content);

    expect(reviewServiceMock.addReview).toHaveBeenCalledWith(userId, recipeId, rating, content);
  });

  it('should return the result from reviewService.addReview', async () => {
    const userId = 'user123';
    const recipeId = 'recipe456';
    const rating = 5;
    const content = 'Great recipe!';
    const expectedResult: Review = {
      id: 'review789',
      userId,
      recipeId,
      rating,
      content,
    };

    reviewServiceMock.addReview.mockResolvedValue(expectedResult);

    const result = await useCase.execute(userId, recipeId, rating, content);

    expect(result).toEqual(expectedResult);
  });
});
