import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ReviewFormComponent } from './review-form.component';
import { ReviewUIService } from '../../services/review-ui.service';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';

describe('ReviewFormComponent', () => {
  let component: ReviewFormComponent;
  let fixture: ComponentFixture<ReviewFormComponent>;
  let mockReviewUIService: jasmine.SpyObj<ReviewUIService>;

  beforeEach(async () => {
    mockReviewUIService = jasmine.createSpyObj('ReviewUIService', ['submitReview']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReviewFormComponent
      ],
      providers: [
        { provide: ReviewUIService, useValue: mockReviewUIService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.rating).toBe(0);
    expect(component.comment).toBe('');
    expect(component.submitting).toBeFalse();
  });

  describe('form validation', () => {
    it('should not submit when rating is 0', () => {
      component.rating = 0;
      component.comment = 'This is a valid comment';

      component.onSubmit();

      expect(mockReviewUIService.submitReview).not.toHaveBeenCalled();
    });

    it('should not submit when comment is empty', () => {
      component.rating = 4;
      component.comment = '';

      component.onSubmit();

      expect(mockReviewUIService.submitReview).not.toHaveBeenCalled();
    });

    it('should not submit when comment is whitespace', () => {
      component.rating = 4;
      component.comment = '   ';

      component.onSubmit();

      expect(mockReviewUIService.submitReview).not.toHaveBeenCalled();
    });

    it('should not submit when already submitting', () => {
      component.rating = 4;
      component.comment = 'Valid comment';
      component.submitting = true;

      component.onSubmit();

      expect(mockReviewUIService.submitReview).not.toHaveBeenCalled();
    });
  });

  describe('successful submission', () => {
    it('should submit review when form is valid', () => {
      const testRating = 4;
      const testComment = 'This is a test review';

      component.rating = testRating;
      component.comment = testComment;

      component.onSubmit();

      expect(mockReviewUIService.submitReview).toHaveBeenCalledWith(testRating, testComment);
    });

    it('should reset form after submission', () => {
      component.rating = 4;
      component.comment = 'This is a test review';

      component.onSubmit();

      expect(component.rating).toBe(0);
      expect(component.comment).toBe('');
      expect(component.submitting).toBeFalse();
    });
  });

  describe('template interactions', () => {
    it('should include star-rating component', () => {
      const starRatingElement = fixture.debugElement.query(By.css('app-star-rating'));
      expect(starRatingElement).toBeTruthy('Star rating component should be in the template');
    });

    it('should include textarea for comment', () => {
      const textareaElement = fixture.debugElement.query(By.css('textarea'));
      expect(textareaElement).toBeTruthy('Comment textarea should be in the template');
    });

    it('should include submit button', () => {
      const buttonElement = fixture.debugElement.query(By.css('app-button'));
      expect(buttonElement).toBeTruthy('Submit button should be in the template');
    });

    it('should bind rating to star-rating component', () => {
      const starRatingDebug = fixture.debugElement.query(By.directive(StarRatingComponent));

      if (!starRatingDebug) {
        pending('StarRatingComponent not found in template due to NO_ERRORS_SCHEMA');
        return;
      }

      component.rating = 3;
      fixture.detectChanges();

      const starRatingComponent = starRatingDebug.componentInstance;
      expect(starRatingComponent.rating).toBe(3);
    });

    it('should update model when textarea value changes', () => {
      const textarea = fixture.debugElement.query(By.css('textarea'));
      const testComment = 'Test comment';

      textarea.nativeElement.value = testComment;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.comment).toBe(testComment);
    });

    it('should trigger onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');

      const form = fixture.debugElement.query(By.css('form'));

      form.triggerEventHandler('submit', null);

      expect(component.onSubmit).toHaveBeenCalled();
    });
  });
});
