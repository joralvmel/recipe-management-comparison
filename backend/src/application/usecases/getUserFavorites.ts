import { FavoriteServicePort } from '@domain/ports/favoriteServicePort';

export class getUserFavorites {
  constructor(private favoriteService: FavoriteServicePort) {}

  async execute(userId: string) {
    return this.favoriteService.getFavoritesByUser(userId);
  }
}
