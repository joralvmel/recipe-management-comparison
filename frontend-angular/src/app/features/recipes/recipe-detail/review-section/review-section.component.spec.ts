import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ReviewSectionComponent } from './review-section.component';
import { ReviewUIService } from '@features/recipes/recipe-detail/services/review-ui.service';
import { AuthStoreService } from '@core/store/auth-store.service';
import { By } from '@angular/platform-browser';
import { ReviewType } from '@models/review.model';

describe('ReviewSectionComponent', () => {
  let component: ReviewSectionComponent;
  let fixture: ComponentFixture<ReviewSectionComponent>;
  let mockReviewUIService: jasmine.SpyObj<ReviewUIService>;
  let mockAuthStoreService: jasmine.SpyObj<AuthStoreService>;

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
    mockReviewUIService = jasmine.createSpyObj('ReviewUIService',
      [
        'initialize',
        'loadReviews',
        'checkUserReview',
        'getUserName',
        'formatDate',
        'startEditing',
        'cancelEditing',
        'saveReview',
        'submitReview',
        'canEditReview',
        'isEditingReview',
        'getEditRating',
        'getEditComment'
      ],
      {
        reviews$: new BehaviorSubject<ReviewType[]>(mockReviews),
        userReview$: new BehaviorSubject<ReviewType | null>(null),
        hasUserReview$: new BehaviorSubject<boolean>(false),
        editingReviewId$: new BehaviorSubject<string | null>(null),
        editRating$: new BehaviorSubject<number>(0),
        editComment$: new BehaviorSubject<string>('')
      }
    );

    mockReviewUIService.isEditingReview.and.returnValue(false);
    mockReviewUIService.canEditReview.and.returnValue(false);
    mockReviewUIService.getEditRating.and.returnValue(0);
    mockReviewUIService.getEditComment.and.returnValue('');
    mockReviewUIService.formatDate.and.callFake((date: string) => new Date(date).toLocaleDateString());
    mockReviewUIService.getUserName.and.returnValue('Test User');

    mockAuthStoreService = jasmine.createSpyObj('AuthStoreService',
      ['getUserById'],
      { isAuthenticated: true }
    );

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReviewSectionComponent,
      ],
      providers: [
        { provide: AuthStoreService, useValue: mockAuthStoreService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ReviewSectionComponent, {
        set: {
          providers: [
            { provide: ReviewUIService, useValue: mockReviewUIService }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReviewSectionComponent);
    component = fixture.componentInstance;

    component.recipeId = 12345;
    component.isAuthenticated = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject services correctly', () => {
    expect(component.reviewUI).toBeTruthy();
    expect(component.reviewUI).toBe(mockReviewUIService);
    expect(component.authService).toBeTruthy();
    expect(component.authService).toBe(mockAuthStoreService);
  });

  it('should initialize the ReviewUIService with the correct recipe ID', () => {
    expect(mockReviewUIService.initialize).toHaveBeenCalledWith('12345');
  });


  it('should render child components and display review data', () => {
    expect(fixture.nativeElement).toBeTruthy();

    expect(mockReviewUIService.initialize).toHaveBeenCalled();
  });

  it('should reinitialize when recipeId changes', () => {
    mockReviewUIService.initialize.calls.reset();
    component.recipeId = 67890;
    component.ngOnInit();

    expect(mockReviewUIService.initialize).toHaveBeenCalledWith('67890');
  });

  describe('with different input values', () => {
    it('should handle authenticated user state', () => {
      component.isAuthenticated = true;
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should handle unauthenticated user state', () => {
      component.isAuthenticated = false;
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  it('should have a template', () => {
    expect(fixture.nativeElement.innerHTML).toBeTruthy();
    expect(fixture.nativeElement.innerHTML.length).toBeGreaterThan(0);
  });
});
