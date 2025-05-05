import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteButtonComponent } from '@shared/components/favorite-button/favorite-button.component';

@Component({
  selector: 'app-recipe-header',
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent],
  templateUrl: 'recipe-header.component.html'
})
export class RecipeHeaderComponent {
  @Input() title = '';
  @Input() recipeId = 0;
  @Input() isFavorite = false;
  @Input() isAuthenticated = false;
  @Input() isLoadingFavorite = false;

  @Output() toggleFavorite = new EventEmitter<number>();

  onToggleFavorite(recipeId: number): void {
    this.toggleFavorite.emit(recipeId);
  }
}
