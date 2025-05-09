import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, BehaviorSubject, throwError, Subject } from 'rxjs';
import { RecipeDetailUIService } from './recipe-detail-ui.service';
import { RecipeDetailService } from '@core/services/recipe-detail.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { NotificationService } from '@shared/services/notification.service';
import { RecipeDetailType } from '@models/recipe.model';
import { first } from 'rxjs/operators';

describe('RecipeDetailUIService', () => {
  let service: RecipeDetailUIService;
  let recipeDetailServiceSpy: jasmine.SpyObj<RecipeDetailService>;
  let favoritesStoreServiceSpy: jasmine.SpyObj<FavoritesStoreService>;
  let authStoreServiceSpy: jasmine.SpyObj<AuthStoreService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let favoritesSubject: BehaviorSubject<Set<number>>;
  let loadingRecipeIdSubject: BehaviorSubject<number | null>;

  const mockRecipeId = 123456;
  const mockRecipe: RecipeDetailType = {
    _id: { $oid: '60a1e2c3d4e5f6a7b8c9d0e1' },
    externalId: mockRecipeId,
    title: 'Spaghetti Carbonara',
    image: 'carbonara.jpg',
    readyInMinutes: 30,
    healthScore: 40,
    cuisines: ['Italian'],
    dishTypes: ['main course', 'dinner'],
    diets: [],
    servings: 4,
    extendedIngredients: [
      {
        externalId: 1001,
        nameClean: 'spaghetti',
        amount: 200,
        unitShort: 'g',
        image: 'spaghetti.jpg'
      },
      {
        externalId: 1002,
        nameClean: 'eggs',
        amount: 2,
        unitShort: 'pcs',
        image: 'eggs.jpg'
      },
      {
        externalId: 1003,
        nameClean: 'bacon',
        amount: 100,
        unitShort: 'g',
        image: 'bacon.jpg'
      }
    ],
    analyzedInstructions: [
      'Cook pasta until al dente',
      'Fry bacon until crispy',
      'Mix eggs with cheese',
      'Combine all ingredients'
    ]
  };

  beforeEach(() => {
    favoritesSubject = new BehaviorSubject<Set<number>>(new Set());
    loadingRecipeIdSubject = new BehaviorSubject<number | null>(null);

    recipeDetailServiceSpy = jasmine.createSpyObj('RecipeDetailService', ['getRecipeById']);
    favoritesStoreServiceSpy = jasmine.createSpyObj('FavoritesStoreService',
      ['isFavorite', 'toggleFavorite'],
      { favoriteIds$: favoritesSubject.asObservable(), loadingRecipeId$: loadingRecipeIdSubject.asObservable() }
    );
    authStoreServiceSpy = jasmine.createSpyObj('AuthStoreService', [], { isAuthenticated: true });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showNotification']);

    recipeDetailServiceSpy.getRecipeById.and.returnValue(of(mockRecipe));
    favoritesStoreServiceSpy.isFavorite.and.returnValue(false);
    favoritesStoreServiceSpy.toggleFavorite.and.returnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        RecipeDetailUIService,
        { provide: RecipeDetailService, useValue: recipeDetailServiceSpy },
        { provide: FavoritesStoreService, useValue: favoritesStoreServiceSpy },
        { provide: AuthStoreService, useValue: authStoreServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    });

    service = TestBed.inject(RecipeDetailUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set recipeId and load recipe on initialize', () => {
      spyOn(service, 'loadRecipe');

      service.initialize(mockRecipeId);

      service.recipeId$.pipe(first()).subscribe(id => {
        expect(id).toBe(mockRecipeId);
      });
      expect(service.loadRecipe).toHaveBeenCalled();
    });

    it('should update favorite status when favoriteIds$ emits', () => {
      service.initialize(mockRecipeId);

      service.isFavorite$.pipe(first()).subscribe(isFavorite => {
        expect(isFavorite).toBe(false);
      });

      favoritesSubject.next(new Set([mockRecipeId]));

      service.isFavorite$.pipe(first()).subscribe(isFavorite => {
        expect(isFavorite).toBe(true);
      });
    });

    it('should update loadingFavoriteId when loadingRecipeId$ emits', () => {
      service.initialize(mockRecipeId);

      service.loadingFavoriteId$.pipe(first()).subscribe(id => {
        expect(id).toBeNull();
      });

      loadingRecipeIdSubject.next(mockRecipeId);

      service.loadingFavoriteId$.pipe(first()).subscribe(id => {
        expect(id).toBe(mockRecipeId);
      });

      service.isLoadingFavorite$.pipe(first()).subscribe(isLoading => {
        expect(isLoading).toBeTrue();
      });
    });
  });

  describe('loadRecipe', () => {
    it('should set loading state and fetch recipe details', (done) => {
      const recipeSubject = new Subject<RecipeDetailType>();
      recipeDetailServiceSpy.getRecipeById.and.returnValue(recipeSubject);

      service.initialize(mockRecipeId);

      service.isLoading$.pipe(first()).subscribe(isLoading => {
        expect(isLoading).toBeTrue();

        recipeSubject.next(mockRecipe);

        service.recipe$.pipe(first()).subscribe(recipe => {
          expect(recipe).toEqual(mockRecipe);

          service.isLoading$.pipe(first()).subscribe(loadingAfter => {
            expect(loadingAfter).toBeFalse();
            expect(recipeDetailServiceSpy.getRecipeById).toHaveBeenCalledWith(mockRecipeId);
            expect(favoritesStoreServiceSpy.isFavorite).toHaveBeenCalled();
            done();
          });
        });
      });
    });

    it('should set servings from recipe', () => {
      service.initialize(mockRecipeId);

      service.servings$.pipe(first()).subscribe(servings => {
        expect(servings).toBe(mockRecipe.servings);
      });

      service.originalServings$.pipe(first()).subscribe(originalServings => {
        expect(originalServings).toBe(mockRecipe.servings);
      });
    });

    it('should handle error when loading recipe', () => {
      recipeDetailServiceSpy.getRecipeById.and.returnValue(throwError(() => new Error('Network error')));

      service.initialize(mockRecipeId);

      service.error$.pipe(first()).subscribe(error => {
        expect(error).toBe('Error loading recipe');
      });

      service.isLoading$.pipe(first()).subscribe(isLoading => {
        expect(isLoading).toBeFalse();
      });

      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Error fetching recipe detail', 'error');
    });

    it('should handle null recipe result', () => {
      recipeDetailServiceSpy.getRecipeById.and.returnValue(of(undefined));

      service.initialize(mockRecipeId);

      service.error$.pipe(first()).subscribe(error => {
        expect(error).toBe('Recipe not found');
      });

      service.isLoading$.pipe(first()).subscribe(isLoading => {
        expect(isLoading).toBeFalse();
      });

      expect(notificationServiceSpy.showNotification).toHaveBeenCalledWith('Error fetching recipe detail', 'error');
    });
  });

  describe('toggleFavorite', () => {
    it('should call favoritesStore.toggleFavorite when authenticated', () => {
      service.initialize(mockRecipeId);
      service.toggleFavorite();

      expect(favoritesStoreServiceSpy.toggleFavorite).toHaveBeenCalledWith(mockRecipeId);
    });

    it('should navigate to login when not authenticated', () => {
      Object.defineProperty(authStoreServiceSpy, 'isAuthenticated', { get: () => false });

      service.initialize(mockRecipeId);
      service.toggleFavorite();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: `/recipe/${mockRecipeId}` }
      });
      expect(favoritesStoreServiceSpy.toggleFavorite).not.toHaveBeenCalled();
    });
  });

  describe('Servings functionality', () => {
    it('should update servings', () => {
      service.initialize(mockRecipeId);
      service.updateServings(6);

      service.servings$.pipe(first()).subscribe(servings => {
        expect(servings).toBe(6);
      });
    });

    it('should calculate scaled amount correctly', () => {
      service.initialize(mockRecipeId);

      expect(service.getScaledAmount(100)).toBe(100);

      service.updateServings(8);
      expect(service.getScaledAmount(100)).toBe(200);

      service.updateServings(2);
      expect(service.getScaledAmount(100)).toBe(50);
    });
  });

  describe('Derived observables', () => {
    beforeEach(() => {
      service.initialize(mockRecipeId);
    });

    it('should emit correct title', (done) => {
      service.title$.pipe(first()).subscribe(title => {
        expect(title).toBe('Spaghetti Carbonara');
        done();
      });
    });

    it('should emit correct image URL', (done) => {
      service.imageUrl$.pipe(first()).subscribe(url => {
        expect(url).toBe('carbonara.jpg');
        done();
      });
    });

    it('should emit correct ingredients', (done) => {
      service.ingredients$.pipe(first()).subscribe(ingredients => {
        expect(ingredients.length).toBe(3);
        expect(ingredients[0].nameClean).toBe('spaghetti');
        done();
      });
    });

    it('should emit correct readyInMinutes', (done) => {
      service.readyInMinutes$.pipe(first()).subscribe(minutes => {
        expect(minutes).toBe(30);
        done();
      });
    });

    it('should emit correct healthScore', (done) => {
      service.healthScore$.pipe(first()).subscribe(score => {
        expect(score).toBe(40);
        done();
      });
    });

    it('should emit correct cuisines', (done) => {
      service.cuisines$.pipe(first()).subscribe(cuisines => {
        expect(cuisines).toEqual(['Italian']);
        done();
      });
    });

    it('should emit correct dishTypes', (done) => {
      service.dishTypes$.pipe(first()).subscribe(types => {
        expect(types).toEqual(['main course', 'dinner']);
        done();
      });
    });

    it('should emit correct diets', (done) => {
      service.diets$.pipe(first()).subscribe(diets => {
        expect(diets).toEqual([]);
        done();
      });
    });

    it('should emit correct instructions', (done) => {
      service.instructions$.pipe(first()).subscribe(instructions => {
        expect(instructions.length).toBe(4);
        expect(instructions[0]).toBe('Cook pasta until al dente');
        done();
      });
    });

    it('should handle null recipe for derived observables', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          RecipeDetailUIService,
          { provide: RecipeDetailService, useValue: recipeDetailServiceSpy },
          { provide: FavoritesStoreService, useValue: favoritesStoreServiceSpy },
          { provide: AuthStoreService, useValue: authStoreServiceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: NotificationService, useValue: notificationServiceSpy }
        ]
      });
      const newService = TestBed.inject(RecipeDetailUIService);

      newService.title$.pipe(first()).subscribe(title => expect(title).toBe(''));
      newService.imageUrl$.pipe(first()).subscribe(url => expect(url).toBe(''));
      newService.ingredients$.pipe(first()).subscribe(ingredients => expect(ingredients).toEqual([]));
      newService.readyInMinutes$.pipe(first()).subscribe(minutes => expect(minutes).toBe(0));
      newService.healthScore$.pipe(first()).subscribe(score => expect(score).toBe(0));
      newService.cuisines$.pipe(first()).subscribe(cuisines => expect(cuisines).toEqual([]));
      newService.dishTypes$.pipe(first()).subscribe(types => expect(types).toEqual([]));
      newService.diets$.pipe(first()).subscribe(diets => expect(diets).toEqual([]));
      newService.instructions$.pipe(first()).subscribe(instructions => expect(instructions).toEqual([]));
    });
  });
});
