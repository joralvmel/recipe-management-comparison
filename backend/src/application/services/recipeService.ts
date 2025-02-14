import axios from 'axios';

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

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
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

  async getRecipeDetail(recipeId: string): Promise<RecipeDetail> {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
    const response = await axios.get<RecipeDetail>(url);
    return response.data;
  }
}
