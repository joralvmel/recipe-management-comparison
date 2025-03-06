import { Favorite } from '@domain/entities/Favorite';

describe('Favorite', () => {
  it('should create a Favorite instance with the given parameters', () => {
    const userId = 'user123';
    const recipeId = 'recipe456';
    const createdAt = new Date();
    const id = 'fav789';

    const favorite = new Favorite(userId, recipeId, createdAt, id);

    expect(favorite.userId).toBe(userId);
    expect(favorite.recipeId).toBe(recipeId);
    expect(favorite.createdAt).toBe(createdAt);
    expect(favorite.id).toBe(id);
  });

  it('should create a Favorite instance without optional parameters', () => {
    const userId = 'user123';
    const recipeId = 'recipe456';

    const favorite = new Favorite(userId, recipeId);

    expect(favorite.userId).toBe(userId);
    expect(favorite.recipeId).toBe(recipeId);
    expect(favorite.createdAt).toBeUndefined();
    expect(favorite.id).toBeUndefined();
  });
});
