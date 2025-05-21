import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FavoritesComponent } from './favorites.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Component, Directive, Input } from '@angular/core';
import { RecipeType } from '@models/recipe.model';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[routerLink]',
  standalone: true,
})
class RouterLinkDirectiveStub {
  @Input() routerLink: string | (string | number)[] | null | undefined;
}
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
  selector: 'app-search-input',
  template: '',
  standalone: true
})
class MockSearchInputComponent {
  @Input() initialQuery = '';
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
  currentState: {
    user: { name: string } | null;
  };
}

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let favoritesStoreMock: jasmine.SpyObj<FavoritesStoreService>;
  let authStoreMock: AuthStoreMockType;
  let routerMock: jasmine.SpyObj<Router>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let queryParamsSubject: BehaviorSubject<Record<string, string>>;
  let favoriteIdsSubject: BehaviorSubject<Set<number>>;
  let loadingRecipeIdSubject: BehaviorSubject<number | null>;

  const mockRecipes: RecipeType[] = [
    { id: 1, title: 'Recipe 1' } as RecipeType,
    { id: 2, title: 'Recipe 2' } as RecipeType
  ];

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
    queryParamsSubject = new BehaviorSubject<Record<string, string>>({});
    favoriteIdsSubject = new BehaviorSubject<Set<number>>(new Set([1, 2]));
    loadingRecipeIdSubject = new BehaviorSubject<number | null>(null);

    favoritesStoreMock = jasmine.createSpyObj<FavoritesStoreService>('FavoritesStoreService', [
      'getFavoriteRecipes',
      'toggleFavorite',
      'isFavorite'
    ]);

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    authStoreMock = {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      currentState: {
        user: { name: 'Test User' }
      }
    };

    favoritesStoreMock.getFavoriteRecipes.and.returnValue(of({
      results: mockRecipes,
      total: mockRecipes.length,
      totalPages: 1,
      page: 1
    }));

    favoritesStoreMock.toggleFavorite.and.returnValue(of(true));
    favoritesStoreMock.isFavorite.and.callFake((id: number) => favoriteIdsSubject.getValue().has(id));

    Object.defineProperties(favoritesStoreMock, {
      favoriteIds$: {
        get: () => favoriteIdsSubject.asObservable()
      },
      loadingRecipeId$: {
        get: () => loadingRecipeIdSubject.asObservable()
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FavoritesComponent,
        RouterLinkDirectiveStub,
        MockCardComponent,
        MockSearchInputComponent,
        MockPaginationComponent,
        MockLoaderComponent,
      ],
      providers: [
        { provide: FavoritesStoreService, useValue: favoritesStoreMock },
        { provide: AuthStoreService, useValue: authStoreMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    TestBed.overrideComponent(FavoritesComponent, {
      set: {
        template: `
          <div class="favorites-container">
            <h2>Favorites for {{ userName }}</h2>
            <div class="recipes-count">{{ totalResults }} favorites found</div>
          </div>
        `
      }
    });

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;

    favoritesStoreMock.getFavoriteRecipes.calls.reset();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Authentication', () => {
    it('should load favorites when user is authenticated', () => {
      isAuthenticatedSubject.next(true);
      fixture.detectChanges();

      expect(favoritesStoreMock.getFavoriteRecipes).toHaveBeenCalled();
      expect(component.isAuthenticated).toBe(true);
      expect(component.recipes.length).toBeGreaterThan(0);
    });

    it('should redirect to login when user is not authenticated', fakeAsync(() => {
      isAuthenticatedSubject.next(false);
      fixture.detectChanges();
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/favorites' } }
      );
      expect(component.isAuthenticated).toBe(false);
      expect(favoritesStoreMock.getFavoriteRecipes).not.toHaveBeenCalled();
    }));

    it('should expose userName from auth store', () => {
      fixture.detectChanges();
      expect(component.userName).toBe('Test User');
    });
  });

  describe('Loading favorites', () => {
    it('should load favorites with default params on init', () => {
      fixture.detectChanges();

      expect(favoritesStoreMock.getFavoriteRecipes).toHaveBeenCalledWith('', 1, 10);
      expect(component.recipes).toEqual(mockRecipes);
      expect(component.totalResults).toBe(mockRecipes.length);
      expect(component.isLoading).toBe(false);
    });

    it('should update recipes when favorites change', () => {
      fixture.detectChanges();

      const newRecipes: RecipeType[] = [{ id: 3, title: 'New Recipe' } as RecipeType];

      favoritesStoreMock.getFavoriteRecipes.and.returnValue(of({
        results: newRecipes,
        total: newRecipes.length,
        totalPages: 1,
        page: 1
      }));

      component.loadFavorites();
      fixture.detectChanges();

      expect(component.recipes).toEqual(newRecipes);
    });

    it('should not attempt to load favorites if not authenticated', () => {
      isAuthenticatedSubject.next(false);
      fixture.detectChanges();

      component.loadFavorites();

      expect(favoritesStoreMock.getFavoriteRecipes).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Query params handling', () => {
    it('should respect query params from URL', () => {
      favoritesStoreMock.getFavoriteRecipes.and.returnValue(of({
        results: mockRecipes,
        total: mockRecipes.length,
        totalPages: 1,
        page: 2
      }));

      queryParamsSubject.next({ query: 'test', page: '2', pageSize: '20' });
      fixture.detectChanges();

      expect(component.searchQuery).toBe('test');
      expect(component.currentPage).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(favoritesStoreMock.getFavoriteRecipes).toHaveBeenCalledWith('test', 2, 20);
    });

    it('should update URL when search changes', fakeAsync(() => {
      fixture.detectChanges();
      favoritesStoreMock.getFavoriteRecipes.calls.reset();

      component.onSearchChange('pasta');
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/favorites'],
        { queryParams: { query: 'pasta' } }
      );
      expect(component.currentPage).toBe(1);
    }));

    it('should update URL when page changes', fakeAsync(() => {
      fixture.detectChanges();
      favoritesStoreMock.getFavoriteRecipes.calls.reset();

      component.onPageChange(3);
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/favorites'],
        { queryParams: { page: 3 } }
      );
      expect(component.currentPage).toBe(3);
    }));

    it('should update URL when page size changes', fakeAsync(() => {
      fixture.detectChanges();
      favoritesStoreMock.getFavoriteRecipes.calls.reset();

      component.onPageSizeChange(25);
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/favorites'],
        { queryParams: { pageSize: 25 } }
      );
      expect(component.pageSize).toBe(25);
      expect(component.currentPage).toBe(1);
    }));
  });

  describe('Favorites management', () => {
    it('should toggle favorite status', () => {
      fixture.detectChanges();
      favoritesStoreMock.getFavoriteRecipes.calls.reset();

      favoritesStoreMock.toggleFavorite.and.callFake((id: number) => {
        return of(true);
      });

      const recipeId = 3;
      component.toggleFavorite(recipeId);

      expect(favoritesStoreMock.toggleFavorite).toHaveBeenCalledWith(recipeId);
      expect(favoritesStoreMock.getFavoriteRecipes).toHaveBeenCalledTimes(1);
    });

    it('should correctly identify favorite recipes', () => {
      fixture.detectChanges();

      expect(component.isFavorite(1)).toBe(true);
      expect(component.isFavorite(999)).toBe(false);
    });

    it('should track loading state for favorites', () => {
      fixture.detectChanges();

      expect(component.isLoadingFavorite(1)).toBe(false);

      loadingRecipeIdSubject.next(1);
      expect(component.isLoadingFavorite(1)).toBe(true);
      expect(component.isLoadingFavorite(2)).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from all subscriptions on destroy', () => {
      fixture.detectChanges();

      const subscriptionsProp = 'subscriptions';
      const unsubscribeSpy = spyOn(component[subscriptionsProp], 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
