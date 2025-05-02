import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeInfoComponent } from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-info/recipe-info.component';
import { RecipeInstructionsComponent } from '@features/recipes/recipe-detail/recipe-section/recipe-instructions/recipe-instructions.component';

@Component({
  selector: 'app-recipe-wrapper',
  standalone: true,
  imports: [CommonModule, RecipeInfoComponent, RecipeInstructionsComponent],
  templateUrl: 'recipe-wrapper.component.html',
})
export class RecipeWrapperComponent {
  @Input() readyInMinutes = 0;
  @Input() healthScore = 0;
  @Input() cuisines: string[] = [];
  @Input() dishTypes: string[] = [];
  @Input() diets: string[] = [];
  @Input() instructions: string[] = [];
}
