import axios from 'axios';

interface SearchOptions {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  mealType?: string;
}

export class RecipeService {
  async searchRecipes(options: SearchOptions): Promise<any> {
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
    params.append('apiKey', apiKey!);

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    const response = await axios.get(url);
    return response.data;
  }
}
