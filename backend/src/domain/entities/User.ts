export class User {
  public id?: string;
  public name: string;
  public email: string;
  public passwordHash: string;
  public createdAt?: Date;

  constructor(
    name: string,
    email: string,
    passwordHash: string,
    createdAt?: Date,
  ) {
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }
}