import { Review } from '@domain/entities/Review';

describe('Review', () => {
  it('should create a Review instance with the given parameters', () => {
    const userId = 'user123';
    const recipeId = 'recipe456';
    const content = 'Great recipe!';
    const createdAt = new Date();
    const rating = 5;
    const id = 'review789';

    const review = new Review(userId, recipeId, rating, content, createdAt, id);

    expect(review.userId).toBe(userId);
    expect(review.recipeId).toBe(recipeId);
    expect(review.rating).toBe(rating);
    expect(review.content).toBe(content);
    expect(review.createdAt).toBe(createdAt);
    expect(review.id).toBe(id);
  });

  it('should create a Review instance without optional parameters', () => {
    const userId = 'user123';
    const recipeId = 'recipe456';
    const rating = 4;
    const content = 'Good recipe!';

    const review = new Review(userId, recipeId, rating, content);

    expect(review.userId).toBe(userId);
    expect(review.recipeId).toBe(recipeId);
    expect(review.rating).toBe(rating);
    expect(review.content).toBe(content);
    expect(review.createdAt).toBeUndefined();
    expect(review.id).toBeUndefined();
  });
});
