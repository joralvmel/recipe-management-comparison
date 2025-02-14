export class Ingredient {
  public id?: string;
  public externalId?: number;
  public nameClean: string;
  public amount?: number;
  public unit?: string;
  public image?: string;

  constructor(
    nameClean: string,
    amount?: number,
    unit?: string,
    externalId?: number,
    image?: string,
  ) {
    this.nameClean = nameClean;
    this.amount = amount;
    this.unit = unit;
    this.externalId = externalId;
    this.image = image;
  }
}
