import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { RecipeDetailComponent } from './recipe-detail.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { ReviewService } from '@core/services/review.service';
import { ReviewType } from '@models/review.model';
import { RecipeDetailService } from '@src/app/core/services/recipe-detail.service';
import { RecipeDetailApiService } from '@core/http/recipe-detail-api.service';
import { FavoritesStoreService } from '@core/store/favorites-store.service';

describe('RecipeDetailComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule, FormsModule, RouterTestingModule,
        HttpClientTestingModule, RecipeDetailComponent
      ],
      providers: [
        {
          provide: RecipeDetailUIService,
          useValue: { recipeId$: of(null), initialize: () => {} }
        },
        {
          provide: ReviewService,
          useValue: { getReviewsByRecipeId: () => of([]) }
        },
        {
          provide: AuthStoreService,
          useValue: { isAuthenticated$: of(false) }
        },
        {
          provide: RecipeDetailService,
          useValue: { getRecipeById: () => of({}) }
        },
        {
          provide: RecipeDetailApiService,
          useValue: { getRecipeById: () => of({}) }
        },
        {
          provide: FavoritesStoreService,
          useValue: {
            favoriteIds$: of(new Set()),
            loadingRecipeId$: of(null),
            isFavorite: () => false
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '1' }) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(RecipeDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  describe('showReviewSection$ observable', () => {
    it('should return true when user is authenticated', () => {
      const isAuthenticated$ = new BehaviorSubject(true);
      const recipeId$ = new BehaviorSubject<number | null>(123);

      const reviewService = jasmine.createSpyObj(['getReviewsByRecipeId']);
      reviewService.getReviewsByRecipeId.and.returnValue(of([]));

      const component = new RecipeDetailComponent(
        { recipeId$, initialize: () => {} } as unknown as RecipeDetailUIService,
        {} as ActivatedRoute,
        { isAuthenticated$ } as unknown as AuthStoreService,
        reviewService
      );

      let result: boolean | undefined;
      component.showReviewSection$.subscribe(value => {
        result = value;
      });

      expect(result).toBe(true);
      expect(reviewService.getReviewsByRecipeId).toHaveBeenCalledWith('123');
    });

    it('should return true when there are reviews even if user is not authenticated', () => {
      const isAuthenticated$ = new BehaviorSubject(false);
      const recipeId$ = new BehaviorSubject<number | null>(123);

      const reviewService = jasmine.createSpyObj(['getReviewsByRecipeId']);
      reviewService.getReviewsByRecipeId.and.returnValue(of([{
        _id: '1',
        userId: 'user1',
        recipeId: '123',
        rating: 5,
        content: 'Great',
        createdAt: '2025-05-11T15:03:08Z'
      }]));

      const component = new RecipeDetailComponent(
        { recipeId$, initialize: () => {} } as unknown as RecipeDetailUIService,
        {} as ActivatedRoute,
        { isAuthenticated$ } as unknown as AuthStoreService,
        reviewService
      );

      let result: boolean | undefined;
      component.showReviewSection$.subscribe(value => {
        result = value;
      });

      expect(result).toBe(true);
      expect(reviewService.getReviewsByRecipeId).toHaveBeenCalledWith('123');
    });

    it('should return false when user is not authenticated and there are no reviews', () => {
      const isAuthenticated$ = new BehaviorSubject(false);
      const recipeId$ = new BehaviorSubject<number | null>(123);

      const reviewService = jasmine.createSpyObj(['getReviewsByRecipeId']);
      reviewService.getReviewsByRecipeId.and.returnValue(of([]));

      const component = new RecipeDetailComponent(
        { recipeId$, initialize: () => {} } as unknown as RecipeDetailUIService,
        {} as ActivatedRoute,
        { isAuthenticated$ } as unknown as AuthStoreService,
        reviewService
      );

      let result: boolean | undefined;
      component.showReviewSection$.subscribe(value => {
        result = value;
      });

      expect(result).toBe(false);
      expect(reviewService.getReviewsByRecipeId).toHaveBeenCalledWith('123');
    });

    it('should handle null recipeId correctly', () => {
      const isAuthenticated$ = new BehaviorSubject(false);
      const recipeId$ = new BehaviorSubject<number | null>(null);

      const reviewService = jasmine.createSpyObj(['getReviewsByRecipeId']);

      const component = new RecipeDetailComponent(
        { recipeId$, initialize: () => {} } as unknown as RecipeDetailUIService,
        {} as ActivatedRoute,
        { isAuthenticated$ } as unknown as AuthStoreService,
        reviewService
      );

      let result: boolean | undefined;
      component.showReviewSection$.subscribe(value => {
        result = value;
      });

      expect(result).toBe(false);
      expect(reviewService.getReviewsByRecipeId).not.toHaveBeenCalled();
    });
  });

  it('should unsubscribe on ngOnDestroy', () => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule, FormsModule, RouterTestingModule,
        HttpClientTestingModule, RecipeDetailComponent
      ],
      providers: [
        {
          provide: RecipeDetailUIService,
          useValue: { recipeId$: of(null), initialize: () => {} }
        },
        {
          provide: ReviewService,
          useValue: { getReviewsByRecipeId: () => of([]) }
        },
        {
          provide: AuthStoreService,
          useValue: { isAuthenticated$: of(false) }
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '1' }) }
        },
        {
          provide: RecipeDetailService,
          useValue: { getRecipeById: () => of({}) }
        },
        {
          provide: RecipeDetailApiService,
          useValue: { getRecipeById: () => of({}) }
        },
        {
          provide: FavoritesStoreService,
          useValue: {
            favoriteIds$: of(new Set()),
            loadingRecipeId$: of(null),
            isFavorite: () => false
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(RecipeDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const subscriptionsKey = 'subscriptions';
    const unsubscribeSpy = spyOn(component[subscriptionsKey], 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
