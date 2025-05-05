import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FavoriteService } from '@core/services/favorite.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { CardComponent } from '@shared/components/card/card.component';
import { SearchInputComponent } from '@features/recipes/favorites/search-input/search-input.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { RecipeType } from '@models/recipe.model';
import { LoaderComponent } from '@shared/components/loader/loader.component';

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
    PaginationComponent,
    LoaderComponent,
  ],
})
export class FavoritesComponent implements OnInit, OnDestroy {
  recipes: RecipeType[] = [];
  favoriteRecipeIds = new Set<number>();
  loadingFavoriteId: number | null = null;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalResults = 0;

  searchQuery = '';

  isLoading = false;
  isAuthenticated = false;

  private subscriptions = new Subscription();

  constructor(
    private readonly favoriteService: FavoriteService,
    private readonly favoritesStore: FavoritesStoreService,
    private readonly authStore: AuthStoreService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authStore.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;

        if (!this.isAuthenticated) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/favorites' }
          }).catch(err => console.error('Navigation failed:', err));
        } else {
          this.loadFavorites();
        }
      })
    );

    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params[QUERY] ?? '';
        this.currentPage = +(params[PAGE] ?? '1');
        this.pageSize = +(params[PAGE_SIZE] ?? '10');

        if (this.isAuthenticated) {
          this.loadFavorites();
        }
      })
    );

    this.subscriptions.add(
      this.favoriteService.getFavorites().subscribe(favorites => {
        this.favoriteRecipeIds = favorites;
      })
    );

    this.subscriptions.add(
      this.favoritesStore.loadingRecipeId$.subscribe(id => {
        this.loadingFavoriteId = id;
      })
    );
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

  isLoadingFavorite(recipeId: number): boolean {
    return this.loadingFavoriteId === recipeId;
  }

  get userName(): string {
    return this.authStore.currentState.user?.name || 'User';
  }

  private updateQueryParams(): void {
    const queryParams: QueryParams = {};

    if (this.searchQuery) queryParams.query = this.searchQuery;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.pageSize !== 10) queryParams.pageSize = this.pageSize;

    this.router.navigate(['/favorites'], { queryParams })
      .catch(err => console.error('Navigation failed:', err));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
