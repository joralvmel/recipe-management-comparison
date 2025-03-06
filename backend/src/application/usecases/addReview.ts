import type { ReviewServicePort } from '@domain/ports/reviewServicePort';

export class addReview {
  constructor(private reviewService: ReviewServicePort) {}

  async execute(userId: string, recipeId: string, rating: number, content: string) {
    return this.reviewService.addReview(userId, recipeId, rating, content);
  }
}
