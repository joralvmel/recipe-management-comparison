import { Ingredient } from './Ingredient';

export class Recipe {
  public id?: string;
  public externalId: number;
  public title: string;
  public image?: string;
  public readyInMinutes?: number;
  public healthScore?: number;
  public cuisines?: string[];
  public dishTypes?: string[];
  public diets?: string[];
  public servings: number;
  public ingredients: Ingredient[];
  public analyzedInstructions: string[];

  constructor(
    externalId: number,
    title: string,
    servings: number,
    ingredients: Ingredient[],
    analyzedInstructions: string[],
    image?: string,
    readyInMinutes?: number,
    healthScore?: number,
    cuisines?: string[],
    dishTypes?: string[],
    diets?: string[],
  ) {
    this.externalId = externalId;
    this.title = title;
    this.servings = servings;
    this.ingredients = ingredients;
    this.analyzedInstructions = analyzedInstructions;
    this.image = image;
    this.readyInMinutes = readyInMinutes;
    this.healthScore = healthScore;
    this.cuisines = cuisines;
    this.dishTypes = dishTypes;
    this.diets = diets;
  }
}
