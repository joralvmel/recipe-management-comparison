import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FavoriteApiService, FavoriteItem } from './favorite-api.service';

describe('FavoriteApiService', () => {
  let service: FavoriteApiService;
  let httpMock: HttpTestingController;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.API_URL;
    process.env.API_URL = 'https://api.test';

    TestBed.configureTestingModule({
      providers: [
        FavoriteApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FavoriteApiService);
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

  describe('getFavorites', () => {
    it('should send GET request to fetch favorites', () => {
      const mockFavorites: FavoriteItem[] = [
        {
          _id: 'fav1',
          userId: 'user1',
          recipeId: '123',
          createdAt: '2023-05-09T08:52:55.000Z'
        },
        {
          _id: 'fav2',
          userId: 'user1',
          recipeId: '456',
          createdAt: '2023-05-10T10:30:00.000Z'
        }
      ];

      service.getFavorites().subscribe(favorites => {
        expect(favorites).toEqual(mockFavorites);
        expect(favorites.length).toBe(2);
        expect(favorites[0].recipeId).toBe('123');
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/favorites`);
      expect(req.request.method).toBe('GET');

      req.flush(mockFavorites);
    });
  });

  describe('addFavorite', () => {
    it('should send POST request with correct recipeId', () => {
      const recipeId = 789;
      const mockResponse = { recipeId: recipeId.toString() };

      service.addFavorite(recipeId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.recipeId).toBe(recipeId.toString());
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/favorites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        recipeId: recipeId.toString()
      });

      req.flush(mockResponse);
    });

    it('should convert numeric recipeId to string in request body', () => {
      const recipeId = 123;

      service.addFavorite(recipeId).subscribe();

      const req = httpMock.expectOne(`${process.env.API_URL}/favorites`);
      expect(req.request.body.recipeId).toBe('123');
      expect(typeof req.request.body.recipeId).toBe('string');

      req.flush({ recipeId: recipeId.toString() });
    });
  });

  describe('removeFavorite', () => {
    it('should send DELETE request with correct recipeId', () => {
      const recipeId = 456;

      service.removeFavorite(recipeId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/favorites/${recipeId}`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });

  describe('API URL construction', () => {
    it('should use the configured API_URL for all endpoints', () => {
      process.env.API_URL = 'https://different-api.test';

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          FavoriteApiService,
          provideHttpClient(),
          provideHttpClientTesting()
        ]
      });

      const freshService = TestBed.inject(FavoriteApiService);
      const httpController = TestBed.inject(HttpTestingController);

      freshService.getFavorites().subscribe();
      const req1 = httpController.expectOne('https://different-api.test/favorites');
      req1.flush([]);

      freshService.addFavorite(123).subscribe();
      const req2 = httpController.expectOne('https://different-api.test/favorites');
      req2.flush({ recipeId: '123' });

      freshService.removeFavorite(123).subscribe();
      const req3 = httpController.expectOne('https://different-api.test/favorites/123');
      req3.flush(null);

      httpController.verify();
    });
  });
});
