import { toRecipeDTO } from '@shared/mappers/RecipeMapper';
import { Recipe } from '@application/interfaces/recipeInterfaces';

describe('toRecipeDTO', () => {
    it('should map an object to Recipe correctly', () => {
        const recipe = {
            id: 1,
            title: 'Test Recipe',
            image: 'test-image.jpg'
        };

        const expectedDTO: Recipe = {
            id: 1,
            title: 'Test Recipe',
            image: 'test-image.jpg'
        };

        const result = toRecipeDTO(recipe);
        expect(result).toEqual(expectedDTO);
    });
});
