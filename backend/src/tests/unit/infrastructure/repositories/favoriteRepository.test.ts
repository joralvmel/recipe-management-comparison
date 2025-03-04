import { FavoriteRepository } from '@infrastructure/repositories/favoriteRepository';
import { FavoriteModel } from '@infrastructure/repositories/favoriteSchema';
import { Favorite } from '@domain/entities/Favorite';

jest.mock('@infrastructure/repositories/favoriteSchema');

describe('FavoriteRepository', () => {
  let favoriteRepository: FavoriteRepository;

  beforeEach(() => {
    favoriteRepository = new FavoriteRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a favorite and return the added favorite', async () => {
      const favorite: Favorite = { userId: 'user1', recipeId: 'recipe1' };
      const savedFavorite = { ...favorite, _id: '1' };
      (FavoriteModel.prototype.save as jest.Mock).mockResolvedValue(savedFavorite);
      (FavoriteModel.prototype.toObject as jest.Mock).mockReturnValue(savedFavorite);

      const result = await favoriteRepository.addFavorite(favorite);

      expect(FavoriteModel).toHaveBeenCalledWith(favorite);
      expect(result).toEqual(savedFavorite);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by userId and recipeId', async () => {
      const userId = 'user1';
      const recipeId = 'recipe1';
      (FavoriteModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await favoriteRepository.removeFavorite(userId, recipeId);

      expect(FavoriteModel.deleteOne).toHaveBeenCalledWith({ userId, recipeId });
    });
  });

  describe('getFavoritesByUser', () => {
    it('should return a list of favorites for a user', async () => {
      const userId = 'user1';
      const favorites: Favorite[] = [{ userId, recipeId: 'recipe1' }, { userId, recipeId: 'recipe2' }];
      (FavoriteModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(favorites),
      });

      const result = await favoriteRepository.getFavoritesByUser(userId);

      expect(FavoriteModel.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(favorites);
    });
  });
});
