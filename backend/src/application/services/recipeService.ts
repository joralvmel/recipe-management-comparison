import axios from 'axios';
import { RecipeModel, IRecipe } from '@infrastructure/repositories/recipeSchema';

interface SearchOptions {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  mealType?: string;
  offset?: number;
  number?: number;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
}

interface RecipeSearchResponse {
  results: Recipe[];
}

interface Ingredient {
  id: number;
  nameClean: string;
  image: string;
  measures: {
    metric: {
      amount: number;
      unitShort: string;
    };
  };
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  servings: number;
  analyzedInstructions: { steps: { step: string }[] }[];
  extendedIngredients: Ingredient[];
}

export class RecipeService {
  async searchRecipes(options: SearchOptions): Promise<RecipeSearchResponse> {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const params = new URLSearchParams();

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
    params.append('apiKey', apiKey!);

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    const response = await axios.get<RecipeSearchResponse>(url);
    return response.data;
  }

  async getRecipeDetail(recipeId: string): Promise<IRecipe | null> {
    let recipe = await RecipeModel.findOne({ externalId: Number(recipeId) });
    if (recipe) {
      return recipe;
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
    const response = await axios.get<RecipeDetail>(url);
    const externalRecipeData = response.data;

    const analyzedInstructions = externalRecipeData.analyzedInstructions
      .flatMap((instruction: { steps: { step: string }[] }) => instruction.steps)
      .map((step: { step: string }) => step.step);

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
      analyzedInstructions: analyzedInstructions || [],
      ingredients: externalRecipeData.extendedIngredients.map((ing: Ingredient) => ({
        externalId: ing.id,
        nameClean: ing.nameClean,
        amount: ing.measures.metric.amount,
        unit: ing.measures.metric.unitShort,
        image: `https://img.spoonacular.com/ingredients_100x100/${ing.image}`,
      })),
    };

    recipe = await RecipeModel.create(mappedRecipe);
    return recipe;
  }
}
