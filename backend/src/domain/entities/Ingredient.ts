export class Ingredient {
  public id?: string;
  public externalId?: number;
  public nameClean: string;
  public image?: string;
  public amount: number;
  public unitShort: string;

  constructor(nameClean: string, amount: number, unitShort: string, externalId?: number, image?: string) {
    this.nameClean = nameClean;
    this.amount = amount;
    this.unitShort = unitShort;
    this.externalId = externalId;
    this.image = image;
  }
}
