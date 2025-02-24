import { Favorite } from '@domain/entities/Favorite';

export interface FavoriteRepositoryPort {
  addFavorite(favorite: Favorite): Promise<Favorite>;
  removeFavorite(userId: string, recipeId: string): Promise<void>;
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
}
