import axios from 'axios';
import { RecipeModel } from '@infrastructure/repositories/recipeSchema';
import type { SearchOptions,  RecipeSearchResponse, RecipeDetail, Ingredient } from '@application/interfaces/recipeInterfaces';
import type { RecipeServicePort } from '@domain/ports/recipeServicePort';
import { toRecipeDTO } from '@shared/mappers/RecipeMapper';
import { toRecipeDetailDTO } from '@shared/mappers/RecipeDetailMapper';
import type { RecipeDetailDTO } from '@shared/dtos/RecipeDTO';
import { ResourceNotFoundError, ExternalServiceError, type CustomError } from '@shared/errors/customErrors';
import { RecipeSearchModel } from '@infrastructure/repositories/recipeSearchSchema';

export class RecipeService implements RecipeServicePort {
  async searchRecipes(options: SearchOptions): Promise<RecipeSearchResponse> {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const params = new URLSearchParams();
    params.append('addRecipeInformation', "true");
    params.append('instructionsRequired', "true");

    if (!apiKey) {
      throw new Error('API key is missing');
    }

    if (options.query) {
      params.append('query', options.query);
    }
    if (options.cuisine) {
      params.append('cuisine', options.cuisine);
    }
    if (options.diet) {
      params.append('diet', options.diet);
    }
    if (options.intolerances) {
      params.append('intolerances', options.intolerances);
    }
    if (options.mealType) {
      params.append('type', options.mealType);
    }
    if (options.offset !== undefined) {
      params.append('offset', options.offset.toString());
    }
    if (options.number !== undefined) {
      params.append('number', options.number.toString());
    }
    params.append('apiKey', apiKey);

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;

    try {
      const response = await axios.get<{
        results: {
          id: number;
          title: string;
          image: string;
          imageType: string,
          readyInMinutes:number,
          healthScore:number,
          cuisines: string[],
          dishTypes: string[],
          diets: string[]
        }[];
        offset: number;
        number: number;
        totalResults: number;
      }>(url);

      const { results, offset, number, totalResults } = response.data;
      const mappedRecipes = results.map(toRecipeDTO);

      await Promise.all(
        mappedRecipes.map(async (recipe) => {
          const existing = await RecipeSearchModel.findOne({ id: recipe.id });
          if (!existing) {
            await RecipeSearchModel.create(recipe);
          }
        }),
      );

      return {
        results: mappedRecipes,
        offset,
        number,
        totalResults,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ExternalServiceError(
          `Error fetching recipes: ${error.response?.status} ${error.response?.statusText}`,
        );
      }
      throw new ExternalServiceError('An unexpected error occurred');
    }
  }

  async getRecipeDetail(recipeId: string): Promise<RecipeDetailDTO | null> {
    try {
      let recipe = await RecipeModel.findOne({ externalId: Number(recipeId) });
      if (recipe) {
        return toRecipeDetailDTO(recipe);
      }

      const apiKey = process.env.SPOONACULAR_API_KEY;
      const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
      const response = await axios.get<RecipeDetail>(url);
      const externalRecipeData = response.data;

      const analyzedInstructions = Array.isArray(externalRecipeData.analyzedInstructions)
        ? externalRecipeData.analyzedInstructions
            .flatMap((instruction: { steps: { step: string }[] }) => instruction.steps)
            .map((step: { step: string }) => step.step)
        : [];

      const extendedIngredients = Array.isArray(externalRecipeData.extendedIngredients)
        ? externalRecipeData.extendedIngredients.map((ing: Ingredient) => ({
            externalId: ing.id,
            nameClean: ing.nameClean,
            amount: ing.measures.metric.amount,
            unitShort: ing.measures.metric.unitShort,
            image: `https://img.spoonacular.com/ingredients_100x100/${ing.image}`,
          }))
        : [];

      const mappedRecipe = {
        externalId: externalRecipeData.id,
        title: externalRecipeData.title,
        image: externalRecipeData.image,
        readyInMinutes: externalRecipeData.readyInMinutes,
        healthScore: externalRecipeData.healthScore,
        cuisines: externalRecipeData.cuisines || [],
        dishTypes: externalRecipeData.dishTypes || [],
        diets: externalRecipeData.diets || [],
        servings: externalRecipeData.servings,
        analyzedInstructions: analyzedInstructions,
        extendedIngredients: extendedIngredients,
      };

      recipe = await RecipeModel.create(mappedRecipe);
      return toRecipeDetailDTO(recipe);
    } catch (error) {
      const err: CustomError = error as CustomError;
      if (err.response && err.response.status === 404) {
        throw new ResourceNotFoundError('Recipe not found');
      }
      if (axios.isAxiosError(error)) {
        throw new ExternalServiceError(
          `Error fetching recipe detail: ${err.response?.status} ${err.response?.statusText}`,
        );
      }
      throw new ExternalServiceError('An unexpected error occurred');
    }
  }
}
