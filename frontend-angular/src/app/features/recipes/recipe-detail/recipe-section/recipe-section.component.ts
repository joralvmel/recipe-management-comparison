import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import {
  RecipeIngredientsComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-ingredients/recipe-ingredients.component';
import {
  RecipeWrapperComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-wrapper.component';

@Component({
  selector: 'app-recipe-section',
  standalone: true,
  imports: [CommonModule, RecipeIngredientsComponent, RecipeWrapperComponent],
  templateUrl: './recipe-section.component.html',
})
export class RecipeSectionComponent {
  constructor(public recipeUI: RecipeDetailUIService) {}
}
