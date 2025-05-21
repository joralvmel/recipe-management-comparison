import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';
import {
  ServingsFilterComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-instructions/servings-filter/servings-filter.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

@Component({
  selector: 'app-recipe-ingredients',
  standalone: true,
  imports: [CommonModule, ServingsFilterComponent, AppImageComponent],
  templateUrl: 'recipe-ingredients.component.html',
})
export class RecipeIngredientsComponent {
  constructor(public recipeUI: RecipeDetailUIService) {}

  onServingsChange(newServings: number): void {
    this.recipeUI.updateServings(newServings);
  }

  getScaledAmount(amount: number): number {
    return this.recipeUI.getScaledAmount(amount);
  }
}
