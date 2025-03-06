export class Favorite {
  public id?: string;
  public userId: string;
  public recipeId: string;
  public createdAt?: Date;

  constructor(userId: string, recipeId: string, createdAt?: Date, id?: string) {
    this.userId = userId;
    this.recipeId = recipeId;
    this.createdAt = createdAt;
    this.id = id;
  }
}
