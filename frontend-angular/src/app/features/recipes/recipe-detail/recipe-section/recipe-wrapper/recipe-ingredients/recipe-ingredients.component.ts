import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredientType } from '@models/recipe.model';
import { ServingsFilterComponent } from '@features/recipes/recipe-detail/recipe-section/recipe-instructions/servings-filter/servings-filter.component';

@Component({
  selector: 'app-recipe-ingredients',
  standalone: true,
  imports: [CommonModule, ServingsFilterComponent],
  templateUrl: 'recipe-ingredients.component.html',

})
export class RecipeIngredientsComponent {
  @Input() ingredients: IngredientType[] = [];
  @Input() servings = 1;
  @Input() originalServings = 1;

  onServingsChange(newServings: number): void {
    this.servings = newServings;
  }

  getScaledAmount(amount: number): number {
    return (amount / this.originalServings) * this.servings;
  }
}
