import { RecipeService } from '@application/services/recipeService';
import { RecipeModel, IRecipe } from '@infrastructure/repositories/recipeSchema';

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  image: string;
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
  instructions: string;
  extendedIngredients: Ingredient[];
}

export class RecipeCacheService {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  async fetchAndStoreRecipe(recipeId: string): Promise<IRecipe | null> {
    let recipe = await RecipeModel.findOne({ externalId: Number(recipeId) });
    if (recipe) {
      return recipe;
    }

    const externalRecipeData: RecipeDetail = await this.recipeService.getRecipeDetail(recipeId);

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
      instructions: externalRecipeData.instructions ? [externalRecipeData.instructions] : [],
      ingredients: externalRecipeData.extendedIngredients.map((ing: Ingredient) => ({
        externalId: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        image: ing.image,
      })),
    };

    recipe = await RecipeModel.create(mappedRecipe);
    return recipe;
  }
}
