import { RecipeService } from '@application/services/recipeService';
import { RecipeModel, IRecipe } from '@infrastructure/repositories/recipeSchema';

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
