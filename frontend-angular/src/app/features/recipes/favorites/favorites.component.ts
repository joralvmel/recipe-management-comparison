import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FavoriteService } from '@core/services/favorite.service';
import { AuthService } from '@core/services/auth.service';
import { CardComponent } from '@shared/components/card/card.component';
import { SearchInputComponent } from '@features/recipes/favorites/search-input/search-input.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { RecipeType } from '@models/recipe.model';

const QUERY = 'query';
const PAGE = 'page';
const PAGE_SIZE = 'pageSize';

interface QueryParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    SearchInputComponent,
    PaginationComponent
  ]
})
export class FavoritesComponent implements OnInit {
  recipes: RecipeType[] = [];
  favoriteRecipeIds = new Set<number>();

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalResults = 0;

  searchQuery = '';

  isLoading = false;
  isAuthenticated = false;

  constructor(
    private readonly favoriteService: FavoriteService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.authService.getUserObservable().subscribe(user => {
      this.isAuthenticated = !!user;

      if (!this.isAuthenticated) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: '/favorites' }
        }).catch(err => console.error('Navigation failed:', err));
      } else {
        this.loadFavorites();
      }
    });

    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/favorites' }
      }).catch(err => console.error('Navigation failed:', err));
      return;
    }

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params[QUERY] ?? '';
      this.currentPage = +(params[PAGE] ?? '1');
      this.pageSize = +(params[PAGE_SIZE] ?? '10');

      this.loadFavorites();
    });

    this.favoriteService.getFavorites().subscribe(favorites => {
      this.favoriteRecipeIds = favorites;
    });
  }

  loadFavorites(): void {
    if (!this.isAuthenticated) return;

    this.isLoading = true;

    this.favoriteService.getFavoriteRecipes(
      this.searchQuery,
      this.currentPage,
      this.pageSize
    ).subscribe(response => {
      this.recipes = response.results;
      this.totalResults = response.total;
      this.totalPages = response.totalPages || 1;
      this.currentPage = response.page;
      this.isLoading = false;
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateQueryParams();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  toggleFavorite(recipeId: number): void {
    if (this.isAuthenticated) {
      this.favoriteService.toggleFavorite(recipeId).subscribe(() => {
        this.loadFavorites();
      });
    }
  }

  isFavorite(recipeId: number): boolean {
    return true;
  }

  get userName(): string {
    return this.authService.currentUser?.name || 'User';
  }

  private updateQueryParams(): void {
    const queryParams: QueryParams = {};

    if (this.searchQuery) queryParams.query = this.searchQuery;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.pageSize !== 10) queryParams.pageSize = this.pageSize;

    this.router.navigate(['/favorites'], { queryParams })
      .catch(err => console.error('Navigation failed:', err));
  }
}
