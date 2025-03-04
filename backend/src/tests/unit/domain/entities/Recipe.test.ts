import { Recipe } from '@domain/entities/Recipe';
import { Ingredient } from '@domain/entities/Ingredient';

describe('Recipe', () => {
  it('should create a Recipe instance with the given parameters', () => {
    const externalId = 1;
    const title = 'Recipe 1';
    const servings = 4;
    const extendedIngredients = [
      new Ingredient('Tomato', 200, 'g', 123, 'tomato.jpg'),
    ];
    const analyzedInstructions = ['Step 1', 'Step 2'];
    const image = 'image1.jpg';
    const readyInMinutes = 30;
    const healthScore = 80;
    const cuisines = ['Italian'];
    const dishTypes = ['main course'];
    const diets = ['vegan'];

    const recipe = new Recipe(
      externalId,
      title,
      servings,
      extendedIngredients,
      analyzedInstructions,
      image,
      readyInMinutes,
      healthScore,
      cuisines,
      dishTypes,
      diets,
    );

    expect(recipe.externalId).toBe(externalId);
    expect(recipe.title).toBe(title);
    expect(recipe.servings).toBe(servings);
    expect(recipe.extendedIngredients).toBe(extendedIngredients);
    expect(recipe.analyzedInstructions).toBe(analyzedInstructions);
    expect(recipe.image).toBe(image);
    expect(recipe.readyInMinutes).toBe(readyInMinutes);
    expect(recipe.healthScore).toBe(healthScore);
    expect(recipe.cuisines).toBe(cuisines);
    expect(recipe.dishTypes).toBe(dishTypes);
    expect(recipe.diets).toBe(diets);
  });
});
