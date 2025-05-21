import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

@Component({
  selector: 'app-recipe-main-section',
  standalone: true,
  imports: [CommonModule, AppImageComponent],
  templateUrl: './recipe-main-section.component.html',
})
export class RecipeMainSectionComponent {
  constructor(public recipeUI: RecipeDetailUIService) {}
}
