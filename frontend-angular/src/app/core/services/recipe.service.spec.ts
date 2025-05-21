import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { RecipeService, SearchFilters, SearchResult } from './recipe.service';
import { RecipeApiService } from '@core/http/recipe-api.service';
import { CacheService } from '@shared/services/cache.service';
import { RecipeType } from '@models/recipe.model';

interface RecipeServicePrivate {
  applyFilters: (recipesList: RecipeType[], filters: SearchFilters) => RecipeType[];
  applyPagination: (filtered: RecipeType[], filters: SearchFilters) => SearchResult;
  createEmptyResult: (filters: SearchFilters) => SearchResult;
  searchRecipesFromApi: (filters: SearchFilters) => Observable<SearchResult>;
  searchRecipesFromMock: (filters: SearchFilters) => Observable<SearchResult>;
  generateCacheKey: (filters: SearchFilters) => string;
}

describe('RecipeService', () => {
  let service: RecipeService;
  let servicePrivate: RecipeServicePrivate;
  let recipeApiServiceSpy: jasmine.SpyObj<RecipeApiService>;
  let cacheServiceSpy: jasmine.SpyObj<CacheService>;

  const mockRecipes: RecipeType[] = [
    {
      _id: { $oid: '6453f1d3ec3e7282929a8e1a' },
      id: 1,
      title: 'Spaghetti Carbonara',
      image: 'carbonara.jpg',
      readyInMinutes: 30,
      healthScore: 40,
      cuisines: ['Italian'],
      dishTypes: ['lunch', 'main course'],
      diets: []
    },
    {
      _id: { $oid: '6453f1d3ec3e7282929a8e1b' },
      id: 2,
      title: 'Vegan Salad Bowl',
      image: 'vegan-salad.jpg',
      readyInMinutes: 15,
      healthScore: 95,
      cuisines: ['American'],
      dishTypes: ['lunch', 'salad'],
      diets: ['vegan', 'vegetarian']
    },
    {
      _id: { $oid: '6453f1d3ec3e7282929a8e1c' },
      id: 3,
      title: 'Chicken Curry',
      image: 'curry.jpg',
      readyInMinutes: 45,
      healthScore: 70,
      cuisines: ['Indian'],
      dishTypes: ['dinner', 'main course'],
      diets: ['gluten free']
    }
  ];

  const defaultFilters: SearchFilters = {
    query: '',
    mealType: '',
    cuisine: '',
    diet: '',
    page: 1,
    pageSize: 10
  };

  const mockApiResponse = {
    results: mockRecipes,
    totalResults: 3,
    offset: 0,
    number: 10
  };

  const mockCacheResponse = {
    data: of({
      results: mockRecipes,
      total: 3,
      page: 1,
      pageSize: 10,
      totalPages: 1
    } as SearchResult),
    isLoading$: of(false)
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('RecipeApiService', ['searchRecipes']);
    const cacheSpy = jasmine.createSpyObj('CacheService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        RecipeService,
        { provide: RecipeApiService, useValue: apiSpy },
        { provide: CacheService, useValue: cacheSpy }
      ]
    });

    service = TestBed.inject(RecipeService);
    servicePrivate = service as unknown as RecipeServicePrivate;

    recipeApiServiceSpy = TestBed.inject(RecipeApiService) as jasmine.SpyObj<RecipeApiService>;
    cacheServiceSpy = TestBed.inject(CacheService) as jasmine.SpyObj<CacheService>;

    cacheServiceSpy.get.and.returnValue(mockCacheResponse);
    recipeApiServiceSpy.searchRecipes.and.returnValue(of(mockApiResponse));

    if (process?.env) {
      process.env.USE_BACKEND = 'false';
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use CacheService when searching recipes', () => {
    service.searchRecipes(defaultFilters).subscribe();

    expect(cacheServiceSpy.get).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.any(Function),
      5 * 60 * 1000
    );
  });

  it('should generate correct cache key based on filters', () => {
    const filters: SearchFilters = {
      query: 'pasta',
      mealType: 'dinner',
      cuisine: 'italian',
      diet: 'vegetarian',
      page: 2,
      pageSize: 5
    };

    service.searchRecipes(filters).subscribe();

    const expectedCacheKey = 'recipes-pasta-dinner-italian-vegetarian-2-5';

    expect(cacheServiceSpy.get).toHaveBeenCalledWith(
      expectedCacheKey,
      jasmine.any(Function),
      jasmine.any(Number)
    );
  });

  describe('when useBackend is true', () => {
    beforeEach(() => {
      if (process?.env) {
        process.env.USE_BACKEND = 'true';
      }

      Object.defineProperty(service, 'useBackend', { value: true });
      recipeApiServiceSpy.searchRecipes.calls.reset();
    });

    it('should call recipeApiService with correct parameters', () => {
      const filters: SearchFilters = {
        query: 'pasta',
        mealType: 'dinner',
        cuisine: 'italian',
        diet: 'vegetarian',
        page: 2,
        pageSize: 5
      };

      cacheServiceSpy.get.and.callFake((_key, dataFn) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      service.searchRecipes(filters).subscribe();

      expect(recipeApiServiceSpy.searchRecipes).toHaveBeenCalledWith(
        'pasta',
        'italian',
        'vegetarian',
        'dinner',
        5,
        5
      );
    });

    it('should map API response to SearchResult correctly', (done: DoneFn) => {
      const apiResponse = {
        results: mockRecipes.slice(0, 1),
        totalResults: 30,
        offset: 10,
        number: 10
      };

      recipeApiServiceSpy.searchRecipes.and.returnValue(of(apiResponse));

      cacheServiceSpy.get.and.callFake((_key, dataFn) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      const filters = {
        ...defaultFilters,
        page: 2,
        pageSize: 10
      };

      service.searchRecipes(filters).subscribe(result => {
        expect(result.results).toEqual(mockRecipes.slice(0, 1));
        expect(result.total).toBe(30);
        expect(result.page).toBe(2);
        expect(result.pageSize).toBe(10);
        expect(result.totalPages).toBe(3);
        done();
      });
    });

    it('should handle API errors gracefully', (done: DoneFn) => {
      recipeApiServiceSpy.searchRecipes.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      const emptyResult: SearchResult = {
        results: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      };

      cacheServiceSpy.get.and.returnValue({
        data: of(emptyResult),
        isLoading$: of(false)
      });

      service.searchRecipes(defaultFilters).subscribe(result => {
        expect(result.results.length).toBe(0);
        expect(result.total).toBe(0);
        expect(result.totalPages).toBe(0);
        done();
      });
    });

    it('should handle API errors through error handler directly', (done: DoneFn) => {
      spyOn(servicePrivate, 'createEmptyResult').and.callThrough();
      spyOn(console, 'error');

      recipeApiServiceSpy.searchRecipes.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      (servicePrivate.searchRecipesFromApi(defaultFilters)).subscribe(result => {
        expect(servicePrivate.createEmptyResult).toHaveBeenCalledWith(defaultFilters);

        expect(console.error).toHaveBeenCalledWith(
          'Error searching recipes:',
          jasmine.any(Error)
        );

        expect(result.results).toEqual([]);
        expect(result.total).toBe(0);
        done();
      });
    });

    it('should create empty result with correct filter values', () => {
      const customFilters: SearchFilters = {
        query: 'test',
        mealType: 'dinner',
        cuisine: 'italian',
        diet: 'vegan',
        page: 3,
        pageSize: 5
      };

      const emptyResult = servicePrivate.createEmptyResult(customFilters);

      expect(emptyResult.results).toEqual([]);
      expect(emptyResult.total).toBe(0);
      expect(emptyResult.page).toBe(customFilters.page);
      expect(emptyResult.pageSize).toBe(customFilters.pageSize);
      expect(emptyResult.totalPages).toBe(0);
    });
  });

  describe('when useBackend is false', () => {
    beforeEach(() => {
      if (process?.env) {
        process.env.USE_BACKEND = 'false';
      }

      spyOn(servicePrivate, 'applyFilters').and.callThrough();
      spyOn(servicePrivate, 'applyPagination').and.callThrough();
    });

    it('should apply filters and pagination to mock data', (done: DoneFn) => {
      cacheServiceSpy.get.and.callFake((_key, dataFn) => {
        return {
          data: dataFn(),
          isLoading$: of(false)
        };
      });

      jasmine.clock().install();

      service.searchRecipes(defaultFilters).subscribe(() => {
        expect(servicePrivate.applyFilters).toHaveBeenCalled();
        expect(servicePrivate.applyPagination).toHaveBeenCalled();
        done();
      });

      jasmine.clock().tick(301);
      jasmine.clock().uninstall();
    });

    it('should filter recipes by query', (done: DoneFn) => {
      const filters = {
        ...defaultFilters,
        query: 'chicken'
      };

      const filtered = servicePrivate.applyFilters(mockRecipes, filters);
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toContain('Chicken');
      done();
    });

    it('should filter recipes by cuisine', (done: DoneFn) => {
      const filters = {
        ...defaultFilters,
        cuisine: 'Italian'
      };

      const filtered = servicePrivate.applyFilters(mockRecipes, filters);
      expect(filtered.length).toBe(1);
      expect(filtered[0].cuisines).toContain('Italian');
      done();
    });

    it('should filter recipes by diet', (done: DoneFn) => {
      const filters = {
        ...defaultFilters,
        diet: 'vegan'
      };

      const filtered = servicePrivate.applyFilters(mockRecipes, filters);
      expect(filtered.length).toBe(1);
      expect(filtered[0].diets).toContain('vegan');
      done();
    });

    it('should filter recipes by meal type', (done: DoneFn) => {
      const filters = {
        ...defaultFilters,
        mealType: 'salad'
      };

      const filtered = servicePrivate.applyFilters(mockRecipes, filters);
      expect(filtered.length).toBe(1);
      expect(filtered[0].dishTypes).toContain('salad');
      done();
    });

    it('should paginate results correctly', (done: DoneFn) => {
      const manyRecipes = Array(25).fill(null).map((_, i) => ({
        ...mockRecipes[0],
        id: i + 1,
        title: `Recipe ${i + 1}`
      }));

      const filters = {
        ...defaultFilters,
        page: 2,
        pageSize: 10
      };

      const result = servicePrivate.applyPagination(manyRecipes, filters);

      expect(result.results.length).toBe(10);
      expect(result.results[0].id).toBe(11);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(2);

      done();
    });
  });

  it('should update loading state correctly', (done: DoneFn) => {
    let loadingState = false;

    service.isLoading$.subscribe(isLoading => {
      loadingState = isLoading;
    });

    expect(loadingState).toBe(false);

    cacheServiceSpy.get.and.returnValue({
      data: of({} as SearchResult),
      isLoading$: of(true)
    });

    service.searchRecipes(defaultFilters).subscribe();
    expect(loadingState).toBe(true);

    cacheServiceSpy.get.and.returnValue({
      data: of({} as SearchResult),
      isLoading$: of(false)
    });

    service.searchRecipes(defaultFilters).subscribe();
    expect(loadingState).toBe(false);
    done();
  });
});
