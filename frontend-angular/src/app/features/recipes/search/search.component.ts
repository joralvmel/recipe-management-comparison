import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService, SearchFilters } from '@core/services/recipe.service';
import { FavoriteService } from '@core/services/favorite.service';
import { AuthService } from '@core/services/auth.service';
import { CardComponent } from '@shared/components/card/card.component';
import { SearchFiltersComponent } from '@features/recipes/search/search-filters/search-filters.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Filter } from '@models/filter.model';
import { RecipeType } from '@models/recipe.model';
import { filters } from '@app/data/mock-filters';

interface QueryParams {
  query?: string;
  mealType?: string;
  cuisine?: string;
  diet?: string;
  page?: number;
  pageSize?: number;
}

const QUERY = 'query';
const MEAL_TYPE = 'mealType';
const CUISINE = 'cuisine';
const DIET = 'diet';
const PAGE = 'page';
const PAGE_SIZE = 'pageSize';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    SearchFiltersComponent,
    PaginationComponent
  ]
})
export class SearchComponent implements OnInit {
  filters: Filter[] = filters;
  recipes: RecipeType[] = [];
  favoriteRecipeIds = new Set<number>();

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalResults = 0;

  searchQuery = '';
  mealType = '';
  cuisine = '';
  diet = '';

  isLoading = false;
  isAuthenticated = false;

  constructor(
    private recipeService: RecipeService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.authService.getUserObservable().subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // Existing code
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params[QUERY] || '';
      this.mealType = params[MEAL_TYPE] || '';
      this.cuisine = params[CUISINE] || '';
      this.diet = params[DIET] || '';
      this.currentPage = +params[PAGE] || 1;
      this.pageSize = +params[PAGE_SIZE] || 10;

      this.searchRecipes();
    });

    this.favoriteService.getFavorites().subscribe(favorites => {
      this.favoriteRecipeIds = favorites;
    });
  }

  searchRecipes(): void {
    this.isLoading = true;

    const searchFilters: SearchFilters = {
      query: this.searchQuery,
      mealType: this.mealType,
      cuisine: this.cuisine,
      diet: this.diet,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.recipeService.searchRecipes(searchFilters).subscribe(response => {
      this.recipes = response.results;
      this.totalResults = response.total;
      this.totalPages = response.totalPages;
      this.currentPage = response.page;
      this.isLoading = false;
    });
  }

  onSearch(filters: { query: string; mealType: string; cuisine: string; diet: string }): void {
    this.searchQuery = filters.query;
    this.mealType = filters.mealType;
    this.cuisine = filters.cuisine;
    this.diet = filters.diet;
    this.currentPage = 1;

    this.updateQueryParams();
  }

  onReset(): void {
    this.searchQuery = '';
    this.mealType = '';
    this.cuisine = '';
    this.diet = '';
    this.currentPage = 1;
    this.pageSize = 10;

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
      this.favoriteService.toggleFavorite(recipeId).subscribe();
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  isFavorite(recipeId: number): boolean {
    return this.favoriteRecipeIds.has(recipeId);
  }

  private updateQueryParams(): void {
    const queryParams: QueryParams = {};

    if (this.searchQuery) queryParams.query = this.searchQuery;
    if (this.mealType) queryParams.mealType = this.mealType;
    if (this.cuisine) queryParams.cuisine = this.cuisine;
    if (this.diet) queryParams.diet = this.diet;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.pageSize !== 10) queryParams.pageSize = this.pageSize;

    this.router.navigate(['/search'], { queryParams });
  }
}
