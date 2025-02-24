export interface AddReviewDTO {
  rating: number;
  content: string;
}

export interface EditReviewDTO {
  rating?: number;
  content?: string;
}
