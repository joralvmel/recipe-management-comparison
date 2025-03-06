import type { FavoriteRepository } from '@infrastructure/repositories/favoriteRepository';

export interface FavoriteInterface {
  favoriteRepository: FavoriteRepository;
}
