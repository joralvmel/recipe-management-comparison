import { Ingredient } from '@domain/entities/Ingredient';

describe('Ingredient', () => {
  it('should create an Ingredient instance with the given parameters', () => {
    const nameClean = 'Tomato';
    const amount = 200;
    const unitShort = 'g';
    const externalId = 123;
    const image = 'tomato.jpg';

    const ingredient = new Ingredient(nameClean, amount, unitShort, externalId, image);

    expect(ingredient.nameClean).toBe(nameClean);
    expect(ingredient.amount).toBe(amount);
    expect(ingredient.unitShort).toBe(unitShort);
    expect(ingredient.externalId).toBe(externalId);
    expect(ingredient.image).toBe(image);
  });

  it('should create an Ingredient instance without optional parameters', () => {
    const nameClean = 'Tomato';
    const amount = 200;
    const unitShort = 'g';

    const ingredient = new Ingredient(nameClean, amount, unitShort);

    expect(ingredient.nameClean).toBe(nameClean);
    expect(ingredient.amount).toBe(amount);
    expect(ingredient.unitShort).toBe(unitShort);
    expect(ingredient.externalId).toBeUndefined();
    expect(ingredient.image).toBeUndefined();
  });
});
