// infrastructure/repositories/favoriteRepository.ts
import { FavoriteRepositoryPort } from '@domain/ports/favoriteRepositoryPort';
import { FavoriteModel } from './favoriteSchema';
import { Favorite } from '@domain/entities/Favorite';

export class FavoriteRepository implements FavoriteRepositoryPort {
  async addFavorite(favorite: Favorite): Promise<Favorite> {
    const newFavorite = new FavoriteModel(favorite);
    await newFavorite.save();
    return newFavorite.toObject();
  }

  async removeFavorite(userId: string, recipeId: string): Promise<void> {
    await FavoriteModel.deleteOne({ userId, recipeId });
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return FavoriteModel.find({ userId }).lean().exec();
  }
}
