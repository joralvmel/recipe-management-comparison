import { getRecipeDetail } from '@application/usecases/getRecipeDetail';
import { RecipeServicePort } from '@domain/ports/recipeServicePort';
import { BadRequestError } from '@shared/errors/customErrors';

jest.mock('@application/services/recipeService', () => {
    return {
        RecipeService: jest.fn().mockImplementation(() => {
            return {
                getRecipeDetail: jest.fn((recipeId: string) => {
                    if (recipeId === 'valid-id') {
                        return Promise.resolve({ id: 'valid-id', name: 'Test Recipe' });
                    } else {
                        return Promise.reject(new Error('Recipe not found'));
                    }
                }),
            };
        }),
    };
});

describe('getRecipeDetail', () => {
    let recipeService: RecipeServicePort;

    beforeEach(() => {
        recipeService = new (require('@application/services/recipeService').RecipeService)();
    });

    it('should throw BadRequestError if recipeId is missing', async () => {
        await expect(getRecipeDetail('')).rejects.toThrow(BadRequestError);
    });

    it('should return recipe details for a valid recipeId', async () => {
        const result = await getRecipeDetail('valid-id');
        expect(result).toEqual({ id: 'valid-id', name: 'Test Recipe' });
    });

    it('should throw an error if recipe is not found', async () => {
        await expect(getRecipeDetail('invalid-id')).rejects.toThrow('Recipe not found');
    });
});
