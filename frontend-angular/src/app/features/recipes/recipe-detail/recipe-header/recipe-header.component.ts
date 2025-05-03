import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'recipe-header.component.html'
})
export class RecipeHeaderComponent {
  @Input() title = '';
  @Input() recipeId = 0;
  @Input() isFavorite = false;
  @Input() isAuthenticated = false;

  @Output() toggleFavorite = new EventEmitter<void>();

  onToggleFavorite(): void {
    this.toggleFavorite.emit();
  }
}
