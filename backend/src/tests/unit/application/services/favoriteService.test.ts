import { FavoriteService } from '@application/services/favoriteService';
import { FavoriteRepository } from '@infrastructure/repositories/favoriteRepository';
import { Favorite } from '@domain/entities/Favorite';
import { ResourceAlreadyExistsError, ResourceNotFoundError } from '@shared/errors/customErrors';

jest.mock('@infrastructure/repositories/favoriteRepository');

describe('FavoriteService', () => {
  let favoriteService: FavoriteService;
  let favoriteRepository: jest.Mocked<FavoriteRepository>;

  beforeEach(() => {
    favoriteRepository = new FavoriteRepository() as jest.Mocked<FavoriteRepository>;
    favoriteService = new FavoriteService();
    (favoriteService as any).favoriteRepository = favoriteRepository;
  });

  describe('addFavorite', () => {
    it('should add a favorite successfully', async () => {
      favoriteRepository.getFavoritesByUser.mockResolvedValue([]);
      favoriteRepository.addFavorite.mockResolvedValue(new Favorite('user1', 'recipe1'));

      const result = await favoriteService.addFavorite('user1', 'recipe1');

      expect(result).toEqual(new Favorite('user1', 'recipe1'));
      expect(favoriteRepository.addFavorite).toHaveBeenCalledWith(new Favorite('user1', 'recipe1'));
    });

    it('should throw ResourceAlreadyExistsError if favorite already exists', async () => {
      favoriteRepository.getFavoritesByUser.mockResolvedValue([new Favorite('user1', 'recipe1')]);

      await expect(favoriteService.addFavorite('user1', 'recipe1')).rejects.toThrow(ResourceAlreadyExistsError);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', async () => {
      favoriteRepository.getFavoritesByUser.mockResolvedValue([new Favorite('user1', 'recipe1')]);
      favoriteRepository.removeFavorite.mockResolvedValue();

      await favoriteService.removeFavorite('user1', 'recipe1');

      expect(favoriteRepository.removeFavorite).toHaveBeenCalledWith('user1', 'recipe1');
    });

    it('should throw ResourceNotFoundError if favorite does not exist', async () => {
      favoriteRepository.getFavoritesByUser.mockResolvedValue([]);

      await expect(favoriteService.removeFavorite('user1', 'recipe1')).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe('getFavoritesByUser', () => {
    it('should return favorites for a user', async () => {
      const favorites = [new Favorite('user1', 'recipe1'), new Favorite('user1', 'recipe2')];
      favoriteRepository.getFavoritesByUser.mockResolvedValue(favorites);

      const result = await favoriteService.getFavoritesByUser('user1');

      expect(result).toEqual(favorites);
      expect(favoriteRepository.getFavoritesByUser).toHaveBeenCalledWith('user1');
    });
  });
});
