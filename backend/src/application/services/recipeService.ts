import axios from 'axios';

interface Recipe {
  id: number;
  title: string;
  image: string;
}

interface SearchRecipesResponse {
  results: Recipe[];
}

export class RecipeService {
  async searchRecipes(query: string): Promise<SearchRecipesResponse> {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const response = await axios.get<SearchRecipesResponse>(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&apiKey=${apiKey}`,
    );
    return response.data;
  }
}
