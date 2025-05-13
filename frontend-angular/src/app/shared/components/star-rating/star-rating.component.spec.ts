import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRatingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default rating of 0', () => {
      expect(component.rating).toBe(0);
    });

    it('should have default readOnly value of false', () => {
      expect(component.readOnly).toBeFalse();
    });

    it('should have 5 stars', () => {
      expect(component.stars.length).toBe(5);
    });

    it('should initialize with provided rating', () => {
      component.rating = 3;

      fixture.detectChanges();

      expect(component.rating).toBe(3);
    });
  });

  describe('star clicking behavior', () => {
    it('should set rating when star is clicked', () => {
      component.onStarClick(4);
      fixture.detectChanges();

      expect(component.rating).toBe(4);
    });

    it('should reset rating when clicking the same star twice', () => {
      component.rating = 3;
      fixture.detectChanges();

      component.onStarClick(3);
      fixture.detectChanges();

      expect(component.rating).toBe(0);
    });

    it('should not change rating when in readOnly mode', () => {
      component.readOnly = true;
      component.rating = 2;
      fixture.detectChanges();

      component.onStarClick(5);
      fixture.detectChanges();

      expect(component.rating).toBe(2);
    });
  });

  describe('event emission', () => {
    it('should emit ratingChange event when rating changes', () => {
      spyOn(component.ratingChange, 'emit');

      component.onStarClick(5);
      fixture.detectChanges();

      expect(component.ratingChange.emit).toHaveBeenCalledWith(5);
    });

    it('should emit ratingChange event with 0 when rating is reset', () => {
      component.rating = 4;
      fixture.detectChanges();

      spyOn(component.ratingChange, 'emit');

      component.onStarClick(4);
      fixture.detectChanges();

      expect(component.ratingChange.emit).toHaveBeenCalledWith(0);
    });

    it('should not emit ratingChange event when in readOnly mode', () => {
      component.readOnly = true;
      component.rating = 3;
      fixture.detectChanges();

      spyOn(component.ratingChange, 'emit');

      component.onStarClick(5);
      fixture.detectChanges();

      expect(component.ratingChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('visual representation', () => {
    it('should render stars in reverse order', () => {
      expect(component.stars[0]).toBe(5);
      expect(component.stars[4]).toBe(1);
    });

    it('should have a class or attribute to indicate readOnly state', () => {
      component.readOnly = true;
      fixture.detectChanges();

      expect(component.readOnly).toBeTrue();
    });
  });
});
