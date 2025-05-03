import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeType } from '@models/recipe.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CardComponent {
  @Input() recipe!: RecipeType;
  @Input() isFavorite = false;
  @Input() showFavoriteButton = true;

  @Output() toggleFavorite = new EventEmitter<number>();

  onToggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit(this.recipe.id);
  }
}
