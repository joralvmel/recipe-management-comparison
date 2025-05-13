import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RecipeService, SearchFilters } from '@core/services/recipe.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { RecipeType } from '@models/recipe.model';
import { Filter } from '@models/filter.model';

@Component({
  selector: 'app-card',
  template: '',
  standalone: true
})
class MockCardComponent {
  @Input() recipe!: RecipeType;
  @Input() isFavorite = false;
  @Input() showFavoriteButton = true;
  @Input() isLoadingFavorite = false;
}

@Component({
  selector: 'app-search-filters',
  template: '',
  standalone: true
})
class MockSearchFiltersComponent {
  @Input() filters: Filter[] = [];
  @Input() initialQuery = '';
  @Input() initialMealType = '';
  @Input() initialCuisine = '';
  @Input() initialDiet = '';
}

@Component({
  selector: 'app-pagination',
  template: '',
  standalone: true
})
class MockPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageSize = 10;
}

@Component({
  selector: 'app-loader',
  template: '',
  standalone: true
})
class MockLoaderComponent {
  @Input() size = 'medium';
  @Input() fullPage = false;
}

interface AuthStoreMockType {
  isAuthenticated$: Observable<boolean>;
}

interface SearchResult {
  results: RecipeType[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let recipeServiceMock: jasmine.SpyObj<RecipeService>;
  let favoritesStoreMock: jasmine.SpyObj<FavoritesStoreService>;
  let authStoreMock: AuthStoreMockType;
  let routerMock: jasmine.SpyObj<Router>;

  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let queryParamsSubject: BehaviorSubject<Record<string, string>>;
  let favoriteIdsSubject: BehaviorSubject<Set<number>>;
  let loadingRecipeIdSubject: BehaviorSubject<number | null>;
  let isLoadingSubject: BehaviorSubject<boolean>;

  const mockRecipes: RecipeType[] = [
    { id: 1, title: 'Recipe 1' } as RecipeType,
    { id: 2, title: 'Recipe 2' } as RecipeType
  ];

  const mockFilters: Filter[] = [
    {
      id: 'mealType',
      label: 'Meal Type',
      options: [{ value: 'breakfast', label: 'Breakfast' }]
    },
    {
      id: 'cuisine',
      label: 'Cuisine',
      options: [{ value: 'italian', label: 'Italian' }]
    },
    {
      id: 'diet',
      label: 'Diet',
      options: [{ value: 'vegetarian', label: 'Vegetarian' }]
    }
  ] as Filter[];

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
    queryParamsSubject = new BehaviorSubject<Record<string, string>>({});
    favoriteIdsSubject = new BehaviorSubject<Set<number>>(new Set([1]));
    loadingRecipeIdSubject = new BehaviorSubject<number | null>(null);
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    recipeServiceMock = jasmine.createSpyObj<RecipeService>('RecipeService', ['searchRecipes']);
    favoritesStoreMock = jasmine.createSpyObj<FavoritesStoreService>(
      'FavoritesStoreService',
      ['toggleFavorite']
    );
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    routerMock.navigate.and.returnValue(Promise.resolve(true));

    Object.defineProperty(routerMock, 'url', {
      get: () => '/search',
      configurable: true
    });

    recipeServiceMock.searchRecipes.and.returnValue(of({
      results: mockRecipes,
      total: mockRecipes.length,
      totalPages: 1,
      page: 1,
      pageSize: 10
    } as SearchResult));

    favoritesStoreMock.toggleFavorite.and.returnValue(of(true));

    Object.defineProperties(recipeServiceMock, {
      isLoading$: {
        get: () => isLoadingSubject.asObservable()
      }
    });

    Object.defineProperties(favoritesStoreMock, {
      favoriteIds$: {
        get: () => favoriteIdsSubject.asObservable()
      },
      loadingRecipeId$: {
        get: () => loadingRecipeIdSubject.asObservable()
      }
    });

    authStoreMock = {
      isAuthenticated$: isAuthenticatedSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        SearchComponent,
      ],
      providers: [
        { provide: RecipeService, useValue: recipeServiceMock },
        { provide: FavoritesStoreService, useValue: favoritesStoreMock },
        { provide: AuthStoreService, useValue: authStoreMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideComponent(SearchComponent, {
      set: {
        imports: [
          CommonModule,
          RouterModule,
          MockCardComponent,
          MockSearchFiltersComponent,
          MockPaginationComponent,
          MockLoaderComponent
        ],
        template: `
          <div class="search-container">
            <div>Status: {{ isLoading ? 'Loading...' : 'Ready' }}</div>
            <div>Total recipes: {{ totalResults }}</div>
          </div>
        `
      }
    });

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    component.filters = mockFilters;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should subscribe to route query params and load recipes on init', () => {
      fixture.detectChanges();

      expect(recipeServiceMock.searchRecipes).toHaveBeenCalled();
      expect(component.recipes).toEqual(mockRecipes);
    });

    it('should load recipes based on URL query parameters', () => {
      recipeServiceMock.searchRecipes.and.returnValue(of({
        results: mockRecipes,
        total: mockRecipes.length,
        totalPages: 3,
        page: 2,
        pageSize: 20
      } as SearchResult));

      queryParamsSubject.next({
        query: 'pasta',
        mealType: 'dinner',
        cuisine: 'italian',
        diet: 'vegetarian',
        page: '2',
        pageSize: '20'
      });

      fixture.detectChanges();

      expect(component.searchQuery).toBe('pasta');
      expect(component.mealType).toBe('dinner');
      expect(component.cuisine).toBe('italian');
      expect(component.diet).toBe('vegetarian');
      expect(component.currentPage).toBe(2);
      expect(component.pageSize).toBe(20);

      expect(recipeServiceMock.searchRecipes).toHaveBeenCalledWith({
        query: 'pasta',
        mealType: 'dinner',
        cuisine: 'italian',
        diet: 'vegetarian',
        page: 2,
        pageSize: 20
      });
    });

    it('should subscribe to favorites store and update favorites list', () => {
      fixture.detectChanges();

      expect(component.favoriteRecipeIds.has(1)).toBe(true);
      expect(component.favoriteRecipeIds.has(2)).toBe(false);

      favoriteIdsSubject.next(new Set([1, 2]));
      expect(component.favoriteRecipeIds.has(2)).toBe(true);
    });

    it('should subscribe to loading state from recipe service', () => {
      fixture.detectChanges();
      expect(component.isLoading).toBe(false);

      isLoadingSubject.next(true);
      expect(component.isLoading).toBe(true);
    });
  });

  describe('Search functionality', () => {
    it('should update filters and search recipes when onSearch is called', fakeAsync(() => {
      fixture.detectChanges();
      recipeServiceMock.searchRecipes.calls.reset();

      const searchFilters = {
        query: 'cake',
        mealType: 'dessert',
        cuisine: 'french',
        diet: 'gluten-free'
      };

      component.onSearch(searchFilters);
      tick();

      expect(component.searchQuery).toBe('cake');
      expect(component.mealType).toBe('dessert');
      expect(component.cuisine).toBe('french');
      expect(component.diet).toBe('gluten-free');
      expect(component.currentPage).toBe(1);

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: {
            query: 'cake',
            mealType: 'dessert',
            cuisine: 'french',
            diet: 'gluten-free'
          }}
      );
    }));

    it('should reset all filters and search when onReset is called', fakeAsync(() => {
      component.searchQuery = 'pasta';
      component.mealType = 'dinner';
      component.cuisine = 'italian';
      component.diet = 'vegetarian';
      component.currentPage = 3;
      component.pageSize = 20;

      fixture.detectChanges();
      recipeServiceMock.searchRecipes.calls.reset();
      routerMock.navigate.calls.reset();

      component.onReset();
      tick();

      expect(component.searchQuery).toBe('');
      expect(component.mealType).toBe('');
      expect(component.cuisine).toBe('');
      expect(component.diet).toBe('');
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(10);

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: {} }
      );
    }));

    it('should search recipes with correct filters', () => {
      component.searchQuery = 'chicken';
      component.mealType = 'dinner';
      component.cuisine = 'mexican';
      component.diet = 'low-carb';
      component.currentPage = 2;
      component.pageSize = 15;

      recipeServiceMock.searchRecipes.calls.reset();
      component.searchRecipes();

      expect(recipeServiceMock.searchRecipes).toHaveBeenCalledWith({
        query: 'chicken',
        mealType: 'dinner',
        cuisine: 'mexican',
        diet: 'low-carb',
        page: 2,
        pageSize: 15
      });
    });
  });

  describe('Pagination', () => {
    it('should update current page when onPageChange is called', fakeAsync(() => {
      fixture.detectChanges();
      recipeServiceMock.searchRecipes.calls.reset();
      routerMock.navigate.calls.reset();

      component.onPageChange(3);
      tick();

      expect(component.currentPage).toBe(3);
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: { page: 3 } }
      );
    }));

    it('should update page size and reset to page 1 when onPageSizeChange is called', fakeAsync(() => {
      component.currentPage = 3;
      fixture.detectChanges();
      recipeServiceMock.searchRecipes.calls.reset();
      routerMock.navigate.calls.reset();

      component.onPageSizeChange(25);
      tick();

      expect(component.pageSize).toBe(25);
      expect(component.currentPage).toBe(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: { pageSize: 25 } }
      );
    }));

    it('should update pagination details when recipe results are received', () => {
      recipeServiceMock.searchRecipes.and.returnValue(of({
        results: mockRecipes,
        total: 100,
        totalPages: 10,
        page: 3,
        pageSize: 10
      } as SearchResult));

      fixture.detectChanges();

      expect(component.totalResults).toBe(100);
      expect(component.totalPages).toBe(10);
      expect(component.currentPage).toBe(3);
    });
  });

  describe('Favorites functionality', () => {
    it('should toggle favorite when authenticated user clicks favorite button', () => {
      isAuthenticatedSubject.next(true);
      fixture.detectChanges();
      favoritesStoreMock.toggleFavorite.calls.reset();

      const recipeId = 2;
      component.toggleFavorite(recipeId);

      expect(favoritesStoreMock.toggleFavorite).toHaveBeenCalledWith(recipeId);
    });

    it('should redirect to login when unauthenticated user clicks favorite button', () => {
      isAuthenticatedSubject.next(false);
      fixture.detectChanges();
      routerMock.navigate.calls.reset();

      const recipeId = 2;
      component.toggleFavorite(recipeId);

      expect(favoritesStoreMock.toggleFavorite).not.toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/search' } }
      );
    });

    it('should correctly identify favorite recipes', () => {
      favoriteIdsSubject.next(new Set([1, 3]));
      fixture.detectChanges();

      expect(component.isFavorite(1)).toBeTrue();
      expect(component.isFavorite(2)).toBeFalse();
      expect(component.isFavorite(3)).toBeTrue();
    });

    it('should identify loading favorite state correctly', () => {
      loadingRecipeIdSubject.next(1);
      fixture.detectChanges();

      expect(component.isLoadingFavorite(1)).toBeTrue();
      expect(component.isLoadingFavorite(2)).toBeFalse();
    });
  });

  describe('URL query parameters', () => {
    it('should update URL with all query parameters when they exist', fakeAsync(() => {

      fixture.detectChanges();
      routerMock.navigate.calls.reset();
      component.currentPage = 1;
      component.onPageChange(3);
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: { page: 3 } }
      );

      routerMock.navigate.calls.reset();

      component.onSearch({
        query: 'pizza',
        mealType: 'lunch',
        cuisine: 'italian',
        diet: 'keto'
      });
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: {
            query: 'pizza',
            mealType: 'lunch',
            cuisine: 'italian',
            diet: 'keto'
          }}
      );
    }));

    it('should not include default or empty parameters in URL', fakeAsync(() => {
      component.searchQuery = '';
      component.mealType = '';
      component.cuisine = '';
      component.diet = '';
      component.currentPage = 1;
      component.pageSize = 10;

      fixture.detectChanges();
      routerMock.navigate.calls.reset();

      component.onReset();
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: {} }
      );
    }));
  });

  describe('Authentication handling', () => {
    it('should track authentication state', () => {
      fixture.detectChanges();
      expect(component.isAuthenticated).toBeTrue();

      isAuthenticatedSubject.next(false);
      expect(component.isAuthenticated).toBeFalse();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from all subscriptions on destroy', () => {
      fixture.detectChanges();

      const subscriptionsKey = 'subscriptions';
      const unsubscribeSpy = spyOn(component[subscriptionsKey], 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
