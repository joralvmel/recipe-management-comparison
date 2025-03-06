import { getRecipeReviews } from '@application/usecases/getRecipeReviews';
import type { ReviewServicePort } from '@domain/ports/reviewServicePort';
import type { Review } from '@domain/entities/Review';

describe('getRecipeReviews', () => {
    let reviewServiceMock: jest.Mocked<ReviewServicePort>;
    let useCase: getRecipeReviews;

    beforeEach(() => {
        reviewServiceMock = {
            getReviewsByRecipe: jest.fn(),
            addReview: jest.fn(),
            editReview: jest.fn(),
        } as jest.Mocked<ReviewServicePort>;

        useCase = new getRecipeReviews(reviewServiceMock);
    });

    it('should call getReviewsByRecipe on the reviewService with correct parameters', async () => {
        const recipeId = 'recipe123';

        await useCase.execute(recipeId);

        expect(reviewServiceMock.getReviewsByRecipe).toHaveBeenCalledWith(recipeId);
    });

    it('should return the result from reviewService.getReviewsByRecipe', async () => {
        const recipeId = 'recipe123';
        const expectedResult: Review[] = [
            { id: 'review1', userId: 'user1', recipeId: 'recipe123', content: 'Great recipe!', rating: 5 },
            { id: 'review2', userId: 'user2', recipeId: 'recipe123', content: 'Not bad', rating: 3 },
        ];

        reviewServiceMock.getReviewsByRecipe.mockResolvedValue(expectedResult);

        const result = await useCase.execute(recipeId);

        expect(result).toEqual(expectedResult);
    });
});
