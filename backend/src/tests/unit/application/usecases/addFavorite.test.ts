import { addFavorite } from '@application/usecases/addFavorite';
import { FavoriteServicePort } from '@domain/ports/favoriteServicePort';
import { Favorite } from '@domain/entities/Favorite';

describe('addFavorite Use Case', () => {
  let favoriteServiceMock: jest.Mocked<FavoriteServicePort>;
  let useCase: addFavorite;

  beforeEach(() => {
    favoriteServiceMock = {
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      getFavoritesByUser: jest.fn(),
    } as jest.Mocked<FavoriteServicePort>;

    useCase = new addFavorite(favoriteServiceMock);
  });

  it('should call addFavorite on the favoriteService with correct parameters', async () => {
    const userId = 'user123';
    const recipeId = 'recipe456';

    await useCase.execute(userId, recipeId);

    expect(favoriteServiceMock.addFavorite).toHaveBeenCalledWith(userId, recipeId);
  });

  it('should return the result from favoriteService.addFavorite', async () => {
    const userId = 'user123';
    const recipeId = 'recipe456';
    const expectedResult: Favorite = {
      id: 'favorite789',
      userId,
      recipeId,
    };

    favoriteServiceMock.addFavorite.mockResolvedValue(expectedResult);

    const result = await useCase.execute(userId, recipeId);

    expect(result).toEqual(expectedResult);
  });
});
