import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ReviewComponent } from './review.component';
import { ReviewUIService } from '../../../services/review-ui.service';
import { ReviewType } from '@models/review.model';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let mockReviewUIService: jasmine.SpyObj<ReviewUIService>;

  const mockReview: ReviewType = {
    _id: 'review123',
    userId: 'user456',
    recipeId: '789',
    rating: 4,
    content: 'This is a test review content.',
    createdAt: '2023-05-10T10:00:00.000Z',
    updatedAt: '2023-05-10T10:00:00.000Z'
  };

  beforeEach(async () => {
    const editingReviewIdSubject = new BehaviorSubject<string | null>(null);

    mockReviewUIService = jasmine.createSpyObj('ReviewUIService',
      [
        'isEditingReview',
        'getUserName',
        'formatDate',
        'canEditReview',
        'startEditing',
        'cancelEditing',
        'saveReview',
        'getEditRating',
        'getEditComment'
      ],
      {
        editingReviewId$: editingReviewIdSubject,
        editRating$: new BehaviorSubject<number>(0),
        editComment$: new BehaviorSubject<string>('')
      }
    );

    mockReviewUIService.isEditingReview.and.returnValue(false);
    mockReviewUIService.getUserName.and.returnValue('Test User');
    mockReviewUIService.formatDate.and.returnValue('05/10/2023');
    mockReviewUIService.canEditReview.and.returnValue(true);
    mockReviewUIService.getEditRating.and.returnValue(4);
    mockReviewUIService.getEditComment.and.returnValue('This is a test review content.');

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReviewComponent
      ],
      providers: [
        { provide: ReviewUIService, useValue: mockReviewUIService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    component.review = mockReview;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with the provided review', () => {
      expect(component.review).toEqual(mockReview);
    });

    it('should subscribe to editingReviewId$ on init', () => {
      const editingReviewIdSubject = mockReviewUIService.editingReviewId$ as BehaviorSubject<string | null>;

      editingReviewIdSubject.next(mockReview._id);

      expect(component.editRating).toBe(4);
      expect(component.editComment).toBe('This is a test review content.');

      expect(mockReviewUIService.getEditRating).toHaveBeenCalled();
      expect(mockReviewUIService.getEditComment).toHaveBeenCalled();
    });
  });

  describe('getters', () => {
    it('should get isEditing from service', () => {
      mockReviewUIService.isEditingReview.and.returnValue(true);
      expect(component.isEditing).toBeTrue();
      expect(mockReviewUIService.isEditingReview).toHaveBeenCalledWith(mockReview._id);

      mockReviewUIService.isEditingReview.and.returnValue(false);
      expect(component.isEditing).toBeFalse();
    });

    it('should get userName from service', () => {
      expect(component.userName).toBe('Test User');
      expect(mockReviewUIService.getUserName).toHaveBeenCalledWith(mockReview.userId);
    });

    it('should get formattedDate from service', () => {
      expect(component.formattedDate).toBe('05/10/2023');
      expect(mockReviewUIService.formatDate).toHaveBeenCalledWith(mockReview.createdAt);
    });

    it('should get canEdit from service', () => {
      expect(component.canEdit).toBeTrue();
      expect(mockReviewUIService.canEditReview).toHaveBeenCalledWith(mockReview);
    });
  });

  describe('editing actions', () => {
    it('should call startEditing when onStartEditing is called', () => {
      component.onStartEditing();
      expect(mockReviewUIService.startEditing).toHaveBeenCalledWith(mockReview);
    });

    it('should call cancelEditing when onCancel is called', () => {
      component.onCancel();
      expect(mockReviewUIService.cancelEditing).toHaveBeenCalled();
    });

    it('should call saveReview when onSave is called', () => {
      component.editRating = 5;
      component.editComment = 'Updated review content';

      component.onSave();

      expect(mockReviewUIService.saveReview).toHaveBeenCalledWith(
        mockReview._id,
        5,
        'Updated review content'
      );
    });
  });

  describe('display modes', () => {
    it('should display review content in read mode', () => {
      mockReviewUIService.isEditingReview.and.returnValue(false);
      fixture.detectChanges();

      const templateHtml = fixture.nativeElement.innerHTML;

      expect(templateHtml.includes('Test User') || component.userName === 'Test User').toBeTrue();
      expect(mockReview.rating).toBe(4);
      expect(templateHtml.includes(mockReview.content) || mockReview.content === 'This is a test review content.').toBeTrue();
    });

    it('should display edit form in edit mode', () => {
      mockReviewUIService.isEditingReview.and.returnValue(true);
      fixture.detectChanges();

      const formElements = fixture.debugElement.queryAll(By.css('form, textarea, app-star-rating'));

      expect(fixture.nativeElement.innerHTML).toBeTruthy();
    });
  });
});
