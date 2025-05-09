import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { RecipeDetailService } from './recipe-detail.service';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';
import { CacheService } from '@shared/services/cache.service';
import { RecipeDetailType } from '@models/recipe.model';

interface RecipeDetailServicePrivate {
  fetchRecipeDetails: (id: number) => Observable<RecipeDetailType | undefined>;
  getRecipeByIdFromApi: (id: number) => Observable<RecipeDetailType | undefined>;
  getRecipeByIdFromMock: (id: number) => Observable<RecipeDetailType | undefined>;
  isLoadingSubject: BehaviorSubject<boolean>;
}

describe('RecipeDetailService', () => {
  let service: RecipeDetailService;
  let servicePrivate: RecipeDetailServicePrivate;
  let recipeDetailApiServiceSpy: jasmine.SpyObj<RecipeDetailApiService>;
  let cacheServiceSpy: jasmine.SpyObj<CacheService>;

  const mockRecipeDetail: RecipeDetailType = {
    _id: { $oid: '123456789' },
    externalId: 123,
    title: 'Spaghetti Carbonara',
    image: 'carbonara.jpg',
    readyInMinutes: 30,
    servings: 4,
    healthScore: 40,
    cuisines: ['Italian'],
    dishTypes: ['lunch', 'main course'],
    diets: ['pescatarian'],
    extendedIngredients: [
      {
        externalId: 1,
        nameClean: 'spaghetti',
        amount: 400,
        unitShort: 'g',
        image: 'spaghetti.jpg'
      },
      {
        externalId: 2,
        nameClean: 'eggs',
        amount: 3,
        unitShort: '',
        image: 'eggs.jpg'
      }
    ],
    analyzedInstructions: [
      'Cook the pasta according to package instructions.',
      'In a bowl, mix eggs and cheese.'
    ]
  };

  const mockCacheResponse = {
    data: of(mockRecipeDetail),
    isLoading$: of(false)
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('RecipeDetailApiService', ['getRecipeById']);
    const cacheSpy = jasmine.createSpyObj('CacheService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        RecipeDetailService,
        { provide: RecipeDetailApiService, useValue: apiSpy },
        { provide: CacheService, useValue: cacheSpy }
      ]
    });

    service = TestBed.inject(RecipeDetailService);
    servicePrivate = service as unknown as RecipeDetailServicePrivate;

    recipeDetailApiServiceSpy = TestBed.inject(RecipeDetailApiService) as jasmine.SpyObj<RecipeDetailApiService>;
    cacheServiceSpy = TestBed.inject(CacheService) as jasmine.SpyObj<CacheService>;

    cacheServiceSpy.get.and.returnValue(mockCacheResponse);
    recipeDetailApiServiceSpy.getRecipeById.and.returnValue(of(mockRecipeDetail));

    if (process?.env) {
      process.env.USE_BACKEND = 'false';
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use CacheService when getting recipe details', () => {
    service.getRecipeById(123).subscribe();

    expect(cacheServiceSpy.get).toHaveBeenCalledWith(
      'recipe-detail-123',
      jasmine.any(Function),
      15 * 60 * 1000
    );
  });

  it('should generate correct cache key based on recipe id', () => {
    const recipeId = 456;
    service.getRecipeById(recipeId).subscribe();

    expect(cacheServiceSpy.get).toHaveBeenCalledWith(
      `recipe-detail-${recipeId}`,
      jasmine.any(Function),
      jasmine.any(Number)
    );
  });

  it('should log warning when recipe is not found', (done: DoneFn) => {
    spyOn(console, 'warn');
    cacheServiceSpy.get.and.returnValue({
      data: of(undefined),
      isLoading$: of(false)
    });

    service.getRecipeById(999).subscribe(recipe => {
      expect(recipe).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith('Recipe with ID 999 not found');
      done();
    });
  });

  describe('when useBackend is true', () => {
    beforeEach(() => {
      if (process?.env) {
        process.env.USE_BACKEND = 'true';
      }
      Object.defineProperty(service, 'useBackend', { value: true });
      recipeDetailApiServiceSpy.getRecipeById.calls.reset();
    });

    it('should call recipeDetailApiService with correct id', () => {
      const recipeId = 123;

      cacheServiceSpy.get.and.callFake(<T>(_key: string, dataFn: () => Observable<T>) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      service.getRecipeById(recipeId).subscribe();

      expect(recipeDetailApiServiceSpy.getRecipeById).toHaveBeenCalledWith(recipeId);
    });

    it('should return recipe details from API', (done: DoneFn) => {
      const recipeId = 123;

      cacheServiceSpy.get.and.callFake(<T>(_key: string, dataFn: () => Observable<T>) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      service.getRecipeById(recipeId).subscribe(recipe => {
        expect(recipe).toEqual(mockRecipeDetail);
        done();
      });
    });

    it('should handle API errors gracefully', (done: DoneFn) => {
      spyOn(console, 'error');
      recipeDetailApiServiceSpy.getRecipeById.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      cacheServiceSpy.get.and.callFake(<T>(_key: string, dataFn: () => Observable<T>) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      service.getRecipeById(456).subscribe(recipe => {
        expect(recipe).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching recipe details for ID 456:',
          jasmine.any(Error)
        );
        done();
      });
    });

    it('should handle API errors through error handler directly', (done: DoneFn) => {
      spyOn(console, 'error');

      recipeDetailApiServiceSpy.getRecipeById.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      servicePrivate.getRecipeByIdFromApi(456).subscribe(recipe => {
        expect(recipe).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching recipe details for ID 456:',
          jasmine.any(Error)
        );
        done();
      });
    });
  });

  describe('when useBackend is false', () => {
    beforeEach(() => {
      if (process?.env) {
        process.env.USE_BACKEND = 'false';
      }
      Object.defineProperty(service, 'useBackend', { value: false });
    });

    it('should return recipe details from mock data', (done: DoneFn) => {
      spyOn(servicePrivate, 'getRecipeByIdFromMock').and.returnValue(of(mockRecipeDetail));

      cacheServiceSpy.get.and.callFake(<T>(_key: string, dataFn: () => Observable<T>) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      service.getRecipeById(123).subscribe(recipe => {
        expect(servicePrivate.getRecipeByIdFromMock).toHaveBeenCalledWith(123);
        expect(recipe).toBeDefined();
        expect(recipe).toEqual(mockRecipeDetail);
        done();
      });
    });

    it('should return undefined for non-existent recipe id from mock', (done: DoneFn) => {
      spyOn(servicePrivate, 'getRecipeByIdFromMock').and.returnValue(of(undefined));

      cacheServiceSpy.get.and.callFake(<T>(_key: string, dataFn: () => Observable<T>) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      service.getRecipeById(999).subscribe(recipe => {
        expect(recipe).toBeUndefined();
        done();
      });
    });
  });

  describe('loading state handling', () => {
    it('should update loading state correctly when fetching recipe details', (done: DoneFn) => {
      const loadingStates: boolean[] = [];

      const subscription = service.isLoading$.subscribe(isLoading => {
        loadingStates.push(isLoading);
      });

      cacheServiceSpy.get.and.callFake(<T>(_key: string, dataFn: () => Observable<T>, _staleTime?: number) => {
        return {
          data: dataFn(),
          isLoading$: of(true, false)
        };
      });

      service.getRecipeById(123).subscribe({
        next: () => {
          expect(loadingStates).toContain(true);
          subscription.unsubscribe();
          done();
        },
        error: (error) => {
          fail(`Test failed with error: ${error}`);
          subscription.unsubscribe();
          done();
        }
      });
    });
  });

  describe('fetchRecipeDetails', () => {
    it('should call getRecipeByIdFromApi when useBackend is true', () => {
      Object.defineProperty(service, 'useBackend', { value: true });

      spyOn(servicePrivate, 'getRecipeByIdFromApi').and.returnValue(of(mockRecipeDetail));
      spyOn(servicePrivate, 'getRecipeByIdFromMock');

      servicePrivate.fetchRecipeDetails(123).subscribe();

      expect(servicePrivate.getRecipeByIdFromApi).toHaveBeenCalledWith(123);
      expect(servicePrivate.getRecipeByIdFromMock).not.toHaveBeenCalled();
    });

    it('should call getRecipeByIdFromMock when useBackend is false', () => {
      Object.defineProperty(service, 'useBackend', { value: false });

      spyOn(servicePrivate, 'getRecipeByIdFromApi');
      spyOn(servicePrivate, 'getRecipeByIdFromMock').and.returnValue(of(mockRecipeDetail));

      servicePrivate.fetchRecipeDetails(123).subscribe();

      expect(servicePrivate.getRecipeByIdFromMock).toHaveBeenCalledWith(123);
      expect(servicePrivate.getRecipeByIdFromApi).not.toHaveBeenCalled();
    });
  });
});
