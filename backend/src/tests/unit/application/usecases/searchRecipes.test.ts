import { searchRecipes } from '@application/usecases/searchRecipes';
import { RecipeServicePort } from '@domain/ports/recipeServicePort';

jest.mock('@application/services/recipeService', () => {
    return {
        RecipeService: jest.fn().mockImplementation(() => {
            return {
                searchRecipes: jest.fn((options) => {
                    if (options.query === 'valid-query') {
                        return Promise.resolve([{ id: 1, title: 'Test Recipe', image: 'test.jpg' }]);
                    } else {
                        return Promise.resolve([]);
                    }
                }),
            };
        }),
    };
});

describe('searchRecipes', () => {
    let recipeService: RecipeServicePort;

    beforeEach(() => {
        recipeService = new (require('@application/services/recipeService').RecipeService)();
    });

    it('should return recipes for a valid query', async () => {
        const options = { query: 'valid-query' };
        const result = await searchRecipes(options);
        expect(result).toEqual([{ id: 1, title: 'Test Recipe', image: 'test.jpg' }]);
    });

    it('should return an empty array for an invalid query', async () => {
        const options = { query: 'invalid-query' };
        const result = await searchRecipes(options);
        expect(result).toEqual([]);
    });

    it('should return an empty array if no options are provided', async () => {
        const result = await searchRecipes({});
        expect(result).toEqual([]);
    });
});
