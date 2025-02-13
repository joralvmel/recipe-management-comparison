export class Ingredient {
  public id?: string;
  public externalId?: number;
  public name: string;
  public amount?: number;
  public unit?: string;
  public image?: string;

  constructor(
    name: string,
    amount?: number,
    unit?: string,
    externalId?: number,
    image?: string,
  ) {
    this.name = name;
    this.amount = amount;
    this.unit = unit;
    this.externalId = externalId;
    this.image = image;
  }
}
