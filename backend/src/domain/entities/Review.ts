export class Review {
  public id?: string;
  public userId: string;
  public recipeId: string;
  public rating: number;
  public content: string;
  public createdAt?: Date;

  constructor(
    userId: string,
    recipeId: string,
    rating: number,
    content: string,
    createdAt?: Date,
    id?: string,
  ) {
    this.userId = userId;
    this.recipeId = recipeId;
    this.rating = rating;
    this.content = content;
    this.createdAt = createdAt;
    this.id = id;
  }
}
