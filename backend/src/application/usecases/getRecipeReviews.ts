import { ReviewServicePort } from '@domain/ports/reviewServicePort';

export class getRecipeReviews {
  constructor(private reviewService: ReviewServicePort) {}

  async execute(recipeId: string) {
    return this.reviewService.getReviewsByRecipe(recipeId);
  }
}
