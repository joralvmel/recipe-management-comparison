import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeHeaderComponent } from '@features/recipes/recipe-detail/recipe-main-section/recipe-header/recipe-header.component';

@Component({
  selector: 'app-recipe-main-section',
  standalone: true,
  imports: [CommonModule, RecipeHeaderComponent],
  templateUrl: 'recipe-main-section.component.html',
})
export class RecipeMainSectionComponent {
  @Input() title = '';
  @Input() recipeId = 0;
  @Input() imageUrl = '';
  @Input() isFavorite = false;
  @Input() isAuthenticated = false;

  @Output() toggleFavorite = new EventEmitter<void>();

  onToggleFavorite(): void {
    this.toggleFavorite.emit();
  }
}
