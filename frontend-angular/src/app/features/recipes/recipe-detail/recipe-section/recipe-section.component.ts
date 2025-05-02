import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeIngredientsComponent } from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-ingredients/recipe-ingredients.component';
import { RecipeWrapperComponent } from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-wrapper.component';
import { IngredientType } from '@models/recipe.model';

@Component({
  selector: 'app-recipe-section',
  standalone: true,
  imports: [CommonModule, RecipeIngredientsComponent, RecipeWrapperComponent],
  templateUrl: 'recipe-section.component.html',
})
export class RecipeSectionComponent {
  @Input() ingredients: IngredientType[] = [];
  @Input() servings = 1;
  @Input() originalServings = 1;
  @Input() readyInMinutes = 0;
  @Input() healthScore = 0;
  @Input() cuisines: string[] = [];
  @Input() dishTypes: string[] = [];
  @Input() diets: string[] = [];
  @Input() instructions: string[] = [];
}
