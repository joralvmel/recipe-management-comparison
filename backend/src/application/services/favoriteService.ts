import { FavoriteServicePort } from '@domain/ports/favoriteServicePort';
import { FavoriteRepository } from '@infrastructure/repositories/favoriteRepository';
import { Favorite } from '@domain/entities/Favorite';

export class FavoriteService implements FavoriteServicePort {
  private favoriteRepository: FavoriteRepository;

  constructor() {
    this.favoriteRepository = new FavoriteRepository();
  }

  async addFavorite(userId: string, recipeId: string): Promise<Favorite> {
    const existingFavorite = await this.favoriteRepository.getFavoritesByUser(userId);
    if (existingFavorite.some((fav) => fav.recipeId === recipeId)) {
      throw new Error('Favorite already exists');
    }
    const favorite = new Favorite(userId, recipeId);
    return this.favoriteRepository.addFavorite(favorite);
  }

  async removeFavorite(userId: string, recipeId: string): Promise<void> {
    const existingFavorite = await this.favoriteRepository.getFavoritesByUser(userId);
    if (!existingFavorite.some((fav) => fav.recipeId === recipeId)) {
      throw new Error('Favorite does not exist');
    }
    return this.favoriteRepository.removeFavorite(userId, recipeId);
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.getFavoritesByUser(userId);
  }
}
