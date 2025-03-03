import { removeFavorite } from '@application/usecases/removeFavorite';
import { FavoriteServicePort } from '@domain/ports/favoriteServicePort';

describe('removeFavorite', () => {
    let favoriteServiceMock: jest.Mocked<FavoriteServicePort>;
    let useCase: removeFavorite;

    beforeEach(() => {
        favoriteServiceMock = {
            getFavoritesByUser: jest.fn(),
            addFavorite: jest.fn(),
            removeFavorite: jest.fn(),
        } as jest.Mocked<FavoriteServicePort>;

        useCase = new removeFavorite(favoriteServiceMock);
    });

    it('should call removeFavorite on the favoriteService with correct parameters', async () => {
        const userId = 'user123';
        const recipeId = 'recipe123';

        await useCase.execute(userId, recipeId);

        expect(favoriteServiceMock.removeFavorite).toHaveBeenCalledWith(userId, recipeId);
    });

    it('should return void when removeFavorite is called', async () => {
        const userId = 'user123';
        const recipeId = 'recipe123';

        favoriteServiceMock.removeFavorite.mockResolvedValue(undefined);

        const result = await useCase.execute(userId, recipeId);

        expect(result).toBeUndefined();
    });
});
