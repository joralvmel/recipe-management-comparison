export interface ReviewType {
  _id: string;
  userId: string;
  recipeId: string;
  rating: number;
  content: string;
  createdAt: string;
}
