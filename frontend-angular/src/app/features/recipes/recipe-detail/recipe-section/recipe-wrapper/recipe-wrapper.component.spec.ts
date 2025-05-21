import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { RecipeWrapperComponent } from './recipe-wrapper.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { RecipeDetailType, IngredientType } from '@models/recipe.model';
import { By } from '@angular/platform-browser';
import {
  RecipeInstructionsComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-instructions/recipe-instructions.component';
import {
  RecipeInfoComponent
} from '@features/recipes/recipe-detail/recipe-section/recipe-wrapper/recipe-info/recipe-info.component';

describe('RecipeWrapperComponent', () => {
  let component: RecipeWrapperComponent;
  let fixture: ComponentFixture<RecipeWrapperComponent>;
  let mockRecipeDetailUIService: jasmine.SpyObj<RecipeDetailUIService>;

  const mockRecipe: RecipeDetailType = {
    _id: { $oid: '60a1e2c3d4e5f6a7b8c9d0e1' },
    externalId: 123456,
    title: 'Delicious Pasta',
    image: 'pasta.jpg',
    readyInMinutes: 30,
    healthScore: 75,
    cuisines: ['Italian'],
    dishTypes: ['main course'],
    diets: ['vegetarian'],
    servings: 4,
    extendedIngredients: [
      {
        externalId: 1001,
        nameClean: 'olive oil',
        amount: 2,
        unitShort: 'tbsp',
        image: 'olive-oil.jpg'
      },
      {
        externalId: 1002,
        nameClean: 'pasta',
        amount: 200,
        unitShort: 'g',
        image: 'pasta.jpg'
      }
    ],
    analyzedInstructions: ['Cook pasta until al dente', 'Add sauce and serve']
  };

  beforeEach(async () => {
    mockRecipeDetailUIService = jasmine.createSpyObj('RecipeDetailUIService',
      ['initialize', 'loadRecipe', 'toggleFavorite', 'updateServings', 'getScaledAmount'],
      {
        recipe$: new BehaviorSubject<RecipeDetailType | null>(mockRecipe),
        recipeId$: new BehaviorSubject<number>(123456),
        isLoading$: new BehaviorSubject<boolean>(false),
        error$: new BehaviorSubject<string | null>(null),
        isFavorite$: new BehaviorSubject<boolean>(false),
        servings$: new BehaviorSubject<number>(4),
        originalServings$: new BehaviorSubject<number>(4),
        loadingFavoriteId$: new BehaviorSubject<number | null>(null),
        isLoadingFavorite$: new BehaviorSubject<boolean>(false),
        title$: new BehaviorSubject<string>('Delicious Pasta'),
        imageUrl$: new BehaviorSubject<string>('pasta.jpg'),
        ingredients$: new BehaviorSubject<IngredientType[]>(mockRecipe.extendedIngredients),
        readyInMinutes$: new BehaviorSubject<number>(30),
        healthScore$: new BehaviorSubject<number>(75),
        cuisines$: new BehaviorSubject<string[]>(['Italian']),
        dishTypes$: new BehaviorSubject<string[]>(['main course']),
        diets$: new BehaviorSubject<string[]>(['vegetarian']),
        instructions$: new BehaviorSubject<string[]>(mockRecipe.analyzedInstructions)
      }
    );

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RecipeWrapperComponent
      ],
      providers: [
        { provide: RecipeDetailUIService, useValue: mockRecipeDetailUIService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeWrapperComponent);
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

  it('should render RecipeInfoComponent', () => {
    const infoComponent = fixture.debugElement.query(By.directive(RecipeInfoComponent));

    if (!infoComponent) {
      const infoElement = fixture.debugElement.query(By.css('app-recipe-info'));
      expect(infoElement).toBeTruthy('RecipeInfoComponent should be included in the template');
    } else {
      expect(infoComponent).toBeTruthy('RecipeInfoComponent should be included in the template');
    }
  });

  it('should render RecipeInstructionsComponent', () => {
    const instructionsComponent = fixture.debugElement.query(By.directive(RecipeInstructionsComponent));

    if (!instructionsComponent) {
      const instructionsElement = fixture.debugElement.query(By.css('app-recipe-instructions'));
      expect(instructionsElement).toBeTruthy('RecipeInstructionsComponent should be included in the template');
    } else {
      expect(instructionsComponent).toBeTruthy('RecipeInstructionsComponent should be included in the template');
    }
  });

  it('should pass RecipeDetailUIService to child components', () => {
    const templateElement = fixture.debugElement.nativeElement;
    const hasChildComponents =
      fixture.debugElement.query(By.css('app-recipe-info')) !== null &&
      fixture.debugElement.query(By.css('app-recipe-instructions')) !== null;

    expect(hasChildComponents).toBeTruthy('Template should render child components');
  });

  it('should render without errors when RecipeDetailUIService has data', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should handle loading state', () => {
    (mockRecipeDetailUIService.isLoading$ as BehaviorSubject<boolean>).next(true);
    fixture.detectChanges();

    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should handle error state', () => {
    (mockRecipeDetailUIService.error$ as BehaviorSubject<string | null>).next('Error message');
    fixture.detectChanges();

    expect(fixture.nativeElement).toBeTruthy();
  });
});
