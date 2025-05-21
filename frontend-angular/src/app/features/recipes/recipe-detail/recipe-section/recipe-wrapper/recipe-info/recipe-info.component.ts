import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

@Component({
  selector: 'app-recipe-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-info.component.html',
})
export class RecipeInfoComponent {
  constructor(public recipeUI: RecipeDetailUIService) {}
}
