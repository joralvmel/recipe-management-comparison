import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, of, throwError, Observable, first } from 'rxjs';
import { FavoritesStoreService, FavoritesState, FavoriteSearchResponse } from './favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { FavoriteApiService } from '@core/http/favorite-api.service';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';
import { NotificationService } from '@shared/services/notification.service';
import { UserType } from '@models/user.model';
import { RecipeType, RecipeDetailType } from '@models/recipe.model';
import { recipes } from '@app/data/mock-recipes';
import { favoriteData } from '@app/data/mock-favorites';

interface FavoriteType {
  _id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

interface FavoriteResponse {
  _id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

interface FavoritesStoreServicePrivate {
  useBackend: boolean;
  loadUserFavorites: (userId: string) => void;
  loadFavoritesFromApi: () => void;
  loadFavoritesFromLocal: (userId: string) => void;
  toggleFavoriteApi: (recipeId: number, isFavorite: boolean, recipeName: string) => Observable<boolean>;
  toggleFavoriteLocal: (recipeId: number, isFavorite: boolean, recipeName: string) => Observable<boolean>;
  addFavoriteToState: (recipeId: number) => void;
  removeFavoriteFromState: (recipeId: number) => void;
  getFavoriteRecipesFromApi: (query: string, page: number, pageSize: number) => Observable<FavoriteSearchResponse>;
  getFavoriteRecipesFromLocal: (query: string, page: number, pageSize: number) => Observable<FavoriteSearchResponse>;
  fetchRecipeDetails: (favoriteIds: number[], query: string, page: number, pageSize: number) => Observable<FavoriteSearchResponse>;
  paginateResults: (recipes: RecipeType[], page: number, pageSize: number) => FavoriteSearchResponse;
  getRecipeTitle: (id: number) => string;
  convertDetailToRecipe: (detail: RecipeDetailType) => RecipeType;
  getStoredFavorites: (userId: string) => number[];
  saveFavoritesToStorage: () => void;
  getFavoriteStorageKey: (userId: string) => string;
  clearFavorites: () => void;
  updateState: (partialState: Partial<FavoritesState>) => void;
}

describe('FavoritesStoreService', () => {
  let service: FavoritesStoreService;
  let servicePrivate: FavoritesStoreServicePrivate;
  let authStoreSpy: jasmine.SpyObj<AuthStoreService>;
  let favoriteApiSpy: jasmine.SpyObj<FavoriteApiService>;
  let recipeDetailApiSpy: jasmine.SpyObj<RecipeDetailApiService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let userSubject: BehaviorSubject<UserType | null>;

  const mockUser: UserType = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: 1620000000000
  };

  const mockRecipes: RecipeType[] = [
    {
      _id: { $oid: 'recipe1' },
      id: 1,
      title: 'Recipe 1',
      image: 'image1.jpg',
      readyInMinutes: 30,
      healthScore: 80,
      cuisines: [],
      dishTypes: [],
      diets: []
    },
    {
      _id: { $oid: 'recipe2' },
      id: 2,
      title: 'Recipe 2',
      image: 'image2.jpg',
      readyInMinutes: 45,
      healthScore: 90,
      cuisines: [],
      dishTypes: [],
      diets: []
    },
    {
      _id: { $oid: 'recipe3' },
      id: 3,
      title: 'Recipe 3',
      image: 'image3.jpg',
      readyInMinutes: 15,
      healthScore: 70,
      cuisines: [],
      dishTypes: [],
      diets: []
    }
  ];

  const mockRecipeDetails: RecipeDetailType[] = mockRecipes.map(recipe => ({
    _id: recipe._id,
    externalId: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    healthScore: recipe.healthScore,
    servings: 4,
    extendedIngredients: [],
    analyzedInstructions: [],
    cuisines: [],
    dishTypes: [],
    diets: []
  }));

  const mockFavorites: FavoriteType[] = [
    { _id: 'fav1', userId: 'user1', recipeId: '1', createdAt: '2025-05-08T21:34:55Z' },
    { _id: 'fav2', userId: 'user1', recipeId: '2', createdAt: '2025-05-08T21:34:55Z' }
  ];

  beforeEach(() => {
    userSubject = new BehaviorSubject<UserType | null>(null);

    const authStoreMock = jasmine.createSpyObj('AuthStoreService', [], {
      user$: userSubject.asObservable(),
      currentState: { user: null }
    });

    const favoriteApiMock = jasmine.createSpyObj('FavoriteApiService', [
      'getFavorites',
      'addFavorite',
      'removeFavorite'
    ]);

    const recipeDetailApiMock = jasmine.createSpyObj('RecipeDetailApiService', [
      'getRecipeById'
    ]);

    const notificationMock = jasmine.createSpyObj('NotificationService', [
      'showNotification'
    ]);

    TestBed.configureTestingModule({
      providers: [
        FavoritesStoreService,
        { provide: AuthStoreService, useValue: authStoreMock },
        { provide: FavoriteApiService, useValue: favoriteApiMock },
        { provide: RecipeDetailApiService, useValue: recipeDetailApiMock },
        { provide: NotificationService, useValue: notificationMock }
      ]
    });

    service = TestBed.inject(FavoritesStoreService);
    servicePrivate = service as unknown as FavoritesStoreServicePrivate;
    authStoreSpy = TestBed.inject(AuthStoreService) as jasmine.SpyObj<AuthStoreService>;
    favoriteApiSpy = TestBed.inject(FavoriteApiService) as jasmine.SpyObj<FavoriteApiService>;
    recipeDetailApiSpy = TestBed.inject(RecipeDetailApiService) as jasmine.SpyObj<RecipeDetailApiService>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    servicePrivate.useBackend = false;

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem').and.callFake(() => {});

    spyOn(recipes, 'find').and.callFake((
      predicate: (value: RecipeType, index: number, obj: RecipeType[]) => boolean
    ) => {
      return mockRecipes.find((recipe, index, array) => predicate(recipe, index, array));
    });

    spyOn(recipes, 'filter').and.callFake((
      predicate: (value: RecipeType, index: number, array: RecipeType[]) => boolean
    ) => {
      return mockRecipes.filter((recipe, index, array) => predicate(recipe, index, array));
    });

    spyOn(favoriteData, 'filter').and.returnValue(mockFavorites);
  });

  afterEach(() => {
    (localStorage.getItem as jasmine.Spy).calls.reset();
    (localStorage.setItem as jasmine.Spy).calls.reset();
    userSubject.next(null);
    servicePrivate.useBackend = false;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor behavior', () => {
    it('should load user favorites when user is available', () => {
      spyOn(servicePrivate, 'loadUserFavorites');
      userSubject.next(mockUser);
      expect(servicePrivate.loadUserFavorites).toHaveBeenCalledWith(mockUser.id);
    });

    it('should clear favorites when user is null', () => {
      spyOn(servicePrivate, 'clearFavorites');
      userSubject.next(null);
      expect(servicePrivate.clearFavorites).toHaveBeenCalled();
    });
  });

  describe('loadUserFavorites', () => {
    it('should call loadFavoritesFromApi when useBackend is true', () => {
      servicePrivate.useBackend = true;
      spyOn(servicePrivate, 'loadFavoritesFromApi');

      servicePrivate.loadUserFavorites(mockUser.id);

      expect(service.currentState.loading).toBeTrue();
      expect(servicePrivate.loadFavoritesFromApi).toHaveBeenCalled();
    });

    it('should call loadFavoritesFromLocal when useBackend is false', () => {
      spyOn(servicePrivate, 'loadFavoritesFromLocal');

      servicePrivate.loadUserFavorites(mockUser.id);

      expect(service.currentState.loading).toBeTrue();
      expect(servicePrivate.loadFavoritesFromLocal).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('loadFavoritesFromApi', () => {
    it('should update state with favorite ids from API', () => {
      favoriteApiSpy.getFavorites.and.returnValue(of(mockFavorites));
      spyOn(servicePrivate, 'updateState');

      servicePrivate.loadFavoritesFromApi();

      expect(favoriteApiSpy.getFavorites).toHaveBeenCalled();
      expect(servicePrivate.updateState).toHaveBeenCalledWith(
        jasmine.objectContaining({
          favoriteIds: new Set([1, 2])
        })
      );
    });

    it('should handle API errors', () => {
      favoriteApiSpy.getFavorites.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      servicePrivate.loadFavoritesFromApi();

      expect(console.error).toHaveBeenCalled();
      expect(notificationSpy.showNotification).toHaveBeenCalledWith('Failed to load favorites', 'error');
      expect(service.currentState.loading).toBeFalse();
    });
  });

  describe('loadFavoritesFromLocal', () => {
    it('should load favorites from localStorage and mock data', () => {
      const storedFavorites = [1, 3];
      spyOn(servicePrivate, 'getStoredFavorites').and.returnValue(storedFavorites);

      servicePrivate.loadFavoritesFromLocal(mockUser.id);

      expect(servicePrivate.getStoredFavorites).toHaveBeenCalledWith(mockUser.id);
      expect(service.currentState.favoriteIds).toEqual(new Set([1, 2, 3]));
      expect(service.currentState.loading).toBeFalse();
    });

    it('should handle errors', () => {
      spyOn(servicePrivate, 'getStoredFavorites').and.throwError('Storage error');
      spyOn(console, 'error');

      servicePrivate.loadFavoritesFromLocal(mockUser.id);

      expect(console.error).toHaveBeenCalled();
      expect(notificationSpy.showNotification).toHaveBeenCalledWith('Error loading favorites', 'error');
      expect(service.currentState.loading).toBeFalse();
    });
  });

  describe('State and Getters', () => {
    it('should return favoriteIds as an observable', (done) => {
      const testIds = new Set([1, 2, 3]);
      servicePrivate.updateState({ favoriteIds: testIds });

      service.favoriteIds$.pipe(first()).subscribe(ids => {
        expect(ids).toEqual(testIds);
        done();
      });
    });

    it('should return loadingRecipeId as an observable', (done) => {
      servicePrivate.updateState({ loadingRecipeId: 42 });

      service.loadingRecipeId$.pipe(first()).subscribe(id => {
        expect(id).toEqual(42);
        done();
      });
    });

    it('should return current state', () => {
      const testIds = new Set([1, 2, 3]);
      servicePrivate.updateState({ favoriteIds: testIds, loading: true });

      expect(service.currentState.favoriteIds).toEqual(testIds);
      expect(service.currentState.loading).toBeTrue();
    });

    it('should check if a recipe is favorite', () => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2]) });

      expect(service.isFavorite(1)).toBeTrue();
      expect(service.isFavorite(3)).toBeFalse();
    });
  });

  describe('toggleFavorite', () => {
    beforeEach(() => {
      spyOn(servicePrivate, 'getRecipeTitle').and.returnValue('Test Recipe');
    });

    it('should call toggleFavoriteApi when useBackend is true', () => {
      servicePrivate.useBackend = true;
      spyOn(servicePrivate, 'toggleFavoriteApi').and.returnValue(of(true));

      service.toggleFavorite(1).subscribe();

      expect(service.currentState.loadingRecipeId).toBe(1);
      expect(servicePrivate.toggleFavoriteApi).toHaveBeenCalledWith(1, false, 'Test Recipe');
    });

    it('should call toggleFavoriteLocal when useBackend is false', () => {
      spyOn(servicePrivate, 'toggleFavoriteLocal').and.returnValue(of(true));

      service.toggleFavorite(1).subscribe();

      expect(service.currentState.loadingRecipeId).toBe(1);
      expect(servicePrivate.toggleFavoriteLocal).toHaveBeenCalledWith(1, false, 'Test Recipe');
    });
  });

  describe('toggleFavoriteApi', () => {
    it('should add favorite when recipe is not favorited', (done) => {
      favoriteApiSpy.addFavorite.and.returnValue(of({
        _id: 'newfav',
        userId: 'user1',
        recipeId: '1',
        createdAt: '2025-05-08T21:34:55Z'
      } as FavoriteResponse));

      spyOn(servicePrivate, 'addFavoriteToState');

      servicePrivate.toggleFavoriteApi(1, false, 'Test Recipe').subscribe({
        next: (result) => {
          expect(favoriteApiSpy.addFavorite).toHaveBeenCalledWith(1);
          expect(servicePrivate.addFavoriteToState).toHaveBeenCalledWith(1);
          expect(notificationSpy.showNotification).toHaveBeenCalledWith('Test Recipe added to favorites!', 'success');
          expect(result).toBeTrue();
          done();
        }
      });
    });

    it('should remove favorite when recipe is already favorited', (done) => {
      favoriteApiSpy.removeFavorite.and.returnValue(of(undefined));

      spyOn(servicePrivate, 'removeFavoriteFromState');

      servicePrivate.toggleFavoriteApi(1, true, 'Test Recipe').subscribe({
        next: (result) => {
          expect(favoriteApiSpy.removeFavorite).toHaveBeenCalledWith(1);
          expect(servicePrivate.removeFavoriteFromState).toHaveBeenCalledWith(1);
          expect(notificationSpy.showNotification).toHaveBeenCalledWith('Test Recipe removed from favorites', 'info');
          expect(result).toBeFalse();
          done();
        }
      });
    });

    it('should handle error when adding favorite', (done) => {
      favoriteApiSpy.addFavorite.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');
      spyOn(servicePrivate, 'updateState');

      servicePrivate.toggleFavoriteApi(1, false, 'Test Recipe').subscribe({
        next: (result) => {
          expect(console.error).toHaveBeenCalled();
          expect(servicePrivate.updateState).toHaveBeenCalledWith({ loadingRecipeId: null });
          expect(notificationSpy.showNotification).toHaveBeenCalledWith('Failed to add to favorites', 'error');
          expect(result).toBeFalse();
          done();
        }
      });
    });

    it('should handle error when removing favorite', (done) => {
      favoriteApiSpy.removeFavorite.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');
      spyOn(servicePrivate, 'updateState');

      servicePrivate.toggleFavoriteApi(1, true, 'Test Recipe').subscribe({
        next: (result) => {
          expect(console.error).toHaveBeenCalled();
          expect(servicePrivate.updateState).toHaveBeenCalledWith({ loadingRecipeId: null });
          expect(notificationSpy.showNotification).toHaveBeenCalledWith('Failed to remove from favorites', 'error');
          expect(result).toBeTrue();
          done();
        }
      });
    });
  });

  describe('toggleFavoriteLocal', () => {
    it('should add favorite when recipe is not favorited', fakeAsync(() => {
      spyOn(servicePrivate, 'addFavoriteToState');
      spyOn(servicePrivate, 'saveFavoritesToStorage');

      let result: boolean | undefined;
      servicePrivate.toggleFavoriteLocal(1, false, 'Test Recipe').subscribe({
        next: (value) => {
          result = value;
        }
      });

      tick(300);

      expect(servicePrivate.addFavoriteToState).toHaveBeenCalledWith(1);
      expect(notificationSpy.showNotification).toHaveBeenCalledWith('Test Recipe added to favorites!', 'success');
      expect(servicePrivate.saveFavoritesToStorage).toHaveBeenCalled();
      expect(result).toBeTrue();
    }));

    it('should remove favorite when recipe is already favorited', fakeAsync(() => {
      spyOn(servicePrivate, 'removeFavoriteFromState');
      spyOn(servicePrivate, 'saveFavoritesToStorage');

      let result: boolean | undefined;
      servicePrivate.toggleFavoriteLocal(1, true, 'Test Recipe').subscribe({
        next: (value) => {
          result = value;
        }
      });

      tick(300);

      expect(servicePrivate.removeFavoriteFromState).toHaveBeenCalledWith(1);
      expect(notificationSpy.showNotification).toHaveBeenCalledWith('Test Recipe removed from favorites', 'info');
      expect(servicePrivate.saveFavoritesToStorage).toHaveBeenCalled();
      expect(result).toBeFalse();
    }));
  });

  describe('State Modification', () => {
    it('should add favorite to state', () => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2]) });

      servicePrivate.addFavoriteToState(3);

      expect(service.currentState.favoriteIds.has(3)).toBeTrue();
      expect(service.currentState.loadingRecipeId).toBeNull();
    });

    it('should remove favorite from state', () => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2, 3]) });

      servicePrivate.removeFavoriteFromState(2);

      expect(service.currentState.favoriteIds.has(2)).toBeFalse();
      expect(service.currentState.favoriteIds.has(1)).toBeTrue();
      expect(service.currentState.loadingRecipeId).toBeNull();
    });
  });

  describe('getFavoriteRecipes', () => {
    it('should call getFavoriteRecipesFromApi when useBackend is true', () => {
      servicePrivate.useBackend = true;
      spyOn(servicePrivate, 'getFavoriteRecipesFromApi').and.returnValue(of({
        results: [], total: 0, totalPages: 0, page: 1
      }));

      service.getFavoriteRecipes('query', 2, 20).subscribe();

      expect(service.currentState.loading).toBeTrue();
      expect(servicePrivate.getFavoriteRecipesFromApi).toHaveBeenCalledWith('query', 2, 20);
    });

    it('should call getFavoriteRecipesFromLocal when useBackend is false', () => {
      spyOn(servicePrivate, 'getFavoriteRecipesFromLocal').and.returnValue(of({
        results: [], total: 0, totalPages: 0, page: 1
      }));

      service.getFavoriteRecipes('query', 2, 20).subscribe();

      expect(service.currentState.loading).toBeTrue();
      expect(servicePrivate.getFavoriteRecipesFromLocal).toHaveBeenCalledWith('query', 2, 20);
    });
  });

  describe('getFavoriteRecipesFromApi', () => {
    it('should return empty results when no favorites exist', (done) => {
      favoriteApiSpy.getFavorites.and.returnValue(of([]));

      servicePrivate.getFavoriteRecipesFromApi('', 1, 10).subscribe({
        next: (result) => {
          expect(result.results.length).toBe(0);
          expect(result.total).toBe(0);
          expect(service.currentState.loading).toBeFalse();
          done();
        }
      });
    });

    it('should fetch recipe details when favorites exist', (done) => {
      favoriteApiSpy.getFavorites.and.returnValue(of(mockFavorites));
      spyOn(servicePrivate, 'fetchRecipeDetails').and.returnValue(of({
        results: mockRecipes.slice(0, 2),
        total: 2,
        totalPages: 1,
        page: 1
      }));

      servicePrivate.getFavoriteRecipesFromApi('', 1, 10).subscribe({
        next: () => {
          expect(servicePrivate.fetchRecipeDetails).toHaveBeenCalledWith([1, 2], '', 1, 10);
          done();
        }
      });
    });

    it('should handle API errors', (done) => {
      favoriteApiSpy.getFavorites.and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error');

      servicePrivate.getFavoriteRecipesFromApi('', 1, 10).subscribe({
        next: (result) => {
          expect(console.error).toHaveBeenCalled();
          expect(service.currentState.loading).toBeFalse();
          expect(notificationSpy.showNotification).toHaveBeenCalledWith('Error loading favorite recipes', 'error');
          expect(result.results.length).toBe(0);
          done();
        }
      });
    });
  });

  describe('getFavoriteRecipesFromLocal', () => {
    it('should filter and paginate favorite recipes', fakeAsync(() => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2]) });

      let result: FavoriteSearchResponse | undefined;
      servicePrivate.getFavoriteRecipesFromLocal('', 1, 10).subscribe({
        next: (response) => {
          result = response;
        }
      });

      tick(600);

      expect(result?.results.length).toBe(2);
      expect(service.currentState.loading).toBeFalse();
    }));

    it('should filter recipes by query string', fakeAsync(() => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2, 3]) });

      const filteredRecipes = [mockRecipes[0]];
      (recipes.filter as jasmine.Spy).and.returnValue(filteredRecipes);

      let result: FavoriteSearchResponse | undefined;
      servicePrivate.getFavoriteRecipesFromLocal('Recipe 1', 1, 10).subscribe({
        next: (response) => {
          result = response;
        }
      });

      tick(600);

      expect(result?.results.length).toBe(1);
      expect(result?.total).toBe(1);
    }));
  });

  describe('fetchRecipeDetails', () => {
    it('should fetch and filter recipes by query', (done) => {
      recipeDetailApiSpy.getRecipeById.and.callFake((id: number) => {
        const detail = mockRecipeDetails.find(r => r.externalId === id);
        return detail ? of(detail) : throwError(() => new Error('Recipe not found'));
      });

      spyOn(servicePrivate, 'convertDetailToRecipe').and.callThrough();

      servicePrivate.fetchRecipeDetails([1, 2, 3], 'Recipe 1', 1, 10).subscribe({
        next: () => {
          expect(recipeDetailApiSpy.getRecipeById).toHaveBeenCalledTimes(3);
          expect(servicePrivate.convertDetailToRecipe).toHaveBeenCalled();
          expect(service.currentState.loading).toBeFalse();
          done();
        }
      });
    });

    it('should paginate when not filtering by query', (done) => {
      recipeDetailApiSpy.getRecipeById.and.callFake((id: number) => {
        const detail = mockRecipeDetails.find(r => r.externalId === id);
        return detail ? of(detail) : throwError(() => new Error('Recipe not found'));
      });

      servicePrivate.fetchRecipeDetails([1, 2, 3, 4, 5], '', 1, 2).subscribe({
        next: (result) => {
          expect(recipeDetailApiSpy.getRecipeById).toHaveBeenCalledTimes(2);
          expect(result.total).toBe(5);
          expect(result.totalPages).toBe(3);
          done();
        }
      });
    });

    it('should handle recipe detail errors', (done) => {
      recipeDetailApiSpy.getRecipeById.and.callFake((id: number) => {
        if (id === 1) {
          return of(mockRecipeDetails[0]);
        }
        return throwError(() => new Error('Recipe not found'));
      });

      servicePrivate.fetchRecipeDetails([1, 2], '', 1, 10).subscribe({
        next: (result) => {
          expect(result.results.length).toBe(1);
          done();
        }
      });
    });
  });

  describe('paginateResults', () => {
    it('should paginate results correctly', () => {
      const testRecipes = Array(25).fill(0).map((_, i) => ({
        ...mockRecipes[0],
        id: i + 1,
        title: `Recipe ${i + 1}`
      }));

      const page1 = servicePrivate.paginateResults(testRecipes, 1, 10);
      expect(page1.results.length).toBe(10);
      expect(page1.results[0].id).toBe(1);
      expect(page1.total).toBe(25);
      expect(page1.totalPages).toBe(3);
      expect(page1.page).toBe(1);

      const page2 = servicePrivate.paginateResults(testRecipes, 2, 10);
      expect(page2.results.length).toBe(10);
      expect(page2.results[0].id).toBe(11);

      const page3 = servicePrivate.paginateResults(testRecipes, 3, 10);
      expect(page3.results.length).toBe(5);
      expect(page3.results[0].id).toBe(21);

      const pageSize5 = servicePrivate.paginateResults(testRecipes, 2, 5);
      expect(pageSize5.results.length).toBe(5);
      expect(pageSize5.totalPages).toBe(5);
    });
  });

  describe('getRecipeTitle', () => {
    it('should return recipe title when found', () => {
      (recipes.find as jasmine.Spy).and.returnValue(mockRecipes[0]);

      const title = servicePrivate.getRecipeTitle(1);

      expect(title).toBe('Recipe 1');
    });

    it('should return default title when recipe not found', () => {
      (recipes.find as jasmine.Spy).and.returnValue(undefined);

      const title = servicePrivate.getRecipeTitle(999);

      expect(title).toBe('Recipe');
    });
  });

  describe('convertDetailToRecipe', () => {
    it('should convert recipe detail to recipe type', () => {
      const detail: RecipeDetailType = {
        _id: { $oid: 'detail123' },
        externalId: 123,
        title: 'Test Recipe',
        image: 'test.jpg',
        readyInMinutes: 30,
        healthScore: 80,
        servings: 4,
        extendedIngredients: [],
        analyzedInstructions: [],
        cuisines: ['Italian'],
        dishTypes: ['main course'],
        diets: ['vegetarian']
      };

      const recipe = servicePrivate.convertDetailToRecipe(detail);

      expect(recipe._id).toEqual({ $oid: 'detail123' });
      expect(recipe.id).toBe(123);
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.cuisines).toEqual(['Italian']);
      expect(recipe.dishTypes).toEqual(['main course']);
      expect(recipe.diets).toEqual(['vegetarian']);
    });
  });

  describe('Storage methods', () => {
    it('should get stored favorites from localStorage', () => {
      const storedFavorites = [1, 2, 3];
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(storedFavorites));

      const result = servicePrivate.getStoredFavorites('user1');

      expect(localStorage.getItem).toHaveBeenCalledWith('favorites_user1');
      expect(result).toEqual(storedFavorites);
    });

    it('should return empty array when no stored favorites', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      const result = servicePrivate.getStoredFavorites('user1');

      expect(result).toEqual([]);
    });

    it('should generate correct storage key for user', () => {
      const key = servicePrivate.getFavoriteStorageKey('user123');
      expect(key).toBe('favorites_user123');
    });

    it('should save favorites to localStorage', () => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2, 3]) });

      Object.defineProperty(authStoreSpy, 'currentState', {
        get: () => ({ user: mockUser })
      });

      servicePrivate.saveFavoritesToStorage();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'favorites_user1',
        JSON.stringify([1, 2, 3])
      );
    });

    it('should not save to localStorage when useBackend is true', () => {
      servicePrivate.useBackend = true;

      servicePrivate.saveFavoritesToStorage();

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not save to localStorage when user is null', () => {
      Object.defineProperty(authStoreSpy, 'currentState', {
        get: () => ({ user: null })
      });

      servicePrivate.saveFavoritesToStorage();

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle errors when saving to localStorage', () => {
      Object.defineProperty(authStoreSpy, 'currentState', {
        get: () => ({ user: mockUser })
      });

      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      servicePrivate.saveFavoritesToStorage();

      expect(console.error).toHaveBeenCalled();
      expect(notificationSpy.showNotification).toHaveBeenCalledWith('Error saving favorites', 'error');
    });
  });

  describe('clearFavorites', () => {
    it('should reset favoriteIds to empty set', () => {
      servicePrivate.updateState({ favoriteIds: new Set([1, 2, 3]) });

      servicePrivate.clearFavorites();

      expect(service.currentState.favoriteIds.size).toBe(0);
    });
  });

  describe('updateState', () => {
    it('should merge partial state with current state', () => {
      const initialState = service.currentState;

      servicePrivate.updateState({ loading: true });

      expect(service.currentState.loading).toBeTrue();
      expect(service.currentState.favoriteIds).toEqual(initialState.favoriteIds);

      servicePrivate.updateState({ loadingRecipeId: 42 });

      expect(service.currentState.loading).toBeTrue();
      expect(service.currentState.loadingRecipeId).toBe(42);
    });
  });
});
