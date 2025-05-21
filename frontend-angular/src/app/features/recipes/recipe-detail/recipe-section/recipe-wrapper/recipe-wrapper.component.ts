import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import {
  RecipeInstructionsComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-instructions/recipe-instructions.component';
import {
  RecipeInfoComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-info/recipe-info.component';

@Component({
  selector: 'app-recipe-wrapper',
  standalone: true,
  imports: [CommonModule, RecipeInfoComponent, RecipeInstructionsComponent],
  templateUrl: './recipe-wrapper.component.html',
})
export class RecipeWrapperComponent {
  constructor(public recipeUI: RecipeDetailUIService) {}
}
