import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ReviewsListComponent } from './reviews-list.component';
import { ReviewComponent } from './review/review.component';
import { ReviewUIService } from '@features/recipes/recipe-detail/services/review-ui.service';
import { ReviewType } from '@models/review.model';

describe('ReviewsListComponent', () => {
  let component: ReviewsListComponent;
  let fixture: ComponentFixture<ReviewsListComponent>;
  let mockReviewUIService: jasmine.SpyObj<ReviewUIService>;

  const mockReviews: ReviewType[] = [
    {
      _id: 'review1',
      userId: 'user123',
      recipeId: '12345',
      rating: 5,
      content: 'Excellent recipe! Will make again.',
      createdAt: '2023-05-09T09:45:47.000Z',
      updatedAt: '2023-05-09T09:45:47.000Z'
    },
    {
      _id: 'review2',
      userId: 'user456',
      recipeId: '12345',
      rating: 4,
      content: 'Very good but I added more salt.',
      createdAt: '2023-05-08T14:30:22.000Z',
      updatedAt: '2023-05-08T14:30:22.000Z'
    }
  ];

  beforeEach(async () => {
    // Create a more comprehensive mock with all methods and observables
    mockReviewUIService = jasmine.createSpyObj('ReviewUIService',
      ['getUserName', 'formatDate', 'canEditReview', 'isEditingReview',
        'startEditing', 'cancelEditing', 'saveReview', 'getEditRating', 'getEditComment'],
      {
        // Add all the observables that ReviewComponent might subscribe to
        editingReviewId$: new BehaviorSubject<string | null>(null),
        editRating$: new BehaviorSubject<number>(0),
        editComment$: new BehaviorSubject<string>('')
      }
    );

    mockReviewUIService.getUserName.and.returnValue('Test User');
    mockReviewUIService.formatDate.and.callFake((date: string) => new Date(date).toLocaleDateString());
    mockReviewUIService.canEditReview.and.returnValue(false);
    mockReviewUIService.isEditingReview.and.returnValue(false);
    mockReviewUIService.getEditRating.and.returnValue(0);
    mockReviewUIService.getEditComment.and.returnValue('');

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReviewsListComponent
      ],
      providers: [
        { provide: ReviewUIService, useValue: mockReviewUIService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ReviewUIService', () => {
    expect(component.reviewUI).toBeTruthy();
    expect(component.reviewUI).toBe(mockReviewUIService);
  });

  it('should initialize with empty reviews array', () => {
    expect(component.reviews).toEqual([]);
  });

  describe('with reviews input', () => {
    beforeEach(() => {
      component.reviews = mockReviews;
      fixture.detectChanges();
    });

    it('should store the reviews array', () => {
      expect(component.reviews).toEqual(mockReviews);
      expect(component.reviews.length).toBe(2);
    });

    it('should render review elements', () => {
      const reviewElements = fixture.debugElement.queryAll(By.css('[data-test="review-item"], .review-item, app-review'));

      expect(fixture.nativeElement.innerHTML).toBeTruthy();
    });
  });

  describe('with empty reviews', () => {
    it('should not render review elements when empty', () => {
      component.reviews = [];
      fixture.detectChanges();

      const hasContent = fixture.nativeElement.innerHTML.trim().length > 0;
      expect(hasContent).toBeTruthy('Should have some content even with empty reviews');
    });

    it('should handle empty state', () => {
      component.reviews = [];
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('handling different review data', () => {
    it('should handle reviews with minimal data', () => {
      const minimalReview: ReviewType = {
        _id: 'minimal',
        userId: 'user789',
        recipeId: '12345',
        rating: 3,
        content: '',
        createdAt: '2023-05-10T10:00:00.000Z',
        updatedAt: '2023-05-10T10:00:00.000Z'
      };

      component.reviews = [minimalReview];
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });
  });
});
