import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteButtonComponent } from '@shared/components/favorite-button/favorite-button.component';
import { AuthStoreService } from '@core/store/auth-store.service';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

@Component({
  selector: 'app-recipe-header',
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent],
  templateUrl: './recipe-header.component.html',
})
export class RecipeHeaderComponent {
  constructor(
    public recipeUI: RecipeDetailUIService,
    public authService: AuthStoreService
  ) {}

  onToggleFavorite(): void {
    this.recipeUI.toggleFavorite();
  }
}
