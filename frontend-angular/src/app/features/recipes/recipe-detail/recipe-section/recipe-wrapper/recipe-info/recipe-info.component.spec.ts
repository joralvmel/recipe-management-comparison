import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { RecipeInfoComponent } from './recipe-info.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { RecipeDetailType } from '@models/recipe.model';

describe('RecipeInfoComponent', () => {
  let component: RecipeInfoComponent;
  let fixture: ComponentFixture<RecipeInfoComponent>;
  let mockRecipeDetailUIService: jasmine.SpyObj<RecipeDetailUIService>;

  const mockRecipe: RecipeDetailType = {
    _id: { $oid: '60a1e2c3d4e5f6a7b8c9d0e1' },
    externalId: 123456,
    title: 'Test Recipe',
    image: 'test-image.jpg',
    readyInMinutes: 30,
    healthScore: 85,
    cuisines: ['Mexican', 'Spicy'],
    dishTypes: ['main course', 'dinner'],
    diets: ['gluten free'],
    servings: 4,
    extendedIngredients: [
      {
        externalId: 1001,
        nameClean: 'olive oil',
        amount: 2,
        unitShort: 'tbsp',
        image: 'olive-oil.jpg'
      }
    ],
    analyzedInstructions: ['Step 1', 'Step 2']
  };

  beforeEach(async () => {
    mockRecipeDetailUIService = jasmine.createSpyObj('RecipeDetailUIService',
      ['initialize', 'loadRecipe', 'toggleFavorite', 'updateServings', 'getScaledAmount'],
      {
        recipe$: new BehaviorSubject<RecipeDetailType | null>(mockRecipe),
        isLoading$: new BehaviorSubject<boolean>(false),
        error$: new BehaviorSubject<string | null>(null),
        readyInMinutes$: new BehaviorSubject<number>(30),
        healthScore$: new BehaviorSubject<number>(85),
        cuisines$: new BehaviorSubject<string[]>(['Mexican', 'Spicy']),
        dishTypes$: new BehaviorSubject<string[]>(['main course', 'dinner']),
        diets$: new BehaviorSubject<string[]>(['gluten free']),
        servings$: new BehaviorSubject<number>(4),
        originalServings$: new BehaviorSubject<number>(4)
      }
    );

    await TestBed.configureTestingModule({
      imports: [CommonModule, RecipeInfoComponent],
      providers: [
        { provide: RecipeDetailUIService, useValue: mockRecipeDetailUIService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject RecipeDetailUIService', () => {
    expect(component.recipeUI).toBeTruthy();
    expect(component.recipeUI).toBe(mockRecipeDetailUIService);
  });

  describe('UI rendering', () => {
    it('should display cook time when available', () => {
      const element = fixture.debugElement.nativeElement;
      const cookTimeText = element.textContent;

      expect(cookTimeText).toContain('30');
    });

    it('should display health score when available', () => {
      const element = fixture.debugElement.nativeElement;
      const healthScoreText = element.textContent;

      expect(healthScoreText).toContain('85');
    });

    it('should display cuisines when available', () => {
      const element = fixture.debugElement.nativeElement;
      const cuisinesText = element.textContent;

      expect(cuisinesText).toContain('Mexican');
      expect(cuisinesText).toContain('Spicy');
    });

    it('should display dish types when available', () => {
      const element = fixture.debugElement.nativeElement;
      const dishTypesText = element.textContent;

      expect(dishTypesText).toContain('main course');
      expect(dishTypesText).toContain('dinner');
    });

    it('should display diets when available', () => {
      const element = fixture.debugElement.nativeElement;
      const dietsText = element.textContent;

      expect(dietsText).toContain('gluten free');
    });
  });

  describe('empty or loading states', () => {
    it('should handle loading state', () => {
      (mockRecipeDetailUIService.isLoading$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should handle error state', () => {
      (mockRecipeDetailUIService.error$ as BehaviorSubject<string | null>).next('Error loading recipe');
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should handle empty cuisines array', () => {
      (mockRecipeDetailUIService.cuisines$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should handle empty dish types array', () => {
      (mockRecipeDetailUIService.dishTypes$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should handle empty diets array', () => {
      (mockRecipeDetailUIService.diets$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should handle null recipe data', () => {
      (mockRecipeDetailUIService.recipe$ as BehaviorSubject<RecipeDetailType | null>).next(null);
      (mockRecipeDetailUIService.readyInMinutes$ as BehaviorSubject<number>).next(0);
      (mockRecipeDetailUIService.healthScore$ as BehaviorSubject<number>).next(0);
      (mockRecipeDetailUIService.cuisines$ as BehaviorSubject<string[]>).next([]);
      (mockRecipeDetailUIService.dishTypes$ as BehaviorSubject<string[]>).next([]);
      (mockRecipeDetailUIService.diets$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('should not display cuisines section when cuisines array is empty', () => {
      (mockRecipeDetailUIService.cuisines$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      const element = fixture.debugElement.nativeElement;
      const cuisinesSection = fixture.debugElement.query(By.css('.cuisines'));

      if (cuisinesSection) {
        expect(cuisinesSection.nativeElement.textContent.trim()).toBeFalsy();
      } else {
        expect(true).toBeTruthy();
      }
    });

    it('should not display dish types section when dish types array is empty', () => {
      (mockRecipeDetailUIService.dishTypes$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      const element = fixture.debugElement.nativeElement;
      const dishTypesSection = fixture.debugElement.query(By.css('.dish-types'));

      if (dishTypesSection) {
        expect(dishTypesSection.nativeElement.textContent.trim()).toBeFalsy();
      } else {
        expect(true).toBeTruthy();
      }
    });

    it('should not display diets section when diets array is empty', () => {
      (mockRecipeDetailUIService.diets$ as BehaviorSubject<string[]>).next([]);
      fixture.detectChanges();

      const element = fixture.debugElement.nativeElement;
      const dietsSection = fixture.debugElement.query(By.css('.diets'));

      if (dietsSection) {
        expect(dietsSection.nativeElement.textContent.trim()).toBeFalsy();
      } else {
        expect(true).toBeTruthy();
      }
    });
  });
});
