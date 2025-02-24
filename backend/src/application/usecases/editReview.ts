import { ReviewServicePort } from '@domain/ports/reviewServicePort';

export class editReview {
  constructor(private reviewService: ReviewServicePort) {}

  async execute(reviewId: string, reviewData: { rating?: number; content?: string }) {
    return this.reviewService.editReview(reviewId, reviewData);
  }
}
