import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RecipeDetailApiService } from './recipe-detail-api.service';
import { RecipeDetailType } from '@models/recipe.model';

describe('RecipeDetailApiService', () => {
  let service: RecipeDetailApiService;
  let httpMock: HttpTestingController;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.API_URL;
    process.env.API_URL = 'https://api.test';

    TestBed.configureTestingModule({
      providers: [
        RecipeDetailApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RecipeDetailApiService);
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

  describe('getRecipeById', () => {
    const mockRecipeId = 123456;

    const mockRecipeDetail: RecipeDetailType = {
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

    it('should send GET request with the correct recipe ID', () => {
      service.getRecipeById(mockRecipeId).subscribe(recipe => {
        expect(recipe).toEqual(mockRecipeDetail);
        expect(recipe.title).toBe('Spaghetti Carbonara');
        expect(recipe.servings).toBe(4);
        expect(recipe.extendedIngredients.length).toBe(3);
        expect(recipe.analyzedInstructions.length).toBe(4);
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/recipes/${mockRecipeId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockRecipeDetail);
    });

    it('should construct URL with different recipe IDs', () => {
      const anotherRecipeId = 789012;

      service.getRecipeById(anotherRecipeId).subscribe();

      const req = httpMock.expectOne(`${process.env.API_URL}/recipes/${anotherRecipeId}`);
      expect(req.request.method).toBe('GET');

      req.flush({...mockRecipeDetail, externalId: anotherRecipeId});
    });

    it('should use different API URLs based on environment', () => {
      // Create a fresh instance with different API URL
      process.env.API_URL = 'https://different-api.test';

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          RecipeDetailApiService,
          provideHttpClient(),
          provideHttpClientTesting()
        ]
      });

      const freshService = TestBed.inject(RecipeDetailApiService);
      const httpController = TestBed.inject(HttpTestingController);

      freshService.getRecipeById(mockRecipeId).subscribe();

      const req = httpController.expectOne(`https://different-api.test/recipes/${mockRecipeId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockRecipeDetail);
      httpController.verify();
    });

    it('should handle errors correctly', () => {
      const errorMessage = 'Recipe not found';

      service.getRecipeById(999999).subscribe({
        next: () => fail('Expected an error, not a recipe'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/recipes/999999`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });
});
