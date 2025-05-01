export interface RecipeType {
  _id: {
    $oid: string;
  };
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
}
