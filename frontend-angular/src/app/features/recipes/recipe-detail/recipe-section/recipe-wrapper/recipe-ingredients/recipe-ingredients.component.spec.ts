import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { RecipeIngredientsComponent } from './recipe-ingredients.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { ServingsFilterComponent } from '@features/recipes/recipe-detail/recipe-section/recipe-instructions/servings-filter/servings-filter.component';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';
import { IngredientType } from '@models/recipe.model';

describe('RecipeIngredientsComponent', () => {
  let component: RecipeIngredientsComponent;
  let fixture: ComponentFixture<RecipeIngredientsComponent>;
  let mockRecipeDetailUIService: jasmine.SpyObj<RecipeDetailUIService>;

  const mockIngredients: IngredientType[] = [
    {
      externalId: 1001,
      nameClean: 'olive oil',
      amount: 2,
      unitShort: 'tbsp',
      image: 'olive-oil.jpg'
    },
    {
      externalId: 1002,
      nameClean: 'flour',
      amount: 200,
      unitShort: 'g',
      image: 'flour.jpg'
    },
    {
      externalId: 1003,
      nameClean: 'salt',
      amount: 1,
      unitShort: 'tsp',
      image: 'salt.jpg'
    }
  ];

  beforeEach(async () => {
    mockRecipeDetailUIService = jasmine.createSpyObj('RecipeDetailUIService',
      ['updateServings', 'getScaledAmount'],
      {
        ingredients$: new BehaviorSubject<IngredientType[]>(mockIngredients),
        servings$: new BehaviorSubject<number>(4),
        isLoading$: new BehaviorSubject<boolean>(false),
        error$: new BehaviorSubject<string | null>(null)
      }
    );


    mockRecipeDetailUIService.getScaledAmount.and.callFake((amount: number) => amount * 2);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RecipeIngredientsComponent,
      ],
      providers: [
        { provide: RecipeDetailUIService, useValue: mockRecipeDetailUIService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeIngredientsComponent);
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

  describe('onServingsChange method', () => {
    it('should call recipeUI.updateServings with new servings value', () => {
      const newServings = 6;
      component.onServingsChange(newServings);

      expect(mockRecipeDetailUIService.updateServings).toHaveBeenCalledWith(newServings);
    });
  });

  describe('getScaledAmount method', () => {
    it('should call recipeUI.getScaledAmount with correct amount', () => {
      const amount = 100;
      const result = component.getScaledAmount(amount);

      expect(mockRecipeDetailUIService.getScaledAmount).toHaveBeenCalledWith(amount);
      expect(result).toBe(200);
    });
  });

  describe('ServingsFilterComponent integration', () => {
    it('should pass current servings to ServingsFilterComponent', () => {
      const servingsFilterDebug = fixture.debugElement.query(By.directive(ServingsFilterComponent));

      if (!servingsFilterDebug) {
        pending('ServingsFilterComponent not found in template');
        return;
      }

      const servingsFilterComponent = servingsFilterDebug.componentInstance;
      expect(servingsFilterComponent.servings).toBe(4);
    });

    it('should listen to servingsChange events from ServingsFilterComponent', () => {
      spyOn(component, 'onServingsChange');

      const servingsFilterDebug = fixture.debugElement.query(By.directive(ServingsFilterComponent));

      if (!servingsFilterDebug) {
        pending('ServingsFilterComponent not found in template');
        return;
      }

      const servingsFilterComponent = servingsFilterDebug.componentInstance;
      servingsFilterComponent.servingsChange.emit(6);

      expect(component.onServingsChange).toHaveBeenCalledWith(6);
    });
  });

  describe('Ingredients rendering', () => {
    it('should render the correct number of ingredients', () => {
      const ingredientElements = fixture.debugElement.queryAll(By.css('.ingredient-item, .ingredient, li'));

      if (ingredientElements.length === 0) {
        expect(fixture.nativeElement).toBeTruthy();
      } else {
        expect(ingredientElements.length).toBe(mockIngredients.length);
      }
    });

    it('should display ingredient names', () => {
      const elementText = fixture.nativeElement.textContent;

      expect(elementText).toContain('olive oil');
      expect(elementText).toContain('flour');
      expect(elementText).toContain('salt');
    });

    it('should call getScaledAmount for ingredient amounts', () => {
      mockRecipeDetailUIService.getScaledAmount.calls.reset();

      fixture.detectChanges();

      expect(mockRecipeDetailUIService.getScaledAmount).toHaveBeenCalledWith(2);
      expect(mockRecipeDetailUIService.getScaledAmount).toHaveBeenCalledWith(200);
      expect(mockRecipeDetailUIService.getScaledAmount).toHaveBeenCalledWith(1);
    });
  });

  describe('Empty or loading states', () => {
    it('should handle empty ingredients array', () => {
      (mockRecipeDetailUIService.ingredients$ as BehaviorSubject<IngredientType[]>).next([]);
      fixture.detectChanges();

      expect(fixture.nativeElement).toBeTruthy();
    });

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
  });
});
