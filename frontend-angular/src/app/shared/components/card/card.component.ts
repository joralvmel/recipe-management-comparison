import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeType } from '@models/recipe.model';
import { RouterModule } from '@angular/router';
import { FavoriteButtonComponent } from '@shared/components/favorite-button/favorite-button.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FavoriteButtonComponent]
})
export class CardComponent {
  @Input() recipe!: RecipeType;
  @Input() isFavorite = false;
  @Input() showFavoriteButton = true;
  @Input() isLoadingFavorite = false;

  @Output() toggleFavorite = new EventEmitter<number>();

  onToggleFavorite(recipeId: number): void {
    this.toggleFavorite.emit(recipeId);
  }
}
