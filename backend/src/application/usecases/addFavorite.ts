import type { FavoriteServicePort } from '@domain/ports/favoriteServicePort';

export class addFavorite {
  constructor(private favoriteService: FavoriteServicePort) {}

  async execute(userId: string, recipeId: string) {
    return this.favoriteService.addFavorite(userId, recipeId);
  }
}
