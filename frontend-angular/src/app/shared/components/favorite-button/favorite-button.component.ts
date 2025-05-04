import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-button.component.html',
})
export class FavoriteButtonComponent {
  @Input() recipeId!: number;
  @Input() isFavorite = false;
  @Input() isLoading = false;
  @Input() error: string | null = null;

  @Output() toggleFavorite = new EventEmitter<number>();

  handleChange(): void {
    console.log('FavoriteButton: change event on checkbox for ID', this.recipeId);
    this.toggleFavorite.emit(this.recipeId);
  }
}
