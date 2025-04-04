import { toRecipeDTO } from '@shared/mappers/RecipeMapper';
import type { Recipe } from '@application/interfaces/recipeInterfaces';

describe('toRecipeDTO', () => {
    it('should map an object to Recipe correctly', () => {
        const recipe = {
            id: 1,
            title: 'test recipe',
            image: 'test-image.jpg',
            readyInMinutes: 30,
            healthScore: 80,
            cuisines: ['italian'],
            dishTypes: ['main course'],
            diets: ['vegetarian']
        };

        const expectedDTO: Recipe = {
            id: 1,
            title: 'Test Recipe',
            image: 'test-image.jpg',
            readyInMinutes: 30,
            healthScore: 80,
            cuisines: ['Italian'],
            dishTypes: ['Main Course'],
            diets: ['Vegetarian']
        };

        const result = toRecipeDTO(recipe);
        expect(result).toEqual(expectedDTO);
    });
});
