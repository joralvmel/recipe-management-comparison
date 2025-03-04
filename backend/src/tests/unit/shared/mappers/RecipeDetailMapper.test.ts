import { toRecipeDetailDTO } from '@shared/mappers/RecipeDetailMapper';
import { IRecipe } from '@infrastructure/repositories/recipeSchema';
import { RecipeDetailDTO } from '@shared/dtos/RecipeDTO';

describe('toRecipeDetailDTO', () => {
    it('should map IRecipe to RecipeDetailDTO correctly', () => {
        const recipe: Partial<IRecipe> = {
            externalId: 123,
            title: 'Test Recipe',
            image: 'test-image.jpg',
            readyInMinutes: 30,
            healthScore: 80,
            cuisines: ['Italian'],
            dishTypes: ['main course'],
            diets: ['vegetarian'],
            servings: 4,
            analyzedInstructions: ['Step 1', 'Step 2'],
            extendedIngredients: [
                { externalId: 1, nameClean: 'Ingredient 1', amount: 1, unitShort: 'unit', image: 'image1.jpg' },
                { externalId: 2, nameClean: 'Ingredient 2', amount: 2, unitShort: 'unit', image: 'image2.jpg' }
            ],
        };

        const expectedDTO: RecipeDetailDTO = {
            externalId: 123,
            title: 'Test Recipe',
            image: 'test-image.jpg',
            readyInMinutes: 30,
            healthScore: 80,
            cuisines: ['Italian'],
            dishTypes: ['main course'],
            diets: ['vegetarian'],
            servings: 4,
            analyzedInstructions: ['Step 1', 'Step 2'],
            extendedIngredients: [
                { externalId: 1, nameClean: 'Ingredient 1', amount: 1, unitShort: 'unit', image: 'image1.jpg' },
                { externalId: 2, nameClean: 'Ingredient 2', amount: 2, unitShort: 'unit', image: 'image2.jpg' }
            ],
        };

        const result = toRecipeDetailDTO(recipe as IRecipe);
        expect(result).toEqual(expectedDTO);
    });
});
