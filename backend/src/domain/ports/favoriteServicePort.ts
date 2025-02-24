import { Favorite } from '@domain/entities/Favorite';

export interface FavoriteServicePort {
  addFavorite(userId: string, recipeId: string): Promise<Favorite>;
  removeFavorite(userId: string, recipeId: string): Promise<void>;
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
}
