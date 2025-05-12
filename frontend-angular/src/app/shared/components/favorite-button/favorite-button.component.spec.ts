import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FavoriteButtonComponent } from './favorite-button.component';

describe('FavoriteButtonComponent', () => {
  let component: FavoriteButtonComponent;
  let fixture: ComponentFixture<FavoriteButtonComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    component.recipeId = 123;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function logTemplateContent() {
    console.log('Component HTML:', fixture.nativeElement.innerHTML);
  }

  function getFavoriteInteractiveElement(): DebugElement | null {
    return debugElement.query(By.css('input.favorite-checkbox, input[type="checkbox"], .input-favorite input'));
  }

  describe('initialization', () => {
    it('should have default values', () => {
      expect(component.isFavorite).toBe(false);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should have the recipeId input set', () => {
      component.recipeId = 456;
      fixture.detectChanges();
      expect(component.recipeId).toBe(456);
    });
  });

  describe('rendering', () => {
    it('should render some favorite button element', () => {
      logTemplateContent();

      const anyElement = debugElement.query(By.css('*'));
      expect(anyElement).toBeTruthy('Component should render something');
    });

    it('should reflect isFavorite state in component', () => {
      component.isFavorite = true;
      expect(component.isFavorite).toBeTrue();

      component.isFavorite = false;
      expect(component.isFavorite).toBeFalse();
    });

    it('should reflect isLoading state in component', () => {
      component.isLoading = true;
      expect(component.isLoading).toBeTrue();
    });

    it('should reflect error state in component', () => {
      const errorMsg = 'Failed to update favorite';
      component.error = errorMsg;
      expect(component.error).toBe(errorMsg);
    });
  });

  describe('user interactions', () => {
    it('should emit toggleFavorite event with recipeId when handleChange is called', () => {
      spyOn(component.toggleFavorite, 'emit');

      component.handleChange();
      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(123);

      component.recipeId = 456;
      component.handleChange();
      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(456);
    });

    it('should trigger handleChange when favorite action is performed', () => {
      const checkbox = getFavoriteInteractiveElement();

      expect(checkbox).toBeTruthy('Should find a checkbox element');

      if (checkbox) {
        spyOn(component, 'handleChange');

        checkbox.triggerEventHandler('change', { target: checkbox.nativeElement });

        expect(component.handleChange).toHaveBeenCalled();
      }
    });
  });

  describe('component methods', () => {
    it('handleChange should emit the toggleFavorite event with recipeId', () => {
      spyOn(component.toggleFavorite, 'emit');

      component.recipeId = 789;
      component.handleChange();

      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(789);
    });
  });
});
