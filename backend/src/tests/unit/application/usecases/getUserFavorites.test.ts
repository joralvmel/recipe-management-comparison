import { getUserFavorites } from '@application/usecases/getUserFavorites';
import type { FavoriteServicePort } from '@domain/ports/favoriteServicePort';
import type { Favorite } from '@domain/entities/Favorite';

describe('getUserFavorites', () => {
    let favoriteServiceMock: jest.Mocked<FavoriteServicePort>;
    let useCase: getUserFavorites;

    beforeEach(() => {
        favoriteServiceMock = {
            getFavoritesByUser: jest.fn(),
            addFavorite: jest.fn(),
            removeFavorite: jest.fn(),
        } as jest.Mocked<FavoriteServicePort>;

        useCase = new getUserFavorites(favoriteServiceMock);
    });

    it('should call getFavoritesByUser on the favoriteService with correct parameters', async () => {
        const userId = 'user123';

        await useCase.execute(userId);

        expect(favoriteServiceMock.getFavoritesByUser).toHaveBeenCalledWith(userId);
    });

    it('should return the result from favoriteService.getFavoritesByUser', async () => {
        const userId = 'user123';
        const expectedResult: Favorite[] = [
            { id: 'favorite1', userId: 'user123', recipeId: 'recipe1' },
            { id: 'favorite2', userId: 'user123', recipeId: 'recipe2' },
        ];

        favoriteServiceMock.getFavoritesByUser.mockResolvedValue(expectedResult);

        const result = await useCase.execute(userId);

        expect(result).toEqual(expectedResult);
    });
});
