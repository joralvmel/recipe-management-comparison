import { FavoriteServicePort } from '@domain/ports/favoriteServicePort';

export class removeFavorite {
  constructor(private favoriteService: FavoriteServicePort) {}

  async execute(userId: string, recipeId: string): Promise<void> {
    return this.favoriteService.removeFavorite(userId, recipeId);
  }
}
