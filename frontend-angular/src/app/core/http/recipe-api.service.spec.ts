import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RecipeApiService, RecipeSearchResponse } from './recipe-api.service';
import { RecipeType } from '@models/recipe.model';

describe('RecipeApiService', () => {
  let service: RecipeApiService;
  let httpMock: HttpTestingController;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.API_URL;
    process.env.API_URL = 'https://api.test';

    TestBed.configureTestingModule({
      providers: [
        RecipeApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RecipeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();

    if (originalEnv === undefined) {
      process.env.API_URL = '';
    } else {
      process.env.API_URL = originalEnv;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchRecipes', () => {
    const mockRecipes: RecipeType[] = [
      {
        _id: { $oid: '60a1e2c3d4e5f6a7b8c9d0e1' },
        id: 123,
        title: 'Pasta Carbonara',
        image: 'pasta.jpg',
        readyInMinutes: 30,
        healthScore: 65,
        cuisines: ['Italian'],
        dishTypes: ['lunch', 'main course'],
        diets: []
      },
      {
        _id: { $oid: '60a1e2c3d4e5f6a7b8c9d0e2' },
        id: 456,
        title: 'Chicken Curry',
        image: 'curry.jpg',
        readyInMinutes: 45,
        healthScore: 70,
        cuisines: ['Indian', 'Asian'],
        dishTypes: ['dinner'],
        diets: ['gluten free']
      }
    ];

    const mockResponse: RecipeSearchResponse = {
      results: mockRecipes,
      offset: 0,
      number: 10,
      totalResults: 2
    };

    it('should send GET request with default parameters only', () => {
      service.searchRecipes().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.results.length).toBe(2);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${process.env.API_URL}/recipes/search` &&
          request.method === 'GET' &&
          request.params.has('offset') &&
          request.params.has('number') &&
          request.params.get('offset') === '0' &&
          request.params.get('number') === '10' &&
          !request.params.has('query') &&
          !request.params.has('cuisine') &&
          !request.params.has('diet') &&
          !request.params.has('mealType');
      });

      req.flush(mockResponse);
    });

    it('should send GET request with all parameters', () => {
      const query = 'pasta';
      const cuisine = 'italian';
      const diet = 'vegetarian';
      const mealType = 'main course';
      const offset = 5;
      const number = 20;

      service.searchRecipes(query, cuisine, diet, mealType, offset, number).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${process.env.API_URL}/recipes/search` &&
          request.method === 'GET' &&
          request.params.get('query') === query &&
          request.params.get('cuisine') === cuisine &&
          request.params.get('diet') === diet &&
          request.params.get('mealType') === mealType &&
          request.params.get('offset') === offset.toString() &&
          request.params.get('number') === number.toString();
      });

      req.flush(mockResponse);
    });

    it('should send GET request with some optional parameters', () => {
      const query = 'chicken';
      const mealType = 'lunch';

      service.searchRecipes(query, undefined, undefined, mealType).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${process.env.API_URL}/recipes/search` &&
          request.method === 'GET' &&
          request.params.get('query') === query &&
          request.params.get('mealType') === mealType &&
          !request.params.has('cuisine') &&
          !request.params.has('diet') &&
          request.params.get('offset') === '0' &&
          request.params.get('number') === '10';
      });

      req.flush(mockResponse);
    });

    it('should handle empty string parameters correctly', () => {
      const query = '';
      const cuisine = 'italian';

      service.searchRecipes(query, cuisine).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${process.env.API_URL}/recipes/search` &&
          request.method === 'GET' &&
          !request.params.has('query') &&
          request.params.get('cuisine') === cuisine &&
          request.params.get('offset') === '0' &&
          request.params.get('number') === '10';
      });

      req.flush(mockResponse);
    });

    it('should use different API URLs based on environment', () => {
      process.env.API_URL = 'https://different-api.test';

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          RecipeApiService,
          provideHttpClient(),
          provideHttpClientTesting()
        ]
      });

      const freshService = TestBed.inject(RecipeApiService);
      const httpController = TestBed.inject(HttpTestingController);

      freshService.searchRecipes('pasta').subscribe();

      const req = httpController.expectOne(request =>
        request.url === 'https://different-api.test/recipes/search' &&
        request.params.get('query') === 'pasta'
      );

      req.flush(mockResponse);
      httpController.verify();
    });
  });
});
